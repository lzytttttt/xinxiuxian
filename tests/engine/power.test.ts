import { describe, expect, it } from 'vitest';
import { BUNDLE } from '../../src/content/index';
import { POWER_PRODUCT_MAX, ZONE_CAPS } from '../../src/engine/constants';
import { bundle, defineArt } from '../../src/engine/registry';
import { basePowerOf, powerOf, softCap, zones } from '../../src/engine/selectors';
import type { ArtDef, ContentBundle } from '../../src/engine/types/effects';
import { newState } from './helpers';

const SCHOOLS_SEQ = ['剑修', '丹修', '体修', '毒修', '雷修', '魔修'] as const;

const heavyArt = (id: string, zone: 'z1' | 'z2' | 'z3' | 'z4' | 'z6', per: number, i = 0): ArtDef =>
  defineArt({
    id,
    name: id,
    school: SCHOOLS_SEQ[i % SCHOOLS_SEQ.length]!,
    quality: 1,
    passives: { [zone]: per },
    text: '',
  });

const HEAVY: ContentBundle = bundle({
  events: [],
  fates: [],
  arts: [
    heavyArt('a_z1', 'z1', 5, 0),
    heavyArt('a_z2', 'z2', 5, 1),
    heavyArt('a_z3', 'z3', 5, 2),
    heavyArt('a_z4', 'z4', 5, 3),
    heavyArt('a_z6', 'z6', 5, 4),
  ],
});

describe('六乘区（验收 3.3）', () => {
  it('软封顶：25 以下恒等，以上对数压缩，硬上限 40', () => {
    expect(softCap(1)).toBe(1);
    expect(softCap(18.2)).toBe(18.2);
    expect(softCap(25)).toBe(25);
    expect(softCap(40)).toBeCloseTo(25 * (1 + Math.log(40 / 25) * 0.5), 10);
    expect(softCap(53.7)).toBeCloseTo(34.56, 1);
    expect(softCap(200)).toBe(POWER_PRODUCT_MAX);
    expect(softCap(1e9)).toBe(POWER_PRODUCT_MAX);
  });

  it('满乘区乘积 ≤ 40（各区硬上限生效）', () => {
    const s = newState();
    s.cultivation = 1e6;
    s.artifactPower = 1e9;
    s.luck = 5000;
    for (const art of HEAVY.arts ?? []) s.arts[art.id] = { level: 10, insight: 0 };
    s.slots = [...(HEAVY.arts ?? []).map((a) => a.id), null];
    const z = zones(s, HEAVY);
    // 五个乘区各自触顶；Z4 无共鸣（流派各异），等于硬上限
    expect(z.z1.mult).toBeCloseTo(ZONE_CAPS.z1, 10);
    expect(z.z2.mult).toBeCloseTo(ZONE_CAPS.z2, 10);
    expect(z.z3.mult).toBeCloseTo(ZONE_CAPS.z3, 10);
    expect(z.z4.mult).toBeCloseTo(ZONE_CAPS.z4, 10);
    expect(z.z6.mult).toBeCloseTo(ZONE_CAPS.z6, 10);
    expect(z.resonance.mult).toBe(1);
    expect(z.z1.atCap && z.z4.atCap).toBe(true);
    expect(z.softCapped).toBeLessThanOrEqual(POWER_PRODUCT_MAX + 1e-9);
    expect(z.softCapped).toBeLessThan(z.rawProduct);
    expect(z.capApplied).toBe(true);
  });

  it('区内加法、区间乘法', () => {
    const s = newState();
    // 流派各异 → 无共鸣，隔离出「区内加法」本身
    const c = bundle({
      events: [],
      fates: [],
      arts: [heavyArt('b1', 'z4', 0.1, 0), heavyArt('b2', 'z4', 0.1, 1)],
    });
    s.arts['b1'] = { level: 1, insight: 0 };
    s.arts['b2'] = { level: 1, insight: 0 };
    s.slots = ['b1', 'b2', null, null, null, null];
    const z = zones(s, c);
    // 区内加法：1 + 0.1 + 0.1 = 1.2，而非 1.1 × 1.1 = 1.21
    expect(z.z4.mult).toBeCloseTo(1.2, 10);
    expect(z.rawProduct).toBeCloseTo(
      z.z1.mult * z.z2.mult * z.z3.mult * z.z4.mult * z.z5.mult * z.z6.mult,
      10,
    );
    expect(z.finalPower).toBeCloseTo(z.base * softCap(z.rawProduct), 6);
  });

  it('基础战力保持 G1 红线公式', () => {
    const s = newState();
    s.cultivation = 12345;
    s.root = 66;
    s.artifactPower = 777;
    s.artifactBonus = 130;
    expect(basePowerOf(s)).toBeCloseTo(12345 * (1 + 66 / 500) + 777 * (130 / 100), 10);
    expect(powerOf(s, BUNDLE)).toBeGreaterThanOrEqual(basePowerOf(s));
  });
});
