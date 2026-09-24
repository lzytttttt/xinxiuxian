# 01 · 引擎架构与 RNG

## 一、分层原则

```
┌─ ui/ ────────────────────────────────────────┐
│  React 组件，唯一写 DOM 的地方                 │
│  只读 store，只调 store 的 action              │
└──────────────────┬───────────────────────────┘
                   │
┌─ store/ ─────────▼───────────────────────────┐
│  Zustand，持有 RunState / MetaState           │
│  唯一允许碰 localStorage 的地方                │
│  驱动 tick 循环（setTimeout 自链）             │
└──────────────────┬───────────────────────────┘
                   │ 调用纯函数
┌─ engine/ ────────▼───────────────────────────┐
│  纯 TS。无 DOM、无 React、无副作用             │
│  rollYear(s, rng, content) → TickResult       │
│  编译器强制（见 00-project-setup.md §3）       │
└──────────────────┬───────────────────────────┘
                   │ 只 import 类型
┌─ content/ ───────▼───────────────────────────┐
│  声明式数据。不 import 引擎实现，只 import 类型 │
└──────────────────────────────────────────────┘
```

**引擎对内容无感知**——它接收 `ContentBundle` 参数，可以用 3 个事件的 fixture bundle 做测试。

---

## 二、RunState（单局状态）

```ts
export type Arc = 'mortal' | 'immortal';
export type SchoolId = '剑修'|'丹修'|'体修'|'毒修'|'雷修'|'魔修';
export type BondType = '道侣'|'师徒'|'挚友'|'宿敌'|'同门';

export interface Realm { arc: Arc; stage: number; level: number; }

export interface RunState {
  // ── 身份
  runId: string;
  seed: string;
  life: number;                 // 第几世
  createdAt: number;

  // ── 移植自参考实现的核心字段
  age: number;
  year: number;
  simPoints: number;
  cultivation: number;
  root: number;
  luck: number;
  artifactPower: number;
  artifactBonus: number;
  xianqi: number;
  chaosQi: number;
  realm: Realm;
  fates: [Fate, Fate];
  breakthroughMult: number;
  tribulationReqMult: number;
  yearsStayed: number;          // 仙界滞留年数
  qiDeviationRisk: number;
  innate: number;               // 初始灵根（灵根蜕变判定用）
  brokeThisYear: boolean;
  pinnacleThisYear: boolean;
  tribPassed: number;
  gotSpecial: boolean;
  ascended: boolean;
  dead: boolean;
  ascendMode: string;
  conquered: ConqueredItem[];
  fruits: ArtifactItem[];
  maxCount: Record<string, number>;

  // ── 新增：功法
  arts: Record<ArtId, { level: number; insight: number }>;
  slots: (ArtId | null)[];      // 长度 6
  insight: number;

  // ── 新增：丹药
  herbs: Record<HerbId, number>;
  recipes: Record<RecipeId, { known: boolean; mastery: number }>;
  pills: Record<PillId, number>;
  toxicity: number;             // 丹毒 0-100

  // ── 新增：宗门
  sect: {
    id: SectId | null;
    rank: number;               // 0-4
    contribution: number;
    joinedYear: number | null;
    defections: number;
    tension: Record<SectId, number>;
  };

  // ── 新增：羁绊
  bonds: Bond[];

  // ── 新增：事件记忆
  flags: Record<string, number>;        // 计数器 + 年份戳
  cooldowns: Record<string, number>;    // eventId → 上次触发年份
  onceFired: string[];
  recencyQueue: string[];               // 最近 20 个事件 id
  deferredQueue: string[];              // 被弹框优先级挤掉的事件
  scheduled: { eventId: string; year: number }[];
  chainDepth: number;

  // ── 新增：战斗策略
  battlePolicy: 'manual'|'yes'|'no'|'smart'|'random';
  smartX: number;                       // 智能阈值，默认 1.0
  autopilot: AutopilotConfig | null;    // 非 null 时本局禁用成就

  // ── 新增：待决策
  awaiting: Decision | null;

  // ── 统计与日志
  stats: RunStats;
  log: LogLine[];                       // 环形，上限 300
}
```

