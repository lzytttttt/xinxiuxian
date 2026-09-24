# 03 · 存档与迁移

## 一、为什么这件事必须提前设计

系统分 6 个 Phase 加，**存档格式至少变 6 次**，而玩家**会有进行中的局**。

参考实现的存档是散装的 `localStorage` 键值对（`xiuxian_ach` / `xiuxian_hl` / `xiuxian_speed` / `xiuxian_player` …），没有版本号、没有迁移、没有校验。任何一次结构变更都会静默丢档或让旧档崩溃。

本作从第一天就上版本信封。

---

## 二、版本信封

**绝不裸存状态。** 所有持久化数据包在统一信封里：

```ts
interface SaveEnvelope {
  v: number;                 // 格式版本
  meta: MetaState;
  run: RunState | null;      // null = 当前没有进行中的局
  checksum: string;          // meta + run 的稳定哈希
  savedAt: number;
}
```

**`localStorage` 键位**：

| 键 | 内容 |
|---|---|
| `xiuxian.save` | 主信封（meta + run） |
| `xiuxian.save.bak.{v}` | 迁移失败时的归档 |
| `xiuxian.settings` | UI 偏好（独立，不参与迁移） |

**`checksum`**：对 `JSON.stringify(meta) + JSON.stringify(run)` 做稳定哈希。加载时校验，不匹配则拒绝加载并归档——**宁可重开也不要用损坏的存档继续玩**。

---

## 三、迁移链

```ts
type Migration = (old: any) => any;

const MIGRATIONS: Record<number, Migration> = {
  1: (s) => { /* v1 → v2 */ return { ...s, v: 2, meta: { ...s.meta, /* 新字段 */ } }; },
  2: (s) => { /* v2 → v3 */ },
  // ...
};

function migrate(env: any): SaveEnvelope {
  let cur = env;
  while (cur.v < CURRENT_VERSION) {
    const m = MIGRATIONS[cur.v];
    if (!m) throw new MigrationError(`no migration from v${cur.v}`);
    cur = m(cur);
  }
  return cur as SaveEnvelope;
}
```

**每个迁移步骤必须有一个 fixture 测试**：`tests/fixtures/save-v{n}.json` 存真实的旧存档 blob，测试加载它并断言产出合法的 v(n+1) 状态。

**fixture 必须是真实的**——从实际运行中导出，而不是手写的"看起来像"的对象。手写 fixture 会漏掉真实存档里的边界情况（比如某个字段是 `null` 而不是 `undefined`）。

---

## 四、六条硬规则

### 1. 版本信封

见上。任何持久化数据必须带 `v`。

### 2. 迁移链顺序应用

`MIGRATIONS` 按版本号顺序执行，**不允许跳跃**。缺失中间步骤时抛错而不是猜测。

### 3. 同版本内只增不改

**不原地改名或改语义。** 加新字段 → 迁移旧值 → 旧键保留一个版本。

```ts
// ❌ 错误：直接改名
- simPts: number;
+ simPoints: number;

// ✅ 正确：加新字段，迁移旧值，旧键留一个版本
simPoints: number;
/** @deprecated v3 起改用 simPoints，v4 移除 */
simPts?: number;
```

### 4. RunState 与 MetaState 不共用字段名

**这是防止 meta 迁移污染 run 的关键。**

当前字段清单（顶层）无交集：

| RunState 顶层 | MetaState 顶层 |
|---|---|
| `runId` `seed` `life` `createdAt` | `version` |
| `age` `year` `simPoints` `cultivation` `root` `luck` | `legacyPoints` `lifetimeLegacy` `cave` |
| `artifactPower` `artifactBonus` `xianqi` `chaosQi` | `unlocks` `sectLegacy` |
| `realm` `fates` `breakthroughMult` `tribulationReqMult` | `pastLives` `pastPartners` |
| `yearsStayed` `qiDeviationRisk` `innate` | `achievements` `codex` `pity` |
| `brokeThisYear` `pinnacleThisYear` `tribPassed` `gotSpecial` | `autoPolicy` `settings` `totals` |
| `ascended` `dead` `ascendMode` `conquered` `fruits` `maxCount` | |
| `arts` `slots` `insight` `herbs` `recipes` `pills` `toxicity` | |
| `sect` `bonds` `flags` `cooldowns` `onceFired` | |
| `recencyQueue` `deferredQueue` `scheduled` `chainDepth` | |
| `battlePolicy` `smartX` `autopilot` `awaiting` `stats` `log` | |

