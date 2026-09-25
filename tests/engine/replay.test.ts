import { describe, expect, it } from 'vitest';
import { BUNDLE } from '../../src/content/index';
import { logDigest, replayRun, simulate } from '../../tools/simlib';

const OPTS = { seed: 'replay-001', maxYears: 200 } as const;

describe('重放确定性（Phase 2 验收 2.3）', () => {
  it('同种子 + 同选择序列 → 逐字节相同日志', () => {
    const first = simulate(BUNDLE, OPTS);
    const second = replayRun(BUNDLE, OPTS, first.decisions);
    expect(logDigest(second.log)).toBe(logDigest(first.log));
    expect(second.level).toBe(first.level);
    expect(second.cultivation).toBe(first.cultivation);
    expect(second.eventIds).toEqual(first.eventIds);
    expect(second.decisions).toEqual(first.decisions);
    expect(first.decisions.length).toBeGreaterThan(0);
  });

  it('多次重放结果稳定（三次一致）', () => {
    const first = simulate(BUNDLE, { seed: 'replay-002', maxYears: 200 });
    const a = replayRun(BUNDLE, { seed: 'replay-002', maxYears: 200 }, first.decisions);
    const b = replayRun(BUNDLE, { seed: 'replay-002', maxYears: 200 }, first.decisions);
    expect(logDigest(a.log)).toBe(logDigest(first.log));
    expect(logDigest(b.log)).toBe(logDigest(first.log));
  });

  it('记录与实际 pending 不符 → 抛错，不静默继续', () => {
    const first = simulate(BUNDLE, OPTS);
    const tampered = first.decisions.map((d, i) => (i === 0 ? { ...d, year: d.year + 7 } : d));
    expect(() => replayRun(BUNDLE, OPTS, tampered)).toThrow(/重放分歧/);
  });

  it('记录缺失 → 抛错', () => {
    const first = simulate(BUNDLE, OPTS);
    expect(() => replayRun(BUNDLE, OPTS, first.decisions.slice(0, 1))).toThrow(/重放中断/);
  });
});
