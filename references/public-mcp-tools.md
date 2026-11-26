# 研Bot 公开 MCP 工具速查

按用户意图选择工具。表中的名称是 MCP 注册名，实际调用使用当前会话提供的名称和参数定义。专业代码、院校代码和记录 ID 按字符串传递，保留前导零及字母。

常见列表通过 `page` 翻页。新版院校专业分数和研招网目录使用 `pageNo`。需要完整结果时按返回的分页字段继续读取，有意只取部分时说明覆盖范围。

## 院校资料

| 工具 | 用途和关键参数 |
| --- | --- |
| `query_schools` | 按 `name`、`schoolCode`、`provinceCode`、`provinceText`、`is985`、`is211` 等筛选院校。用它把学校名解析为院校代码或 ID。 |
| `get_school_detail` | 使用 `idOrCode` 精确读取院校资料。接受 ObjectId、`school_id` 或 `schoolCode`。 |
| `get_school_schema` | 获取院校列表的筛选、排序和可返回字段。 |
| `list_school_provinces` | 列出院校库的省份代码和名称。 |
| `list_school_types` | 列出院校库的学校类型。 |

## 新版专业分数、人数和分布

| 工具 | 用途和关键参数 |
| --- | --- |
| `get_school_data_meta` | 获取分数数据覆盖年份、默认年份、地区、学习方式和院校层次。 |
| `query_school_data_records` | 每次查一个 `year`。可按 `schoolCode`、`schoolName`、`majorCode`、`majorName`、`department`、`studyForm`、`dataMode` 过滤。结果包含记录 `id` 及分开统计的一志愿和调剂复试、录取数据。 |
| `get_school_data_record_detail` | 用列表返回的 `id` 作 `recordId`，读取同一学校、院系、专业和学习方式的历年分数、人数、考试科目与研究方向。 |
| `get_school_data_score_ranges` | 查一志愿总分分布。优先传 `recordId`，也可按 `schoolCode`、`majorCode`、`department`、`studyForm`、`year` 定位。跨年查询时逐年确认所用记录。 |

先对齐招生年份、院系、专业、学习方式和一志愿或调剂口径，再比较数据。最低录取分、进入复试考生最低分、官方复试线分别取对应来源。将 `null` 或未覆盖字段标为缺失。若需要官方复试线，查适用年份的正式公告。

## 研招网招生目录

| 工具 | 用途和关键参数 |
| --- | --- |
| `get_admission_catalog_meta` | 获取已覆盖的招生年份、快照时间和覆盖数量。 |
| `query_admission_catalogs` | 按招生 `year`、学校、院系、`majorCode`、`studyForm`、`degreeType` 和 `subjectCodes` 筛选。默认 `examMode` 为 `统考`。科目代码在同一套考试组合中匹配，例如 `['301', '408']`。 |
| `get_admission_catalog_detail` | 使用列表返回的 `programKey` 获取研究方向、考试组合、拟招生人数、备注和原始链接。完整读取时翻页到 `hasMore` 为 `false`。 |

招生目录的目标年份独立于历史分数年份。说明目录年份和覆盖缺口。人数按 `sharedKey` 去重，同一计划人数只计一次，并核对专项标记、备注和拟招生人数范围。

## 考研资讯、复试和调剂公告

| 工具 | 用途和关键参数 |
| --- | --- |
| `list_feed_tasks` | 用 `schoolName` 定位院校资讯来源，得到可用于过滤的任务 `_id`。 |
| `query_feeds` | 用 `taskId` 或 `taskIds` 按来源筛选，可叠加 `title`、`tagKey`、`publishedFrom`、`publishedTo`。`keyword` 匹配标题和来源。列表默认按发布时间倒序。 |
| `get_feed_detail` | 把列表中的资讯 `_id` 作为 `feedId`，读取正文、摘要和原文链接。 |
| `aggregate_feeds` | 按 `groupBy` 汇总资讯。可选 `task`、`tag`、`month`、`creator`，也可按任务、标签或日期过滤。 |
| `get_feed_schema` | 获取资讯的筛选、排序、字段裁剪和聚合定义。 |
| `list_feed_tags` | 获取资讯标签的 `key` 和名称，用于 `tagKey` 或 `tagKeys`。 |
| `query_tasks` | 用 `schoolCode`、`schoolId` 或 `title` 查采集任务，取得用于资讯查询的 `_id`。 |
| `get_task_detail` | 传采集任务 `taskId`，查所属院校、标题和最新资讯等基础资料。 |

判断公告是否适用时，核对发布单位、招生年份、院系专业及适用条件。保留原文链接，区分已核验的公告和待核验线索。范围较广的当前调剂查询可先检索调剂公告，结合已知院校定位来源后再读正文。

## 历史调剂录取样本

| 工具 | 用途和关键参数 |
| --- | --- |
| `query_adjustments` | 按 `year` 或 `yearFrom` / `yearTo`、`targetSubjectCode`、`targetSchoolCode`、`sourceSchoolCode`、`adjustmentType`、`minScore` / `maxScore` 查历史录取样本。 |
| `aggregate_adjustments` | 用 `groupBy` 统计样本，如 `targetSchool`、`targetSubject`、`year`、`scoreRange`。可选 `metrics` 如 `count`、`avgScore`、`minScore`、`maxScore`。 |
| `get_adjustment_schema` | 查看调剂样本的筛选、排序、聚合和字段定义。 |
| `list_adjustment_years` | 确认调剂样本覆盖的历史年份。 |
| `list_adjustment_types` | 获取可用于 `adjustmentType` 的校内、校外类型。 |
| `list_adjustment_score_ranges` | 获取 `scoreRange` 聚合使用的分段。 |

当前机会和报考资格以适用公告为依据。历史样本用于说明往年去向、分数和样本量，概率与当前缺额需要另外的证据。

## 旧版专业分数和聚合

新版未覆盖目标记录，或确实需要旧版字段和聚合时使用。将口径不同的数据分列，并说明使用了旧版记录。

| 工具 | 用途和关键参数 |
| --- | --- |
| `query_school_scores` | 按 `year` 或 `yearFrom` / `yearTo`、`schoolCode`、`subjectCode`、`college`、`studyForm` 查旧版专业分数与人数。 |
| `aggregate_school_scores` | 聚合旧版分数记录。必填 `groupBy` 支持 `schoolCode`、`subjectCode`、`province`、`level`、`year`，可用 `metrics` 选择指标。 |
| `get_school_score_schema` | 查看旧版分数的筛选、排序、字段裁剪和聚合定义。 |
| `list_score_years` | 列出旧版分数覆盖的年份。 |
| `list_score_provinces` | 获取旧版分数的省份代码和名称，可传 `year`。 |
| `list_score_levels` | 获取旧版分数的院校层次值，可传 `year`。 |
| `list_score_study_forms` | 获取旧版分数的学习方式，可传 `year`。 |
