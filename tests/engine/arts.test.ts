import { describe, expect, it } from 'vitest';
import { BUNDLE } from '../../src/content/index';
import { STARTER_ART_IDS } from '../../src/content/arts/index';
import {
  equipArt,
  grantArt,
  hasSynergy,
  insightCost,
  luckyTribMult,
  resonanceOf,
  schoolCounts,
  slotCount,
  slotCountOf,
  swordNarrow,
  synergiesOf,
  thunderBreakMult,
  toxicityGain,
  unequipArt,
  upgradeArt,
  type SynergyId,
} from '../../src/engine/arts';
import type { RunState } from '../../src/engine/types/run';
import { newState } from './helpers';

const SLOTS6 = (s: RunState, ids: string[]): void => {
  s.slots = [...ids, ...Array.from({ length: 6 - ids.length }, () => null)];
  for (const id of ids) s.arts[id] = { level: 1, insight: 0 };
};

describe('功法系统与悟性经济（验收 3.5 配套）', () => {
  it('升级成本曲线：L2 起 3/4/5/7/10/13/18/25/33，满级累计 118', () => {
    expect(Array.from({ length: 9 }, (_, i) => insightCost(i + 2))).toEqual([3, 4, 5, 7, 10, 13, 18, 25, 33]);
    expect(insightCost(1)).toBe(0);
    expect(insightCost(11)).toBe(Math.round(3 * Math.pow(1.35, 9)));
  });

  it('槽位解锁：初始 3；悟道室 L2/L4 各 +1；道台 +1（上限 6）', () => {
    expect(slotCountOf(0, false)).toBe(3);
    expect(slotCountOf(2, false)).toBe(4);
    expect(slotCountOf(4, false)).toBe(5);
    expect(slotCountOf(4, true)).toBe(6);
    expect(slotCountOf(9, true)).toBe(6);
    const s = newState('slots');
    expect(slotCount(s)).toBe(3);
    s.flags['dao_seat'] = 1;
    expect(slotCount(s)).toBe(4);
  });

  it('装备/卸下/升级：不可重复装备，悟性不足则失败，槽满则失败', () => {
    const s = newState('equip');
    expect(equipArt(s, 'art_jian_yi', BUNDLE)).toBe(false); // 未持有
    grantArt(s, 'art_jian_yi', BUNDLE);
    expect(equipArt(s, 'art_jian_yi', BUNDLE)).toBe(true);
    expect(equipArt(s, 'art_jian_yi', BUNDLE)).toBe(false);
    expect(unequipArt(s, 'art_jian_yi')).toBe(true);
    expect(unequipArt(s, 'art_jian_yi')).toBe(false);

    s.arts['art_jian_yi'] = { level: 9, insight: 0 };
    expect(upgradeArt(s, 'art_jian_yi', BUNDLE)).toBe(false); // 9 → 10 需 33
    s.insight = 33;
    expect(upgradeArt(s, 'art_jian_yi', BUNDLE)).toBe(true);
    expect(s.arts['art_jian_yi']!.level).toBe(10);
    expect(s.insight).toBe(0);
    expect(upgradeArt(s, 'art_jian_yi', BUNDLE)).toBe(false); // 已满级

    for (const id of ['art_jian_xin', 'art_qing_feng', 'art_wan_jian']) {
      grantArt(s, id, BUNDLE);
      expect(equipArt(s, id, BUNDLE)).toBe(true);
    }
    grantArt(s, 'art_zhan_tian', BUNDLE);
    expect(equipArt(s, 'art_zhan_tian', BUNDLE)).toBe(false); // 槽位已满（3）
  });

  it('开局三选一池：六流派各一门，均可解析', () => {
    const ids = new Set((BUNDLE.arts ?? []).map((a) => a.id));
    expect(STARTER_ART_IDS.length).toBe(6);
    const schools = new Set(
      STARTER_ART_IDS.map((id) => (BUNDLE.arts ?? []).find((a) => a.id === id)?.school),
    );
    expect(schools.size).toBe(6);
    for (const id of STARTER_ART_IDS) expect(ids.has(id)).toBe(true);
  });

  it('流派统计只计已装备', () => {
    const s = newState('school-count');
    grantArt(s, 'art_jian_yi', BUNDLE);
    grantArt(s, 'art_jian_xin', BUNDLE);
    expect(schoolCounts(s, BUNDLE)['剑修']).toBe(0);
    equipArt(s, 'art_jian_yi', BUNDLE);
    expect(schoolCounts(s, BUNDLE)['剑修']).toBe(1);
  });
});

