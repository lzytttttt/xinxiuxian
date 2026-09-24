# 00 · 工程结构与依赖

## 一、目录结构

```
xiuxian/
├─ index.html  package.json  vite.config.ts  vitest.config.ts
├─ tsconfig.base.json / tsconfig.engine.json / tsconfig.app.json
├─ doc/                           文档库（本目录）
├─ docs/                          写手手册等面向非开发者的文档
├─ src/
│  ├─ engine/                     纯 TS，零 React / 零 DOM
│  │  ├─ types/{run,meta,content,effects,rng,log}.ts
│  │  ├─ rng.ts  constants.ts  registry.ts  power.ts  interpret.ts
│  │  ├─ conditions.ts  effects.ts  autopilot.ts  selectors.ts
│  │  ├─ tick.ts  breakthrough.ts  encounter.ts  artifact.ts
│  │  ├─ fate.ts  tribulation.ts
│  │  ├─ arts.ts  alchemy.ts  sect.ts  bonds.ts  meta.ts
│  │  └─ index.ts                 barrel，store 只从这里 import
│  ├─ content/                    只 import engine 的**类型**
│  │  ├─ events/{mortal,immortal,bond,sect,alchemy,chain,tribulation}/*.ts
│  │  ├─ arts.ts  recipes.ts  herbs.ts  pills.ts  sects.ts  fates.ts  missions.ts
│  │  ├─ names/{pools,compose}.ts  generated/names.json
│  │  └─ index.ts                 汇总为一个 ContentBundle
│  ├─ store/                      Zustand + 持久化
│  │  ├─ runStore.ts  metaStore.ts  uiStore.ts
│  │  └─ persistence.ts  migrations.ts
│  ├─ ui/
│  │  ├─ tokens.css  base.css
│  │  ├─ screens/{Home,Cultivate,Build,Alchemy,Sect,Bonds,Cave,Codex,Self}.tsx
│  │  ├─ panels/PowerBreakdown.tsx
│  │  └─ components/{DecisionModal,HeatGauge,LogFeed,ArtCard,PillCard,BondCard}.tsx
│  └─ App.tsx  main.tsx
├─ tools/                         node 脚本（tsx 运行）
│  ├─ sim.ts  balance.ts  gen-names.ts  validate-content.ts
└─ tests/
   ├─ engine/  content/  integration/
   └─ fixtures/                   存档迁移测试用的真实 blob
```

---

## 二、依赖清单

### 运行时依赖

| 依赖 | 用途 | 为什么需要 |
|---|---|---|
| `react` | 视图层 | 用户选定 |
| `react-dom` | 视图层 | 同上 |
| `zustand` | 状态管理 | **tick 循环必须在 React 渲染周期外读写状态**——这是核心约束 |
| `immer` | Zustand middleware | 结构共享让 60-140 年的状态 diff/序列化变廉价 |

### 开发依赖

| 依赖 | 用途 |
|---|---|
| `typescript` | 类型系统（**锁 5.9.x**：`typescript-eslint@8` 的 peer 范围是 `<6.1.0`，上 TS 7 就等于放弃 ESLint，即放弃 R6 的二级防线） |
| `vite` | 构建与 dev server |
| `@vitejs/plugin-react` | React 支持 |
| `vitest` | 测试 |
| `@vitest/coverage-v8` | 覆盖率 |
| `tsx` | 运行 `tools/` 下的 node 脚本 |
| `jsdom` | ui project 的测试环境（Vitest 不会自带，必须显式安装） |
| `eslint` `@eslint/js` `typescript-eslint` `globals` | R6 二级防线：`src/engine/**` 上禁 `Math.random`（error 级） |
| `@types/react` / `@types/react-dom` | 类型 |

### 明确不引入

