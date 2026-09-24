# 02 · 效果 DSL 规范

**这是整个重构中最重要的一环。** 参考实现的 `cond/ok/fail` 闭包必须变成声明式数据，否则无法批量写 200 个带分支的事件、无法调平衡、无法校验、无法模拟。

---

## 一、为什么必须改

参考实现的事件长这样：

```js
{
  id: 'ziqi_donglai', name: '紫气东来', tier: 4, weight: 0.18, maxCount: 3,
  cond: function (g, U) { return g.lvl >= Math.min(80, Math.floor(g.age * 0.8)) + U.irand(0, 10); },
  ok:   function (g, U, log) { var tt = U.irand(10,24); U.addTalent(g, tt); /* ... */ },
  fail: function (g, U) { var lf = loseLife(g, U, 4, 10); /* ... */ }
}
```

问题：
1. **没有玩家决策**——`cond` 成立就走 `ok`，不成立走 `fail`，玩家全程旁观
2. **不可校验**——`U.addTalent(g, tt)` 引用什么、`g.root` 会不会被扣成负数，只有运行时才知道
3. **不可调平衡**——想批量看"所有给灵根的事件给了多少"必须读代码
4. **不可模拟**——闭包里的随机调用无法被具名 RNG 接管
5. **写手必须会写 JS**

DSL 把上述全部解决：数据化、可校验、可统计、可模拟、写手只需写对象字面量。

---

## 二、类型定义

### Target —— 可寻址的数值

```ts
export type Target =
  // 核心资源
  | { k: 'cultivation' } | { k: 'simPoints' } | { k: 'root' } | { k: 'luck' }
  | { k: 'artifactPower' } | { k: 'artifactBonus' } | { k: 'xianqi' } | { k: 'chaosQi' }
  // 新增系统
  | { k: 'insight' } | { k: 'toxicity' }
  | { k: 'herb'; id: HerbId } | { k: 'pill'; id: PillId }
  | { k: 'artLevel'; id: ArtId } | { k: 'artInsight'; id: ArtId }
  | { k: 'sectContribution' } | { k: 'sectRank' }
  | { k: 'bondLevel'; id: string } | { k: 'bondAffinity'; id: string }
  // 元状态
  | { k: 'flag'; id: string } | { k: 'cooldown'; id: string }
  | { k: 'realmLevel' } | { k: 'yearsStayed' };
```

### Condition —— 条件文法

```ts
export type Condition =
  | { op: 'always' } | { op: 'never' }
  | { op: 'and'; of: Condition[] } | { op: 'or'; of: Condition[] } | { op: 'not'; of: Condition }
  | { op: 'cmp'; target: Target; cmp: '<'|'<='|'=='|'>='|'>'; value: number }
  | { op: 'flag'; id: string; min?: number; max?: number }
  | { op: 'sect'; id: SectId }
  | { op: 'rankAtLeast'; rank: number }
  | { op: 'school'; id: SchoolId; countAtLeast: number }        // 统计已装备功法
  | { op: 'bondType'; type: BondType; countAtLeast: number }
  | { op: 'hasPill'; id: PillId; countAtLeast?: number }
  | { op: 'hasHerb'; id: HerbId; countAtLeast?: number }
  | { op: 'toxicityAtMost'; value: number }
  | { op: 'rootTierAtLeast'; tier: number }
  | { op: 'realmAtLeast'; level: number }
  | { op: 'lifeAtLeast'; n: number }                            // 第几世
  | { op: 'chance'; p: number }                                 // 消费 rng.event
  | { op: 'roll'; table: RollTableId };                         // 消费 rng.event
```

### Effect —— 效果算子

