# 事件撰写手册

> **目标读者：内容写手。** 你不需要读引擎代码，也不需要会写 TypeScript 类型——只要照着本手册写对象字面量。
>
> 完整类型定义与解释器语义见 [tech/02-effect-dsl.md](../tech/02-effect-dsl.md)；本手册只讲**怎么写**。

---

## 一、五分钟上手

一个事件就是数组里的一个对象。写手只需往对应池子的文件里追加：

```ts
// src/content/events/mortal/early.ts
export const MORTAL_EARLY = [
  // ← 在这里追加你的事件
] satisfies EventDef[];
```

### 最小可用事件

```ts
{
  id: 'ev_world_morning_dew',        // 全局唯一，建议前缀 ev_<池>_<名字>
  title: '晨露',                      // 显示给玩家的标题
  category: 'world',                 // 分类，见 §4
  weight: 100,                       // 档内权重，越大越常出现
  body: '草叶上凝着一层薄露，你俯身饮下，只觉神台一清。',
  choices: [
    {
      id: 'drink',
      label: '饮下',
      outcomes: [
        { text: '清冽入喉，灵台一片澄明。', effects: [{ op: 'gainInsight', value: 1 }] }
      ]
    }
  ]
}
```

**每个事件必须有至少 1 个 choice，每个 choice 必须有至少 1 个 outcome。**

---

## 二、三条写作原则

### 1. 选项必须是真实取舍，不是"正确/错误"

```ts
// ❌ 伪选择：一个明显更好
choices: [
  { id: 'a', label: '拿走灵石', outcomes: [{ text: '你变强了', effects: [{op:'add',target:{k:'luck'},value:5}] }] },
  { id: 'b', label: '不拿',     outcomes: [{ text: '你什么都没得到', effects: [] }] }
]

// ✅ 真实取舍：各有代价
choices: [
  { id: 'take',  label: '取走灵石',
    outcomes: [{ weight: 60, text: '你取走灵石，却惊动了守墓的傀儡。',
      effects: [{op:'add',target:{k:'luck'},value:5}, {op:'add',target:{k:'simPoints'},value:-3}] }] },
  { id: 'leave', label: '原样封好',
    outcomes: [{ text: '你重新封好墓门，心中一片安宁。',
      effects: [{op:'gainInsight',value:2}] }] }
]
```

**判断标准**：如果某个选项在任何 build 下都更优，它就不是决策，是装饰。

### 2. 用比例而非绝对值

绝对值会随境界失真——给 10 级玩家 +100 万修为是毁灭性的，给 100 级玩家 +100 万修为是微不足道的。

```ts
// ❌ 绝对值
{ op: 'add', target: { k: 'cultivation' }, value: 50000 }

// ✅ 比例式（自动随境界缩放）
{ op: 'pct', target: { k: 'cultivation' }, value: 5 }        // 当前修为的 5%
```

**例外**：模拟点、灵根、气运、悟性、丹毒这些**不随境界指数增长**的资源，用绝对值。

### 3. 不泄底

**绝不要写会暴露机缘隐藏战力的文本。** 也绝不要在文本里给精确的成功率。

```ts
// ❌ 泄底
text: '此物战力约 523,400，你的胜率是 67%。'

// ✅ 模糊
text: '此物气息深沉，你心中没底。'
```

---

## 三、数值参考表

写效果数值时对照此表，避免写出破坏平衡的事件。

| 境界段 | 修为收益（用 `pct`） | 灵根/气运 | 模拟点 | 悟性 |
|---|---|---|---|---|
| 1-30 级 | 1%-5% | +1-3 | +1-3 | +1-2 |
| 31-60 | 2%-6% | +2-5 | +2-5 | +1-3 |
| 61-90 | 3%-8% | +3-8 | +3-8 | +2-4 |
| 91-100 | 5%-10% | +5-12 | +5-12 | +3-6 |
| 仙界 101-150 | 5%-12% | +8-20 | 转为修为 | +4-8 |
| 仙界 151-200 | 8%-15% | +10-25 | 转为修为 | +5-10 |

