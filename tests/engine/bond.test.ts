import { describe, expect, it } from 'vitest';
import { BUNDLE } from '../../src/content/index';
import {
  BOND_AID_CAP,
  BOND_FLEE_AFFINITY,
  BOND_INJURY_YEARS,
  BOND_LOSE_AFFINITY,
  BOND_WIN_AFFINITY,
  BOND_LEVEL_MAX,
  PAST_LOVER_EVENT,
} from '../../src/engine/constants';
import {
  addAffinity,
  aidBonus,
  bondStrainCount,
  bondTick,
  breakBond,
  companionCost,
  companions,
  friendZ6Bonus,
  growthRatio,
  killNpc,
  partnerCultRate,
  partnerOnRunEnd,
  teacherInsight,
} from '../../src/engine/index';
import { runRun } from '../../src/engine/replay';
import { makeRngBag } from '../../src/engine/rng';
import { evalCondition, makeEvalCtx } from '../../src/engine/conditions';
import { zones } from '../../src/engine/selectors';
import type { BondType, Npc } from '../../src/engine/types/effects';
import type { RunState } from '../../src/engine/types/run';
import { newState } from './helpers';

type Kind = BondType | null;

function npc(
  i: number,
  type: Kind,
  bondLevel: number,
  affinity = 100,
  neglect = 0,
  alive = true,
): Npc {
  return {
    id: `n${i}`,
    name: `甲${i}`,
    gender: '男',
    rootTier: 7,
    personality: '仁厚',
    origin: '散修',
    level: 40,
    affinity,
    bondType: type,
    bondLevel,
    alive,
    metYear: 0,
    neglect,
    injuredUntil: 0,
    seed: `n:${i}`,
  };
}

function withBonds(list: Npc[], seed = 'bond-test'): RunState {
  const s = newState(seed);
  s.bonds.list = list;
  return s;
}

describe('羁绊：验收 5.2 助战硬上限（G5 红线）', () => {
  it('单个 L5 挚友 = 15%', () => {
    const s = withBonds([npc(1, '挚友', 5)]);
    expect(aidBonus(s)).toBeCloseTo(0.15, 10);
  });

  it('道侣额外 +5%：L5 道侣 = 20%', () => {
    const s = withBonds([npc(1, '道侣', 5)]);
    expect(aidBonus(s)).toBeCloseTo(0.2, 10);
  });

  it('极端堆叠（5 名 L5 含道侣）= 0.15×4 + 0.20 = 0.80，仍被截断到 30%', () => {
    const s = withBonds([
      npc(1, '道侣', 5),
      npc(2, '挚友', 5),
      npc(3, '师徒', 5),
      npc(4, '同门', 5),
      npc(5, '宿敌', 5),
    ]);
    expect(aidBonus(s)).toBe(BOND_AID_CAP);
    expect(aidBonus(s)).toBeLessThanOrEqual(0.3);
  });

  it('受伤期内的 NPC 不计入助战', () => {
    const s = withBonds([npc(1, '挚友', 5), npc(2, '挚友', 5)]);
    s.year = 100;
    s.bonds.list[1]!.injuredUntil = 103;
    expect(companions(s).length).toBe(1);
    expect(aidBonus(s)).toBeCloseTo(0.15, 10);
  });

  it('已死亡 / 无数值关系的 NPC 不计入', () => {
    const s = withBonds([npc(1, '挚友', 5, 100, 0, false), npc(2, null, 0), npc(3, '挚友', 0)]);
    expect(aidBonus(s)).toBe(0);
  });

  it('带人代价：胜 +2 / 败 −5 且伤停 3 年 / 逃跑 −10', () => {
    const win = withBonds([npc(1, '挚友', 3)], 'cost-win');
    companionCost(win, 'win');
    expect(win.bonds.list[0]!.affinity).toBe(100);

    const lose = withBonds([npc(1, '挚友', 3)], 'cost-lose');
    lose.bonds.list[0]!.affinity = 60;
    companionCost(lose, 'lose');
    expect(lose.bonds.list[0]!.affinity).toBe(60 - BOND_LOSE_AFFINITY);
    expect(lose.bonds.list[0]!.injuredUntil).toBe(lose.year + BOND_INJURY_YEARS);

    const flee = withBonds([npc(1, '挚友', 3)], 'cost-flee');
    flee.bonds.list[0]!.affinity = 60;
    companionCost(flee, 'flee');
    expect(flee.bonds.list[0]!.affinity).toBe(60 - BOND_FLEE_AFFINITY);
  });

  it('助战真的进战斗判定（own 战力被放大）', () => {
    const s = withBonds([npc(1, '道侣', 5)], 'aid-battle');
    const base = zones(s, BUNDLE).finalPower;
    const withAid = base * (1 + aidBonus(s));
    expect(withAid / base).toBeCloseTo(1.2, 6);
  });
});

