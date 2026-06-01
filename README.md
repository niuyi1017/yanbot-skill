# Yanbot MCP Setup Skill

一键配置研bot（Yanbot）MCP 服务器，支持多平台自动检测与配置。

## 支持平台

| 平台 | 配置文件 |
|------|---------|
| **WorkBuddy** | `~/.workbuddy/mcp.json` |
| **Claude Desktop** | `%APPDATA%/Claude/claude_desktop_config.json` |
| **Cursor** | `~/.cursor/mcp.json` |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` |
| **Cline (VS Code)** | VS Code `settings.json` → `cline.mcpServers` |

## 研bot MCP 提供什么

研bot MCP 通过 `mcp__yanbot__*` 系列工具提供中国考研数据查询能力：

- **院校查询** — 搜索院校信息、获取院校详情
- **分数线查询** — 按院校/专业/年份查询录取分数线
- **调剂查询** — 查询调剂录取记录、聚合统计
- **资讯动态** — 考研资讯推送、任务监控
- **聚合分析** — 按多维度聚合分数线、调剂、资讯数据

MCP Server Endpoint: `https://api.yanbot.tech/mcp`

## 文件结构

```
yanbot-skill/
├── README.md                        # 本文件
├── SKILL.md                        # Skill 完整配置流程（WorkBuddy 格式）
└── scripts/
    └── check_yanbot_mcp.py         # 多平台配置检测 + 连通性验证脚本
```

## 使用方式

### 在 WorkBuddy 中使用

1. 将本仓库中 `SKILL.md` 和 `scripts/` 目录复制到 `~/.workbuddy/skills/yanbot-mcp-setup/`
2. 在对话中说 **"配置研bot MCP"**，Skill 会自动触发

### 手动配置

在各平台的配置文件中添加以下 JSON 条目：

```json
{
  "yanbot": {
    "url": "https://api.yanbot.tech/mcp"
  }
}
```

### 运行验证脚本

```bash
python scripts/check_yanbot_mcp.py
```

该脚本会自动检测所有已安装平台的配置状态，并验证 MCP 端点连通性。

## 交互示例

配置完成后，你可以直接用中文提问：

| 问题示例 | 功能 |
|---------|------|
| "帮我查一下山东大学的详细信息" | 院校查询 |
| "查一下山东大学计算机专业2025年的分数线" | 分数线查询 |
| "340分能调剂到哪些学校？专业代码081200" | 调剂查询 |
| "最近有没有山东大学考研的最新资讯？" | 资讯动态 |
| "对比杭电、南昌大学和南航三所学校计算机专业的录取分数" | 组合对比 |

## License

MIT