**失败惩罚参照**：收益的 30%-60%，且必须用 `loseLife` / `loseCult` / `loseRoot` 风格的钳制（见 §6 的 `sub` + `clamp`）。

### 稀有度与权重的对应

| tier | 名称 | 档内权重范围 | 事件占比 |
|---|---|---|---|
| 1 | 日常 | 80-200 | 60% |
| 2 | 常见 | 40-120 | 30% |
| 3 | 稀有 | 15-60 | 7% |
| 4 | 传说 | 3-20 | 3% |

**档内权重只在该档内部比较**——tier 1 权重 200 和 tier 4 权重 20 不直接可比。

---

## 四、字段速查

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | 全局唯一。命名：`ev_<池>_<英文短名>` |
| `title` | ✅ | 显示标题，2-6 字 |
| `category` | ✅ | `world` / `encounter` / `bond` / `sect` / `alchemy` / `chain` / `tribulation` / `fate` |
| `body` | ✅ | 情境描述，1-3 句。支持 `{token}` 插值 |
| `weight` | ✅ | 档内权重 |
| `choices` | ✅ | 1-4 个选项 |
| `tierMin` / `tierMax` | — | 稀有度区间，默认 1-4 |
| `levelMin` / `levelMax` | — | 等级门槛 |
| `once` | — | `true` = 本局仅一次 |
| `cooldownYears` | — | 触发后 N 年内不再抽取。**建议 8-15** |
| `requires` | — | 进入事件池的条件 |
| `school` | — | 限定流派 |
| `tags` | — | 自由标签（用于统计） |
| `chain` | — | `{ setsFlag, consumesFlag }` |

> ⚠ **绝对不要写 `realm` 字段。** 位面门控一律走 `requires` 里的条件。校验器会直接报错。

---

## 五、Target 速查

写在 `target` 里的值。

### 核心资源

| 写法 | 含义 | 建议用 |
|---|---|---|
| `{ k: 'cultivation' }` | 修为 | `pct` |
| `{ k: 'simPoints' }` | 模拟点 | `add` / `sub` |
| `{ k: 'root' }` | 灵根 | `add` / `sub` |
| `{ k: 'luck' }` | 气运 | `add` / `sub` |
| `{ k: 'artifactPower' }` | 法宝之力 | `pct` |
| `{ k: 'artifactBonus' }` | 法宝加成 | `add`（基准 100） |
| `{ k: 'xianqi' }` | 仙灵气 | `add` / `sub` |
| `{ k: 'chaosQi' }` | 混沌气 | `add` / `sub` |

### 新增系统

| 写法 | 含义 |
|---|---|
| `{ k: 'insight' }` | 悟性 |
| `{ k: 'toxicity' }` | 丹毒（0-100） |
| `{ k: 'herb', id: 'herb_xxx' }` | 某药材数量 |
| `{ k: 'pill', id: 'pill_xxx' }` | 某丹药数量 |
| `{ k: 'artLevel', id: 'art_xxx' }` | 某功法等级 |
| `{ k: 'sectContribution' }` | 宗门贡献 |
| `{ k: 'sectRank' }` | 宗门职位（0-4） |
| `{ k: 'bondLevel', id: '...' }` | 某羁绊等级 |
| `{ k: 'bondAffinity', id: '...' }` | 某羁绊好感 |

### 元状态

| 写法 | 含义 |
|---|---|
| `{ k: 'flag', id: 'flag_xxx' }` | 自定义标记 |
| `{ k: 'realmLevel' }` | 等级 |
| `{ k: 'yearsStayed' }` | 仙界滞留年数 |

---

## 六、Effect 速查

