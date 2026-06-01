# 研bot

> 在 AI 助手里直接查考研数据——院校、分数线、调剂、资讯，用中文问就行。

---

## 安装研bot后，你可以做什么？

研bot 把全国考研数据库接入了你的 AI 助手。安装后，直接中文对话就能查：

> "对比杭电、南昌大学、南航三校计算机录取分数，看看 340 分哪个更合适上岸"
> "查 081200 专业所有接收校外调剂的学校，按平均分排序，只看 340 分以上"
> "山东大学最近有什么动态？顺便查它的 081200 专业分数线"


---

## 支持哪些 AI 平台？

| 平台 | 状态 |
|------|------|
| **WorkBuddy** | ✅ 自动写入 |
| **Claude Desktop** | ✅ 自动写入 |
| **Cursor** | ✅ 自动写入 |
| **Windsurf** | ✅ 自动写入 |
| **Cline (VS Code)** | ✅ 自动写入 |
| **VS Code Copilot** | ✅ 自动写入 |
| **Agent World（扣子）** | ✅ 在线安装 |
| **Trae IDE** | ✅ 手动添加 |
| **通义灵码** | ✅ 手动添加 |

---

## 如何安装？



直接把下面这段话发给有 shell 权限的 AI Agent：

> 帮我安装研bot Skill。请把 https://github.com/niuyi1017/yanbot-skill 克隆到 skills/yanbot-skill/，安装完成后检查 SKILL.md、scripts/ 是否存在，然后自动配置研bot MCP 连接。

> ⚠️ **VS Code Copilot 用户**：注意使用 `"servers"` 键（非 `"mcpServers"`），并加 `"type": "http"`。


---

## 常见问题

| 问题 | 解决 |
|------|-----|
| 安装后工具未出现 | 重启 AI 助手或刷新连接 |
| VS Code Copilot 查不了 | 确认用了 `"servers"` + `"type": "http"` |
| 通义灵码 MCP 不可用 | 插件 ≥ v2.5.0，Agent 模式 + qwen3 模型 |
| 连接超时 | 检查 `https://api.yanbot.tech/mcp` 是否可访问 |

---

## 开发

```bash
git clone <repo-url>
cd yanbot-skill
cp SKILL.md ~/.workbuddy/skills/yanbot-skill/
cp -r scripts/ ~/.workbuddy/skills/yanbot-skill/
```

```
yanbot-skill/
├── README.md              # 本文件
├── SKILL.md               # Skill 定义
└── scripts/
    └── check_yanbot_mcp.py  # 配置检测 + 连通验证
```

## License

MIT
