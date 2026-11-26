# 研Bot Skill

用自然语言查询中国考研院校、历年复试和录取数据、研招网招生目录、院校公告和历史调剂样本。接入公开研Bot MCP 后，可以对比候选院校，按考试口径和招生年份核对条件。

## 直接提问

- 杭电计算机近三年的最低录取分和录取人数是多少？
- 2027 年哪些全日制计算机专业同时考 408 和数学一？
- 350 分，杭电和南昌大学的计算机怎么选？把历年分数、今年的考试科目和报考限制都列出来。
- 山东大学最近发复试通知了吗？附上公告原文。
- 去年哪些学校收过 081200 的校外调剂？哪些有今年的正式公告？

单项查询会读取对应的数据。择校、调剂等复合请求会结合多个查询结果，标明年份、数据口径、证据来源和待核验项。研Bot站内提供报告保存和作文批改。

## 安装与更新

将本仓库完整安装到客户端识别的技能目录，目录名为 `yanbot-skill`。WorkBuddy 的用户级目录为 `~/.workbuddy/skills/`。Codex 的用户级目录为 `~/.agents/skills/`，项目级目录为 `.agents/skills/`。其他客户端使用各自的技能导入入口。

可以把下面这段话发给支持本地技能的 Agent。

> 帮我把 https://github.com/niuyi1017/yanbot-skill 安装到当前客户端识别的技能目录，文件夹名为 yanbot-skill，保留完整仓库结构。请确认客户端能发现该 Skill，并使用现有研Bot MCP 连接。如果我还没有接入，请按 references/mcp-setup.md 配置。

已有 Git 克隆可在技能目录运行 `git pull --ff-only`。通过复制或导入安装时，更新整个技能目录中的发行文件，至少包含 `SKILL.md`、`references/`、`scripts/`、`server.js` 和 `public/`。保留 `public/user/` 中的自定义页面。刷新客户端或打开一个新会话来验证新版技能。

## 检查技能与 MCP

1. 在客户端技能列表确认 `yanbot-skill` 可用。可以先显式选择 Skill，验证客户端能读取它。
2. 在客户端的工具列表确认研Bot MCP 已启用。首次接入或要修复连接时，按平台阅读 [MCP 接入与配置](references/mcp-setup.md)。
3. 新建会话，直接发送上面的择校问题。查看客户端记录，确认它加载了 Skill 并查询了分数、招生目录和公告。日常查询沿用已配置的连接。

## 本地仪表盘

可以在技能目录运行 `node server.js`，然后打开 `http://localhost:3000`。启动方式和自定义页面开发见 [Dashboard 和自定义页面](references/dashboard.md)。

## 工具维护

[公开工具速查](references/public-mcp-tools.md)记录外部 Agent 可调用的公开只读工具。公开工具发布时，以目标环境 MCP 的分页 `tools/list` 核对工具名称和正文所用的参数。新增、改名或修改参数时，同步检查根目录技能、速查表和 [触发验收用例](evals/trigger-cases.md)。

## License

MIT
