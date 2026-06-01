---
name: yanbot-mcp-setup
description: "Automates the configuration of the Yanbot (研bot) MCP server across multiple AI agent platforms including WorkBuddy, Claude Desktop, Cursor, Windsurf, and Cline. It should be used when the user wants to set up, re-configure, or verify the Yanbot MCP connection. Writes the correct server entry into each platform's config file and guides the user through activation and verification."
agent_created: true
---

# Yanbot MCP Setup Skill

## Overview

Yanbot MCP provides `mcp__yanbot__*` tools for querying Chinese graduate admissions data:
- School queries (`mcp__yanbot__query_schools`, `mcp__yanbot__get_school_detail`)
- Score line queries (`mcp__yanbot__query_school_scores`, `mcp__yanbot__aggregate_school_scores`)
- Adjustment queries (`mcp__yanbot__query_adjustments`, `mcp__yanbot__aggregate_adjustments`)
- Feed/news queries (`mcp__yanbot__query_feeds`, `mcp__yanbot__aggregate_feeds`)
- Task queries (`mcp__yanbot__query_tasks`, `mcp__yanbot__get_task_detail`)

**MCP Server Endpoint**: `https://api.yanbot.tech/mcp` (HTTP/SSE, no auth required)

---

## Step 0 — Detect Platform and Check Existing Config

First, ask the user which platform(s) to configure. Default to the current platform.

### Platform Config Paths

| Platform | Config Path (Windows) | Config Path (macOS/Linux) |
|----------|----------------------|---------------------------|
| **WorkBuddy** | `~/.workbuddy/mcp.json` | `~/.workbuddy/mcp.json` |
| **Claude Desktop** | `%APPDATA%/Claude/claude_desktop_config.json` | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Cursor** | `~/.cursor/mcp.json` | `~/.cursor/mcp.json` |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` | `~/.codeium/windsurf/mcp_config.json` |
| **Cline (VS Code)** | VS Code settings: `settings.json` → `cline.mcpServers` | Same |

Read the relevant config file(s). If `yanbot` entry already exists with correct `url` and `disabled: false` (or no `disabled` key), skip to **Step 3 — Already Configured**.

If the entry is missing, wrong, or disabled, proceed to Step 1.

### Already Configured → Step 3 (shortcut)

If all target platforms already have the correct config, inform the user immediately:

> ✅ 研bot MCP 配置正常，无需修改。
> [platform list] 的配置文件中均已包含正确的 yanbot 连接。

Then proceed directly to **Step 3** to show interaction examples.

---

## Step 1 — Write MCP Configuration

The Yanbot MCP server entry is the same across all platforms:

```json
{
  "yanbot": {
    "url": "https://api.yanbot.tech/mcp"
  }
}
```

**Rules when merging:**
- Read the existing config file first.
- Preserve ALL existing server entries — do NOT overwrite other servers.
- If `yanbot` key already exists, update `url` and remove `disabled` or set it to `false`.
- Write the file using the Edit tool (not shell commands) to avoid encoding issues.
- For Claude Desktop: if the file uses the top-level `mcpServers` wrapper, keep it; some versions put servers directly at root level.

### Platform-specific notes:

**WorkBuddy** — uses `mcpServers` wrapper:
```json
{
  "mcpServers": {
    "yanbot": {
      "url": "https://api.yanbot.tech/mcp",
      "disabled": false
    }
  }
}
```

**Claude Desktop** — uses `mcpServers` wrapper. Older versions may use `"command"` + `"args"` for stdio; SSE type uses `"url"`:
```json
{
  "mcpServers": {
    "yanbot": {
      "url": "https://api.yanbot.tech/mcp"
    }
  }
}
```

**Cursor** — same format as above.

**Windsurf** — same format as above.

**Cline (VS Code)** — add to `cline.mcpServers` in VS Code `settings.json`:
```json
{
  "cline.mcpServers": {
    "yanbot": {
      "url": "https://api.yanbot.tech/mcp"
    }
  }
}
```

After writing, confirm to the user which platform(s) have been configured.

---

## Step 2 — Run Connectivity Check

After writing config, verify the endpoint is reachable:

```bash
"C:\Users\10961\.workbuddy\binaries\python\versions\3.13.12\python.exe" "C:\Users\10961\.workbuddy\skills\yanbot-mcp-setup\scripts\check_yanbot_mcp.py"
```

The script checks:
1. Whether the WorkBuddy `yanbot` entry exists in `~/.workbuddy/mcp.json`
2. Whether the MCP endpoint `https://api.yanbot.tech/mcp` is reachable (HTTP GET, expect 2xx or 4xx)

