# 安装和修复研Bot MCP

用户明确要求安装、接入、配置或修复研Bot MCP 时，按本页处理。安装请求已包含配置意图，可以直接检查和配置当前客户端。

公开服务地址为 `https://api.yanbot.tech/mcp`，使用 Streamable HTTP。公开查询无需额外凭证。

## 检查并配置目标客户端

1. 使用用户指定的客户端。用户未指定时，优先根据运行环境识别当前客户端，无法识别时再询问。
2. 先读取现有配置或检查 MCP 面板。已启用且指向正确服务的 `yanbot` 条目可以直接进入验证。现有的可用代理配置也可沿用。
3. 需要修复时，只合并 `yanbot` 条目，保留其他连接、字段和原有结构。客户端提供配置界面时，优先从界面打开或修改对应的配置。

| 客户端 | 配置入口和格式 | 启用方式 |
| --- | --- | --- |
| WorkBuddy | `~/.workbuddy/mcp.json` 的 `mcpServers`。`yanbot` 条目使用 `url`，启用时可设 `disabled: false`。 | 在连接器管理中信任 `yanbot`，刷新对话。 |
| Codex | 用 `codex mcp list` 检查现有连接。首次添加用 `codex mcp add yanbot --url https://api.yanbot.tech/mcp`，修复时编辑对应配置中的 `mcp_servers.yanbot`。 | 确认 `yanbot` 已启用后，新建会话检查工具。 |
| Claude Desktop | Windows `%APPDATA%/Claude/claude_desktop_config.json`，macOS `~/Library/Application Support/Claude/claude_desktop_config.json`。编辑时遵循该版本实际使用的配置结构。 | 重新打开客户端后，在对话的工具列表中查看 `yanbot`。 |
| Cursor | `~/.cursor/mcp.json` 的 `mcpServers`，`yanbot` 条目使用 `url`。 | 在 Cursor Settings → MCP 确认连接状态，必要时刷新。 |
| Windsurf | `~/.codeium/windsurf/mcp_config.json`。MCP Servers 面板可核对当前配置格式。 | 在 Windsurf Settings → MCP Servers 确认启用，必要时重启。 |
| Cline | 在 Cline 的 MCP 面板打开当前版本的配置，保留已经工作的连接格式。 | 在 Cline 的 MCP 面板确认已连接。 |
| VS Code Copilot | 工作区 `.vscode/mcp.json` 或 `MCP: Open User Configuration` 打开的用户级文件。使用 `servers`，条目包含 `type: "http"` 和 `url`。 | 在 Copilot Chat 的工具列表中启用 `yanbot`，必要时新建对话。 |
| Trae IDE | Settings → MCP → 手动添加，按面板要求填写 URL 或合并 `mcpServers` 配置。 | 在 MCP 服务列表确认连接，再从 Agent 对话检查工具。 |
| 通义灵码 | 个人设置 → MCP 服务，使用当前客户端支持的远程 MCP 配置方式填写名称 `yanbot` 和服务地址。 | 确认连接后切换到智能体模式，检查工具是否可用。 |

使用 `mcpServers` 和 `url` 的客户端可按以下结构合并。

```json
{
  "mcpServers": {
    "yanbot": {
      "url": "https://api.yanbot.tech/mcp"
    }
  }
}
```

VS Code Copilot 配置示例。

```json
{
  "servers": {
    "yanbot": {
      "type": "http",
      "url": "https://api.yanbot.tech/mcp"
    }
  }
}
```

## 验证当前会话

1. 确认 `yanbot` 已启用，按客户端要求完成信任、刷新或重启。
2. 检查当前会话是否列出公开工具，并实际调用 `get_school_data_meta`。拿到可用年份或其他有效元数据后，再确认工具可用。
3. 还可运行 Skill 目录中的 `scripts/check_yanbot_mcp.py` 辅助排查配置和网络，使用 Python 3.8 或更高版本。该脚本以 HTTP GET 检查地址可达，工具是否可调用以上一步为准。

```powershell
py -3 "$Env:SKILL_DIR\scripts\check_yanbot_mcp.py"
```

```bash
python3 "$SKILL_DIR/scripts/check_yanbot_mcp.py"
```

`SKILL_DIR` 指已安装的 `yanbot-skill` 目录，在 WorkBuddy 中通常是 `~/.workbuddy/skills/yanbot-skill/`。Windows 若没有 `py`，使用可用的 `python`。客户端能看到连接但会话缺少工具时，检查信任、Agent 模式和当前对话的工具开关。工具调用失败时，报告实际错误和受影响的功能。

验证成功后可以直接问「杭电计算机近三年最低录取分是多少」或「山东大学最近有没有复试通知」。更多查询见[公开工具速查](public-mcp-tools.md)。
