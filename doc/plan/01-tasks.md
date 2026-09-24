# 01 · 任务拆解

分级：**P0** = 阻塞后续所有工作 · **P1** = 本 Phase 核心交付 · **P2** = 完善项，可延后。

---

## Phase 0 · 脚手架（0.5 天）

| 级别 | 任务 | 文件 |
|---|---|---|
| P0 | 初始化 npm 项目与依赖 | `package.json` |
| P0 | 三个 tsconfig + project references | `tsconfig.base.json` `tsconfig.engine.json` `tsconfig.app.json` `tsconfig.json` |
| P0 | Vite + React 插件配置 | `vite.config.ts` `index.html` |
| P0 | Vitest 双 project 配置 | `vitest.config.ts` |
| P0 | **验证编译器强制纯净**：写一个故意 import `localStorage` 的 engine 文件 → 确认编译失败 → 删除 | 临时文件 |
| P1 | Token 层 | `src/ui/tokens.css` |
| P1 | 基础样式与动画词表 | `src/ui/base.css` |
| P1 | 岛屿风格外壳 + 假日志流 + 硬编码资源条 | `src/main.tsx` `src/App.tsx` |
| P2 | ESLint 配置（含 `Math.random` 禁用） | `.eslintrc.json` |

**依赖**：无。**出口条件**：`npm run dev` 起得来；`tsc -b` 通过；故意的 DOM import 编译失败。

---

## Phase 1 · 忠实移植（4-6 天）

### P0 —— 引擎地基

| 任务 | 文件 |
|---|---|
| 类型定义（RunState / MetaState / LogLine / Decision） | `src/engine/types/{run,meta,log}.ts` |
| 具名 RNG 流（xmur3 + mulberry32，13 条流） | `src/engine/rng.ts` |
| 全部常量与数值表（含参考实现的所有表） | `src/engine/constants.ts` |
| 效果 DSL 类型 | `src/engine/types/effects.ts` |
| 解释器（七条语义） | `src/engine/interpret.ts` |
| 条件求值 + 记忆化 | `src/engine/conditions.ts` |
| 派生值唯一来源（含 `luckMult` 唯一定义点） | `src/engine/selectors.ts` |
| 内容注册表 | `src/engine/registry.ts` |

### P1 —— 核心循环

| 任务 | 文件 |
|---|---|
| 突破判定（查表 + 连破 + 关口 + 年龄系数） | `src/engine/breakthrough.ts` |
| 机缘（档位、隐藏战力、战斗、逃跑） | `src/engine/encounter.ts` |
| 法宝（档位、降服、加成） | `src/engine/artifact.ts` |
| 命格（6×4 矩阵、抽取、应用） | `src/engine/fate.ts` |
| 天劫（九重连渡、飞升、仙劫、走火入魔、证道） | `src/engine/tribulation.ts` |
| 总战力（此阶段仅基础公式，六乘区留到 Phase 3） | `src/engine/power.ts` |
| **逐年 tick（14 槽，此阶段仅槽 1-13）** | `src/engine/tick.ts` |
| 引擎 barrel | `src/engine/index.ts` |

### P1 —— 内容

| 任务 | 文件 |
|---|---|
| 135 个事件翻译为 DSL（**原创文案**） | `src/content/events/mortal/*.ts` `src/content/events/immortal/*.ts` |
| 命格定义 | `src/content/fates.ts` |
| 名称表词池 + 生成器 | `src/content/names/{pools,compose}.ts` `tools/gen-names.ts` |
| 生成产物 | `src/content/generated/names.json` |
| 内容汇总 | `src/content/index.ts` |

### P1 —— 状态与 UI

| 任务 | 文件 |
|---|---|
| Zustand run store + tick 循环驱动 | `src/store/runStore.ts` |
| 持久化（版本信封 + 节流） | `src/store/persistence.ts` |
| 修炼主屏（日志流 + 资源条） | `src/ui/screens/Cultivate.tsx` `src/ui/components/LogFeed.tsx` |
| 开局抽卡屏 | `src/ui/screens/Home.tsx` |

### P1 —— 验证