**与参考实现的字段对照**：`simPts` → `simPoints`、`xianqi` 保留、`fateXianqi/fateBrk/fateTrib` 合并为 `breakthroughMult` / `tribulationReqMult` 与命格对象。合并的原因是参考实现用三个独立字段存命格加成，新增命格属性时就要加字段——改为在 `fates[]` 里查更可扩展。

---

## 三、MetaState（跨局状态）

```ts
export interface MetaState {
  version: 1;

  // ── 传承
  legacyPoints: number;
  lifetimeLegacy: number;
  cave: Record<RoomId, number>;         // 六室，各 0-5

  // ── 解锁
  unlocks: { arts: ArtId[]; recipes: RecipeId[]; sects: SectId[] };
  sectLegacy: Record<SectId, number>;   // 各宗门历史最高职位

  // ── 历史
  pastLives: LifeSummary[];
  pastPartners: PastPartner[];

  // ── 收集
  achievements: string[];
  codex: CodexBits;                     // 位串压缩
  pity: number;

  // ── 偏好与统计
  autoPolicy: AutopilotConfig;
  settings: { reducedMotion: boolean; visualIntensity: 'low'|'mid'|'high'; textSpeed: number };
  totals: { runs: number; years: number; ascensions: number; zhengdao: number; bestLevel: number };
}
```

**`RunState` 与 `MetaState` 不共用任何字段名**——这样 meta 迁移永远不会污染 run。这是 [03-persistence.md](03-persistence.md) 的硬规则之一。

---

## 四、具名 RNG 流

### 问题

参考实现全程用裸 `Math.random()`，导致：
- 无法复现任何一局
- 无法做平衡测试（它自己写了 `testLv/testCombat` 分位函数就是为了绕过这点）
- 改任何一处随机调用都会扰动全局序列

### 设计

```ts
export type StreamName =
  | 'break' | 'encounter' | 'artifact' | 'event' | 'fate' | 'root' | 'luck'
  | 'alchemy' | 'tribulation' | 'bond' | 'sect' | 'reward' | 'misc';

export interface Rng {
  next(): number;                          // [0,1)
  int(a: number, b: number): number;       // [a,b] 闭区间整数
  chance(p: number): boolean;
  pick<T>(xs: T[]): T;
  weighted<T>(xs: [T, number][]): T;
}

export type RngBag = Record<StreamName, Rng>;
```

**派生**：一个 root seed → 每条流用 `` `${seed}:${name}` `` 过 xmur3 哈希 → mulberry32 生成器。

```ts
export function makeRngBag(seed: string): RngBag;
```

### 三条纪律

1. **流不进 state、不做全局。** 每个子系统接收 `rng: RngBag` 参数。
2. **分流的意义**：改炼丹平衡不会扰动突破序列。这在参考实现里是不可能的。
3. **`Math.random` 在 `src/engine/**` 被 ESLint 禁止（error 级）。** 见 [05-toolchain.md](05-toolchain.md)。

### 重放

```
RunState.seed + 有序 DecisionRecord[] 完全决定一局

DecisionRecord = { year: number; eventId: string; choiceId: string; payload?: unknown }

replayRun(seed, decisions, content): RunState
  → 重执行 rollYear 与 applyChoice
  → 在首个 log hash 分歧处抛错（不静默继续）
```

`tools/sim.ts` 与 `tools/balance.ts` 靠它跑万局无头模拟。

---

## 五、Tick 契约

```ts
export interface TickResult {
  logs: LogLine[];
  pending: Decision | null;
  ended: RunEndReason | null;
}

export function rollYear(s: RunState, rng: RngBag, c: ContentBundle): TickResult;
export function applyChoice(s: RunState, d: Decision, choiceId: string, rng: RngBag, c: ContentBundle): TickResult;
```

**`LogLine`**：

```ts
export interface LogLine {
  cls: LogTone;              // 'year'|'brk'|'ev1'..'ev4'|'huan'|'rare'|'red'|'gold'|'xian'|'rainbow'|'god'|'special'|'dead'
  text: string;
  fx?: 'trib'|'levelup'|'ascend';   // 触发视觉特效
}
```