| op | 写法 | 说明 |
|---|---|---|
| `add` | `{ op:'add', target:{k:'luck'}, value:3 }` | 加 |
| `sub` | `{ op:'sub', target:{k:'simPoints'}, value:2 }` | 减（自动钳制 ≥0） |
| `pct` | `{ op:'pct', target:{k:'cultivation'}, value:5 }` | 按**结算前快照**的百分比加 |
| `set` | `{ op:'set', target:{k:'toxicity'}, value:0 }` | 直接赋值 |
| `clamp` | `{ op:'clamp', target:{k:'toxicity'}, lo:0, hi:50 }` | 限制范围 |
| `setFlag` | `{ op:'setFlag', id:'flag_x', value:1 }` | 写标记 |
| `incFlag` | `{ op:'incFlag', id:'flag_x', value:1 }` | 累加标记 |
| `clearFlag` | `{ op:'clearFlag', id:'flag_x' }` | 清除标记 |
| `grantHerb` | `{ op:'grantHerb', id:'herb_x', count:2 }` | 给药材 |
| `grantPill` | `{ op:'grantPill', id:'pill_x', count:1 }` | 给丹药 |
| `grantArt` | `{ op:'grantArt', id:'art_x' }` | 给功法 |
| `learnRecipe` | `{ op:'learnRecipe', id:'rec_x' }` | 学丹方 |
| `gainInsight` | `{ op:'gainInsight', value:2 }` | 给悟性 |
| `addToxicity` | `{ op:'addToxicity', value:10 }` | 加丹毒 |
| `sectJoin` | `{ op:'sectJoin', id:'sect_x' }` | 入宗 |
| `bond` | `{ op:'bond', action:'create', type:'挚友', npcSeed:'x' }` | 建立/升级/断绝羁绊 |
| `chain` | `{ op:'chain', eventId:'ev_x' }` | 立即链到另一事件 |
| `schedule` | `{ op:'schedule', eventId:'ev_x', inYears:10 }` | N 年后触发 |
| `log` | `{ op:'log', text:'...', tone:'gold' }` | 额外输出一行日志 |
| `endRun` | `{ op:'endRun', reason:'voluntary' }` | 直接结束本局 |
| `if` | `{ op:'if', cond:{...}, then:[...], else:[...] }` | 条件分支 |

> **`pct` 默认读"结算前的快照"**，所以效果写在数组里的位置不影响结果。需要读运行值时才写 `base:'live'`。

### 日志色调（`tone`）

`year` 静修 · `brk` 突破 · `ev1`-`ev4` 事件（按稀有度）· `huan` 境界抬升 · `rare` 秘宝 · `red` 损失/战斗 · `gold` 收获 · `xian` 仙缘 · `rainbow` 天劫 · `god` 神迹 · `special` 灵根蜕变 · `dead` 死亡

---

## 七、Condition 速查

写在 `requires` / `show` / `enable` / `when` / `if.cond` 里。

| 写法 | 含义 |
|---|---|
| `{ op:'always' }` / `{ op:'never' }` | 恒真 / 恒假 |
| `{ op:'and', of:[...] }` / `{ op:'or', of:[...] }` / `{ op:'not', of:{...} }` | 逻辑组合 |
| `{ op:'cmp', target:{k:'luck'}, cmp:'>=', value:50 }` | 数值比较 |
| `{ op:'flag', id:'flag_x', min:1 }` | 标记存在（`max` 可选） |
| `{ op:'sect', id:'sect_x' }` | 属于某宗门 |
| `{ op:'rankAtLeast', rank:2 }` | 宗门职位 ≥ N |
| `{ op:'school', id:'剑修', countAtLeast:4 }` | 已装备某流派功法 ≥ N 门 |
| `{ op:'bondType', type:'道侣', countAtLeast:1 }` | 有某类羁绊 ≥ N 段 |
| `{ op:'hasPill', id:'pill_x', countAtLeast:1 }` | 持有某丹药 |
| `{ op:'hasHerb', id:'herb_x', countAtLeast:1 }` | 持有某药材 |
| `{ op:'toxicityAtMost', value:50 }` | 丹毒 ≤ N |
| `{ op:'rootTierAtLeast', tier:7 }` | 灵根档 ≥ N |
| `{ op:'realmAtLeast', level:80 }` | 等级 ≥ N |
| `{ op:'lifeAtLeast', n:3 }` | 第 N 世及以后 |
| `{ op:'chance', p:0.6 }` | 60% 概率为真 |
| `{ op:'roll', table:'xxx' }` | 查表 |

### `show` 与 `enable` 的区别

| 字段 | 行为 |
|---|---|
| `show` | 条件不满足 → **选项完全不显示** |
| `enable` | 条件不满足 → 显示但**置灰**，并展示 `disabledReason` |

