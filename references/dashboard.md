# 研Bot 仪表盘和自定义页面

用户明确要求打开研Bot网页或开发研Bot仪表盘页面时，使用本页。仪表盘在本机运行，`server.js` 自行连接公开 MCP，浏览器通过同源接口查询资讯、分数和历史调剂数据。

## 启动仪表盘

1. 确认 `node --version` 显示 Node.js 16 或更高版本。
2. 将下列命令中的 `SKILL_DIR` 指向包含 `SKILL.md` 和 `server.js` 的安装目录。WorkBuddy 的常见位置是 `~/.workbuddy/skills/yanbot-skill/`。
3. 使用后台启动命令。若已有研Bot仪表盘在运行，直接使用它的地址。

Windows PowerShell。

```powershell
Start-Process node -ArgumentList 'server.js' -WorkingDirectory $Env:SKILL_DIR -WindowStyle Hidden
```

macOS 或 Linux。

```bash
cd "$SKILL_DIR" && node server.js &
```

默认服务监听 `127.0.0.1:3000`。若端口被其他服务占用，可在启动命令的环境中把 `PORT` 设为 `3001`，并使用对应地址。确认 `GET /api/status` 返回 JSON 后，再打开仪表盘。

```text
http://127.0.0.1:3000/api/status
http://127.0.0.1:3000/
```

Windows 用 `Start-Process` 打开地址，macOS 用 `open`，Linux 用 `xdg-open`。`/api/status` 返回 `{"ready":true}` 时，页面状态显示「已连接」。若页面一直显示「连接中」，检查本地服务输出及 `api.yanbot.tech` 的网络连通情况。

## 自定义页面

1. 根据用户要求确定页面名称及用途。已有相同文件名时，按用户指定的目标编辑或选择新的文件名。
2. 从 [public/template.html](../public/template.html) 复制模板到 `public/user/<页面名>.html`。目录不存在时先创建。该目录由 Git 忽略，更新 Skill 时保留其中的页面。
3. 修改标题、导航、筛选条件和结果区。保留 `../common.css`，在 `body` 末尾引入 `../common.js`，并在导航中保留 `id="badge"` 的连接状态元素。页面使用现有公共资源和本地接口即可。
4. 用 `YB.pollStatus(badgeEl, onReady)` 等待 MCP 连通，在就绪回调和后续页面操作中使用 `YB.callTool(toolName, args)` 查询。工具的名称、用法与数据口径见[公开工具速查](public-mcp-tools.md)。
5. 在运行中的服务访问 `http://127.0.0.1:3000/user/<页面名>.html`，检查样式、筛选、分页和空结果。若用户还要求加入内置导航，在 `public/index.html`、`public/feeds.html` 和 `public/data.html` 的导航中添加 `href="/user/<页面名>.html"`，保留各内置页面自己的 `active` 状态。

### 页面接口

`YB.callTool` 通过 `POST /api/call` 发送 `{ tool, args }`，解析本地代理的 `{ ok, data }` 并返回 `data`。例如查询带「调剂」标题或来源关键词的资讯。

```js
const data = await YB.callTool('query_feeds', {
  keyword: '调剂',
  page: 1,
  pageSize: 20,
});
YB.renderTable(resultEl, data.list, [
  { key: 'title', label: '标题' },
  { key: 'isoDate', label: '发布时间', fmt: value => YB.formatDate(value) },
]);
YB.renderPagination(paginationEl, data.pagination, loadData);
```

| 公共函数 | 用途 |
| --- | --- |
| `YB.pollStatus(badgeEl, onReady)` | 轮询 `/api/status`，刷新状态徽章，就绪后加载数据。 |
| `YB.renderTable(el, rows, colDefs, opts)` | 渲染结果表格。用 `sortKey` 和 `opts.onSort` 绑定排序。 |
| `YB.renderPagination(el, pagination, onPage)` | 根据接口分页字段渲染分页按钮。 |
| `YB.showLoading(el)`、`YB.showError(el, message)`、`YB.showEmpty(el, message)` | 显示加载、错误和空结果。 |
| `YB.esc(value)` | 转义来自接口的文本。自定义 `fmt` 返回 HTML 时，对插入的外部文本做转义。 |
| `YB.formatDate(value)`、`YB.formatScore(value)`、`YB.formatNum(value)` | 按内置样式格式化时间、分数和数字。 |
| `YB.debounce(fn, ms)`、`YB.renderTagChip(key)` | 对连续输入做防抖，或渲染资讯标签。 |

访问返回 404 时，核对 `public/user/` 下的文件名和 URL。`YB is not defined` 时，核对 `../common.js` 的路径和加载顺序。返回 `MCP session not ready` 时，等待状态恢复后重试。
