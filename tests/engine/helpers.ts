import { createRun } from '../../src/engine/newRun';
import { makeRngBag } from '../../src/engine/rng';
import type { RunState } from '../../src/engine/types/run';

/** 测试用基准状态：tier5 / 灵根 50 / 气运 20 */
export function newState(seed = 'power-test'): RunState {
  const rng = makeRngBag(seed);
  return createRun(
    seed,
    1,
    { tier: 5, value: 50, luck: 20, simPoints: 120, fates: [], guard: false },
    rng,
    { runId: seed, createdAt: 0, battlePolicy: 'manual' },
  );
}