**用 `enable` + `disabledReason` 更好**——它告诉玩家"这里有路，但你还没准备好"，这本身就是一种目标感。

```ts
{
  id: 'breakthrough',
  label: '以仙灵气强行冲关',
  enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
  disabledReason: '需仙灵气×1',
  cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
  outcomes: [...]
}
```

---

## 八、三个完整范例

### 范例 A —— 2 选项（基础）

```ts
{
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
          effects: [{ op: 'grantHerb', id: '{herb}', count: 2 }] },
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
}
```

**要点**：两个选项都有收益，只是类型不同（材料 vs 悟性）。随机 outcome 用 `weight` 表达风险。

### 范例 B —— 3 选项，含资源门槛（进阶）

```ts
{
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
}
```

**要点**：选项 2 有 `enable` 门槛 + `cost` 代价 + 加权随机结果（赌一把）；选项 3 放弃即时收益换取长期能力。三个选项对应三种玩家心态。

### 范例 C —— 链式事件（写 flag → 读 flag）

```ts
// 第一段：设置 flag
{
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
}

// 第二段：读取 flag。weight: 0 表示不参与常规抽取，只由 requires 门控
{
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
}
```

**要点**：
- **后续事件的 `weight` 必须设为 0** —— 它不参与常规抽取，只由 `requires` 门控
- `once: true` 保证第一段只触发一次
- 第二段的 `consumesFlag` 与选项里的 `clearFlag` 双重清理，确保不会重复触发

---

## 九、自检清单

提交前逐条确认：

- [ ] `id` 全局唯一（grep 一下）
- [ ] **没有 `realm` 字段**（用 `requires` 代替）
- [ ] 每个 choice 至少 1 个 outcome
- [ ] 无 `when` 的兜底 outcome 放在数组**末尾**
- [ ] `cooldownYears` 已设置（建议 8-15）
- [ ] 数值在 §3 参考表范围内
- [ ] 修为收益用 `pct`，不随境界指数增长的资源用绝对值
- [ ] 引用的 `herb_` / `pill_` / `art_` / `rec_` id 确实存在
- [ ] 写入的 flag 有对应读取方（或有注释说明用途）
- [ ] 文本不泄底（无精确战力、无精确成功率）
- [ ] 选项构成真实取舍（不是"正确/错误"）
- [ ] 文案与世界观术语一致（见 [product/00-overview.md 术语表](../product/00-overview.md#术语表)）

### 提交前运行

```bash
npx tsx tools/validate-content.ts          # 应输出 0 error
npx tsx tools/validate-content.ts --stats  # 确认事件数已计入
```

---

## 十、常见错误

| 错误 | 症状 | 修正 |
|---|---|---|
| 写了 `realm: 2` | 校验器报 error | 改用 `requires: { op:'realmAtLeast', level:101 }` |
| 链式后续事件忘了 `weight: 0` | 该事件会在常规抽取里随机出现 | 设 `weight: 0` |
| 兜底 outcome 写在中间 | 校验器报 error | 移到数组末尾 |
| 用绝对值给修为 | 低境界玩家瞬间无敌 | 改 `pct` |
| 两个 choice 用同一个 `id` | 决策记录无法区分 | 改成唯一 |
| `chance` 写在 `show` 和 `if` 里 | 实际是同一次求值（记忆化），不是两次 | 这是**正确行为**，不必改 |
| `cost` 扣的资源不够 | 系统会阻止选择并显示 `disabledReason` | 检查 `enable` 条件是否与 `cost` 匹配 |

---

## 附：术语一致性

写文案时使用的术语必须与 [product/00-overview.md 术语表](../product/00-overview.md#术语表) 一致。常用对照：

| 用 | 不用 |
|---|---|
| 修为 | 经验、XP、功力值 |
| 灵根 | 天赋、资质 |
| 气运 | 运气值、幸运 |
| 模拟点 | 寿命、血量、HP |
| 法宝之力 | 装备战力 |
| 机缘 | 副本、关卡、敌人 |
| 渡劫 | 打 BOSS、终极考验 |
| 飞升 / 证道 | 通关、胜利 |
