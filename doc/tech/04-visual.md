# 04 · 视觉系统

**视觉方向：岛屿治愈系（Animal Island 风格）。** 2026-09-24 经用户确认改版，原「深色山巅夜空 + 金色仙气」方向**已废弃**。

| | 原方向（废弃） | 现方向 |
|---|---|---|
| 基调 | 深色夜空，**靠发光表达层次** | 奶油羊皮纸浅底，**靠厚度（3D 堆叠阴影）与描边表达层次** |
| 主色 | 金色 `#d4a94a` 仙气 | 薄荷青 `#19c8b9` |
| 文字 | 暖白 `#ece7dc` | 暖褐 `#794f27` |
| 形状 | 4/8/14/22px 小圆角 | 12/18/24px + 50px 胶囊，**禁止直角交互元件** |
| 字体 | 宋体标题 + 黑体 UI 的**衬线反差** | Nunito 圆体 + 系统中文，**全无衬线** |
| 质感 | 星空、云雾、噪点 | 羊皮纸、波点壁纸、blob 剪影 |

**设计语言来源**：[`animal-island-ui`](https://github.com/guokaigdg/animal-island-ui)（CC BY-NC 4.0）的 `docs/design-system/`。我们**不引入该库**，只按它的 token 与设计法则用零依赖 CSS 重实现——理由见 [§九](#九与参考库的关系)。

> **法则优先级**：本文件是视觉的唯一权威源。任何"看着更好看"的临场发挥，若违反 [§十 设计法则](#十设计法则) 的硬规则，一律以法则为准。

---

## 一、Token 层

`src/ui/tokens.css` —— **所有颜色、间距、字体、动效都必须是 token，不允许内联临时值。**

**改版说明：token 名保持语义层稳定，值整体替换。** 仅 3 处改名（原名为深色专属隐喻，浅色下语义不通）：

| 原名 | 新名 | 原因 |
|---|---|---|
| `--bg-void` / `--bg-abyss` | `--bg-page` | "虚空/深渊"是深色隐喻 |
| `--gold` / `--gold-lit` / `--gold-deep` | `--primary` / `--primary-hover` / `--primary-active` | 主色不再是金色 |
| `--jade` / `--jade-deep` | `--success` / `--success-active` | 状态色改用语义命名 |

```css
:root {
  /* ── 底：奶油羊皮纸。绝不用冷灰（#fafafa / #f5f5f5 是硬违规） */
  --bg-page:       #f8f8f0;            /* 页面背景 */
  --bg-content:    rgb(247, 243, 223); /* 内容区 / 卡片 */
  --surface-1:     rgb(247, 243, 223); /* 面板 */
  --surface-2:     #fffdf5;            /* 抬起卡片 */
  --surface-3:     #f0e8d8;            /* hover / 弹层 */
  --surface-4:     #f0ece2;            /* 内嵌凹槽 */
  --surface-input: #fffbe7;            /* 输入框底 */
  --hairline:      #c4b89e;            /* 描边（2px，不是 1px） */
  --hairline-lit:  #a89878;            /* hover / 激活描边 */
  --hairline-dash: rgba(196,184,158,.5); /* 日志行与构成表的分隔虚线 */

  /* ── 墨：暖褐。绝不用纯黑（#000 / #111 是硬违规） */
  --ink-1:    #794f27;  /* 标题、强调正文      6.6:1 on --bg-page */
  --ink-2:    #725d42;  /* 正文                5.9:1 */
  --ink-3:    #6f6250;  /* 次要 / 元信息        5.6:1  ← 偏离参考值，见 §八 */
  --ink-4:    #c4b89e;  /* 禁用（无障碍豁免） */
  --ink-soft: #8a7b66;  /* 装饰性次要文本，仅 ≥3:1 场合（大字 / 非必要） */

  /* ── 文本色阶：承载文字时一律用这一族，不用 --island-* / --r-*（见 §八） */
  --tone-green:  #4a7a1a;  /* 4.8:1 —— 突破 / 成长 */
  --tone-blue:   #2f5bbf;  /* 5.8:1 —— 灵根 / 信息 */
  --tone-violet: #7a3fc9;  /* 5.8:1 —— 混沌 / 魔修 */
  --tone-red:    #c0392b;  /* 5.1:1 —— 伤害 / 丹毒 / 失败 */
  --tone-gold:   #7a5f22;  /* 5.6:1 —— 高亮数值 / 天品 */

  /* ── 主色：薄荷青（分两条轨道，见 §八） */
  --primary:        #19c8b9;  /* 装饰轨道：描边 / 图标 / 大面积 / focus ring，不承载小字 */
  --primary-hover:  #3dd4c6;
  --primary-active: #11a89b;
  --primary-bg:     #e6f9f6;
  --primary-deep:        #0d7a71; /* 信息轨道：承载白字的按钮底 / 进度填充 / 强调文本 5.2:1 */
  --primary-deep-hover:  #0e8177; /* 4.8:1 */
  --primary-deep-active: #0a5f58; /* 压深 */

  /* ── 状态色 */
  --success:        #6fba2c;
  --success-active: #5a9e1e;
  --warning:        #f5c31c;
  --warning-active: #dba90e;
  --error:          #e05a5a;
  --error-active:   #c94444;

  /* ── 岛屿 11 色（卡片 / 标签调色板，供装饰块与分类色使用） */
  --island-pink:   #f8a6b2;
  --island-purple: #b77dee;
  --island-blue:   #889df0;
  --island-yellow: #f7cd67;
  --island-orange: #e59266;
  --island-teal:   #82d5bb;
  --island-green:  #8ac68a;
  --island-red:    #fc736d;
  --island-lime:   #d1da49;
  --island-brown:  #9a835a;
  --island-peach:  #e18c6f;

  /* ── 六档稀有度：饱和度与视觉重量单调递增（浅色底不能用"亮度递增"） */
  --r-fan:  #9f927d;  /* 凡 —— 暖灰，最朴素 */
  --r-ling: #8ac68a;  /* 灵 */
  --r-xuan: #889df0;  /* 玄 */
  --r-di:   #b77dee;  /* 地 */
  --r-tian: #e0b800;  /* 天 —— 深金（用 --island-yellow 在奶油底上几乎不可见） */
  --r-xian: #e05a5a;  /* 仙 —— 最重的红，落点最强 */

  /* ── 几何 */
  --r-sm: 12px;   /* 交互元件最小圆角，12px 是下限 */
  --r-md: 18px;
  --r-lg: 24px;
  --r-card: 20px;
  --r-pill: 50px; /* 按钮与输入框一律胶囊 */
  --bw: 2px;      /* 默认描边宽度 */
  --bw-input: 2.5px;

  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px;
  --sp-5: 24px; --sp-6: 32px; --sp-7: 48px;

  /* ── 阴影：暖调，绝不用冷黑 rgba(0,0,0,*) */
  --shadow-sm:      0 2px 4px 0 rgba(61, 52, 40, 0.06);
  --shadow-base:    0 3px 10px 0 rgba(61, 52, 40, 0.10);
  --shadow-lg:      0 8px 24px 0 rgba(61, 52, 40, 0.14);
  --shadow-3d:       0 5px 0 0 #bdaea0; /* 主按钮静止 */
  --shadow-3d-hover: 0 6px 0 0 #bdaea0; /* 主按钮悬停（海拔抬高） */
  --shadow-3d-press: 0 1px 0 0 #bdaea0; /* 主按钮按下（压扁） */
  --shadow-3d-danger: 0 5px 0 0 #c94444;
  --shadow-input-3d:  0 3px 0 0 #d4c9b4;
  --shadow-track:     inset 0 2px 4px rgba(114, 93, 66, 0.15);

  /* ── 焦点：黄。绝不用蓝色焦点环 */
  --focus-ring:     #ffcc00; /* 输入 / 开关 / 复选 */
  --focus-ring-warn: #f5c31c; /* 单选 */
  --focus-ring-btn:  #19c8b9; /* 按钮 */

  /* ── 氛围：羊皮纸波点 + 双色柔光 */
  --dots:  rgba(114, 93, 66, 0.055);
  --amb-a: radial-gradient(120% 80% at 50% 0%, rgba(25, 200, 185, 0.07), transparent 60%);
  --amb-b: radial-gradient(100% 70% at 100% 100%, rgba(247, 205, 103, 0.12), transparent 55%);

  /* ── 字体 */
  --font-round: 'Nunito', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;

  /* ── 动效 */
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --t-fast: 150ms; --t-base: 250ms; --t-slow: 350ms; --t-setpiece: 1200ms;
}
```

**包体代价：** 11 色岛屿调色板里，只有实际被引用的会被保留（纯 CSS 变量无运行时成本）；Nunito 变量字体 39 KB woff2 是本批次唯一新增的二进制资源。

> `--rf` / `--rb` / `--rk` / `--rt`（丝带前脸 / 燕尾 / 折角 / 文字）**不在 `:root` 上**——它们是组件局部变量，定义在 `.ribbon` 作用域内（见 §五），用于同一套丝带结构换 13 种配色。token 层与实现的逐条核对应把这四个排除在外。

---

## 二、字体策略

**结论：Nunito 变量字体自托管（拉丁 + 数字），中文走系统栈。**

| 方案 | 判定 |
|---|---|
| **Nunito 变量 woff2，latin 子集** | ✅ **采用**。39 KB，覆盖字重 200-1000，OFL 协议可自由分发。数字与拉丁字形是本作视觉密度最高的部分（修为/战力/年龄/倍率），圆体收益最大 |
| Noto Sans SC 自托管 | ❌ CJK 全集约 9 MB；子集化到 ~1200 字仍需 300-600 KB，破坏包体预算 |
| Google Fonts CDN | ❌ 违反零网络约束；且中国网络环境下首屏会白屏等字体或回退 |
| 全系统栈（不打包字体） | ❌ 丢失圆体特征，数字与拉丁字形偏硬——这套风格的辨识度有一半在字形上 |

`@font-face` 落在 `tokens.css`：

```css
@font-face {
  font-family: 'Nunito';
  font-style: normal;
  font-weight: 200 1000;
  font-display: swap;
  src: url('./fonts/nunito-latin-wght-normal.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
    U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

`unicode-range` 锁死为拉丁区段——中日韩汉字不进这个 `@font-face`，浏览器直接走下一个字体，**不产生任何中文字形下载**。

**中文回退链：** `PingFang SC`（macOS / iOS）→ `Hiragino Sans GB` → `Microsoft YaHei`（Windows）→ `system-ui`。四个平台都能落到无衬线的黑体类字体。

### 字重规则（硬要求）

| 用途 | 字重 |
|---|---|
| 正文、日志散文 | **500** |
| 按钮、标题、面板名、导航项 | **600-700** |
| 数字强调（修为、战力、倒计时） | **900** |
| 占位符、辅助说明 | 400 |
| — | **任何位置都不得低于 400** |

### 两条被推翻的旧规则

1. **不再使用衬线字体。** 旧方案靠"宋体标题 + 黑体 UI"的反差发出仙侠信号；这套语言里所有文本都是圆体无衬线。`--font-serif` 已从 token 层删除。
2. **不再使用等宽字体。** 参考硬规则明确禁止 UI 文本使用系统等宽字体。数字对齐改用 `font-variant-numeric: tabular-nums`——Nunito 支持该 OpenType 特性，等宽对齐的效果保留，字形仍是圆体。`--font-num` 已删除，`.num` 类改为"圆体 + 表格数字"。

---

## 三、氛围配方

**比深色版更简单：零图片、零网络、零伪元素。** 深色版需要 `body::before`（噪点）+ `body::after`（星野 + 90s 漂移动画）压住渐变色带；浅色羊皮纸底没有色带问题，波点本身就是纹理。

```css
body {
  background-color: var(--bg-page);
  background-image:
    var(--amb-a),                                        /* 顶部薄荷青光晕 */
    var(--amb-b),                                        /* 右下暖黄光晕 */
    radial-gradient(circle, var(--dots) 1.5px, transparent 1.6px); /* 羊皮纸波点 */
  background-size: auto, auto, 24px 24px;
  background-attachment: fixed;
}
```

**因此 z-index 阶梯少两层**——不再需要"氛围 0 / 内容 1"的分层（[§五](#五组件配方) 底部给出新阶梯）。

> 波点透明度 `0.055` 是刻意压低的：日志流是长文本区，底纹一重就会干扰阅读。改这个值前先看一眼满屏日志。

---

## 四、布局

**布局结构不变**（这是产品结构，不是视觉风格），只调整单列宽度以堵住 768-1023px 的断点空洞。

### 单列（< 1024px）

```
┌──────────────────────────────────┐
│ 资源条（sticky，双行）             │  ← 上：境界 + 年龄 + 模拟点
│                                  │     下：修为·灵根·气运·法宝 chips
├──────────────────────────────────┤
│                                  │
│  日志流（主滚动区）                │
│                                  │
├──────────────────────────────────┤
│ 修炼 构筑 洞天 图鉴 吾身           │  ← 固定底部导航，56px + 安全区
└──────────────────────────────────┘
```

- 容器 `max-width: 640px` 居中。**旧文档写的 480px 从未落地**（实现是全宽铺满），本次修正为 640px——日志是长文本，窄于 640px 在平板上会频繁折行。
- 底部导航 `56px + env(safe-area-inset-bottom)`，**在 < 1024px 全程可见**（旧实现把 `display:none` 写在 ≥768px，导致 768-1023px 导航整块消失，见 [v0.1.0-01 交付记录](../v0.1.0-01-scaffold-port.md)）。

### 三栏（≥ 1024px）

CSS Grid：`grid-template-columns: 220px minmax(0,1fr) 320px`

| 栏 | 内容 |
|---|---|
| 左（220px） | 导航 + 境界进度环 + 转世次数 |
| 中（1fr） | **日志流（游戏本体）** |
| 右（320px） | **战力构成面板** + 生效 buff + 丹毒条 + 羁绊列表 |

> **右栏常驻是本作的关键设计。** 它让玩家能实时看着乘区跳动——构筑感不是翻面板翻出来的，是看着它涨出来的。移动端则折叠进「构筑」页。

### 日志流性能

- 引擎侧上限 300 行，**渲染侧只渲染最后 120 行**
- 每行 `content-visibility: auto`，跳过视口外布局
- 追加用 `translateY` 过渡，避免整列重排
- **不引入虚拟列表库**——120 行 + `content-visibility` 足够

---

## 五、组件配方

### 面板

```css
.panel {
  background: var(--surface-1);
  border: var(--bw) solid var(--hairline);   /* 2px，不是 1px */
  border-radius: var(--r-md);
}
```

**面板扁平、卡片有抬起。** 面板是结构，卡片是内容。**绝不嵌套带抬起效果的卡片。**

### 卡片

```css
.card {
  position: relative;
  background: var(--surface-2);              /* #fffdf5，比页底亮一档 */
  border: var(--bw) solid var(--hairline);
  border-radius: var(--r-card);
  /* 无 box-shadow —— 硬规则 8 */
  transition: transform var(--t-slow) var(--ease);
}
.card:hover { transform: translateY(-2px); border-color: var(--hairline-lit); }

.card[data-rarity]::before {                 /* 稀有度仍用左条，不给整卡染色 */
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 4px;                                /* 浅色底加宽到 4px：2px 在奶油底上会被 2px 描边吃掉 */
  background: var(--rc, var(--r-fan));
}
```

六档 `--rc` 由 `[data-rarity='fan'|'ling'|'xuan'|'di'|'tian'|'xian']` 映射到 `--r-*`。

> 深色底整卡染色会毁掉文字对比度，浅色底同样——**稀有度一律用左条 + 角标表达，不染整卡**。这条结论在两个方向上都成立。

### 按钮

**主按钮（唯一使用 3D 堆叠阴影的按钮）：**

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--sp-2);
  padding: 10px var(--sp-5);
  border: var(--bw) solid var(--primary-deep-active);
  border-radius: var(--r-pill);
  background: var(--primary-deep);           /* 不是 --primary：白字需要 5.2:1 */
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: var(--shadow-3d);
  transition: all var(--t-base) var(--ease);
}
.btn:hover  { background: var(--primary-deep-hover); transform: translateY(-1px); box-shadow: var(--shadow-3d-hover); }
.btn:active { background: var(--primary-deep-active); transform: translateY(2px); box-shadow: var(--shadow-3d-press); }
.btn:focus-visible { outline: 3px solid var(--focus-ring-btn); outline-offset: 2px; }
```

**次级按钮（柔和抬升，不用 3D）：**

```css
.btn-soft {
  background: var(--surface-2);
  border: var(--bw) solid var(--hairline);
  color: var(--ink-2);
  box-shadow: var(--shadow-sm);
}
.btn-soft:hover  { border-color: var(--hairline-lit); box-shadow: var(--shadow-base); transform: translateY(-1px); }
.btn-soft:active { transform: translateY(0); box-shadow: var(--shadow-sm); }
```

**危险按钮：** `background: var(--error)` + `--shadow-3d-danger`。

> **硬规则 5：3D 堆叠阴影只给主按钮与危险主按钮。** 次级/文字/链接按钮只用柔和抬升阴影。**给每个按钮都加 3D 阴影会让界面过重、过"游戏化"**——这是参考库明确警告的反模式，也是本作最容易犯的错（本作按钮很多）。

**禁用态：** `background: var(--surface-4); color: var(--ink-4); border-color: var(--hairline); box-shadow: none; transform: none; cursor: not-allowed;`

### 标签 / 胶囊

```css
.chip {
  display: inline-flex; align-items: baseline; gap: 6px;
  padding: 3px var(--sp-3);
  border: var(--bw) solid var(--hairline);
  border-radius: var(--r-pill);
  background: var(--surface-2);
  color: var(--ink-3);
  font-size: 13px;
}
.chip b { color: var(--ink-1); font-weight: 700; }
```

分类色标签：`background: var(--primary-bg); border-color: var(--primary); color: var(--primary-active);`

### 进度条

```css
.bar {
  height: 10px;                              /* 浅色底上 4px 太细，看不清 */
  border: var(--bw) solid var(--hairline);
  border-radius: var(--r-pill);
  background: var(--surface-4);
  box-shadow: var(--shadow-track);           /* 轨道内凹，凹槽感 */
  overflow: hidden;
}
.bar > i {
  display: block; width: var(--p, 0%); height: 100%;
  border-radius: inherit;
  background: var(--primary-deep);            /* 4.4:1 vs 轨道；--primary 只有 1.8:1 */
  transition: width var(--t-slow) var(--ease);
}
.bar[data-tone='gold']    > i { background: var(--tone-gold); }
.bar[data-tone='crimson'] > i { background: var(--tone-red); }
```

> **填充一律用 `--tone-*` 加深档，不用 `--r-*` / `--island-*`。** 进度条是数值的**唯一**指示物，必须 ≥3:1；`--r-tian #e0b800` 在轨道上只有 **1.61:1**，等于看不见。这是"装饰调色板不能承载信息"的第二个实例（第一个是文字，见 §八）。

### 环形进度

```css
.ring {
  position: relative; width: 96px; height: 96px;
  border-radius: 50%;
  background: conic-gradient(var(--primary-deep) var(--p, 0%), var(--surface-4) 0);
  box-shadow: var(--shadow-base);
}
.ring::after {
  content: ''; position: absolute; inset: 7px;
  border-radius: 50%;
  background: var(--surface-1);
  border: var(--bw) solid var(--hairline);
}
```

### 弹层

**居中决策弹层 —— 使用 SVG blob 剪影（硬规则 9）：**

```css
.mask {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(61, 52, 40, 0.35);        /* 暖调遮罩，不是冷黑 */
  animation: 凝气 var(--t-base) var(--ease);
  z-index: 50;
}
.modal {
  width: 360px; max-width: calc(100vw - 32px); max-height: calc(100vh - 64px);
  clip-path: url(#animal-modal-clip);
  background: var(--bg-content);
  color: var(--ink-2);
  padding: var(--sp-7) var(--sp-7) var(--sp-6);  /* blob 边缘内缩大，padding 必须宽松 */
  animation: 凝气 300ms var(--ease);
}
```

blob 的 `<clipPath>` 定义放在 `index.html` 里（随页面加载即存在，无需 React 参与）：

```html
<svg style="position:absolute;width:0;height:0" aria-hidden="true">
  <defs>
    <clipPath id="animal-modal-clip" clipPathUnits="objectBoundingBox">
      <path d="M0.501,0.005 L0.501,0.005 L0.523,0.005 L0.549,0.006
        C0.704,0.01,0.796,0.017,0.825,0.027 L0.827,0.028
        C0.872,0.045,0.939,0.044,0.978,0.17 C1,0.254,1,0.365,0.99,0.505
        L0.988,0.513 C0.979,0.558,0.971,0.598,0.965,0.633
        C0.956,0.689,0.979,0.77,0.964,0.865 C0.953,0.928,0.921,0.966,0.869,0.979
        C0.821,0.986,0.773,0.992,0.726,0.995 L0.712,0.996 L0.694,0.997
        C0.648,1,0.586,1,0.507,1 L0.501,1 L0.464,1
        C0.385,1,0.325,0.998,0.283,0.995 C0.234,0.992,0.184,0.987,0.133,0.979
        C0.081,0.966,0.05,0.928,0.039,0.865 C0.023,0.77,0.047,0.689,0.037,0.633
        C0.031,0.595,0.023,0.552,0.013,0.505 C-0.006,0.365,-0.002,0.254,0.024,0.17
        C0.064,0.045,0.13,0.045,0.174,0.028 L0.175,0.028
        C0.204,0.017,0.303,0.009,0.474,0.005 L0.501,0.005" />
    </clipPath>
  </defs>
</svg>
```

> **blob 不可替换为圆角矩形**（硬规则 9）。它用 `objectBoundingBox` 单位，会随弹层尺寸拉伸——所以弹层宽度要相对固定，不要让内容把它撑得很宽。

**移动端底部抽屉 —— 不用 blob，用圆角上缘：**

```css
@media (max-width: 1023px) {
  .mask { align-items: flex-end; }
  .modal {
    width: 100%; max-width: 100%;
    clip-path: none;
    border-radius: var(--r-lg) var(--r-lg) 0 0;
    padding: var(--sp-5) var(--sp-5) calc(var(--sp-6) + env(safe-area-inset-bottom));
  }
}
```

> **blob 规则的作用域是居中弹层。** 底部抽屉是另一种形态（宽度铺满、高度自适应），blob 在非等比尺寸下会被拉变形。这是对硬规则 9 的**有意收窄**，不是违反。

**决策弹层不可点击遮罩关闭——选择就是玩法本身。** 加 `role="dialog" aria-modal="true"` + 焦点陷阱。仅当存在"暂缓"选项时才允许 Esc。

### 燕尾丝带标题（Title）

用于**主面板标题**与**外壳品牌名**，不是每个面板都用（丝带很重，满屏丝带会吵）。

```css
.ribbon {
  display: inline-flex; height: 2em;
  padding: 0 1.6em;
  letter-spacing: 0.04em;
  font-weight: 800;
  filter: drop-shadow(0 0.08em 0.12em rgba(61, 52, 40, 0.05));
  position: relative;
  --rf: var(--primary-deep);   /* 前面（白字需 5.2:1） */
  --rb: var(--primary);        /* 燕尾（无字，可用亮档） */
  --rk: #0a5f58;               /* 折角阴影 */
  --rt: #fff;                  /* 文字 */
}
.ribbon-back-left,
.ribbon-back-right {
  position: absolute; bottom: -0.4em;
  width: 1.7em; height: 1.7em;
  background: var(--rb);
}
.ribbon-back-left  { left: 0;  clip-path: polygon(100% 0%, 100% 100%, 0% 100%, 30% 50%, 0% 0%); }
.ribbon-back-right { right: 0; clip-path: polygon(0% 0%, 100% 0%, 70% 50%, 100% 100%, 0% 100%); }
.ribbon-fold-left,
.ribbon-fold-right {
  position: absolute; bottom: -0.45em;
  width: 0; height: 0;
  border-style: solid;
}
.ribbon-fold-left  { left: 0;  border-width: 0 0.95em 0.45em 0; border-color: transparent var(--rk) transparent transparent; }
.ribbon-fold-right { right: 0; border-width: 0 0 0.45em 0.95em; border-color: transparent transparent transparent var(--rk); }
.ribbon-front {
  position: absolute; inset: 0 0.1em;
  display: flex; align-items: center; justify-content: center;
  background: var(--rf);
  color: var(--rt);
  border-radius: 0.2em;
  transform: perspective(11.5em) rotateX(3deg);   /* 硬规则 10：必须带 3deg 透视 */
}
.ribbon-text { font-weight: 900; padding-top: 0.11em; }  /* CJK 视觉居中补偿 */
```

### 输入框

```css
.input {
  padding: 10px var(--sp-4);
  background: var(--surface-input);
  border: var(--bw-input) solid var(--hairline);
  border-radius: var(--r-pill);
  color: var(--ink-2);
  font-weight: 500;
  /* 默认无阴影 */
}
.input:focus { outline: 3px solid var(--focus-ring); outline-offset: 1px; border-color: var(--hairline-lit); }
```

### z-index 阶梯

| 层 | z-index |
|---|---|
| sticky 头部 / 底部导航 | 5 |
| 弹层遮罩 | 50 |
| 天劫特效 | 60 |
| 决策回顾 | 70 |
| toast | 98-99 |

> 深色版有"氛围 0 / 内容 1"两层，浅色版去掉——**氛围改用 `body` 自身背景，不再需要伪元素叠层**，因此内容层无需抬升。

---

## 六、动画词表

**在 `base.css` 里具名定义 `@keyframes`，组件只引用名字。**

| 名称 | 用途 | 规格 |
|---|---|---|
| `凝气` | 元素入场 | `opacity 0→1, scale .92→1`，250ms，`--ease` |
| `浮起` | 日志行、列表项入场 | `opacity 0→1, translateY 8px→0`，250ms，`--ease` |
| `流光` | 主按钮/传说边框扫光 | `::after` 渐变扫光，`translateX(-120%→120%)`，900ms |
| `灵光` | 生效 buff | 描边转 `--primary` + `box-shadow` 在 `--shadow-base`↔`--shadow-lg` 间呼吸，2.4s 无限 |
| `翻页` | 抽命格、得法宝、图鉴解锁 | `rotateY(0→180deg)`，`backface-visibility: hidden`，700ms |
| `碎裂` | 突破失败、丹毒过量 | `translateX(±3px)` 抖动 ×6，420ms + 8 粒子 `--error` 迸发 |
| `飞升` | 飞升、证道 | 全屏竖向 `--primary-deep`→`--r-tian` 光柱，`scaleY(0→1)` 再 `opacity 1→0`，2200ms |
| `顿悟` | 稀有顿悟触发 | `--r-tian` 径向闪光自中心，`scale .2→3`，`opacity .8→0`，900ms |
| `丹火` | 炉温条、炼丹进行中 | 填充 `box-shadow` 呼吸 1.2s；仙品时切 `--r-xian` |
| `劫雷` | 天劫 | 三道连续白闪（各 80ms）+ 屏幕 `brightness(.6→1)`，失败接 `碎裂` |

**删除：`云涌`。** 它是星野漂移动画，浅色版没有星野。

### 动效规则

**过渡一律 `var(--ease)`（`cubic-bezier(0.4, 0, 0.2, 1)`），时长 150-350ms。** 不允许 `ease` / `ease-in-out` 等未统一曲线，不允许突发跳变。

**例外：过场动画不是过渡。** `飞升`（2200ms）、`劫雷`、`顿悟`（900ms）、`流光`（900ms）是演出，不受 350ms 上限约束——但受「视觉强度 低/中/高」设置门控（见 [03-persistence.md](03-persistence.md#六设置与存档分离)）。

### 无障碍（硬要求）

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: opacity var(--t-fast) !important;
  }
}
```

**`劫雷` 与 `飞升` 另外受「视觉强度 低/中/高」设置门控**——玩家会连玩几小时，全屏闪光会很伤。

---

## 七、视觉与数据的对应

| 数据 | 视觉表达 |
|---|---|
| 档位 1-20 | 稀有度左侧 4px 色条（`--r-*` 六档循环，11-20 档加角标） |
| 修为/战力变化 | 数字滚动 + 颜色闪烁（增 `--success`，减 `--error`） |
| 丹毒 | 环形进度条，>50 转 `--error`，>80 加 `灵光` 呼吸 |
| 乘区触顶 | 该行右侧"已满"标记 + `--primary` 描边 |
| 软封顶生效 | 页脚"已触发软封顶，边际收益降低" |
| 羁绊好感 | 心形填充，`--island-pink` |
| 宗门职位 | 徽记 + 职位名，色阶从 `--island-green` 递进到 `--r-tian` |
| 天劫 | `劫雷` + `--r-xian` 丝带标题 |
| 飞升/证道 | `飞升` 全屏光柱 |

> 着色规则：**数值类文本用色须过 [§八](#八无障碍与对比度) 的对比度表。** 浅色底上"发光"不成立（没有暗背景可衬），高亮改为"加深 + 加粗 + 描边"，不要照搬深色版的 `text-shadow` 发光。

---

## 八、无障碍与对比度

**参考库的调色板整体偏浅，白字压在主色上是不达标的**——这是本批次最需要处理的一处硬冲突（见下方实测）。全站文本按 WCAG 2.x 相对亮度公式实测：

| 组合 | 用途 | 实测 | 要求 |
|---|---|---|---|
| `--ink-1` `#794f27` on `--bg-page` | 标题、强调正文 | **6.6:1** | ≥ 4.5 ✓ |
| `--ink-2` `#725d42` on `--bg-page` | 正文 | **5.9:1** | ≥ 4.5 ✓ |
| `--ink-3` `#6f6250` on `--surface-1` | 元信息 | **5.3:1** | ≥ 4.5 ✓ |
| `--ink-soft` `#8a7b66` on `--bg-page` | 装饰性次要文本 | **3.9:1** | **仅限大字**，不得用于正文/元信息 |
| `--ink-4` `#c4b89e` on `--surface-1` | 禁用态 | 1.9:1 | 豁免（WCAG 不禁用禁态） |
| 白字 on `--primary-deep` `#0d7a71` | **主按钮** | **5.2:1** | ≥ 4.5 ✓ |
| 白字 on `--primary` `#19c8b9` | —— | **2.1:1** | ✗ **禁止** |
| `--primary-deep` on `--surface-4` | 进度条填充 vs 轨道 | **4.4:1** | ≥ 3:1（非文本元件） ✓ |
| `--primary` on `--surface-4` | —— | 1.8:1 | ✗ 填充不可用 `--primary` |
| `--r-tian` `#e0b800` on `--surface-4` | 金色进度填充 | **1.61:1** | ✗ **看不见**，已改用 `--tone-gold` |
| `--r-*` 六档 on `--surface-2` | 稀有度左条 | 凡 3.00 / 灵 1.96 / 玄 2.54 / 地 2.87 / 天 1.87 / 仙 3.57 | **4/6 不到 3:1**，见下方纪律 3 |

### 由此得出的三条着色纪律

1. **主色分两条轨道。** `--primary #19c8b9` 只用于**不承载小字的场合**——描边、大面积装饰、图标、focus ring、卡片 pattern。**凡是要在上面压白字、或要以细尺寸表达进度的，一律用加深档 `--primary-deep #0d7a71`。** 参考库在它的按钮上压白字（2.1:1），我们不跟。
2. **`--ink-soft` 是装饰色，不是文本色。** 它对应参考库的 `@text-color-muted`，但那个值（`#8a7b66`）在本作的正文尺寸下只有 3.9:1，**不足以承载元信息**。元信息改用 `--ink-3`（`#6f6250`，5.3:1）——这是相对参考库 `--text-color-secondary #9f927d` 的一处**主动加深**，理由是元信息在本作里是高频可读内容（年龄、档位、倍率），不是可选装饰。

3. **装饰调色板只做装饰，承载信息时一律换加深档。** `--island-*` 与 `--r-*` 是**背景色/描边色**，不是文字色也不是填充色。凡是"没有它就读不出信息"的位置，换成对应的 `--tone-*` 或 `--primary-deep`。

   **唯一的例外：稀有度左条。** 六档里有四档不到 3:1（灵/玄/地/天），但色条**不是稀有度的唯一指示物**——卡片上始终有"凡品 · 一档"这样的文字标签，色条是冗余强调。WCAG 1.4.11 只约束"理解内容所必需"的图形，因此这里不构成违规。**但这条豁免依赖文字标签存在**：如果哪天出现只有色条、没有文字的稀有度表达（例如图鉴的网格缩略图），那一处必须重新取色。

### 焦点可见性

| 元件 | 焦点环 |
|---|---|
| 主/次按钮 | `3px solid var(--focus-ring-btn)` `#19c8b9`，`outline-offset: 2px` |
| 输入框 / 开关 / 复选 | `3px solid var(--focus-ring)` `#ffcc00` |
| 单选 | `3px solid var(--focus-ring-warn)` `#f5c31c` |

**永不使用蓝色焦点环。** 焦点环一律 `:focus-visible`，不用 `:focus`（避免鼠标点击也出环）。

### 对比度回归

改 token 后必须重跑本节表格。`--ink-3` 与 `--primary-deep` 是**风险对**——它们是"刚好过线"的值，下调一点就会破线。

---

## 九、与参考库的关系

**设计语言来源：** [`animal-island-ui`](https://github.com/guokaigdg/animal-island-ui) 的 `docs/design-system/`（color / typography / spacing / radius / shadow / motion tokens、七条设计法则、十四条视觉硬规则、各组件的像素级规格）。本文档的 token 值、几何参数、剪影路径与法则条目**直接取自该设计系统**。

**许可证：CC BY-NC 4.0 —— 禁止商业使用。** 本项目为个人非商业项目，符合许可范围；**署名要求已履行（本节）。** 若本作未来要商业化，必须先取得授权或重新设计视觉系统。这条约束是硬约束，不是建议。

### 为什么不直接引入这个库

| # | 理由 |
|---|---|
| 1 | **只需要约 6 类组件**（按钮/卡片/弹层/标签/进度条/标题），而该库导出 34 个（含 `DatePicker` `Table` `Carousel` `CodeBlock` `Form` 等本作永远用不到的） |
| 2 | **依赖与包体**：4.77 MB 未压缩 + `naive-icons` + `classnames` 两个新运行时依赖，直接违反 [tech/00 §二](00-project-setup.md#明确不引入) 的「不引入 UI 组件库」红线与 < 200 KB gzip 首屏预算 |
| 3 | **字体副作用**：库内字体走 `@fontsource` 分片，会让 `dist/` 膨胀数 MB（浏览器按需取分片，但产物与 CI 体积核对都被污染） |
| 4 | **决策弹层语义冲突**：本作要求"不可遮罩关闭 + 焦点陷阱 + 仅特定选项允许 Esc"，与库的 Modal 默认行为不一致，接了也要包一层改 |

**结论：只复用设计语言，用零依赖 CSS 自己实现。** 这也是 [tech/00 §二](00-project-setup.md#明确不引入) 里"定制的视觉会与组件库默认样式打架"那条理由的自然延伸——只不过现在打架的对象从"深色仙侠"换成了"我们自己照规格实现的岛屿风格"。

### 需要留意的实现细节

- **blob 剪影的 `objectBoundingBox` 单位会随尺寸拉伸**，弹层宽度要相对固定
- **丝带的 `filter: drop-shadow` 会创建新的层叠上下文**，注意与 z-index 阶梯的关系
- **2px 描边 + 大圆角**在 `border-radius: var(--r-pill)` 下是胶囊，不是圆角矩形——按钮/输入框一律胶囊，卡片 20px，其他交互元件最低 12px

---

## 十、设计法则

### 七条法则

1. **色彩**：暖褐文字 + 薄荷青主色 + 奶油羊皮纸底。**永不用纯黑或冷灰。**
2. **圆角**：最低 12px；按钮与输入框必须是 50px 胶囊。
3. **层次**：粗 3D 堆叠阴影（`0 Npx 0 0 [深色]` + 悬停抬升 / 按下压扁）**只给主按钮、危险主按钮、输入框、开关**。次级/虚线/文字/链接按钮只用柔和抬升阴影。
4. **字体**：Nunito 圆体，按钮与标题 600 以上，**永不用细字重**。
5. **动效**：过渡 150-350ms，缓动统一 `cubic-bezier(0.4, 0, 0.2, 1)`——顺滑，永不突兀。
6. **焦点**：输入框用黄 `#ffcc00`，按钮用青 `#19c8b9`。**永不用蓝色。**
7. **禁止**：直角交互元件、纯黑文字、冷蓝调、无阴影的扁平设计。

### 硬规则（本作相关部分）

| # | 规则 |
|---|---|
| 1 | 无纯黑文字。用 `#794f27` / `#725d42` / `#6f6250` |
| 2 | 无冷蓝焦点环 |
| 3 | 交互元件无 0px 圆角，最低 12px；按钮与输入框 50px 胶囊，卡片 20px |
| 4 | 无冷灰背景。用 `#f8f8f0` 或 `rgb(247,243,223)` |
| 5 | 3D 堆叠阴影**只给主按钮与危险主按钮** |
| 6 | 输入框默认无阴影 |
| 7 | 开关无外阴影，轨道内凹，手柄是 2.5px 描边的平面圆 |
| 8 | **卡片无 `box-shadow`**，悬停只做 `translateY(-2px)` |
| 9 | **居中弹层必须用 SVG blob 剪影**，不得换成圆角矩形（底部抽屉例外，见 §五） |
| 10 | 标题丝带必须带 `perspective(11.5em) rotateX(3deg)` 透视 |
| 11 | 字体 `Nunito` + 系统中文栈；**UI 文本禁用系统等宽字体** |
| 12 | 字重永不低于 400 |
| 13 | 缓动统一 `cubic-bezier(0.4, 0, 0.2, 1)`，时长 150-350ms |
| 15 | **不用 emoji 冒充 UI 图标**——emoji 在各平台的颜色温度、风格、字重都不一致 |
| 16 | 图标不写内联 SVG、不用 Unicode 符号（`✓ ✕ →`）。需要图标时用 CSS 绘制装饰块或引入 `naive-icons` |

> 规则 15 / 16 对本作的实际影响：日志流与面板里**不要**放 `✨🌿⚔️` 这类装饰 emoji。需要视觉标记时用 CSS 画的圆点、色条、丝带（本作已有的稀有度色条与羁绊心形都属此类）。

### 反模式速查

提交前对照此表，**出现任一 ❌ 即为不合格**：

| ❌ | ✅ |
|---|---|
| `color: #000` / `#111` | `color: var(--ink-1)` |
| `outline: 2px solid #0066ff` | `3px solid var(--focus-ring)` |
| `border-radius: 4px`（按钮/卡片） | `var(--r-pill)` / `var(--r-card)` |
| `background: #fafafa` | `background: var(--bg-page)` |
| 每个按钮都挂 `--shadow-3d` | 只有主按钮挂；次级用 `--shadow-sm` |
| 卡片挂 `box-shadow` | 卡片无阴影，悬停 `translateY(-2px)` |
| 居中弹层用 `border-radius` | `clip-path: url(#animal-modal-clip)` |
| `font-family: -apple-system, sans-serif` | `var(--font-round)` |
| `font-weight: 300` | 最低 400；正文 500，按钮/标题 600-700 |
| `transition: all 0.3s ease` | `transition: all var(--t-base) var(--ease)` |
| `<span>✨ 机缘</span>` | CSS 绘制的装饰块，或 `naive-icons` |