**新增字段时必须检查此表。** 若确实需要同名，则必须加前缀区分（如 `metaCave` / `runCave`）。

### 5. 失败时归档，绝不静默丢档

```ts
function loadSave(): SaveEnvelope | null {
  const raw = localStorage.getItem('xiuxian.save');
  if (!raw) return null;
  try {
    const env = JSON.parse(raw);
    if (!verifyChecksum(env)) throw new ChecksumError();
    return migrate(env);
  } catch (e) {
    // 归档而不是删除
    localStorage.setItem(`xiuxian.save.bak.${extractVersion(raw)}`, raw);
    localStorage.removeItem('xiuxian.save');
    reportError(e);        // 告知玩家"存档已损坏，已备份"
    return null;
  }
}
```

**绝不静默丢档。** 玩家宁可看到一个"存档损坏，已备份"的提示，也不要看到进度凭空消失。

### 6. 节流写入

**不要每 tick 写。**

```
写入时机：
  · 每次决策点（applyChoice 之后）
  · 每 5 年
  · 页面隐藏时（visibilitychange）
  · 结算时
```

**为什么**：90 年 1× 速度会写 90 次，`JSON.stringify` 一个大状态对象每次都是几毫秒——累积起来就是可见的卡顿。

**额外优化**：`persist` 用一个 200ms 的 debounce，连续触发只写最后一次。

---

## 五、存档体积

| 部分 | 估算 |
|---|---|
| `MetaState` | ~8 KB（含 codex 位串、pastLives、achievements） |
| `RunState` | ~12 KB（含 log 300 行、bonds、arts、flags） |
| 信封 | ~1 KB |
| **合计** | **~21 KB** |

`localStorage` 通常有 5-10 MB 配额，21 KB 完全安全。

**`RunState.log` 是最大的字段**——上限 300 行、每行约 40 字节，约 12 KB。若需要瘦身，可只持久化最后 50 行（回顾一世功能不需要全部 300 行）。当前设计保留全部，因为 21 KB 远未触及配额。

---

## 六、设置与存档分离

UI 偏好（音量、手动模式、战斗策略、速度、视觉强度）存在**独立键** `xiuxian.settings`，不参与迁移。

**为什么**：设置是"玩家偏好"，存档是"游戏进度"。混在一起会导致：迁移失败时连音量设置都丢了。分离后，存档损坏不影响偏好。

```ts
interface UiSettings {
  sound: boolean;
  manual: boolean;
  battlePolicy: 'manual'|'yes'|'no'|'smart'|'random';
  smartX: number;
  tickMs: number;            // 默认 300
  visualIntensity: 'low'|'mid'|'high';
  alchemySpeed: 'slow'|'mid'|'fast';
}
```

---

## 七、验收标准

| 项 | 断言 | 命令 |
|---|---|---|
| 迁移链完整 | 每个版本都有 fixture 测试 | `npm test -- migrations` |
| fixture 真实 | fixture 从实际运行导出，非手写 | 人工审查 |
| 校验和 | 篡改任一字节能被检出 | `npm test -- persistence` |
| 失败归档 | 损坏存档被归档到 `bak.{v}` 而非删除 | `npm test -- persistence` |
| 节流生效 | 90 年模拟中写入次数 ≤ 25 | `npm test -- persistence` |
| 字段不冲突 | `RunState` 与 `MetaState` 顶层字段名无交集 | `npm test -- types` |
| 体积达标 | 存档 ≤ 50 KB | `npm test -- persistence` |