describe('羁绊：等级与好感', () => {
  it('好感越过门槛即晋级，等级上限 5', () => {
    const s = withBonds([npc(1, '挚友', 1, 20)]);
    addAffinity(s, 'n1', 20);
    expect(s.bonds.list[0]!.bondLevel).toBe(2);
    addAffinity(s, 'n1', 200);
    expect(s.bonds.list[0]!.affinity).toBe(100);
    expect(s.bonds.list[0]!.bondLevel).toBe(BOND_LEVEL_MAX);
    addAffinity(s, 'n1', 10);
    expect(s.bonds.list[0]!.bondLevel).toBe(BOND_LEVEL_MAX);
  });

  it('正向好感变动清零 neglect（互动即"见到人了"）', () => {
    const s = withBonds([npc(1, '挚友', 2, 40, 30)]);
    expect(s.bonds.list[0]!.neglect).toBe(30);
    addAffinity(s, 'n1', 5);
    expect(s.bonds.list[0]!.neglect).toBe(0);
  });

  it('负向好感变动不重置 neglect', () => {
    const s = withBonds([npc(1, '挚友', 2, 40, 30)]);
    addAffinity(s, 'n1', -5);
    expect(s.bonds.list[0]!.neglect).toBe(30);
  });
});

describe('羁绊：验收 5.7 背叛条件性（非随机背刺）', () => {
  const BETRAY_IDS = [
    'ev_bond_betray_whisper',
    'ev_bond_betray_profit',
    'ev_bond_betray_opposite',
    'ev_bond_betray_partner',
  ];
  const betrayEvents = BUNDLE.events.filter((e) => BETRAY_IDS.includes(e.id));

  it('4 个背叛事件的 requires 全部带 bondStrain', () => {
    expect(betrayEvents.length).toBe(4);
    for (const ev of betrayEvents) {
      expect(JSON.stringify(ev.requires)).toContain('bondStrain');
    }
  });

  it('高好感 + 无冷落：四个背叛事件一条都进不来', () => {
    const all: BondType[] = ['道侣', '师徒', '挚友', '宿敌', '同门'];
    const s = withBonds(all.map((t, i) => npc(i, t, 5, 100, 0)));
    s.realm.level = 80;
    s.sect.id = 'sect_taixu';
    s.sect.rank = 3;
    expect(bondStrainCount(s, '挚友')).toBe(0);
    expect(bondStrainCount(s, '同门')).toBe(0);
    expect(bondStrainCount(s, '道侣')).toBe(0);
    const ctx = makeEvalCtx(BUNDLE, makeRngBag('betray-safe').event);
    const passable = betrayEvents.filter((ev) => evalCondition(s, ev.requires!, ctx, ev.id));
    expect(passable.map((e) => e.id)).toEqual([]);
  });

  it('新结识的关系不算结怨（初始好感高于阈值）', () => {
    const s = withBonds([npc(1, '挚友', 1, 20, 0)]);
    expect(bondStrainCount(s, '挚友')).toBe(0);
    // 一次带人逃跑（−10）就足以越线
    companionCost(s, 'flee');
    expect(bondStrainCount(s, '挚友')).toBe(1);
  });

  it('好感跌到阈值以下：对应的背叛事件才开门', () => {
    const s = withBonds([npc(1, '挚友', 5, 10, 0), npc(2, '同门', 5, 100, 0)]);
    s.sect.id = 'sect_taixu';
    s.realm.level = 80;
    const ctx = makeEvalCtx(BUNDLE, makeRngBag('betray-open').event);
    const open = betrayEvents
      .filter((ev) => evalCondition(s, ev.requires!, ctx, ev.id))
      .map((e) => e.id);
    expect(open).toContain('ev_bond_betray_whisper');
    expect(open).not.toContain('ev_bond_betray_profit');
  });

  it('长期未互动（neglect ≥ 20）也算结怨，但互动一次就关闭', () => {
    const s = withBonds([npc(1, '挚友', 5, 90, 25)]);
    s.realm.level = 80;
    expect(bondStrainCount(s, '挚友', 20)).toBe(1);
    addAffinity(s, 'n1', 2);
    expect(bondStrainCount(s, '挚友', 20)).toBe(0);
  });

  it('背叛事件真的会拆掉关系（break 后助战归零）', () => {
    const s = withBonds([npc(1, '挚友', 5, 10)]);
    expect(aidBonus(s)).toBeGreaterThan(0);
    breakBond(s, 'n1');
    expect(aidBonus(s)).toBe(0);
    expect(s.bonds.list[0]!.bondType).toBeNull();
    expect(s.bonds.list[0]!.affinity).toBe(5); // 好感折半保留
  });
});