describe('流派共鸣（六模式与优先级）', () => {
  it('一重 / 二重 / 极意', () => {
    const s = newState('reso');
    SLOTS6(s, ['art_jian_yi', 'art_jian_xin']);
    expect(resonanceOf(s, BUNDLE).name).toBe('共鸣·一重');
    SLOTS6(s, ['art_jian_yi', 'art_jian_xin', 'art_qing_feng', 'art_wan_jian']);
    expect(resonanceOf(s, BUNDLE).name).toBe('共鸣·二重');
    SLOTS6(s, [
      'art_jian_yi',
      'art_jian_xin',
      'art_qing_feng',
      'art_wan_jian',
      'art_zhan_tian',
      'art_wu_wo_jian',
    ]);
    expect(resonanceOf(s, BUNDLE).name).toBe('共鸣·极意');
    expect(resonanceOf(s, BUNDLE).mult).toBeCloseTo(1.6, 10);
  });

  it('万法归一（三流派各 2）与 阴阳互济（两流派各 3）', () => {
    const s = newState('reso-mixed');
    SLOTS6(s, ['art_jian_yi', 'art_jian_xin', 'art_dan_ding', 'art_qing_nang', 'art_tie_gu', 'art_long_xiang']);
    expect(resonanceOf(s, BUNDLE).name).toBe('万法归一');
    SLOTS6(s, ['art_jian_yi', 'art_jian_xin', 'art_qing_feng', 'art_dan_ding', 'art_qing_nang', 'art_bai_cao']);
    expect(resonanceOf(s, BUNDLE).name).toBe('阴阳互济');
    SLOTS6(s, []);
    expect(resonanceOf(s, BUNDLE).name).toBe('散修');
  });
});

describe('六条协同（触发条件）', () => {
  const active = (s: RunState): Record<SynergyId, boolean> => synergiesOf(s, BUNDLE);

  it('剑心通明：剑修 4 门 + 气运 ≥80；收窄硬上限 50%', () => {
    const s = newState('syn-sword');
    SLOTS6(s, ['art_jian_yi', 'art_jian_xin', 'art_qing_feng', 'art_wan_jian']);
    s.luck = 40;
    expect(active(s).swordHeart).toBe(false);
    s.luck = 80;
    expect(active(s).swordHeart).toBe(true);
    expect(swordNarrow(s, BUNDLE)).toBeCloseTo(0.45, 10);
    s.luck = 100000;
    expect(swordNarrow(s, BUNDLE)).toBeLessThanOrEqual(0.5);
    expect(swordNarrow(s, BUNDLE)).toBe(0.5);
  });

  it('毒体：毒修 4 门（丹毒 >50 才给 Z5 来源，见 breakdown 测试）', () => {
    const s = newState('syn-poison');
    SLOTS6(s, ['art_wan_du', 'art_bai_du', 'art_hua_du', 'art_shi_gu']);
    expect(active(s).poisonBody).toBe(true);
  });

  it('丹火不侵：丹修 3 + 体修 3（丹毒获取 ×0.5）', () => {
    const s = newState('syn-fire');
    SLOTS6(s, ['art_dan_ding', 'art_qing_nang', 'art_bai_cao', 'art_tie_gu', 'art_long_xiang', 'art_bu_huai']);
    expect(active(s).fireImmunity).toBe(true);
    expect(toxicityGain(s, BUNDLE, 10)).toBe(5);
    const s2 = newState('syn-fire-2');
    expect(toxicityGain(s2, BUNDLE, 10)).toBe(10);
  });

  it('炼宝诀：体修 4 门 + 法宝之力 > 修为 × 0.5', () => {
    const s = newState('syn-treasure');
    SLOTS6(s, ['art_tie_gu', 'art_long_xiang', 'art_bu_huai', 'art_lian_ti_zhen']);
    s.cultivation = 1000;
    s.artifactPower = 400;
    expect(active(s).treasureArt).toBe(false);
    s.artifactPower = 600;
    expect(active(s).treasureArt).toBe(true);
  });

  it('雷罚加身：雷修 4 门（侥幸 ×1.5 + 突破概率随雷修数提升）', () => {
    const s = newState('syn-thunder');
    expect(luckyTribMult(s, BUNDLE)).toBe(1);
    SLOTS6(s, ['art_wu_lei', 'art_zi_xiao', 'art_lei_dun', 'art_lei_ting']);
    expect(active(s).thunderBody).toBe(true);
    expect(luckyTribMult(s, BUNDLE)).toBeCloseTo(1.5, 10);
    const s2 = newState('syn-thunder-2');
    SLOTS6(s2, ['art_wu_lei', 'art_zi_xiao']);
    expect(thunderBreakMult(s2, BUNDLE)).toBeCloseTo(1.04, 10);
  });

  it('掠夺：魔修 4 门', () => {
    const s = newState('syn-plunder');
    SLOTS6(s, ['art_xue_mo', 'art_shi_hun', 'art_mo_yan', 'art_duo_ling']);
    expect(active(s).plunder).toBe(true);
    expect(hasSynergy(s, BUNDLE, 'plunder')).toBe(true);
  });
});