```ts
export type Effect =
  | { op: 'add' | 'sub'; target: Target; value: number }
  | { op: 'pct'; target: Target; value: number; base?: 'snapshot' | 'live' }
  | { op: 'set' | 'mul'; target: Target; value: number }
  | { op: 'clamp'; target: Target; lo?: number; hi?: number }
  | { op: 'setFlag' | 'incFlag'; id: string; value?: number }
  | { op: 'clearFlag'; id: string }
  | { op: 'setCooldown'; id: string; years?: number }
  | { op: 'grantPill'; id: PillId; count: number }
  | { op: 'grantHerb'; id: HerbId; count: number }
  | { op: 'grantArt'; id: ArtId }
  | { op: 'learnRecipe'; id: RecipeId }
  | { op: 'gainInsight'; value: number }
  | { op: 'addToxicity'; value: number }
  | { op: 'bond'; action: 'create'|'levelUp'|'break'|'retype'; type?: BondType; id?: string; npcSeed?: string }
  | { op: 'sectJoin'; id: SectId }
  | { op: 'sectLeave'; defect: boolean }
  | { op: 'chain'; eventId: string }
  | { op: 'schedule'; eventId: string; inYears: number }
  | { op: 'log'; text: string; tone?: LogTone }
  | { op: 'endRun'; reason: RunEndReason }
  | { op: 'if'; cond: Condition; then: Effect[]; else?: Effect[] };
```

### Outcome / Choice / EventDef

```ts
export interface Outcome {
  when?: Condition;
  weight?: number;
  text: string;                 // 支持 {token} 插值
  tone?: LogTone;
  effects: Effect[];
}

export interface Choice {
  id: string;
  label: string;
  show?: Condition;             // 不满足则整个选项不显示
  enable?: Condition;           // 不满足则显示但置灰
  disabledReason?: string;      // 置灰时显示的原因
  cost?: Effect[];              // 先于 outcomes 原子应用
  outcomes: Outcome[];
  hint?: { risk: 0|1|2|3; reward: 0|1|2|3 };   // 只给粗略档位，不泄底
}

export interface EventDef {
  id: string;
  title: string;
  category: EventCategory;
  body: string;                 // 支持 {token} 插值
  tierMin?: number;             // 稀有度下限 1-4
  tierMax?: number;
  levelMin?: number;
  levelMax?: number;
  weight: number;
  once?: boolean;
  cooldownYears?: number;
  requires?: Condition;         // 进入事件池的门槛
  school?: SchoolId[];
  tags?: string[];
  choices: Choice[];
  chain?: { setsFlag?: string; consumesFlag?: string };
}

export type EventCategory =
  | 'world' | 'encounter' | 'bond' | 'sect' | 'alchemy' | 'chain' | 'tribulation' | 'fate';
```

---

## 三、解释器语义（七条）

`engine/interpret.ts` 的实现必须严格遵循：

### 1. 快照

结算前对本次 outcome 涉及的所有 `Target` 取浅快照。`pct` 默认读快照（`base: 'snapshot'`）。

