import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { BUNDLE } from '../src/content/index';
import {
  calibrate,
  goldenSnapshot,
  logDigest,
  replayRun,
  simulate,
  type CalibrateRow,
  type GoldenEntry,
} from './simlib';

const args = process.argv.slice(2);
const has = (flag: string): boolean => args.includes(flag);
const num = (flag: string, fallback: number): number => {
  const i = args.indexOf(flag);
  if (i < 0) return fallback;
  const v = Number(args[i + 1]);
  return Number.isFinite(v) ? v : fallback;
};

function writeJson(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function compareJson(path: string, label: string, tolerance: number): boolean {
  if (!existsSync(path)) {
    console.error(`${label}: 缺少基线文件 ${path}（先运行 --write 生成）`);
    return false;
  }
  const baseline = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  const current = JSON.parse(readFileSync(`${path}.tmp`, 'utf8')) as unknown;
  if (JSON.stringify(baseline) === JSON.stringify(current)) {
    console.log(`${label}: 与基线精确一致`);
    return true;
  }
  if (tolerance > 0 && Array.isArray(baseline) && Array.isArray(current)) {
    let ok = true;
    for (let i = 0; i < baseline.length; i++) {
      const b = baseline[i] as CalibrateRow;
      const c = current[i] as CalibrateRow;
      for (const key of ['p10', 'p50', 'p90'] as const) {
        const base = b[key];
        const cur = c[key];
        const dev = base === 0 ? (cur === 0 ? 0 : 1) : Math.abs(cur - base) / base;
        if (dev > tolerance) {
          console.error(
            `${label}: 档 ${b.tier} ${key} 偏移 ${(dev * 100).toFixed(2)}% (> ${tolerance * 100}%)`,
          );
          ok = false;
        }
      }
    }
    console.log(ok ? `${label}: 全部落在 ±${tolerance * 100}% 内` : `${label}: 超出容差`);
    return ok;
  }
  if (Array.isArray(baseline) && Array.isArray(current)) {
    for (let i = 0; i < Math.max(baseline.length, current.length); i++) {
      const b = JSON.stringify(baseline[i]);
      const c = JSON.stringify(current[i]);
      if (b !== c) {
        console.error(`${label}: 第 ${i} 项不一致\n  基线 ${b}\n  当前 ${c}`);
        break;
      }
    }
  }
  return false;
}

if (has('--golden')) {
  const count = num('--seeds', 50);
  const years = num('--years', 200);
  const path = 'tests/fixtures/golden.json';
  const snapshot = goldenSnapshot(BUNDLE, count, years);
  if (has('--write') || !existsSync(path)) {
    writeJson(path, snapshot);
    console.log(`golden: 已写入 ${path}（${snapshot.length} 种子 × ${years} 年）`);
  } else {
    writeJson(`${path}.tmp`, snapshot);
    const ok = compareJson(path, 'golden', 0);
    process.exitCode = ok ? 0 : 1;
  }
} else if (has('--calibrate')) {
  const samples = num('--samples', 200);
  const years = num('--years', 200);
  const path = 'tests/fixtures/calibrate.json';
  const rows = calibrate(BUNDLE, samples, years);
  console.table(rows);
  if (has('--write') || !existsSync(path)) {
    writeJson(path, rows);
    console.log(`calibrate: 已写入 ${path}（每档 ${samples} 局）`);
  } else {
    writeJson(`${path}.tmp`, rows);
    const ok = compareJson(path, 'calibrate', 0.02);
    process.exitCode = ok ? 0 : 1;
  }
} else if (has('--pacing')) {
  const runs = num('--runs', 200);
  const years = num('--years', 200);
  const yearsArr: number[] = [];
  const decArr: number[] = [];
  const optArr: number[] = [];
  for (let i = 0; i < runs; i++) {
    const out = simulate(BUNDLE, { seed: `pace-${String(i).padStart(4, '0')}`, maxYears: years });
    yearsArr.push(out.years);
    decArr.push(out.decisionCount);
    optArr.push(out.optionPoints);
  }
  const q = (arr: number[], p: number): number => {
    const a = [...arr].sort((x, y) => x - y);
    return a[Math.min(a.length - 1, Math.floor(a.length * p))] ?? 0;
  };
  const avg = (arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length;
  const fmt = (arr: number[]): string => `${q(arr, 0.1)}/${q(arr, 0.5)}/${q(arr, 0.9)}`;
  console.log(`runs=${runs} 年数 p10/p50/p90 = ${fmt(yearsArr)}（均 ${avg(yearsArr).toFixed(0)}）`);
  console.log(`决策次数 p10/p50/p90 = ${fmt(decArr)}（均 ${avg(decArr).toFixed(1)}）`);
  console.log(`选项点总数 p10/p50/p90 = ${fmt(optArr)}（均 ${avg(optArr).toFixed(1)}）`);
  const p50 = q(optArr, 0.5);
  const ok = p50 >= 25;
  console.log(`验收 2.4（选项点总数 p50 ≥ 25）：${ok ? `通过（${p50}）` : `未达标（${p50}）`}`);
  process.exitCode = ok ? 0 : 1;
} else if (has('--replay')) {
  const runs = num('--runs', 200);
  const years = num('--years', 200);
  let passed = 0;
  for (let i = 0; i < runs; i++) {
    const seed = `replay-${String(i).padStart(4, '0')}`;
    const opts = { seed, maxYears: years };
    try {
      const first = simulate(BUNDLE, opts);
      const again = replayRun(BUNDLE, opts, first.decisions);
      if (logDigest(again.log) !== logDigest(first.log)) throw new Error('日志与首次运行分歧');
      passed += 1;
    } catch (err) {
      console.error(`replay: ${seed} 失败 —— ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  const ok = passed === runs;
  console.log(`replay: 记录→重放闭环 ${passed}/${runs} 局一致`);
  process.exitCode = ok ? 0 : 1;
} else {
  const runs = num('--runs', 200);
  const years = num('--years', 200);
  const levels: number[] = [];
  const ends = new Map<string, number>();
  for (let i = 0; i < runs; i++) {
    const out = simulate(BUNDLE, { seed: `sim-${String(i).padStart(4, '0')}`, maxYears: years });
    levels.push(out.level);
    const key = out.ended ?? 'running';
    ends.set(key, (ends.get(key) ?? 0) + 1);
  }
  levels.sort((a, b) => a - b);
  const q = (p: number): number => levels[Math.min(levels.length - 1, Math.floor(levels.length * p))] ?? 0;
  console.log(
    `runs=${runs} 等级 p10/p50/p90 = ${q(0.1)}/${q(0.5)}/${q(0.9)} 最高 ${levels[levels.length - 1]}`,
  );
  console.table([...ends.entries()].map(([reason, count]) => ({ reason, count })));
}
