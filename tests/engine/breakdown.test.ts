import { describe, expect, it } from 'vitest';
import { BUNDLE } from '../../src/content/index';
import { equipArt, grantArt, insightCost, upgradeArt } from '../../src/engine/arts';
import { makeRngBag } from '../../src/engine/rng';
import { basePowerOf, softCap, powerOf, zones, type ZoneBreakdown, type ZoneDetail } from '../../src/engine/selectors';
import { newState } from './helpers';

function assertHonest(z: ZoneDetail, label: string): void {
  const sum = 1 + z.sources.reduce((a, src) => a + src.delta, 0);
  expect(Math.abs(sum - z.mult), `${label} 逐项之和 ${sum} != mult ${z.mult}`).toBeLessThan(1e-9);
}

function assertBreakdown(z: ZoneBreakdown): void {
  assertHonest(z.z1, 'Z1');
  assertHonest(z.z2, 'Z2');
  assertHonest(z.z3, 'Z3');
  assertHonest(z.z4, 'Z4');
  assertHonest(z.z5, 'Z5');
  assertHonest(z.z6, 'Z6');
  expect(z.rawProduct).toBeCloseTo(
    z.z1.mult * z.z2.mult * z.z3.mult * z.z4.mult * z.z5.mult * z.z6.mult,
    10,
  );
  expect(z.softCapped).toBeCloseTo(softCap(z.rawProduct), 10);
  expect(z.finalPower).toBeCloseTo(z.base * z.softCapped, 6);
}

describe('面板诚实（验收 3.4）：1 + Σ 逐项 Δ 精确等于乘区倍率', () => {
  it('空构筑（仅命格/气运/法宝）', () => {
    const s = newState('breakdown-empty');
    s.luck = 137;
    s.fates = [
      { id: 'f1', name: '灵根', attr: 'root', color: 'blue', value: 5, text: '' },
      { id: 'f2', name: '气运', attr: 'luck', color: 'purple', value: 6, text: '' },
    ];
    assertBreakdown(zones(s, BUNDLE));
  });

  it('装备多门功法 + 道台槽位 + 丹毒', () => {
    const s = newState('breakdown-armed');
    s.flags['dao_seat'] = 1;
    for (const id of ['art_jian_yi', 'art_tian_lei', 'art_rou_shen', 'art_wu_wo_jian']) {
      grantArt(s, id, BUNDLE);
      expect(equipArt(s, id, BUNDLE)).toBe(true);
    }
    for (const id of ['art_jian_yi', 'art_tian_lei']) {
      s.insight = 999;
      for (let i = 0; i < 4; i++) expect(upgradeArt(s, id, BUNDLE)).toBe(true);
    }
    s.toxicity = 80;
    s.artifactPower = 250000;
    s.luck = 400;
    assertBreakdown(zones(s, BUNDLE));
  });

  it('乘区触顶（硬上限截断来源可见）与软封顶触发', () => {
    const s = newState('breakdown-capped');
    s.cultivation = 1e7;
    s.artifactPower = 1e9;
    s.luck = 9000;
    s.flags['dao_seat'] = 1;
    for (const id of ['art_wu_wo_jian', 'art_da_dao_dan', 'art_rou_shen', 'art_wan_mo']) {
      grantArt(s, id, BUNDLE);
      equipArt(s, id, BUNDLE);
      s.arts[id]!.level = 10;
    }
    const z = zones(s, BUNDLE);
    assertBreakdown(z);
    expect(z.rawProduct).toBeGreaterThan(25);
    expect(z.capApplied).toBe(true);
    const details = [z.z1, z.z2, z.z3, z.z4, z.z5, z.z6];
    expect(details.some((d) => d.sources.some((src) => src.kind === 'cap'))).toBe(true);
    expect(details.some((d) => d.atCap)).toBe(true);
  });

  it('共鸣与协同以独立来源行计入', () => {
    const s = newState('breakdown-resonance');
    // 四门剑修 → 共鸣·二重（Z4 区后乘子）
    for (const id of ['art_jian_yi', 'art_jian_xin', 'art_qing_feng', 'art_wan_jian']) {
      grantArt(s, id, BUNDLE);
      s.arts[id]!.level = 5;
      s.insight = 999;
    }
    s.flags['dao_seat'] = 1;
    for (const id of ['art_jian_yi', 'art_jian_xin', 'art_qing_feng', 'art_wan_jian']) {
      equipArt(s, id, BUNDLE);
    }
    const z = zones(s, BUNDLE);
    expect(z.resonance.name).toBe('共鸣·二重');
    const artSum = z.z4.sources.filter((x) => x.kind === 'art').reduce((a, b) => a + b.delta, 0);
    expect(z.z4.mult).toBeCloseTo(Math.min(2.5, 1 + artSum) * 1.35, 6);
    assertBreakdown(z);
  });

  it('悟性成本表与累计（L2..L10）', () => {
    const costs = Array.from({ length: 9 }, (_, i) => insightCost(i + 2));
    expect(costs).toEqual([3, 4, 5, 7, 10, 13, 18, 25, 33]);
    expect(costs.reduce((a, b) => a + b, 0)).toBe(118);
    expect(insightCost(1)).toBe(0);
  });

  it('powerOf 与 breakdown 同步（不同状态抽样）', () => {
    for (const seed of ['bd-1', 'bd-2', 'bd-3']) {
      const s = newState(seed);
      grantArt(s, 'art_xue_mo', BUNDLE);
      equipArt(s, 'art_xue_mo', BUNDLE);
      s.insight = 200;
      upgradeArt(s, 'art_xue_mo', BUNDLE);
      const z = zones(s, BUNDLE);
      expect(powerOf(s, BUNDLE)).toBeCloseTo(z.finalPower, 6);
      expect(z.base).toBeCloseTo(basePowerOf(s), 10);
    }
  });
});