**槽位顺序**见 [product/01-core-loop.md §五](../product/01-core-loop.md#五逐年-tick-顺序14-槽)。**槽 14 的弹框仲裁是新增的**：

```ts
const PRIORITY = ['tribulation', 'encounter', 'bond', 'sect', 'alchemy'] as const;
// 全年最多产出一个 Decision，落选者进 deferredQueue，次年优先
```

`autopilot.ts` 在槽 14 自行按预设规则表结算，返回 `pending: null`。

---

## 六、内容注册表

**引擎不反向依赖内容。** 引擎定义类型与 `ContentBundle`；内容文件用类型化 helper 构造对象；`content/index.ts` 汇总。

```ts
// engine/registry.ts
export interface ContentBundle {
  events: EventDef[];
  arts: ArtDef[];
  recipes: Recipe[];
  herbs: Herb[];
  pills: PillDef[];
  sects: SectDef[];
  missions: Mission[];
  rollTables: RollTable[];
}

export function defineEvent(e: EventDef): EventDef { return e; }
export function defineArt(a: ArtDef): ArtDef { return a; }
// ... 其余 define*
```

```ts
// content/events/mortal/early.ts
import { defineEvent } from '../../../engine/registry';

export const MORTAL_EARLY = [
  defineEvent({ id: 'ev_world_herb_patch', /* ... */ }),
  // ...
] satisfies EventDef[];
```

```ts
// content/index.ts
import { MORTAL_EARLY } from './events/mortal/early';
// ...
export const BUNDLE: ContentBundle = Object.freeze({
  events: [...MORTAL_EARLY, ...MORTAL_MID, /* ... */],
  arts: [...], recipes: [...], /* ... */
});
```

**收益**：写手只加对象字面量，无注册步骤、无构建配置；引擎测试可以用 3 个事件的 fixture bundle，不必加载全部内容。

---

## 七、selectors.ts —— 派生值的唯一来源

**所有跨系统派生值集中在此**，防止重复实现导致的不一致：

```ts
export function powerOf(s: RunState): number;              // 最终战力（含六乘区与软封顶）
export function luckMult(s: RunState): number;             // 1 + luck/1000  ← 唯一定义点
export function levelTier(level: number): number;
export function localLevel(s: RunState): number;
export function talentTier(root: number): number;
export function talentMult(root: number): number;
export function breakChance(tier: number, localLvl: number, arc: Arc): number;
export function escapeRate(level: number, encTier: number): number;
export function supportBonus(s: RunState): number;         // 羁绊助战，cap 30%
export function zones(s: RunState): ZoneBreakdown;         // 六乘区明细（供面板）
export function effectiveToxicity(s: RunState): number;
```

### `luckMult` 的硬约束

> ⚠ **`luckMult` 只在 `tick.ts` 的通道掷骰处应用，绝不在事件内部或系统内部应用。**

这是 [plan/03-risks.md R2](../plan/03-risks.md#r2) 的核心。三重防护：

1. **唯一定义点**：`selectors.ts`，且有测试 grep `src/engine/**` 断言 `/1000` 只出现一次。
2. **只在通道掷骰处应用**：`tick.ts` 的槽 7/8/9/10。
3. **每个通道一个单元测试**：气运从 0 翻到 1000，10 万次具名掷骰的触发率必须精确翻倍（±2%）。

---

## 八、zones() —— 战力构成的数据源

```ts
export interface ZoneBreakdown {
  z1: ZoneDetail;  // 修为总量
  z2: ZoneDetail;  // 灵根增幅
  z3: ZoneDetail;  // 法宝共鸣
  z4: ZoneDetail;  // 功法被动
  z5: ZoneDetail;  // 丹药状态
  z6: ZoneDetail;  // 气运命格
  rawProduct: number;
  softCapped: number;
  capApplied: boolean;
  finalPower: number;
}

export interface ZoneDetail {
  mult: number;
  cap: number;
  atCap: boolean;
  sources: { label: string; delta: number; kind: 'art'|'pill'|'fate'|'bond'|'cave'|'base' }[];
}
```

`PowerBreakdown.tsx` 直接消费 `zones()` 的返回值。

**验收断言**：`Σ sources[].delta` 加上基础值必须精确等于 `mult`（写成单元测试）。这条抓的是经典的"面板骗人"bug。
