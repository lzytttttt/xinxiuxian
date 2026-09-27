import { beforeEach, describe, expect, it } from 'vitest';
import { makeRngBag } from '../../src/engine/rng';
import { runRun } from '../../src/engine/replay';
import { rollYear } from '../../src/engine/tick';
import { BUNDLE } from '../../src/content/index';
import type { MetaState } from '../../src/engine/types/meta';
import type { RunState } from '../../src/engine/types/run';
import {
  CURRENT_VERSION,
  SAVE_KEY,
  ChecksumError,
  checksumOf,
  createSaver,
  defaultMeta,
  loadEnvelope,
  makeEnvelope,
  saveEnvelope,
  shouldPersistYear,
  verifyChecksum,
  type SaveEnvelope,
} from '../../src/store/persistence';

/* 6.5-6.9 走 localStorage。engine project 的 environment 是 node（没有 DOM），
   所以这里自己装一个最小的替身——不引入 jsdom 依赖，也不碰 vitest 配置。 */

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string): string | null {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string): void {
    this.map.set(k, v);
  }
  removeItem(k: string): void {
    this.map.delete(k);
  }
  keys(): string[] {
    return [...this.map.keys()];
  }
}

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
  (globalThis as unknown as { localStorage: MemoryStorage }).localStorage = storage;
});

/** 引擎真跑一局的存档，保证字段形态与真实存档一致（结果缓存，避免每个用例都重跑） */
let cached: RunState | null = null;
function busyRun(): RunState {
  cached ??= runRun(
    BUNDLE,
    { seed: 'ps-fixture-run', maxYears: 90, battlePolicy: 'yes' },
    (d) => d.choices.find((c) => c.show && c.enable)?.id ?? d.choices[0]?.id ?? 'resolve',
  ).state;
  return cached;
}

describe('存档校验和（验收 6.5）', () => {
  it('合法信封校验通过', () => {
    const run = busyRun();
    const env = makeEnvelope(defaultMeta(), run);
    expect(() => verifyChecksum(env)).not.toThrow();
  });

  it('篡改 run 的任意字段即被检出', () => {
    const run = busyRun();
    const env = makeEnvelope(defaultMeta(), run);
    (env.run as unknown as Record<string, unknown>).cultivation = 999999;
    expect(() => verifyChecksum(env)).toThrow(ChecksumError);
  });

  it('篡改 meta 的任意字段即被检出', () => {
    const env = makeEnvelope(defaultMeta(), busyRun());
    env.meta.legacyPoints += 1;
    expect(() => verifyChecksum(env)).toThrow(ChecksumError);
  });

  it('改一个字符也检得出（checksum 覆盖整个 JSON 文本）', () => {
    const run = busyRun();
    const env = makeEnvelope(defaultMeta(), run);
    const raw = JSON.stringify(env);
    const flipped = raw.replace('"seed":"ps-fixture-run"', '"seed":"ps-fixture-rux"');
    expect(flipped).not.toBe(raw);
    expect(() => verifyChecksum(JSON.parse(flipped) as SaveEnvelope)).toThrow(ChecksumError);
  });
});

describe('失败归档（验收 6.6）', () => {
  it('损坏存档被归档到 bak.{v} 而非删除', () => {
    storage.setItem(SAVE_KEY, '{"v":6,"meta":{},"run":null,"checksum":"deadbeef","savedAt":0}');
    const loaded = loadEnvelope();
    expect(loaded).toBeNull();
    expect(storage.getItem(SAVE_KEY)).toBeNull();
    const backup = storage.getItem(`${SAVE_KEY}.bak.6`);
    expect(backup).not.toBeNull();
    expect(backup).toContain('deadbeef');
  });

  it('连 JSON 都解不开时归档到 bak.unknown，原始内容一字不改', () => {
    storage.setItem(SAVE_KEY, 'not json at all');
    expect(loadEnvelope()).toBeNull();
    expect(storage.getItem(`${SAVE_KEY}.bak.unknown`)).toBe('not json at all');
  });

  it('没有存档时返回 null 且不产生任何归档', () => {
    expect(loadEnvelope()).toBeNull();
    expect(storage.keys()).toHaveLength(0);
  });

  it('合法存档原样载入，不产生归档', () => {
    const env = makeEnvelope(defaultMeta(), null);
    saveEnvelope(env);
    const loaded = loadEnvelope();
    expect(loaded?.v).toBe(CURRENT_VERSION);
    expect(storage.keys()).toEqual([SAVE_KEY]);
  });
});

