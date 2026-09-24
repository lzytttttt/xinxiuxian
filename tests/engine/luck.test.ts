import { describe, expect, it } from 'vitest';
import { LUCK_DIV } from '../../src/engine/constants';
import { makeRngBag } from '../../src/engine/rng';
import { createRun } from '../../src/engine/newRun';
import { luckMult } from '../../src/engine/selectors';
import type { StreamName } from '../../src/engine/types/rng';
import type { RunState } from '../../src/engine/types/run';

const ENGINE_SOURCES = import.meta.glob('../../src/engine/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function stateWithLuck(luck: number): RunState {
  const rng = makeRngBag('luck-test');
  const s = createRun(
    'luck-test',
    1,
    { tier: 5, value: 45, luck, simPoints: 100, fates: [], guard: false },
    rng,
    { runId: 'luck-test', createdAt: 0 },
  );
  s.luck = luck;
  return s;
}

describe('luckMult 唯一性（R2 三重防护之一）', () => {
  it('LUCK_DIV 只被除一次，且只在 selectors.ts', () => {
    const divisors: string[] = [];
    for (const [path, source] of Object.entries(ENGINE_SOURCES)) {
      const count = (source.match(/\/\s*LUCK_DIV\b/g) ?? []).length;
      if (count > 0) {
        divisors.push(`${path.replace(/^.*?(src[\\/]engine[\\/])/, 'src/engine/')}:${count}`);
      }
    }
    expect(divisors).toEqual(['src/engine/selectors.ts:1']);
    expect(LUCK_DIV).toBe(1000);
  });

  it('引擎源码里没有裸 /1000 除法', () => {
    const bad = Object.entries(ENGINE_SOURCES)
      .filter(([, source]) => /\/\s*1000\b/.test(source.replace(/\/\/[^\n]*/g, '')))
      .map(([path]) => path);
    expect(bad).toEqual([]);
  });
});

describe('概率通道翻倍（R2 行为断言）', () => {
  const CASES: { stream: StreamName; rate: number; samples: number }[] = [
    { stream: 'event', rate: 0.1, samples: 1_000_000 },
    { stream: 'artifact', rate: 0.05, samples: 1_000_000 },
    { stream: 'encounter', rate: 0.05, samples: 1_000_000 },
    { stream: 'luck', rate: 1 / 1500, samples: 2_000_000 },
  ];

  for (const { stream, rate, samples } of CASES) {
    it(`${stream} 通道：气运 0→1000 触发率翻倍（±2%，稀有通道放宽到 4σ）`, () => {
      const lowBag = makeRngBag('channel-seed');
      const highBag = makeRngBag('channel-seed');
      const low = stateWithLuck(0);
      const high = stateWithLuck(1000);
      let lowHits = 0;
      let highHits = 0;
      for (let i = 0; i < samples; i++) {
        if (lowBag[stream].chance(rate * luckMult(low))) lowHits += 1;
        if (highBag[stream].chance(rate * luckMult(high))) highHits += 1;
      }
      expect(lowHits).toBeGreaterThan(0);
      const ratio = highHits / lowHits;
      // 比值的统计噪声 ≈ 2·√(1/n_low + 1/n_high)；稀有通道（仙灵气）低频，
      // 固定 ±2% 会变成噪声测试，故取「±2% 与 4σ 的较大者」。
      const sigma = 2 * Math.sqrt(1 / lowHits + 1 / highHits);
      const tolerance = Math.max(0.02, 4 * sigma);
      expect(Math.abs(ratio - 2)).toBeLessThanOrEqual(tolerance);
    });
  }
});