| 任务 | 文件 |
|---|---|
| 无头模拟器 + `--golden` `--calibrate` | `tools/sim.ts` |
| 黄金回归测试 | `tests/engine/golden.test.ts` |
| 概率通道测试（`luckMult` 唯一性与翻倍验证） | `tests/engine/luck.test.ts` |

**依赖**：Phase 0。**出口条件**：黄金回归通过 + 分位标定 ±8% + 完整一局可玩。

---

## Phase 2 · 决策 + DSL 硬化（3-4 天）

| 级别 | 任务 | 文件 |
|---|---|---|
| P0 | tick 槽 14：弹框仲裁与优先级 | `src/engine/tick.ts` |
| P0 | `applyChoice` / `resolveDecision` | `src/engine/index.ts` |
| P0 | flag / cooldown / recencyQueue / deferredQueue 生效 | `src/engine/interpret.ts` `src/engine/tick.ts` |
| P0 | 内容校验器 | `tools/validate-content.ts` |
| P1 | 决策弹层组件 | `src/ui/components/DecisionModal.tsx` |
| P1 | **60 个事件改写为 2-4 个真实选项**（带 `enable` 门槛与 `risk` 分支） | `src/content/events/mortal/mid.ts` 等 |
| P1 | 重放确定性测试 | `tests/engine/replay.test.ts` |
| P2 | 调试面板（事件记忆可视化） | `src/ui/screens/Self.tsx` |

**依赖**：Phase 1。**出口条件**：决策闸门断言通过；校验器 0 error；重放逐字节一致；单局 ≥25 决策。

---

## Phase 3 · 功法 + 战力构成（4-5 天）

| 级别 | 任务 | 文件 |
|---|---|---|
| P0 | 六乘区 + 硬上限 + 软封顶 | `src/engine/power.ts` |
| P0 | `zones()` 明细导出 | `src/engine/selectors.ts` |
| P0 | 功法系统（获得、升级、槽位、悟性） | `src/engine/arts.ts` |
| P0 | 流派共鸣 + 六条协同规则 | `src/engine/arts.ts` |
| P1 | 约 40 门功法内容 | `src/content/arts/*.ts` |
| P1 | 构筑屏 | `src/ui/screens/Build.tsx` `src/ui/components/ArtCard.tsx` |
| P1 | **战力构成面板** | `src/ui/panels/PowerBreakdown.tsx` |
| P1 | 开局三选一功法 | `src/ui/screens/Home.tsx` |
| P1 | 平衡断言（`P_build/P_nobuild`、乘区分布、面板诚实性） | `tools/balance.ts` `tests/engine/power.test.ts` `tests/engine/breakdown.test.ts` |

**依赖**：Phase 2。**出口条件**：`P_build/P_nobuild ∈ [2.0,4.5]`；面板逐项 Δ 之和 == 总倍率。

---

## Phase 4 · 丹药 + 炼丹（4-5 天）

| 级别 | 任务 | 文件 |
|---|---|---|
| P0 | 药材模型 + 丹方 schema | `src/engine/types/content.ts` |
| P0 | **控火小游戏引擎**（状态机、四动作、判定） | `src/engine/alchemy.ts` |
| P0 | 丹毒累积/衰减/两惩罚 | `src/engine/alchemy.ts` |
| P0 | 毒体 / 丹火不侵协同（接入 `arts.ts`） | `src/engine/arts.ts` |
| P1 | 约 35 丹方 + 约 60 药材 + 7 类丹药 | `src/content/{recipes,herbs,pills}.ts` |
| P1 | 炼丹屏 + 炉温条组件 | `src/ui/screens/Alchemy.tsx` `src/ui/components/HeatGauge.tsx` |
| P1 | 自动控火（mastery ≥3）+ 批量炼制 | `src/engine/alchemy.ts` `src/ui/screens/Alchemy.tsx` |
| P1 | **技能性测试**（贪心 ≥4.5，乱按 ≤1.5） | `tests/engine/alchemy.test.ts` |
| P1 | 丹毒/协同平衡断言 | `tools/balance.ts` |

**依赖**：Phase 3（协同需接入 `arts.ts`）。**出口条件**：技能性双断言通过；丹毒代价与毒修收益的对照断言通过。

---

