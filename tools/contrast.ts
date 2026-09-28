/**
 * 对比度实测（验收 7.4）。读 `src/ui/tokens.css`，按 WCAG 2.x 相对亮度公式实算全表。
 *
 * **为什么要有这个工具**：`doc/tech/04-visual.md §八` 的对比度表原先是手写结论，
 * 改一个 token 没有任何东西会失败。现在表格由本工具的输出逐行回填，文档与代码同源。
 *
 * 豁免项**显式列在 EXEMPT 里**而不是静默跳过——豁免不写下来就等于没有。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS = resolve(ROOT, 'src/ui/tokens.css');

type Rgb = readonly [number, number, number];

function parseColor(raw: string): Rgb | null {
  const s = raw.trim();
  const hex = /^#([0-9a-f]{6})$/i.exec(s);
  if (hex) {
    const n = parseInt(hex[1] as string, 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  }
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i.exec(s);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

function loadTokens(css: string): Map<string, Rgb> {
  const out = new Map<string, Rgb>();
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    const rgb = parseColor(m[2] as string);
    if (rgb) out.set(`--${m[1] as string}`, rgb);
  }
  return out;
}

/** WCAG 2.x 相对亮度 */
function luminance([r, g, b]: Rgb): number {
  const lin = (c: number): number => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(fg: Rgb, bg: Rgb): number {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE: Rgb = [255, 255, 255];

interface Pair {
  label: string;
  fg: string;
  bg: string;
  min: number;
  /** 豁免理由；给出则只记录不失败 */
  exempt?: string;
}

const PAIRS: readonly Pair[] = [
  // ── 正文 / 标题 / 元信息：≥ 4.5:1（WCAG 1.4.3）
  { label: '--ink-1 标题 on --bg-page', fg: '--ink-1', bg: '--bg-page', min: 4.5 },
  { label: '--ink-2 正文 on --bg-page', fg: '--ink-2', bg: '--bg-page', min: 4.5 },
  { label: '--ink-2 正文 on --surface-2', fg: '--ink-2', bg: '--surface-2', min: 4.5 },
  { label: '--ink-3 元信息 on --bg-page', fg: '--ink-3', bg: '--bg-page', min: 4.5 },
  { label: '--ink-3 元信息 on --surface-1', fg: '--ink-3', bg: '--surface-1', min: 4.5 },
  { label: '--ink-3 元信息 on --surface-2', fg: '--ink-3', bg: '--surface-2', min: 4.5 },
  { label: '--tone-green on --bg-page', fg: '--tone-green', bg: '--bg-page', min: 4.5 },
  { label: '--tone-blue on --bg-page', fg: '--tone-blue', bg: '--bg-page', min: 4.5 },
  { label: '--tone-violet on --bg-page', fg: '--tone-violet', bg: '--bg-page', min: 4.5 },
  { label: '--tone-red on --bg-page', fg: '--tone-red', bg: '--bg-page', min: 4.5 },
  { label: '--tone-gold on --bg-page', fg: '--tone-gold', bg: '--bg-page', min: 4.5 },
  { label: '白字 on --primary-deep 主按钮', fg: '__white', bg: '--primary-deep', min: 4.5 },
  { label: '白字 on --primary-deep-hover', fg: '__white', bg: '--primary-deep-hover', min: 4.5 },
  { label: '白字 on --primary-deep-active', fg: '__white', bg: '--primary-deep-active', min: 4.5 },
  { label: '--primary-deep 链接/强调 on --surface-2', fg: '--primary-deep', bg: '--surface-2', min: 4.5 },

  // ── 非文本元件：≥ 3:1（WCAG 1.4.11）
  { label: '--primary-deep 进度填充 vs --surface-4 轨道', fg: '--primary-deep', bg: '--surface-4', min: 3 },
  // 焦点环一律 `outline-offset: 2px`，画在元件**外侧**的空隙里，那里的底色是页面底而非元件面
  { label: '--focus-ring-btn 按钮焦点环 on --bg-page', fg: '--focus-ring-btn', bg: '--bg-page', min: 3 },
  { label: '--focus-ring 输入焦点环 on --bg-page', fg: '--focus-ring', bg: '--bg-page', min: 3 },
  { label: '--focus-ring-warn 单选焦点环 on --bg-page', fg: '--focus-ring-warn', bg: '--bg-page', min: 3 },

  // ── 豁免：显式列名，只记录不失败
  {
    label: '--ink-soft 装饰性次要文本',
    fg: '--ink-soft',
    bg: '--bg-page',
    min: 4.5,
    exempt: '装饰色，仅限 ≥3:1 的大字与非必要文本（§八纪律 2）',
  },
  {
    label: '--ink-4 禁用态',
    fg: '--ink-4',
    bg: '--surface-1',
    min: 4.5,
    exempt: 'WCAG 不对禁用态提对比度要求',
  },
  {
    label: '--hairline 卡片/分隔描边 on --surface-1',
    fg: '--hairline',
    bg: '--surface-1',
    min: 3,
    exempt: '装饰描边：元件由底色填充 + 投影识别，边框不承担唯一指示（WCAG 1.4.11 排除纯装饰）',
  },
  {
    label: '白字 on --primary',
    fg: '__white',
    bg: '--primary',
    min: 4.5,
    exempt: '硬禁止：--primary 只走装饰轨道，不承载小字（§八纪律 1）',
  },
  {
    label: '--r-tian 天品稀有度左条 on --surface-4',
    fg: '--r-tian',
    bg: '--surface-4',
    min: 3,
    exempt: '稀有度另有文字标签「天品 · 五档」，色条是冗余强调（§八纪律 3）',
  },
  {
    label: '--r-fan 凡品稀有度左条 on --surface-4',
    fg: '--r-fan',
    bg: '--surface-4',
    min: 3,
    exempt: '同左条豁免',
  },
  {
    label: '--r-ling 灵品稀有度左条 on --surface-4',
    fg: '--r-ling',
    bg: '--surface-4',
    min: 3,
    exempt: '同左条豁免',
  },
  {
    label: '--r-xuan 玄品稀有度左条 on --surface-4',
    fg: '--r-xuan',
    bg: '--surface-4',
    min: 3,
    exempt: '同左条豁免',
  },
  {
    label: '--r-di 地品稀有度左条 on --surface-4',
    fg: '--r-di',
    bg: '--surface-4',
    min: 3,
    exempt: '同左条豁免',
  },
  {
    label: '--r-xian 仙品稀有度左条 on --surface-4',
    fg: '--r-xian',
    bg: '--surface-4',
    min: 3,
    exempt: '同左条豁免',
  },
];

const tokens = loadTokens(readFileSync(TOKENS, 'utf8'));
const lookup = (name: string): Rgb | null => (name === '__white' ? WHITE : (tokens.get(name) ?? null));

const failures: string[] = [];
const missing: string[] = [];

console.log('── 对比度实测（WCAG 2.x）src/ui/tokens.css ──\n');
console.log('组合                                          实测      要求   判定');
console.log('─'.repeat(78));

for (const p of PAIRS) {
  const fg = lookup(p.fg);
  const bg = lookup(p.bg);
  if (!fg || !bg) {
    missing.push(`${p.label}（${!fg ? p.fg : p.bg} 未在 tokens.css 中定义）`);
    continue;
  }
  const ratio = contrast(fg, bg);
  const pass = ratio >= p.min;
  const tag = p.exempt ? '豁免' : pass ? '✓' : '✗';
  console.log(
    `${p.label.padEnd(46, ' ')} ${ratio.toFixed(2).padStart(5)}:1  ≥${p.min}  ${tag}`,
  );
  if (p.exempt) {
    console.log(`${' '.repeat(46)} ↳ ${p.exempt}`);
  } else if (!pass) {
    failures.push(`${p.label} = ${ratio.toFixed(2)}:1，要求 ≥${p.min}:1`);
  }
}

if (missing.length > 0) {
  console.log(`\n✗ 解析失败 ${missing.length} 项：`);
  for (const m of missing) console.log(`  ${m}`);
  process.exit(1);
}

console.log('');
if (failures.length > 0) {
  console.log(`✗ 对比度红线破线 ${failures.length} 项：`);
  for (const f of failures) console.log(`  ${f}`);
  console.log('\n破线后必须同步改 doc/tech/04-visual.md §八（该表由本工具输出回填）。');
  process.exit(1);
}

console.log(`✓ 全部非豁免组合达标（${PAIRS.length - failures.length} 项，豁免已显式列名）`);
console.log('  表格回填：doc/tech/04-visual.md §八');
