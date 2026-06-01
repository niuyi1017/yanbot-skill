---
name: yanbot-skill
description: "研bot (Yanbot) 综合技能包 —— 围绕中国考研数据（院校、分数线、调剂、资讯）的一站式能力集合。当前包含「功能一：MCP 接入与配置」，可一条指令在 8 个平台完成 MCP 安装、写入配置、连通性校验并给出使用示例（WorkBuddy / Claude Desktop / Cursor / Windsurf / Cline / VS Code Copilot / Trae IDE / 通义灵码）。后续功能（数据导出、定向监控、报告生成等）将以新的章节追加到本文件，调用方式不变。"
agent_created: true
---

# Yanbot Skill

研bot 综合技能包。本 Skill 是一个**功能容器**，按章节组织多个可独立调用的子功能。当前已实装的是**功能一：MCP 接入与配置**；后续功能会在下方「Feature Roadmap」中陆续落地，调用入口（本 Skill 名称 `yanbot-skill`）保持不变。

## 触发词路由

根据用户说的话，路由到对应的功能章节：

| 用户说什么 | 路由到 |
|-----------|-------|
| "安装研bot" / "install yanbot" / "配置研bot" / "接入研bot MCP" | **功能一：MCP 接入与配置** |
| "研bot 能做什么" / "研bot 有哪些功能" | 列出本文件下所有 `## Feature` 章节标题 |
| 其他研bot 相关请求 | 先确认目标功能，再路由；若尚未实装则告知「该功能规划中」并指引使用功能一 |

---

## Feature Roadmap