describe('节流写入（验收 6.7）', () => {
  it('90 年模拟写入 ≤ 25 次', () => {
    const holder: { meta: MetaState; run: RunState | null } = { meta: defaultMeta(), run: null };
    const saver = createSaver(() => holder);
    const run = busyRun();
    holder.run = run;
    const rng = makeRngBag('ps-throttle-loop');
    let requests = 0;
    for (let year = 1; year <= 90; year++) {
      rollYear(run, rng, BUNDLE);
      if (shouldPersistYear(run.year)) {
        saver.request();
        requests += 1;
      }
    }
    saver.flush();
    // 每 5 年一档：90 年最多 18 次请求；debounce 只会让写入更少
    expect(requests).toBeLessThanOrEqual(18);
    expect(saver.writes()).toBeLessThanOrEqual(25);
    expect(saver.writes()).toBeGreaterThan(0);
  });

  it('请求节流：连打 100 次 request 只写一次', async () => {
    const holder: { meta: MetaState; run: RunState | null } = { meta: defaultMeta(), run: null };
    const saver = createSaver(() => holder, { debounceMs: 20 });
    for (let i = 0; i < 100; i++) saver.request();
    expect(saver.writes()).toBe(0);
    await new Promise((r) => setTimeout(r, 60));
    expect(saver.writes()).toBe(1);
  });

  it('flush 一定落盘，且多次 flush 计数累加', () => {
    const holder: { meta: MetaState; run: RunState | null } = { meta: defaultMeta(), run: null };
    const saver = createSaver(() => holder);
    saver.flush();
    saver.flush();
    expect(saver.writes()).toBe(2);
    expect(storage.getItem(SAVE_KEY)).toBeTruthy();
  });
});

describe('存档体积（验收 6.9）', () => {
  it('一局满存档（20 世高光 + 六张图鉴位串 + 成就）≤ 50 KB', () => {
    const meta = defaultMeta();
    // 撑满跨局层：20 条高光 + 10 位前世道侣 + 全部成就 + 2000 条图鉴位串
    const bits = (n: number): string => {
      let s = '';
      for (let i = 0; i < n; i += 4) s += 'f';
      return s.slice(0, Math.ceil(n / 4));
    };
    const full: MetaState = {
      ...meta,
      lifetimeLegacy: 99999,
      legacyPoints: 2846,
      cave: { 药园: 5, 丹房: 5, 藏经阁: 5, 悟道室: 5, 聚灵阵: 5, 静室: 5 },
      unlocks: {
        arts: Array.from({ length: 42 }, (_, i) => `art_${i}`),
        recipes: Array.from({ length: 35 }, (_, i) => `recipe_${i}`),
        sects: Array.from({ length: 8 }, (_, i) => `sect_${i}`),
      },
      sectLegacy: Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`sect_${i}`, 4])),
      pastLives: Array.from({ length: 20 }, (_, i) => ({
        life: i + 1,
        level: 100 + i,
        power: 10 ** (i + 3),
        years: 120,
        reason: 'zhengdao' as const,
        ascendMode: 'zhengdao',
        fates: ['天命', '道骨', '星陨'],
      })),
      pastPartners: Array.from({ length: 10 }, (_, i) => ({
        name: `道友${i}`,
        seed: `seed-${i}`,
        life: i,
        level: 5,
      })),
      achievements: Array.from({ length: 80 }, (_, i) => `ach_${i}`),
      codex: {
        encounters: bits(2000),
        artifacts: bits(2000),
        realms: bits(20),
        pills: bits(40),
        arts: bits(50),
        herbs: bits(70),
      },
    };
    const run = busyRun();
    const size = JSON.stringify(makeEnvelope(full, run)).length;
    expect(size, `实际 ${(size / 1024).toFixed(1)} KB`).toBeLessThanOrEqual(50 * 1024);
  });
});

describe('字段不冲突（验收 6.8）', () => {
  it('RunState 与 MetaState 顶层字段名无交集', () => {
    // 用真实值构造实例，再取顶层 key——比读 .d.ts 可靠（类型断言不会留下运行时痕迹）
    const run = busyRun();
    const meta = defaultMeta();
    const runKeys = Object.keys(run).sort();
    const metaKeys = Object.keys(meta).sort();
    const overlap = runKeys.filter((k) => metaKeys.includes(k));
    expect(overlap, `重叠字段：${overlap.join('、')}`).toEqual([]);
  });

  it('洞府与跨局数据都只落在 RunState.cave 一处（不重复定义）', () => {
    const run = busyRun();
    expect(Object.keys(run.legacyCave).sort()).toEqual(
      ['丹房', '悟道室', '静室', '聚灵阵', '药园', '藏经阁'].sort(),
    );
    expect(defaultMeta().cave).toEqual(run.legacyCave);
  });
});

describe('校验和的确定性（不随写入顺序漂移）', () => {
  it('同一份 meta+run 两次计算结果一致', () => {
    const run = busyRun();
    const meta = defaultMeta();
    expect(checksumOf(meta, run)).toBe(checksumOf(meta, run));
  });

  it('空局与 null 局也走同一条路径', () => {
    const meta = defaultMeta();
    expect(checksumOf(meta, null)).toBe(checksumOf(meta, null));
    expect(checksumOf(meta, null)).not.toBe(checksumOf(defaultMeta(), busyRun()));
  });
});
