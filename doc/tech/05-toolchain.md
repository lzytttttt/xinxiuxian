# 05 · 工具链与测试矩阵

## 一、tools/ 清单

全部用 `tsx` 运行（node 环境，不经过 Vite）。

| 工具 | 用途 | 关键参数 |
|---|---|---|
| `sim.ts` | 无头模拟器：跑 N 局，输出统计 | `--golden` `--calibrate` `--pacing` `--lives N` `--sect` `--bond` |
| `balance.ts` | 平衡红线断言 | `--build-ratio` `--support-cap` `--toxicity` |
| `gen-names.ts` | 名称表组合生成 | `--check`（校验产物与词池一致） |
| `validate-content.ts` | 内容合法性校验 | `--stats` |

### sim.ts

```bash
npx tsx tools/sim.ts --golden              # 50 种子黄金回归
npx tsx tools/sim.ts --calibrate           # 分位标定（对照参考实现）
npx tsx tools/sim.ts --pacing              # 单局时长/年数/决策数分布
npx tsx tools/sim.ts --lives 20            # 20 世进程，验传承不碾压
npx tsx tools/sim.ts --sect                # 宗门晋升曲线
npx tsx tools/sim.ts --bond                # 羁绊建立曲线
```

**核心能力**：`replayRun(seed, decisions, content)` 让每一局可复现。所有统计都是对具名 RNG 流的确定性重放，不是采样估计。

### validate-content.ts

```bash
npx tsx tools/validate-content.ts          # 全量校验，退出码非 0 表示有 error
npx tsx tools/validate-content.ts --stats  # 输出内容统计（事件数、决策点数、平均选项数）
```

---

## 二、测试矩阵

| 层 | 环境 | 范围 | 覆盖率门槛 |
|---|---|---|---|
| `tests/engine/` | node | 引擎单测 | lines 90 / functions 90 / branches 85 |
| `tests/content/` | node | 内容校验、名称生成 | — |
| `tests/integration/` | jsdom | UI 行为、决策流 | — |

### 关键测试清单

| 测试 | 断言 | 文件 |
|---|---|---|
| **引擎纯净** | `tsc -b` 通过，DOM import 编译失败 | 编译期 |
| **`Math.random` 禁用** | `src/engine/**` 中零出现 | ESLint |
| **`luckMult` 唯一定义** | `src/engine/**` 中 `/1000` 只出现一次 | `engine/luck.test.ts` |
| **概率通道** | 气运 0→1000，10 万次掷骰触发率精确翻倍（±2%） | `engine/luck.test.ts` |
| **黄金回归** | 50 种子槽 1-9 数值精确一致 | `engine/golden.test.ts` |
| **重放确定性** | 同种子 + 同选择序列 → 逐字节相同日志 | `engine/replay.test.ts` |
| **决策闸门** | 种子局在首个决策处停住直到选择 | `engine/tick.test.ts` |
| **乘区上限** | 满乘区乘积 ≤ 40，25× 以上软封顶生效 | `engine/power.test.ts` |
| **面板诚实** | 逐项 Δ 之和 == 显示总倍率 | `engine/breakdown.test.ts` |
| **助战上限** | 助战加成永不超过 30% | `engine/bond.test.ts` |
| **区间收窄上限** | 收窄永不超过 50% | `engine/encounter.test.ts` |
| **炼丹技能性** | 贪心 ≥4.5，乱按 ≤1.5 | `engine/alchemy.test.ts` |
| **存档迁移** | 每步有 fixture 测试 | `persistence/migrations.test.ts` |
| **存档校验和** | 篡改任一字节能被检出 | `persistence/checksum.test.ts` |
| **节流写入** | 90 年模拟写入 ≤ 25 次 | `persistence/throttle.test.ts` |
| **字段不冲突** | RunState 与 MetaState 顶层字段无交集 | `engine/types.test.ts` |

---

## 三、CI 关卡

按顺序执行，**任一失败即阻断**：

