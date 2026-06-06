'use strict';
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const MCP_HOST = 'api.yanbot.tech';
const MCP_PATH = '/mcp';
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json' };

// ─── MCP session ──────────────────────────────────────────────────────────────

let mcpReady = false;
let sessionId = null;
let retryCount = 0;
const MAX_RETRY = 5;

function mcpPost(body, sid) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Content-Length': Buffer.byteLength(data),
    };
    if (sid) headers['mcp-session-id'] = sid;

    const req = https.request(
      { hostname: MCP_HOST, path: MCP_PATH, method: 'POST', headers },
      res => {
        const newSid = res.headers['mcp-session-id'];
        let buf = '';
        res.setEncoding('utf8');
        res.on('data', c => { buf += c; });
        res.on('end', () => {
          let rpc = null;
          for (const line of buf.split('\n')) {
            if (line.startsWith('data: ')) {
              try { rpc = JSON.parse(line.slice(6)); } catch {}
            }
          }
          resolve({ rpc, sessionId: newSid || sid });
        });
        res.on('error', reject);
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function connectMcp() {
  mcpReady = false;
  sessionId = null;
  try {
    const { rpc, sessionId: sid } = await mcpPost({
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'yanbot-dashboard', version: '1.0' } },
    });
    if (!sid || rpc?.error) throw new Error(rpc?.error?.message || 'no session id');
    sessionId = sid;
    // Send notifications/initialized (no response expected)
    await mcpPost({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }, sessionId);
    mcpReady = true;
    retryCount = 0;
    console.log('MCP session ready:', sessionId);
  } catch (err) {
    console.error('MCP connect failed:', err.message);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (retryCount >= MAX_RETRY) { console.error('MCP max retries reached'); return; }
  retryCount++;
  const delay = 2000 * retryCount;
  console.log(`Reconnecting MCP in ${delay}ms (attempt ${retryCount})`);
  setTimeout(connectMcp, delay);
}

async function callTool(tool, args) {
  if (!mcpReady || !sessionId) throw new Error('MCP session not ready');
  let rpcId = Math.floor(Math.random() * 1e9);
  const { rpc } = await mcpPost(
    { jsonrpc: '2.0', id: rpcId, method: 'tools/call', params: { name: tool, arguments: args || {} } },
    sessionId
  );
  if (!rpc) throw new Error('empty MCP response');
  if (rpc.error) throw new Error(rpc.error.message || JSON.stringify(rpc.error));
  const text = rpc.result?.content?.[0]?.text;
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

// ─── HTTP server ──────────────────────────────────────────────────────────────

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(data);
}

function serveStatic(res, rel) {
  const abs = path.resolve(PUBLIC_DIR, rel);
  if (!abs.startsWith(PUBLIC_DIR + path.sep) && abs !== PUBLIC_DIR) {
    res.writeHead(403); res.end(); return;
  }
  fs.readFile(abs, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); return; }
    const ext = path.extname(abs);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let buf = '';
    req.setEncoding('utf8');
    req.on('data', c => { buf += c; });
    req.on('end', () => resolve(buf));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/status') {
    sendJson(res, 200, { ready: mcpReady });
    return;
  }

  if (url.pathname === '/api/call' && req.method === 'POST') {
    if (!mcpReady) {
      sendJson(res, 503, { ok: false, error: 'MCP session not ready, please retry' });
      return;
    }
    let body;
    try { body = JSON.parse(await readBody(req)); }
    catch { sendJson(res, 400, { ok: false, error: 'invalid JSON body' }); return; }

    const { tool, args } = body;
    if (!tool) { sendJson(res, 400, { ok: false, error: 'missing tool' }); return; }

    try {
      const data = await callTool(tool, args);
      sendJson(res, 200, { ok: true, data });
    } catch (err) {
      // session may have expired — reconnect
      if (mcpReady) { mcpReady = false; connectMcp(); }
      sendJson(res, 502, { ok: false, error: err.message });
    }
    return;
  }

  if (req.method === 'GET') {
    url.pathname === '/' ? serveStatic(res, 'index.html') : serveStatic(res, url.pathname.slice(1));
    return;
  }

  res.writeHead(404); res.end();
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE')
    console.error(`Port ${PORT} is in use. Try: PORT=${PORT + 1} node server.js`);
  else
    console.error('Server error:', err.message);
  process.exit(1);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
  connectMcp();
});