Report the result. If connectivity fails, suggest checking network/VPN settings.

---

## Step 2.5 — Activate per Platform

MCP servers do NOT activate automatically on most platforms. Guide the user per platform:

### WorkBuddy
1. Open Connector Management (连接器管理) — plug icon in left sidebar
2. Find **yanbot** in custom connectors
3. Click **Trust（信任）**
4. Refresh conversation

### Claude Desktop
1. Restart Claude Desktop app (it reads config on launch)
2. Verify the hammer icon appears in the input area — yanbot tools should be listed

### Cursor
1. Open Cursor Settings → MCP
2. Verify yanbot appears and shows connected status
3. If not, click the refresh/restart button

### Windsurf
1. Open Windsurf Settings → MCP Servers
2. Verify yanbot is listed and enabled
3. Restart Windsurf if needed

### Cline (VS Code)
1. Open Cline panel in VS Code
2. Click the MCP icon to see connected servers
3. yanbot should appear in the list

---

## Step 3 — Show Interaction Examples

After successful setup (or when config is already correct), present the following examples to guide the user on how to interact with Yanbot MCP tools.

Present this as a formatted table in the response:

### Example Questions for Yanbot MCP

#### 🏫 院校查询

| 你可以这么问 | 触发的工具 |
|-------------|-----------|
| "帮我查一下山东大学的详细信息" | `get_school_detail` |
| "搜索名字包含'航空'的院校" | `query_schools` |
| "山东有哪些985/211院校？" | `query_schools` |
| "查一下南昌大学的基本信息" | `get_school_detail` |

#### 📊 分数线查询

| 你可以这么问 | 触发的工具 |
|-------------|-----------|
| "查一下山东大学计算机专业2024年的分数线" | `query_school_scores` |
| "哪些学校计算机专业2024年平均分在300-350之间？" | `query_school_scores` / `aggregate_school_scores` |
| "帮我对比北航和南航2024年的录取分数" | `query_school_scores` (多校对比) |
| "081200专业有哪些学校招调剂？" | `query_school_scores` |

#### 🔄 调剂信息查询

| 你可以这么问 | 触发的工具 |
|-------------|-----------|
| "340分能调剂到哪些学校？专业代码081200" | `query_adjustments` |
| "一志愿山东大学，有哪些校内调剂机会？" | `query_adjustments` |
| "2024年校外调剂有哪些院校接收？" | `query_adjustments` |
| "统计各学校调剂的平均分和人数" | `aggregate_adjustments` |

#### 📰 资讯/动态查询

| 你可以这么问 | 触发的工具 |
|-------------|-----------|
| "最近有没有山东大学考研的最新资讯？" | `query_feeds` |
| "帮我看看今天有哪些考研新闻" | `query_feeds` |
| "研bot监控了哪些任务？" | `query_tasks` |

#### 💡 组合使用示例

- "帮我对比一下杭电、南昌大学和南航三所学校计算机专业的录取分数，看看340分调剂哪个更合适"
- "查一下081200专业所有接收校外调剂的学校，按平均分排序，只看340分以上的"
- "山东大学最近有什么考研动态？顺便查一下它的081200专业分数线"

**Tip**: 研bot支持自然语言查询，直接用中文描述需求即可，无需记忆工具名称。AI 会自动匹配合适的 MCP 工具。

---

## Common Issues

| Symptom | Fix |
|---------|-----|
| `yanbot` not in connector list | Config not saved correctly — re-run Step 1 |
| Tools not appearing after Trust | Restart the app |
| Connection timeout in script | Check network; endpoint is `https://api.yanbot.tech/mcp` |
| `disabled: true` in config | Set `disabled: false` and re-trust in UI |
| Claude Desktop shows no MCP | Ensure config JSON is valid; restart app |
| Cline shows disconnected | Check VS Code settings.json format |