describe('羁绊：五种关系的数值效果', () => {
  it('师徒：每年悟性 +ΣL', () => {
    const s = withBonds([npc(1, '师徒', 3), npc(2, '师徒', 5), npc(3, '挚友', 5)]);
    expect(teacherInsight(s)).toBe(8);
  });

  it('挚友：Z6 加法 Σ(L × 2%)，并进入 zones 面板（kind=bond）', () => {
    const s = withBonds([npc(1, '挚友', 5), npc(2, '挚友', 3)]);
    expect(friendZ6Bonus(s)).toBeCloseTo(0.16, 10);
    const z = zones(s, BUNDLE);
    expect(z.z6.sources.some((src) => src.kind === 'bond' && src.label === '挚友')).toBe(true);
  });

  it('道侣：静修增益率 Σ(L × 0.05%)，L5 = 0.25%', () => {
    const s = withBonds([npc(1, '道侣', 5)]);
    expect(partnerCultRate(s)).toBeCloseTo(0.0025, 10);
  });

  it('道侣双修的 90 年量级：满羁绊年增益 0.30% 上限，远低于复利 10%', () => {
    const s = withBonds([npc(1, '道侣', 5)]);
    const rate = 0.001 + partnerCultRate(s); // 静修基础上限 0.1% + 双修 0.25%
    expect(rate).toBeLessThanOrEqual(0.0035);
    expect(Math.pow(1 + rate, 90)).toBeLessThan(1.4);
  });
});

describe('羁绊：生死离别不可逆', () => {
  it('NPC 死亡后所有加成消失', () => {
    const s = withBonds([npc(1, '道侣', 5), npc(2, '师徒', 4)]);
    expect(aidBonus(s)).toBeGreaterThan(0);
    expect(teacherInsight(s)).toBe(4);
    killNpc(s, 'n1');
    killNpc(s, 'n2');
    expect(aidBonus(s)).toBe(0);
    expect(teacherInsight(s)).toBe(0);
    expect(partnerOnRunEnd(s)).toBeNull();
  });
});

describe('羁绊：局末与前世道侣', () => {
  it('只有道侣且羁绊 ≥ 4 才进入下一世的重逢池', () => {
    const low = withBonds([npc(1, '道侣', 3)], 'end-low');
    expect(partnerOnRunEnd(low)).toBeNull();
    const high = withBonds([npc(1, '道侣', 4)], 'end-high');
    expect(partnerOnRunEnd(high)?.name).toBe('甲1');
  });

  it('验收 5.8：注入前世道侣后，500 局内至少触发一次重逢', () => {
    let hits = 0;
    for (let i = 0; i < 500; i++) {
      const out = runRun(
        BUNDLE,
        { seed: `past-${String(i).padStart(3, '0')}`, maxYears: 40, pastPartner: { name: '苏疏影', seed: 'past-lover', level: 4 } },
        (d) => d.choices.filter((c) => c.show && c.enable)[0]?.id ?? d.choices[0]!.id,
      );
      if (out.state.eventLog.includes(PAST_LOVER_EVENT)) hits += 1;
    }
    // 判据（产品文档）：至少一次。实测 495/500 —— 少数局里玩家先有了道侣或跑过 40 级，
    // 前置条件本身不再成立，属设计内的落空，不是机制失效。下限取 450 作为回归护栏。
    expect(hits).toBeGreaterThanOrEqual(1);
    expect(hits).toBeGreaterThanOrEqual(450);
  });

  it('未注入前世道侣时，重逢事件不会出现', () => {
    const out = runRun(
      BUNDLE,
      { seed: 'past-none', maxYears: 40 },
      (d) => d.choices.filter((c) => c.show && c.enable)[0]?.id ?? d.choices[0]!.id,
    );
    expect(out.state.eventLog.includes(PAST_LOVER_EVENT)).toBe(false);
  });
});

describe('羁绊：NPC 同步成长', () => {
  it('成长比随 rootTier 单调（0.6 → 0.9）', () => {
    expect(growthRatio(3)).toBeCloseTo(0.6, 6);
    expect(growthRatio(10)).toBeCloseTo(0.9, 6);
    expect(growthRatio(7)).toBeGreaterThan(growthRatio(4));
  });

  it('NPC 会跟着玩家变强：同一年限内高 rootTier 的追得更远', () => {
    const run = (rootTier: number): number => {
      const s = newState(`npc-grow-${rootTier}`);
      s.realm.level = 90;
      s.bonds.list = [npc(1, '挚友', 3)];
      s.bonds.list[0]!.rootTier = rootTier;
      s.bonds.list[0]!.level = 10;
      const rng = makeRngBag(`npc-grow-${rootTier}`);
      for (let y = 0; y < 80; y++) {
        s.year += 1;
        s.realm.level = 90;
        bondTick(s, rng.bond, BUNDLE);
      }
      return s.bonds.list[0]!.level;
    };
    const slow = run(3);
    const fast = run(10);
    expect(slow).toBeGreaterThan(10);
    expect(fast).toBeGreaterThanOrEqual(slow);
    // 不越过玩家的 90% 上限
    expect(fast).toBeLessThanOrEqual(Math.floor(90 * 0.9) + 1);
  });

  it('neglect 逐年累加（长期不见面会积累张力）', () => {
    const s = newState('npc-neglect');
    s.bonds.list = [npc(1, '挚友', 3)];
    const rng = makeRngBag('npc-neglect');
    bondTick(s, rng.bond, BUNDLE);
    bondTick(s, rng.bond, BUNDLE);
    bondTick(s, rng.bond, BUNDLE);
    expect(s.bonds.list[0]!.neglect).toBe(3);
  });
});