| # | 功能 | 状态 | 章节锚点 |
|---|------|------|---------|
| 1 | MCP 接入与配置（8 平台一键设置） | ✅ 已实装 | [Feature 1](#feature-1--mcp-接入与配置) |
| 2 | 数据导出（院校 / 分数线 / 调剂离线包） | ⏳ 规划中 | — |
| 3 | 定向监控（指定院校 / 专业的资讯订阅） | ⏳ 规划中 | — |
| 4 | 报告生成（择校 / 调剂决策报告） | ⏳ 规划中 | — |

> 新增功能时，在本表登记一行，并在下方追加一个 `## Feature N — <名称>` 章节，章节内沿用 `Step 0 / Step 1 / ...` 的结构。**不要**改动已有功能章节的编号。

---

# Feature 1 — MCP 接入与配置

> 本章节即原 `yanbot-mcp-setup` Skill 的完整内容，迁入后作为本技能包的第一个功能。

## Overview

Yanbot MCP provides `mcp__yanbot__*` tools for querying Chinese graduate admissions data:
- School queries (`mcp__yanbot__query_schools`, `mcp__yanbot__get_school_detail`)
- Score line queries (`mcp__yanbot__query_school_scores`, `mcp__yanbot__aggregate_school_scores`)
- Adjustment queries (`mcp__yanbot__query_adjustments`, `mcp__yanbot__aggregate_adjustments`)
- Feed/news queries (`mcp__yanbot__query_feeds`, `mcp__yanbot__aggregate_feeds`)
- Task queries (`mcp__yanbot__query_tasks`, `mcp__yanbot__get_task_detail`)

**MCP Server Endpoint**: `https://api.yanbot.tech/mcp` (HTTP/SSE, no auth required)

---

## Auto-Setup on Install (one command, zero config)

当本 Skill 被加载，或用户说 **"安装 研bot"** / **"install yanbot"** / **"配置研bot"** / **"接入研bot MCP"** 时，**立即按下方完整流程执行 Feature 1**，无需等待用户再说一遍"配置"：

1. **Detect current platform** from the running environment → Step 0
2. **Write MCP config** for that platform → Step 1
3. **Verify connectivity** → Step 2
4. **Guide activation** if needed → Step 2.5
5. **Show usage examples** and confirm readiness → Step 3

**Do NOT ask the user to say "配置研bot MCP" separately.** Installing and configuring are one atomic action. If the MCP is already configured, skip to Step 3 and show the existing setup is good.

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
| **VS Code Copilot** | `.vscode/mcp.json` (workspace) or user `mcp.json` | Same |
| **Trae IDE** | IDE Settings → MCP → 手动添加 JSON | Same |
| **通义灵码** | IDE Settings → MCP → 手动添加 SSE | Same |

> **注意**: VS Code Copilot 使用 `"servers"` 键（非 `"mcpServers"`），详见 Step 1 平台说明。
> **注意**: Trae IDE 和通义灵码的 MCP 配置通过 IDE 界面操作，无直接可编辑的配置文件路径。

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

**VS Code Copilot** — uses `"servers"` key (NOT `"mcpServers"`!) in `.vscode/mcp.json` or user-level `mcp.json`. For HTTP/SSE type, add `"type": "http"`:
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

**Trae IDE** — MCP 配置通过 IDE 界面操作，不支持直接编辑文件。指导用户在 Settings → MCP → 手动添加中粘贴 JSON：
```json
{
  "mcpServers": {
    "yanbot": {
      "url": "https://api.yanbot.tech/mcp"
    }
  }
}
```

**通义灵码** — MCP 配置通过 IDE 界面操作（暂不支持白屏化添加，仅支持配置文件添加）。指导用户在 设置 → MCP 服务 → 手动添加 SSE 中填写：
- 名称: `yanbot`
- 类型: `SSE`
- 服务地址: `https://api.yanbot.tech/mcp`

或直接在 JSON 配置文件（个人设置）中添加：
```json
{
  "mcpServers": {
    "yanbot": {
      "type": "sse",
      "url": "https://api.yanbot.tech/mcp"
    }
  }
}
```

After writing, confirm to the user which platform(s) have been configured.

---

## Step 2 — Run Connectivity Check

After writing config, verify the endpoint is reachable by running the script bundled with this Skill.

**不要硬编码绝对路径**。按下面优先级解析：

1. **脚本路径**：定位本 `SKILL.md` 所在目录下的 `scripts/check_yanbot_mcp.py`（即 `<SKILL_DIR>/scripts/check_yanbot_mcp.py`）。常见 `SKILL_DIR`：
   - WorkBuddy：`~/.workbuddy/skills/yanbot-skill/`
   - 其他平台：克隆/安装时的目标目录（用户自定义）
2. **Python 解释器**：优先用 `PATH` 中可用的解释器（Windows 用 `py -3` 或 `python`，macOS/Linux 用 `python3`）。仅当用户明确指定时才使用自定义解释器路径（例如 WorkBuddy 内置 `~/.workbuddy/binaries/python/.../python.exe`）。

参考调用示例（按平台自行替换）：

```bash
# macOS / Linux
python3 "$SKILL_DIR/scripts/check_yanbot_mcp.py"

# Windows (PowerShell)
py -3 "$Env:SKILL_DIR\scripts\check_yanbot_mcp.py"

# WorkBuddy（如需用内置 Python）
"~/.workbuddy/binaries/python/versions/3.13.12/python.exe" \
  "~/.workbuddy/skills/yanbot-skill/scripts/check_yanbot_mcp.py"
```

> 脚本本身不依赖任何第三方库，标准库即可运行（Python ≥ 3.8）。

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

### VS Code Copilot
1. Open VS Code, ensure GitHub Copilot extension is installed and active
2. If using workspace-level `.vscode/mcp.json`, the server auto-activates on next Copilot Chat session
3. If using user-level `mcp.json`, open Command Palette (`Ctrl+Shift+P`) → **MCP: Open User Configuration**
4. Verify yanbot is listed in the MCP servers panel under Copilot Chat

### Trae IDE
1. Open Trae IDE Settings → MCP
2. Verify **yanbot** appears in the MCP server list
3. If using Agent 模式, all configured MCP servers auto-attach — confirm yanbot tools are available in Agent conversation

### 通义灵码
1. 打开 IDE 右上角头像 → 个人设置 → MCP 服务
2. 确认 **yanbot** 出现在 MCP 服务列表中，状态为已连接
3. 切换到 **智能体 (Agent) 模式**（需配合 qwen3 模型）
4. 在对话中输入考研相关查询，Agent 会自动调用 yanbot MCP 工具

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
| VS Code Copilot: tools not showing | Ensure MCP config uses `"servers"` key (not `"mcpServers"`); restart VS Code |
| VS Code Copilot: server type mismatch | For HTTP/SSE servers, add `"type": "http"` in server config |
| Trae IDE: yanbot not in MCP list | Re-open Settings → MCP → 手动添加 and paste JSON; ensure no syntax errors |
| 通义灵码: MCP 服务不可用 | 确认插件版本 ≥ v2.5.0；确认在 Agent 模式下使用 qwen3 模型 |
| 通义灵码: 连接数量超限 | 通义灵码最多同时连接 10 个 MCP 服务，检查是否超限 |

---

# Feature 2 — 数据导出（规划中）

> 占位章节。计划支持把院校、分数线、调剂记录按筛选条件导出为 CSV / JSON 离线包。
> 触发词预留："导出研bot数据" / "yanbot export"。
> 实装前若用户触发，请回复："该功能尚在规划中，目前可先用 Feature 1 接入 MCP 后通过对话查询。"

# Feature 3 — 定向监控（规划中）

> 占位章节。计划支持订阅指定院校 / 专业的最新资讯，定时推送变更。
> 触发词预留："监控研bot动态" / "订阅院校资讯"。

# Feature 4 — 报告生成（规划中）

> 占位章节。计划生成择校 / 调剂决策报告（含分数对比、调剂概率估算、建议清单）。
> 触发词预留："生成择校报告" / "生成调剂报告"。