## Phase 5 · 宗门 + 羁绊（5-7 天，工作量最大）

### 宗门

| 级别 | 任务 | 文件 |
|---|---|---|
| P0 | 宗门系统（加入、贡献、职位、俸禄、张力、叛宗） | `src/engine/sect.ts` |
| P1 | 八宗门定义 | `src/content/sects.ts` |
| P1 | 约 30 个宗门任务 | `src/content/missions.ts` `src/content/events/sect/*.ts` |
| P1 | 宗门大比（每 20 年） | `src/engine/sect.ts` |
| P1 | 宗门屏 | `src/ui/screens/Sect.tsx` |

### 羁绊

| 级别 | 任务 | 文件 |
|---|---|---|
| P0 | NPC 生成 + 五种关系 + 好感/等级 | `src/engine/bonds.ts` |
| P0 | NPC 同步成长 | `src/engine/bonds.ts` |
| P0 | 助战计算（**cap 30%**） | `src/engine/bonds.ts` `src/engine/selectors.ts` |
| P1 | 约 35 个羁绊事件 | `src/content/events/bond/*.ts` |
| P1 | 羁绊屏 | `src/ui/screens/Bonds.tsx` `src/ui/components/BondCard.tsx` |
| P1 | 前世道侣（跨局） | `src/engine/bonds.ts` `src/store/metaStore.ts` |
| P1 | 断言（散修 vs 宗门 ±10%、助战 ≤30%、背叛条件性） | `tools/balance.ts` `tests/engine/{sect,bond}.test.ts` |

**依赖**：Phase 3（宗门功法）。**出口条件**：入宗是选择不是税；助战上限断言通过。

---

## Phase 6 · 传承 + 洞府（4-5 天）

| 级别 | 任务 | 文件 |
|---|---|---|
| P0 | 传承点公式与结算 | `src/engine/meta.ts` |
| P0 | 洞府六室 + 升级阶梯 | `src/engine/meta.ts` |
| P0 | MetaState 持久化 | `src/store/metaStore.ts` |
| P0 | **存档迁移链 v1→v6 + fixture 测试** | `src/store/migrations.ts` `tests/fixtures/*.json` |
| P1 | 洞府屏 | `src/ui/screens/Cave.tsx` |
| P1 | 图鉴 / 成就（约 80 个）/ 高光 / 本地榜 | `src/ui/screens/{Codex,Self}.tsx` `src/content/achievements.ts` |
| P1 | **20 世进程断言（≤1.35×）** | `tools/sim.ts --lives 20` |
| P1 | 存档断言（迁移、校验和、节流、字段不冲突、体积） | `tests/persistence/*.test.ts` |

**依赖**：Phase 1-5（读取全部系统数据）。**出口条件**：20 世 ≤1.35×；每个迁移步骤有 fixture 测试。

---

## Phase 7 · 平衡、打磨、扩展（持续）

| 级别 | 任务 |
|---|---|
| P1 | 完整视觉打磨（全部动画、稀有度表现、`prefers-reduced-motion`） |
| P1 | 事件数补到 200 |
| P1 | 对比度审查（重点测 `--ink-3` on `--surface-1`） |
| P1 | 视觉强度设置（低/中/高）门控 `劫雷` 与 `飞升` |
| P2 | 8 门扩展功法（符/阵） |
| P2 | 高光 PNG 海报导出 |
| P2 | 无障碍完整审查（焦点陷阱、键盘导航、ARIA） |
| P2 | 新存档 / 满传承存档各 2 小时试玩 |

---

## 任务统计

| Phase | P0 | P1 | P2 | 估时 |
|---|---|---|---|---|
| 0 | 5 | 3 | 1 | 0.5 天 |
| 1 | 8 | 19 | 0 | 4-6 天 |
| 2 | 4 | 3 | 1 | 3-4 天 |
| 3 | 4 | 5 | 0 | 4-5 天 |
| 4 | 4 | 5 | 0 | 4-5 天 |
| 5 | 5 | 9 | 0 | 5-7 天 |
| 6 | 4 | 4 | 0 | 4-5 天 |
| 7 | 0 | 4 | 4 | 持续 |
| **合计** | **34** | **52** | **6** | **25-35 天** |