```bash
# 1. 类型与引擎纯净
tsc -b

# 2. Lint（含 Math.random 禁用）
eslint src/ --max-warnings 0

# 3. 单元测试 + 覆盖率
vitest run --project engine --coverage

# 4. 内容合法性
tsx tools/validate-content.ts

# 5. 名称表一致性
tsx tools/gen-names.ts --check

# 6. 平衡红线
tsx tools/balance.ts

# 7. 黄金回归（不允许 skip）
tsx tools/sim.ts --golden

# 8. 单局节奏
tsx tools/sim.ts --pacing

# 9. UI 行为测试
vitest run --project ui
```

### ESLint 配置（关键规则）

配置文件是 **`eslint.config.js`（flat config）**——ESLint 10 已移除 eslintrc，`.eslintrc.json` 不再可用。规则内容与下表一致，仅格式变化。

```js
// eslint.config.js
export default tseslint.config(
  {
    files: ['src/engine/**/*.ts', 'src/content/**/*.ts'],
    rules: {
      // 禁止裸 Math.random —— error 级，不是 warning
      'no-restricted-properties': ['error', {
        object: 'Math', property: 'random',
        message: '引擎必须使用具名 RNG 流（rng: RngBag），禁止 Math.random'
      }],
      // 禁止 DOM 与 React（编译器已挡，这里是二级防线）
      'no-restricted-imports': ['error', {
        patterns: ['react', 'react-dom', 'zustand']
      }]
    }
  }
);
```

> **`Math.random` 必须是 error 级。** 具名 RNG 流只有在被一致使用时才有价值——一次裸调用就会让确定性静默崩掉，黄金回归开始间歇性失败，然后被 `skip` 掉。**这就是确定性死亡的方式。** 见 [plan/03-risks.md R6](../plan/03-risks.md#r6)。
>
> **规则本身也要验一次。** Phase 0 用一个 `Math.random()` 探针文件确认 ESLint 真的报 error（`no-restricted-properties` 命中、退出码 1），再删除。没验过的规则和没写的规则一样不可信。

### 黄金回归不允许 skip

CI 配置里显式禁止：

```bash
# 若有任何 skip，视为失败
vitest run --project engine --reporter=json | jq -e '[.testResults[].assertionResults[] | select(.status=="pending")] | length == 0'
```

**一旦不稳定必须当天修**，不能靠 skip 让它变绿。

---

## 四、命令速查

```bash
# 开发
npm run dev              # Vite dev server
npm run build            # 生产构建
npm run preview          # 预览构建产物

# 测试
npm test                 # 全部测试
npm test -- alchemy      # 单个测试文件
npm run test:engine      # 仅引擎
npm run test:ui          # 仅 UI
npm run coverage         # 带覆盖率

# 类型
npm run typecheck        # tsc -b
npm run typecheck:engine # 仅引擎纯净检查

# 内容
npm run content:validate # 内容校验
npm run content:stats    # 内容统计
npm run content:names    # 重新生成名称表

# 平衡
npm run sim              # 默认 1000 局统计
npm run sim:golden       # 黄金回归
npm run sim:calibrate    # 分位标定
npm run sim:pacing       # 单局节奏
npm run sim:lives        # 20 世进程
npm run balance          # 平衡红线
```

---

## 五、与参考实现的对照验证

Phase 1 的验收需要**把参考实现的分位函数移植过来做一次性标定**：

参考实现里有 `testLv(tier, age, n, X)` 与 `testCombat(tier, age, n, X)`，它们用无头模拟算某灵根档修炼到指定年数的 top X% 分位数值——作者写这两个函数，正是因为没有具名 RNG 就无法做统计验证。

本作移植它作为**一次性标定工具**：

```ts
// tools/sim.ts --calibrate
// 对每个灵根档（1-10），跑 10000 局到 200 年，输出最终等级的 p10/p50/p90
// 与参考实现的同参数结果对照，断言落在 ±8% 内
```

**这个对照能抓出 `BREAK_CHANCE`、`COMBAT_COEF`、年龄系数的转写错误。**

> **Phase 1 的分布对不上参考实现就停下来修，不要往上叠新系统**——后面所有内容都是对着这条基线调平衡的。见 [plan/00-roadmap.md](../plan/00-roadmap.md)。