**为什么**：让效果与书写顺序无关。这是让 [product/04-arts-build.md 的数值预算表](../product/04-arts-build.md#数值预算表p50-目标值) 能成立的前提——否则 `{pct: cultivation, 5}` 写在不同位置会得到不同结果，数值无法预测。

需要读运行值时显式写 `base: 'live'`。

### 2. 代价先行且原子

`cost` 先于 `outcomes` 应用。若任何 cost 会把受限 Target 压到下限以下，视为 `enable` 失败（UI 显示 `disabledReason`）。

**不允许部分扣除。** 玩家不会遇到"扣了一半资源然后告诉我不能选"的情况。

### 3. outcome 选择

```
若任一 outcome 有 weight：
  → 先按 when 过滤，再 rng.event.weighted 抽
否则：
  → 取第一个 when 通过的
  → 无 when 的是兜底项，必须在数组末尾（由校验器强制）
```

### 4. 应用顺序

- 效果**严格按数组顺序**执行
- `add` / `sub` 累加到运行值
- `pct` 默认走快照
- `if` 分支按运行值判断
- `chain` / `schedule` **只入队不递归**（`chainDepth` 上限 3，超出丢弃并告警）

### 5. 钳制

在效果数组末尾**统一执行一次**：

| Target | 范围 |
|---|---|
| `cultivation` | ≥ 0 |
| `simPoints` | ≥ 0（归零则 `ended: 'simDepleted'`） |
| `root` | ≥ 1 |
| `luck` | ≥ 0 |
| `artifactPower` | ≥ 0 |
| `artifactBonus` | ≥ 0 |
| `toxicity` | 0-100 |
| `insight` | ≥ 0 |
| `sectRank` | 0-4 |
| `bondLevel` | 0-5 |
| `bondAffinity` | 0-100 |
| `realmLevel` | 1-200 |
| `yearsStayed` | ≥ 0 |

参考实现的事件文件里手写了 `loseLife` / `loseCult` / `loseRoot` 三个兜底工具函数——DSL 把这件事收敛到解释器一处，写手不需要关心。

### 6. 失败判定记忆化

每个 `chance` / `roll` 节点在一次事件结算内**最多求值一次**，按节点路径缓存。

**为什么**：同一个条件写在 `show` 和 `if` 里必须得到同一答案。否则 UI 显示"成功率 60%"然后判定时用的是另一个结果——**预览会骗人**。

### 7. 确定性

所有随机走 `rng.event`，**按声明顺序消费**。校验器强制兄弟 `chance` 节点路径唯一（防止两个同路径的 chance 节点导致顺序歧义）。

---

## 四、Flag 与状态机制

### 链式事件

```ts
// 前置事件
chain: { setsFlag: 'flag_blood_pool_open' }
// 后续事件
requires: { op: 'and', of: [
  { op: 'flag', id: 'flag_blood_pool_open', min: 1 },
  { op: 'realmAtLeast', level: 80 }
]},
chain: { consumesFlag: 'flag_blood_pool_open' }
```

### 一次性事件

```ts
once: true          // 本局仅一次（写入 onceFired[]）
```

### 冷却

```ts
cooldownYears: 10   // 触发后 10 年内不再抽取（写入 cooldowns[eventId]）
```

### 延迟调度

```ts
{ op: 'schedule', eventId: 'ev_chain_blood_pool_return', inYears: 10 }
```

### 校验器对 flag 的强制

| 情况 | 级别 |
|---|---|
| flag 被读但**没有任何事件写入** | **error** |
| flag 被写但**没有任何事件读取** | warning（可能是死代码） |

---

## 五、三个完整示例

### 示例 A —— 2 选项

```ts
defineEvent({
  id: 'ev_world_herb_patch',
  title: '崖畔灵草',
  category: 'world',
  weight: 100,
  cooldownYears: 6,
  body: '崖壁上有一株{herb}，根须缠着碎石，风一吹便散出冷香。',
  choices: [
    {
      id: 'take',
      label: '攀崖采下',
      outcomes: [
        { weight: 70, text: '你稳稳摘下，收入囊中。', tone: 'gold',
          effects: [
            { op: 'grantHerb', id: '{herb}', count: 2 },
            { op: 'log', text: '得{herb}×2', tone: 'gold' }
          ] },
        { weight: 30, text: '碎石滑落，你擦破了手臂。',
          effects: [
            { op: 'add', target: { k: 'simPoints' }, value: -1 },
            { op: 'grantHerb', id: '{herb}', count: 1 }
          ] }
      ]
    },
    {
      id: 'leave',
      label: '不动它',
      outcomes: [
        { text: '你绕路而行，心绪反而通透。',
          effects: [{ op: 'gainInsight', value: 1 }] }
      ]
    }
  ]
});
```

### 示例 B —— 3 选项，含资源门槛

```ts
defineEvent({
  id: 'ev_sect_elder_favor',
  title: '长老赐丹',
  category: 'sect',
  weight: 80,
  requires: { op: 'rankAtLeast', rank: 2 },
  cooldownYears: 10,
  body: '长老取出丹炉，炉中三枚丹药嗡鸣。',
  choices: [
    {
      id: 'gift',
      label: '谢过长老',
      outcomes: [
        { text: '长老颔首。',
          effects: [
            { op: 'grantPill', id: 'pill_pojing', count: 1 },
            { op: 'add', target: { k: 'sectContribution' }, value: 40 }
          ] }
      ]
    },
    {
      id: 'trade',
      label: '以仙灵气换整炉',
      show:   { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
      enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
      disabledReason: '需仙灵气×1',
      cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
      outcomes: [
        { weight: 65, text: '长老大笑，整炉归你。', tone: 'gold',
          effects: [
            { op: 'grantPill', id: 'pill_pojing', count: 3 },
            { op: 'grantPill', id: 'pill_xisui', count: 1 }
          ] },
        { weight: 35, text: '长老收下仙灵气，却只予你两枚。',
          effects: [{ op: 'grantPill', id: 'pill_pojing', count: 2 }] }
      ]
    },
    {
      id: 'refuse',
      label: '婉拒，只求学艺',
      outcomes: [
        { text: '长老传你一段口诀。',
          effects: [
            { op: 'learnRecipe', id: 'rec_pojing_2' },
            { op: 'gainInsight', value: 2 }
          ] }
      ]
    }
  ]
});
```

### 示例 C —— 链式事件（写 flag → 读 flag）

```ts
// 第一段：设置 flag
defineEvent({
  id: 'ev_chain_blood_pool',
  title: '血池低语',
  category: 'chain',
  weight: 60,
  once: true,
  levelMin: 40,
  body: '山腹血池翻涌，池底似有物事应你呼吸。',
  chain: { setsFlag: 'flag_blood_pool_open' },
  choices: [
    {
      id: 'drink',
      label: '饮下',
      outcomes: [
        { text: '血脉灼痛，你记住了那道气机。', tone: 'xian',
          effects: [
            { op: 'setFlag', id: 'flag_blood_pool_open', value: 1 },
            { op: 'pct', target: { k: 'cultivation' }, value: 8 },
            { op: 'addToxicity', value: 15 }
          ] }
      ]
    },
    {
      id: 'seal',
      label: '封住池口',
      outcomes: [
        { text: '你以灵石封阵，池水归于死寂。',
          effects: [
            { op: 'add', target: { k: 'luck' }, value: 2 },
            { op: 'clearFlag', id: 'flag_blood_pool_open' }
          ] }
      ]
    }
  ]
});

// 第二段：读取 flag（weight: 0 → 不参与常规抽取，只由 requires 门控）
defineEvent({
  id: 'ev_chain_blood_pool_return',
  title: '池底之物',
  category: 'chain',
  weight: 0,
  requires: { op: 'and', of: [
    { op: 'flag', id: 'flag_blood_pool_open', min: 1 },
    { op: 'realmAtLeast', level: 80 }
  ]},
  chain: { consumesFlag: 'flag_blood_pool_open' },
  body: '十年后你再临血池，池水已干，露出一枚暗红骨珠。',
  choices: [
    {
      id: 'refine',
      label: '炼化骨珠',
      outcomes: [
        { text: '骨珠入体，魔气翻腾。', tone: 'xian',
          effects: [
            { op: 'grantArt', id: 'art_mo_blood_pearl' },
            { op: 'addToxicity', value: 25 },
            { op: 'clearFlag', id: 'flag_blood_pool_open' }
          ] }
      ]
    }
  ]
});
```

> **注意 `weight: 0`**：链式后续事件的 `weight` 设为 0，它不参与常规的两阶段抽样，只由 `requires` 条件门控。这是链式事件的标准写法。

---

## 六、Token 插值

`body` 与 `text` 支持 `{token}` 占位，由解释器在渲染时替换：

| Token | 替换为 |
|---|---|
| `{herb}` | 当前上下文选中的药材名 |
| `{npc}` | 当前事件关联 NPC 的名字 |
| `{sect}` | 当前宗门名 |
| `{art}` | 当前功法名 |
| `{level}` | 当前等级 |
| `{realm}` | 当前境界名（如"金丹三重"） |
| `{age}` | 当前年龄 |
| `{power}` | 总战力（**格式化后的模糊值，不泄底**） |

**`{power}` 的约束**：只输出格式化后的量级（如"约 52 万"），绝不输出精确值——防止写手无意间泄露隐藏战力。

---

## 七、校验规则汇总

`tools/validate-content.ts` 强制执行：

| 规则 | 级别 |
|---|---|
| 事件 id 唯一 | error |
| `target` 在 `targets.ts` 中存在 | error |
| `grant.id` 能在对应内容表中解析 | error |
| `show`/`enable` 引用的 flag 有写入方 | error |
| 写入的 flag 有读取方 | warning |
| 事件可达（500 采样状态至少触发一次） | error |
| `once: true` 与 `maxCount` 同时出现 | warning |
| **事件不得有 `realm` 字段** | error |
| 无 `when` 的兜底 outcome 必须在末尾 | error |
| 兄弟 `chance` 节点路径唯一 | error |
| `pct` 的 `value` 在 ±100 范围内（防误写成 500%） | warning |

> **「不得有 `realm` 字段」这条修掉参考实现最隐蔽的内容 bug**：仙界事件漏标 `realm: 2` 就永不触发（`sim.js:492` 是硬池过滤），而作者不会收到任何报错。本作改为位面门控一律走 `when`。