| 不引入 | 理由 |
|---|---|
| `zod` | 内容校验由 `tools/validate-content.ts` 在构建期对 DSL 类型做，避免运行时开销 |
| `react-router` | 单屏 + 弹层，不需要路由 |
| 其他状态库（redux/mobx/jotai） | Zustand 已满足，且 tick 循环的需求只有它能优雅满足 |
| 动画库（framer-motion 等） | 视觉全部用 CSS 实现（见 [04-visual.md](04-visual.md)），零运行时成本 |
| UI 组件库（antd/mui/animal-island-ui） | 本作的视觉是**照 `animal-island-ui` 的设计语言自己用零依赖 CSS 实现**的（见 [04-visual.md §九](04-visual.md#九与参考库的关系)）：只需要约 6 类组件而该库导出 34 个，且 4.77 MB 未压缩 + 2 个新依赖 + `@fontsource` 字体分片都超出预算 |
| Web 字体 | CJK 字体子集化后仍有 300-600KB，且违反零网络约束（见 [04-visual.md](04-visual.md#二字体策略)） |
| 虚拟列表库 | 日志流用 `content-visibility` + 120 行上限即可，不需要额外依赖 |

**依赖总数：4 运行时 + 13 开发。** 保持最小是有意的——参考实现的优势之一就是零依赖，我们要保住"打开就能跑"的体感。

---

## 三、编译器强制引擎纯净（关键机制）

**这是本项目最重要的工程约束。** 引擎必须是纯 TS，不得依赖 React 或 DOM——但我们不靠自觉，靠编译器。

### 三个 tsconfig

**`tsconfig.base.json`** —— 共享严格配置：

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "moduleResolution": "bundler",
    "module": "ESNext",       // moduleResolution: bundler 的前置要求
    "target": "ES2022",
    "skipLibCheck": true
  }
}
```

**`tsconfig.engine.json`** —— 纯度项目：

```jsonc
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022"],        // 不含 DOM
    "types": [],              // 不含 @types/react、不含 node globals
    "composite": true,
    // ⚠ 不能写 noEmit：被引用的 composite 项目禁用 emit 会报 TS6310。
    // 改为只发声明文件，且产物落到 node_modules/.tmp，不污染仓库。
    "emitDeclarationOnly": true,
    "declarationDir": "./node_modules/.tmp/types/engine",
    "rootDir": "./src",
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.engine.tsbuildinfo"
  },
  "include": ["src/engine/**/*", "src/content/**/*"]
}
```

> **TS6310 是实测踩到的坑：** 文档初稿写的是 `composite: true` + `noEmit: true`，在 TS 5.9 下 `tsc -b` 直接报 `error TS6310: Referenced project may not disable emit`。纯度**不靠 noEmit 实现**，而靠 `lib: ["ES2022"]` + `types: []`——声明文件发不发出去，与引擎能不能碰 DOM 无关。
>
> **另一个坑：** 引擎目录为空时，`include` 匹配不到任何文件会报 `TS18003`。因此 `src/engine/index.ts`（barrel）从 Phase 0 就存在，先以空模块占位。

**`tsconfig.app.json`** —— 应用项目：

```jsonc
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "types": ["vite/client"],
    "composite": true,
    "noEmit": true,
    "rootDir": ".",
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo"
  },
  "include": ["src/store/**/*", "src/ui/**/*", "src/App.tsx", "src/main.tsx", "tests/**/*"],
  "references": [{ "path": "./tsconfig.engine.json" }]
}
```

> **`tests/**/*` 必须在某个 tsconfig 的 include 里。** Vitest 用 esbuild 转译，**不做类型检查**——测试文件里的类型错误不会让任何测试失败。把它纳入 app 项目是唯一能自动发现这类错误的途径。

**根 `tsconfig.json`** 用 project references 串联：

```jsonc
{ "files": [], "references": [
  { "path": "./tsconfig.engine.json" },
  { "path": "./tsconfig.app.json" }
]}
```

### 为什么这样能强制纯净

`lib: ["ES2022"]` + `types: []` 带来三重硬失败：

1. `document` / `window` / `localStorage` / `setTimeout` **全部是未声明标识符** → 类型错误
2. `import ... from 'react'` 能解析但 JSX 与 React 类型全部缺失 → 实际使用即错误
3. **`localStorage` 未声明** → 持久化**必须**待在 `src/store/`，这是编译器保证的事实，不是约定

`tsc -b` 会先编 engine 项目。**任何 DOM/React 泄漏直接编译失败，而不是靠 lint 提醒。**

### 二级防线

`tools/validate-content.ts` 额外断言：没有 engine 文件的 import 图能到达 `react` / `zustand`。这是防止有人用 `any` 或动态 import 绕过编译器。

### Phase 0 的验收动作

**先写一个故意 `import localStorage` 的 engine 文件，确认编译失败，然后删掉它。** 这一步必须做——否则"编译器强制"只是文档里的一句话。

---

## 四、Vitest 配置

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    // ⚠ 覆盖率必须配在根级：配在 project 内会被 Vitest 5 忽略（见下方注）
    coverage: {
      provider: 'v8',
      include: ['src/engine/**'],
      thresholds: { lines: 90, functions: 90, branches: 85 }
    },
    projects: [
      {
        test: {
          name: 'engine',
          environment: 'node',
          include: ['tests/engine/**', 'tests/content/**']
        }
      },
      {
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: ['tests/integration/**']
        }
      }
    ]
  }
});
```

**两个 project 分离**：engine 测试跑在 node 环境（快、无 DOM），UI 测试才需要 jsdom。覆盖率门槛只对 engine 生效——UI 的覆盖率没意义，行为测试更有价值。

> **覆盖率配置的位置是硬约束（v0.1.0-01 实测）：** Vitest 5 下 `coverage` 写在某个 project 内会被**静默忽略**——`include` 不生效、`thresholds` 不检查、退出码仍为 0。必须写在根级 `test.coverage`；此时 `--project engine --coverage` 仍只统计 engine 测试的覆盖率。
>
> **另一个实测坑：** 空模块（0 语句）的覆盖率是 0/0，被判定为"达标"——所以"引擎目录为空 → 覆盖率通过"不代表门槛在工作。验证门槛是否真的在拦，必须用一个含未覆盖分支的文件试一次。

---

## 五、构建产物预算

| 产物 | 估算 | gzip |
|---|---|---|
| 引擎 + 内容（JS） | ~500 KB | ~120 KB |
| React + Zustand + Immer | ~180 KB | ~58 KB |
| CSS | ~30 KB | ~6 KB |
| 名称表（names.json） | ~400 KB | 按需拆分 |
| **合计** | **~1.1 MB** | **~200 KB** |

**名称表优化**：`names.json` 若全量打包会让首屏体积翻倍。方案：按档位拆分为 20 个 chunk，**只加载当前境界段需要的档位**（1-3 档在凡界早期，8-10 档在凡界后期，11-20 档在仙界）。用动态 `import()` 实现，Vite 会自动分包。

**首屏目标**：< 200 KB gzip（不含名称表），名称表按需加载。
