# 研bot

> 在 AI 助手里直接查考研数据——院校、分数线、调剂、资讯，用中文问就行。

---

## 安装研bot后，你可以做什么？

研bot 把全国考研数据库接入了你的 AI 编程助手。安装后，直接中文对话就能查：

### 🏫 查院校

搜索任意院校的详细信息（层次、类型、所在地、硕博点）。

> "帮我查一下山东大学的详细信息"
> "搜索名字包含'航空'的院校"
> "山东有哪些 985/211？"

### 📊 查分数线

按院校、专业、省份、年份筛选历年录取分数线，支持多校横向对比。

> "查山东大学计算机专业分数线"
> "对比杭电、南航、南昌大学计算机录取分数"
> "哪些学校计算机专业平均分在 300-350 之间？"

### 🔄 找调剂

查询历年调剂录取记录，按分数段、调剂类型（校内/校外）聚合分析。

> "340 分能调剂到哪些学校？专业代码 081200"
> "一志愿山东大学，有哪些校内调剂机会？"
> "统计各校调剂的平均分和接收人数"

### 📰 追资讯

实时获取院校考研动态——招生简章变更、考试政策调整、复试通知。

> "最近山东大学有什么考研动态？"
> "帮我看看今天有哪些考研新闻"

### 💡 组合查询

一次对话搞定复杂分析，AI 自动调用多个数据源：

> "对比杭电、南昌大学、南航三校计算机录取分数，看看 340 分哪个更合适上岸"
> "查 081200 专业所有接收校外调剂的学校，按平均分排序，只看 340 分以上"
> "山东大学最近有什么动态？顺便查它的 081200 专业分数线"

---

## 支持哪些 AI 助手？

| 平台 | 状态 |
|------|------|
| **WorkBuddy** | ✅ 一键配置 |
| **Claude Desktop** | ✅ 自动写入 |
| **Cursor** | ✅ 自动写入 |
| **Windsurf** | ✅ 自动写入 |
| **Cline (VS Code)** | ✅ 自动写入 |
| **VS Code Copilot** | ✅ 自动写入 |
| **Trae IDE** | ✅ 手动添加 |
| **通义灵码** | ✅ 手动添加 |

---

## 如何安装？

### WorkBuddy 用户（推荐）

在对话中说：

> "安装 研bot"

AI 会自动完成安装和 MCP 接入，一次对话搞定。安装完就能直接查考研数据。

### 其他平台用户

直接把下面这段话发给有 shell 权限的 AI Agent：

> 帮我安装研bot Skill。请把 https://github.com/WiLL/yanbot-skill 克隆到 skills/yanbot-mcp-setup/，安装完成后检查 SKILL.md、scripts/ 是否存在，然后自动配置研bot MCP 连接。

> ⚠️ **VS Code Copilot 用户**：注意使用 `"servers"` 键（非 `"mcpServers"`），并加 `"type": "http"`。

---

## 验证安装

```bash
python scripts/check_yanbot_mcp.py
```

```
  [WorkBuddy] Config OK
  [VS Code Copilot] Config OK
  [Endpoint]   Reachable
  → 所有已配置平台均可正常使用！
```

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
cp SKILL.md ~/.workbuddy/skills/yanbot-mcp-setup/
cp -r scripts/ ~/.workbuddy/skills/yanbot-mcp-setup/
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
