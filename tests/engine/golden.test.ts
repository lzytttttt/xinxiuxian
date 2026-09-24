import { describe, expect, it } from 'vitest';
import { BUNDLE } from '../../src/content/index';
import { goldenSnapshot } from '../../tools/simlib';
import baseline from '../fixtures/golden.json';

describe('黄金回归（Phase 1 出口条件 1.1）', () => {
  it('50 种子 × 200 年：等级/修为/命格/法宝数/事件序列与基线精确一致', () => {
    const current = goldenSnapshot(BUNDLE, 50, 200);
    expect(current).toEqual(baseline);
  });
});
