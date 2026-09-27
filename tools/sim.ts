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
} else if (has('--sect')) {
  /* 验收 5.3 / 5.4：宗门晋升可达 + 大比每 20 年一次、名次随战力单调 */
  const runs = num('--runs', 200);
  const years = num('--years', 200);
  const levels: number[] = [];
  const ranks: number[] = [];
  const contribs: number[] = [];
  const places: number[] = [];
  const defections: number[] = [];
  const tournamentsPerRun: number[] = [];
  const cadenceOk: boolean[] = [];
  const RANK_NAMES = ['外门', '内门', '真传', '长老', '宗主'];
  for (let i = 0; i < runs; i++) {
    const out = simulate(BUNDLE, {
      seed: `sect-${String(i).padStart(4, '0')}`,
      maxYears: years,
      sect: 'greedy',
    });
    levels.push(out.level);
    ranks.push(out.sectRank);
    contribs.push(out.contribution);
    places.push(...out.tournamentPlaces);
    defections.push(out.state.sect.defections);
    tournamentsPerRun.push(out.tournamentPlaces.length);
    // 局可能提前结束：断言的是「存活的每个 20 年节点都打过」。
    // 死在当年 20 年整点上的局 hit 不到那一次（onYear 不再回调），故按死年折算。
    const expected = Math.max(
      0,
      out.state.dead ? Math.ceil(out.years / 20) - 1 : Math.floor(out.years / 20),
    );
    cadenceOk.push(out.tournamentPlaces.length === expected);
  }
  const q = (arr: number[], p: number): number => {
    const a = [...arr].sort((x, y) => x - y);
    return a[Math.min(a.length - 1, Math.floor(a.length * p))] ?? 0;
  };
  const rankDist = new Map<string, number>();
  for (const r of ranks) rankDist.set(RANK_NAMES[r] ?? String(r), (rankDist.get(RANK_NAMES[r] ?? String(r)) ?? 0) + 1);
  console.log(`── 宗门（验收 5.3/5.4）runs=${runs} · 宗门策略 greedy ──`);
  console.log(`最终境界 p10/p50/p90 = ${q(levels, 0.1)}/${q(levels, 0.5)}/${q(levels, 0.9)}`);
  console.log(`贡献 p50 = ${q(contribs, 0.5)}；职位分布 ${[...rankDist.entries()].map(([k, v]) => `${k} ${v}`).join('、')}`);
  console.log(`大比次数/局 p50 = ${q(tournamentsPerRun, 0.5)}（按局内存活年数折算）`);
  console.log(`大比名次 p10/p50/p90 = ${q(places, 0.1)}/${q(places, 0.5)}/${q(places, 0.9)}（样本 ${places.length}）`);
  console.log(`叛宗次数合计 = ${defections.reduce((a, b) => a + b, 0)}`);
  const rank3 = ranks.filter((r) => r >= 3).length;
  const ok53 = rank3 / runs >= 0.5;
  const cadence = cadenceOk.filter(Boolean).length;
  const ok54 = cadence === runs;
  console.log(`验收 5.3（多数局可达 rank≥3 长老）：${rank3}/${runs} —— ${ok53 ? '通过' : '未达标'}`);
  console.log(`验收 5.4（每个 20 年节点都触发）：${cadence}/${runs} —— ${ok54 ? '通过' : '未达标'}`);
  process.exitCode = ok53 && ok54 ? 0 : 1;
} else if (has('--bond')) {
  /* 验收 5.6：一局 90 年建立 3-5 段羁绊（终局存活关系数） */
  const runs = num('--runs', 300);
  const years = num('--years', 90);
  const counts: number[] = [];
  const aids: number[] = [];
  const types = new Map<string, number>();
  for (let i = 0; i < runs; i++) {
    const out = simulate(BUNDLE, { seed: `bond-${String(i).padStart(4, '0')}`, maxYears: years });
    const live = out.state.bonds.list.filter((n) => n.alive && n.bondType !== null).length;
    counts.push(live);
    aids.push(out.aidBonus);
    for (const t of out.bondTypes) types.set(t, (types.get(t) ?? 0) + 1);
  }
  const q = (arr: number[], p: number): number => {
    const a = [...arr].sort((x, y) => x - y);
    return a[Math.min(a.length - 1, Math.floor(a.length * p))] ?? 0;
  };
  const p50 = q(counts, 0.5);
  const inBand = counts.filter((c) => c >= 3 && c <= 5).length;
  console.log(`── 羁绊（验收 5.6）runs=${runs} · ${years} 年 ──`);
  console.log(`存活关系数 p10/p50/p90 = ${q(counts, 0.1)}/${p50}/${q(counts, 0.9)}；落在 [3,5] 的比例 ${(inBand / runs).toFixed(2)}`);
  console.log(`助战加成 p50 = ${(q(aids.map((a) => Math.round(a * 1000)), 0.5) / 1000).toFixed(3)}（上限 0.30）`);
  console.log(`关系类型分布（局次）${[...types.entries()].map(([k, v]) => `${k} ${v}`).join('、')}`);
  const ok = p50 >= 3 && p50 <= 5;
  console.log(`验收 5.6（p50 落在 3-5 段）：${ok ? '通过' : '未达标'}`);
  process.exitCode = ok ? 0 : 1;
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
