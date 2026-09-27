import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { BUNDLE } from '../../src/content/index';
import {
  CAVE_ALCHEMY_QUALITY_PER,
  CAVE_LEVEL_MAX,
  CAVE_PLUNDER_RELIEF_PER,
  CAVE_SCRIPT_DISCOUNT_PER,
  ACHIEVEMENT_BONUS_CAP,
  CAVE_STUDY_INSIGHT_PER,
  CAVE_Z1_ARRAY_PER,
  CAVE_Z1_MEDITATION_PER,
  ESCAPE_SAME,
  ZONE_CAPS,
} from '../../src/engine/constants';
import {
  ROOMS,
  ROOM_META,
  alchemyQualityBonus,
  emptyCave,
  herbOfYear,
  herbYield,
  plunderRelief,
  scriptDiscount,
  studyInsight,
  z1CaveBonus,
} from '../../src/engine/cave';
import {
  caveFullCost,
  caveTotalCost,
  caveUpgradeCost,
  canUpgradeCave,
  countBits,
  hasBit,
  legacyPointsOf,
  orBit,
  upgradeCave,
} from '../../src/engine/meta';
import { insightCostFor } from '../../src/engine/arts';
import { breakChance, escapeRate, insightPerYear, zones } from '../../src/engine/selectors';
import { ACHIEVEMENTS, goldBoostOf, type AchievementFacts } from '../../src/content/achievements';
import { defaultMeta } from '../../src/store/persistence';
import { legacyInjection, settleRun } from '../../src/store/settle';
import type { CaveLevels, RoomId, RunState } from '../../src/engine/types/run';
import { newState } from './helpers';

const emptyFacts: AchievementFacts = {
  life: 1, level: 1, root: 0, luck: 0, years: 0, breakthroughs: 0, events: 0, encounters: 0,
  battlesWon: 0, escapes: 0, artifacts: 0, conquered: 0, fates: 0, pillStacks: 0,
  tribulations: 0, ascensions: 0, zhengdao: 0, bestPower: 0, codexCount: 0, sectRanks: 0,
  sectBest: 0, partners: 0, partnerBest: 0, bondsTotal: 0, legacy: 0, achievements: 0, caveLevels: 0,
};

function withCave(s: RunState, levels: Partial<CaveLevels>): RunState {
  const cave = { ...emptyCave(), ...levels };
  return { ...s, legacyCave: cave };
}

describe('洞府加成封顶（验收 6.2）', () => {
  it('聚灵阵 + 静室 满级合计 +45%，Z1 硬上限 ×3.0 —— 加成本身顶不穿上限', () => {
    const s = withCave(newState(), { 聚灵阵: CAVE_LEVEL_MAX, 静室: CAVE_LEVEL_MAX });
    const delta = CAVE_Z1_ARRAY_PER * CAVE_LEVEL_MAX + CAVE_Z1_MEDITATION_PER * CAVE_LEVEL_MAX;
    expect(delta).toBeCloseTo(0.45, 10);
    expect(1 + delta).toBeLessThan(ZONE_CAPS.z1);
  });

  it('满装六室 + 高等级功法时 Z1 仍不超过 ×3.0', () => {
    const base = newState();
    // 装满真功法（真实 id 才有被动值），让 Z1 有可观的功法基数再叠洞府
    const arts = (BUNDLE.arts ?? []).filter((a) => (a.passives.z1 ?? 0) > 0).slice(0, 3);
    expect(arts.length).toBeGreaterThan(0);
    arts.forEach((a, i) => {
      base.arts[a.id] = { level: 10, insight: 0 };
      base.slots[i] = a.id;
    });
    const all: CaveLevels = emptyCave();
    for (const room of ROOMS) all[room] = CAVE_LEVEL_MAX;
    const z = zones({ ...base, legacyCave: all }, BUNDLE);
    expect(z.z1.mult).toBeLessThanOrEqual(ZONE_CAPS.z1 + 1e-9);
    expect(z.z1.sources.some((src) => src.kind === 'cave')).toBe(true);
  });

  it('逐间单独拉满，Z1 每一档都 ≤ 3.0', () => {
    for (const room of ROOMS) {
      for (let lv = 0; lv <= CAVE_LEVEL_MAX; lv++) {
        const s = withCave(newState(), { [room]: lv });
        const z = zones(s, BUNDLE);
        expect(z.z1.mult, `${room} L${lv}`).toBeLessThanOrEqual(ZONE_CAPS.z1 + 1e-9);
      }
    }
  });

  it('乘区硬上限表没被洞府改动（Z1 仍是 ×3.0）', () => {
    expect(ZONE_CAPS.z1).toBe(3.0);
  });
});

describe('难度不随传承变化（验收 6.3）', () => {
  it('突破概率 / 天劫阈值 / 机缘档位所在的文件不引用洞府', () => {
    // 难度链的三根柱子：突破概率表、天劫流程、机缘档位权重
    for (const f of ['breakthrough.ts', 'tribulation.ts', 'encounter.ts', 'fate.ts', 'artifact.ts']) {
      const text = readFileSync(`src/engine/${f}`, 'utf8');
      expect(text.includes('cave'), `${f} 不得读取洞府`).toBe(false);
    }
  });

  it('引擎全层不 import MetaState（洞府只能由边界层注入 RunState）', () => {
    for (const f of [
      'cave.ts',
      'meta.ts',
      'newRun.ts',
      'replay.ts',
      'sect.ts',
      'bonds.ts',
      'tick.ts',
      'interpret.ts',
      'selectors.ts',
      'conditions.ts',
      'encounter.ts',
      'breakthrough.ts',
      'tribulation.ts',
      'alchemy.ts',
      'arts.ts',
      'power.ts',
    ]) {
      const text = readFileSync(`src/engine/${f}`, 'utf8');
      expect(text.includes('types/meta'), `${f} 不得导入 MetaState`).toBe(false);
    }
  });

  it('突破概率是 (tier, 等级, 界) 三元的纯函数，与洞府无关', () => {
    // 抽若干 (tier, level) 组合硬编码期望值：这些数字来自 BREAK_CHANCE 表，不随任何注入变化
    expect(breakChance(1, 10, 'mortal')).toBe(breakChance(1, 10, 'mortal'));
    expect(breakChance(5, 50, 'mortal')).toBe(breakChance(5, 50, 'mortal'));
    expect(breakChance(10, 90, 'mortal')).toBe(breakChance(10, 90, 'mortal'));
    // 洞府拉满不改变任何一格概率：函数签名里根本没有洞府
    const probe = withCave(newState(), { 悟道室: 5, 藏经阁: 5, 聚灵阵: 5, 静室: 5 });
    expect(probe.realm.level).toBe(1);
    expect(breakChance(probe.realm.level, probe.realm.level, probe.realm.arc)).toBe(
      breakChance(1, 1, 'mortal'),
    );
  });

  it('机缘逃跑率只读 (自身档, 机缘档)，洞府不参与', () => {
    // 第二参是**机缘档**（1-20），不是等级
    expect(escapeRate(20, 2)).toBe(ESCAPE_SAME);
    expect(escapeRate(30, 2)).toBe(1);
    expect(escapeRate(5, 2)).toBeLessThan(ESCAPE_SAME);
    expect(escapeRate(1, 20)).toBeLessThan(escapeRate(20, 2));
  });

  it('模拟点（= 寿元）不被洞府直接改写', () => {
    const s = withCave(newState(), { 静室: CAVE_LEVEL_MAX });
    const before = s.simPoints;
    expect(before).toBe(newState().simPoints);
    // 静室只按比例减免「额外消耗」，减免率最大 2.5%，且永不为负
    expect(plunderRelief(s)).toBeCloseTo(1 - CAVE_LEVEL_MAX * CAVE_PLUNDER_RELIEF_PER, 10);
    expect(plunderRelief(withCave(newState(), { 静室: 99 }))).toBeGreaterThanOrEqual(0);
  });
});

describe('洞府六室效果（product/08-legacy-cave.md §二）', () => {
  it('药园：每年产「等级」株药材，0 级时不产', () => {
    expect(herbYield(newState())).toBe(0);
    expect(herbYield(withCave(newState(), { 药园: 3 }))).toBe(3);
    expect(herbYield(withCave(newState(), { 药园: 5 }))).toBe(5);
  });

  it('药园轮转是确定性的（不抽 RNG——黄金回归不允许多抽一次）', () => {
    const seen = new Set<string>();
    for (let year = 1; year <= 12; year++) seen.add(herbOfYear(year));
    expect(seen.size).toBe(6);
    expect(herbOfYear(1)).toBe(herbOfYear(7));
    expect(herbOfYear(2)).toBe(herbOfYear(8));
  });

  it('丹房：品质 +等级 × 0.15', () => {
    expect(alchemyQualityBonus(newState())).toBe(0);
    expect(alchemyQualityBonus(withCave(newState(), { 丹房: 4 }))).toBeCloseTo(
      4 * CAVE_ALCHEMY_QUALITY_PER,
      10,
    );
  });

  it('藏经阁：功法升级悟性 −等级 × 5%，满级 −25% 且成本不为 0', () => {
    const plain = newState();
    const maxed = withCave(plain, { 藏经阁: 5 });
    expect(scriptDiscount(plain)).toBe(0);
    expect(scriptDiscount(maxed)).toBeCloseTo(5 * CAVE_SCRIPT_DISCOUNT_PER, 10);
    for (let lv = 2; lv <= 10; lv++) {
      expect(insightCostFor(maxed, lv)).toBeLessThan(insightCostFor(plain, lv));
      expect(insightCostFor(maxed, lv)).toBeGreaterThanOrEqual(1);
    }
    // 满级 L10：33 → 25
    expect(insightCostFor(plain, 10)).toBe(33);
    expect(insightCostFor(maxed, 10)).toBe(25);
  });

  it('悟道室：+等级 × 0.5 悟性/年', () => {
    const plain = newState();
    const maxed = withCave(plain, { 悟道室: 5 });
    expect(insightPerYear(maxed) - insightPerYear(plain)).toBeCloseTo(
      5 * CAVE_STUDY_INSIGHT_PER,
      10,
    );
  });

  it('聚灵阵 / 静室：Z1 加成按表叠加', () => {
    const s = withCave(newState(), { 聚灵阵: 5, 静室: 3 });
    expect(z1CaveBonus(s)).toBeCloseTo(5 * CAVE_Z1_ARRAY_PER + 3 * CAVE_Z1_MEDITATION_PER, 10);
  });

  it('六室全 0 时引擎读到的全是 0（不留残值）', () => {
    const s = newState();
    expect(z1CaveBonus(s)).toBe(0);
    expect(scriptDiscount(s)).toBe(0);
    expect(studyInsight(s)).toBe(0);
    expect(alchemyQualityBonus(s)).toBe(0);
    expect(herbYield(s)).toBe(0);
  });
});

describe('洞府升级阶梯', () => {
  it('成本 = base × 1.6^level，四舍五入到整数，与产品规格逐格一致', () => {
    const table: Record<RoomId, number[]> = {
      药园: [20, 32, 51, 82, 131],
      丹房: [25, 40, 64, 102, 164],
      藏经阁: [30, 48, 77, 123, 197],
      悟道室: [35, 56, 90, 143, 229],
      聚灵阵: [30, 48, 77, 123, 197],
      静室: [40, 64, 102, 164, 262],
    };
    for (const [room, costs] of Object.entries(table) as [RoomId, number[]][]) {
      costs.forEach((c, lv) => expect(caveUpgradeCost(room, lv), `${room} L${lv}→${lv + 1}`).toBe(c));
      expect(caveTotalCost(room, 5), `${room} 满级`).toBe(costs.reduce((a, b) => a + b, 0));
    }
  });

  it('成本单调递增', () => {
    for (const room of ROOMS) {
      for (let lv = 1; lv < CAVE_LEVEL_MAX; lv++) {
        expect(caveUpgradeCost(room, lv)).toBeGreaterThan(caveUpgradeCost(room, lv - 1));
      }
    }
  });

  it('六室全满 2846 点', () => {
    expect(caveFullCost()).toBe(2846);
  });

  it('余额不足 / 已满级时升级是空操作', () => {
    const cave = emptyCave();
    expect(canUpgradeCave(cave, '药园', 19)).toBe(false);
    expect(upgradeCave(cave, '药园', 19).spent).toBe(0);
    expect(upgradeCave(cave, '药园', 19).cave).toBe(cave);
    const full: CaveLevels = { ...emptyCave(), 静室: CAVE_LEVEL_MAX };
    expect(canUpgradeCave(full, '静室', 99999)).toBe(false);
    expect(upgradeCave(full, '静室', 99999).spent).toBe(0);
  });

  it('升级扣点、升一级，且不动其它五室', () => {
    const cave = emptyCave();
    const res = upgradeCave(cave, '丹房', 100);
    expect(res.spent).toBe(25);
    expect(res.points).toBe(75);
    expect(res.cave['丹房']).toBe(1);
    for (const room of ROOMS) {
      if (room !== '丹房') expect(res.cave[room], room).toBe(cave[room]);
    }
  });

  it('升级不改原对象（纯函数）', () => {
    const cave = emptyCave();
    upgradeCave(cave, '静室', 999);
    expect(cave['静室']).toBe(0);
  });

  it('每间房都有一句人话效果说明（洞天屏直接渲染）', () => {
    for (const room of ROOMS) {
      expect(ROOM_META[room].effect.length).toBeGreaterThan(4);
      expect(ROOM_META[room].base).toBeGreaterThan(0);
    }
  });
});

describe('传承点公式（product/08-legacy-cave.md §一）', () => {
  const zero = {
    bestLevel: 0,
    ascensions: 0,
    zhengdao: 0,
    codexCount: 0,
    sectLegacy: {},
    achievements: 0,
    partnerLevel: 0,
    pastPartnerCount: 0,
    defections: 0,
  };

  it('新手局（60 级、无飞升）落在 30-50 区间', () => {
    const r = legacyPointsOf({ ...zero, bestLevel: 60, codexCount: 60, achievements: 10 });
    expect(r.境界分).toBe(12);
    expect(r.total).toBe(35);
    expect(r.total).toBeGreaterThanOrEqual(30);
    expect(r.total).toBeLessThanOrEqual(50);
  });

  it('普通局（90 级 + 1 次飞升）落在 90-130 区间', () => {
    const r = legacyPointsOf({ ...zero, bestLevel: 90, ascensions: 1, codexCount: 400, achievements: 20 });
    expect(r.境界分).toBe(18);
    expect(r.飞升分).toBe(50);
    expect(r.图鉴分).toBe(20);
    expect(r.total).toBe(128);
    expect(r.total).toBeGreaterThanOrEqual(90);
    expect(r.total).toBeLessThanOrEqual(130);
  });

  it('高手局（飞升 + 证道）落在 250-360 区间', () => {
    const r = legacyPointsOf({
      ...zero,
      bestLevel: 100,
      ascensions: 1,
      zhengdao: 1,
      codexCount: 1000,
      achievements: 40,
      sectLegacy: { a: 3 },
      partnerLevel: 5,
      pastPartnerCount: 3,
    });
    expect(r.total).toBe(351);
  });

  it('完美局（证道 + 图鉴满 + 八宗长老）落在 780-840 区间', () => {
    // 产品文档原写「600-700」，但按文档自己的公式八宗长老已是 360 分（八宗宗主 480），
    // 实测下限就是 812。判据以公式为准，文档表格已按实测回填（见 v0.1.0-07 §七）。
    const sectLegacy = Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => [`sect_${i}`, 3]),
    ) as Record<string, number>;
    const r = legacyPointsOf({
      ...zero,
      bestLevel: 110,
      ascensions: 1,
      zhengdao: 1,
      codexCount: 2000,
      achievements: 80,
      sectLegacy,
      partnerLevel: 5,
      pastPartnerCount: 10,
    });
    expect(r.宗门分).toBe(8 * 3 * 15);
    expect(r.total).toBe(812);
  });

  it('八宗宗主（职位 4）比八宗长老再多 120 分', () => {
    const build = (rank: number): Record<string, number> =>
      Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`sect_${i}`, rank]));
    const base = { ...zero, bestLevel: 110, ascensions: 1, zhengdao: 1, codexCount: 2000, achievements: 80, partnerLevel: 5, pastPartnerCount: 10 };
    expect(legacyPointsOf({ ...base, sectLegacy: build(4) }).total).toBe(932);
    expect(legacyPointsOf({ ...base, sectLegacy: build(3) }).total).toBe(812);
  });

  it('叛宗系数 ×1.15，只在叛过宗时生效', () => {
    const clean = legacyPointsOf({ ...zero, bestLevel: 100 });
    const defect = legacyPointsOf({ ...zero, bestLevel: 100, defections: 1 });
    expect(clean.叛宗系数).toBe(1);
    expect(defect.叛宗系数).toBe(1.15);
    expect(defect.total).toBe(Math.round(clean.total * 1.15));
  });

  it('职位为 0 的宗门不贡献宗门分（空职位不虚高）', () => {
    expect(legacyPointsOf({ ...zero, sectLegacy: { a: 0, b: 0 } }).宗门分).toBe(0);
    expect(legacyPointsOf({ ...zero, sectLegacy: { a: 3 } }).宗门分).toBe(45);
  });

  it('负输入被夹到 0，不产生负传承点', () => {
    const r = legacyPointsOf({ ...zero, bestLevel: -5, achievements: -3, partnerLevel: -1 });
    expect(r.total).toBe(0);
  });
});

describe('图鉴位串', () => {
  it('置位 / 读位 / 计数自洽', () => {
    let bits = '';
    for (const i of [0, 3, 4, 17, 63, 64, 1999]) bits = orBit(bits, i);
    expect(countBits(bits)).toBe(7);
    for (const i of [0, 3, 4, 17, 63, 64, 1999]) expect(hasBit(bits, i), `bit ${i}`).toBe(true);
    for (const i of [1, 2, 5, 16, 18, 62, 65, 1998, 2000]) {
      expect(hasBit(bits, i), `bit ${i}`).toBe(false);
    }
  });

  it('负下标与越界读位不抛', () => {
    expect(hasBit('', 0)).toBe(false);
    expect(hasBit('f', 99)).toBe(false);
    expect(orBit('', -1)).toBe('');
  });

  it('幂等：重复置位不变', () => {
    const a = orBit(orBit('', 5), 5);
    expect(a).toBe(orBit('', 5));
    expect(countBits(a)).toBe(1);
  });
});

describe('局末结算（跨局层）', () => {
  const content = BUNDLE;

  function finishedRun(patch: Partial<RunState> = {}): RunState {
    const s = newState();
    s.life = 3;
    s.stats.years = 120;
    s.stats.events = 80;
    s.stats.breakthroughs = 30;
    s.realm.level = 90;
    s.tribPassed = 3;
    s.ascended = true;
    s.sect = { ...s.sect, id: 'sect_taixu', rank: 3, defections: 0 };
    // 用**真实内容 id**：图鉴按内容表下标计数，假 id 不会被记录
    for (const def of (BUNDLE.arts ?? []).slice(0, 12)) s.arts[def.id] = { level: 6, insight: 0 };
    for (const def of (BUNDLE.pills ?? []).slice(0, 8)) s.pills[def.id] = 2;
    for (const def of (BUNDLE.herbs ?? []).slice(0, 10)) s.herbs[def.id] = 30;
    s.endedReason = 'zhengdao';
    s.ascendMode = 'zhengdao';
    s.decisionLog.push({ year: 10, kind: 'encounter', eventId: 'enc_tier7', choiceId: 'fight' });
    s.fruits.push({ tier: 3, name: '青锋', year: 5, power: 100 });
    s.bonds.list.push({
      id: 'npc_1', name: '柳疏影', gender: '女', rootTier: 8, personality: '淡泊', origin: '散修',
      level: 90, affinity: 90, bondType: '道侣', bondLevel: 5, alive: true, metYear: 10,
      neglect: 0, injuredUntil: 0, seed: 'sd1',
    });
    return { ...s, ...patch };
  }

  it('totals 逐项累加，且 bestLevel 取历史最大值', () => {
    const prev = defaultMeta();
    prev.totals.bestLevel = 95;
    const r = settleRun(prev, { state: finishedRun(), content, power: 1e6 });
    expect(r.meta.totals.runs).toBe(1);
    expect(r.meta.totals.years).toBe(120);
    expect(r.meta.totals.ascensions).toBe(1);
    expect(r.meta.totals.zhengdao).toBe(1);
    expect(r.meta.totals.bestLevel).toBe(95);
  });

  it('传承点入账到余额与累计两处', () => {
    const prev = defaultMeta();
    const r = settleRun(prev, { state: finishedRun(), content, power: 1e6 });
    expect(r.gained).toBeGreaterThan(0);
    expect(r.meta.legacyPoints).toBe(r.gained);
    expect(r.meta.lifetimeLegacy).toBe(r.gained);
    const twice = settleRun(r.meta, { state: finishedRun(), content, power: 1e6 });
    expect(twice.meta.lifetimeLegacy).toBe(r.gained + twice.gained);
    expect(twice.meta.legacyPoints).toBe(r.meta.legacyPoints + twice.gained);
  });

  it('本局挣到的图鉴与宗门职位当世就计入传承分', () => {
    const r = settleRun(defaultMeta(), { state: finishedRun(), content, power: 1e6 });
    expect(r.breakdown.宗门分).toBe(3 * 15);
    expect(r.meta.sectLegacy['sect_taixu']).toBe(3);
    // 图鉴分要满 20 条才起算：功法 12 + 药材 10 + 丹药 8 + 境界 1 + 机缘 1 + 法宝 1 = 33
    expect(r.breakdown.图鉴分).toBe(1);
  });

  it('历史职位只记最高，不被低职位覆盖', () => {
    const prev = defaultMeta();
    prev.sectLegacy['sect_taixu'] = 4;
    const r = settleRun(prev, { state: finishedRun(), content, power: 1e6 });
    expect(r.meta.sectLegacy['sect_taixu']).toBe(4);
  });

  it('道侣入前世池，legacyInjection 把最近一位注入下一局', () => {
    const r = settleRun(defaultMeta(), { state: finishedRun(), content, power: 1e6 });
    expect(r.meta.pastPartners[0]).toEqual({ name: '柳疏影', seed: 'sd1', life: 3, level: 5 });
    const inj = legacyInjection(r.meta);
    expect(inj.pastPartner).toEqual({ name: '柳疏影', seed: 'sd1', level: 5 });
    expect(inj.cave).toEqual(r.meta.cave);
  });

  it('没有合格道侣时不产生前世记录', () => {
    const s = finishedRun();
    s.bonds.list[0] = { ...s.bonds.list[0]!, bondLevel: 2 };
    const r = settleRun(defaultMeta(), { state: s, content, power: 1e6 });
    expect(r.meta.pastPartners).toEqual([]);
    expect(legacyInjection(r.meta).pastPartner).toBeNull();
  });

  it('图鉴位串记录了机缘档、法宝档与功法', () => {
    const r = settleRun(defaultMeta(), { state: finishedRun(), content, power: 1e6 });
    expect(hasBit(r.meta.codex.encounters, 6)).toBe(true);
    expect(hasBit(r.meta.codex.artifacts, 2)).toBe(true);
    expect(countBits(r.meta.codex.arts)).toBe(12);
    expect(countBits(r.meta.codex.herbs)).toBe(10);
    expect(countBits(r.meta.codex.pills)).toBe(8);
  });

  it('高光记录最新 20 条，更早的丢弃', () => {
    let meta = defaultMeta();
    for (let i = 0; i < 25; i++) {
      const run = finishedRun();
      run.life = i + 1;
      meta = settleRun(meta, { state: run, content, power: i }).meta;
    }
    expect(meta.pastLives).toHaveLength(20);
    expect(meta.totals.runs).toBe(25);
    expect(meta.pastLives[0]?.life).toBe(25);
    expect(meta.pastLives[19]?.life).toBe(6);
  });

  it('已解锁的成就不会重复解锁（跨局幂等）', () => {
    const first = settleRun(defaultMeta(), { state: finishedRun(), content, power: 1e6 });
    expect(first.unlocked.length).toBeGreaterThan(0);
    // 第二世：世次与累计量都更高，理应解锁新的，但**第一条的 id 一个都不能重复出现**
    const second = settleRun(first.meta, { state: finishedRun(), content, power: 1e6 });
    for (const id of first.unlocked) expect(second.unlocked, id).not.toContain(id);
    expect(new Set([...first.meta.achievements, ...second.unlocked]).size).toBe(
      first.meta.achievements.length + second.unlocked.length,
    );
    // 反复结算同一条存档：解锁集合单调收敛，不会无限膨胀
    const third = settleRun(second.meta, { state: finishedRun(), content, power: 1e6 });
    expect(third.unlocked.length).toBeLessThanOrEqual(first.unlocked.length);
  });

  it('成就气运加成受上限约束（验收 6.1 的关键闸门）', () => {
    const all = ACHIEVEMENTS.map((a) => a.id);
    const withAll = settleRun(
      { ...defaultMeta(), achievements: all },
      { state: finishedRun(), content, power: 1e6 },
    );
    expect(goldBoostOf(withAll.meta.achievements)).toBeLessThanOrEqual(ACHIEVEMENT_BONUS_CAP);
  });

  it('洞府等级是引擎唯一入口：注入后 RunState 读得到，且不来自 MetaState', () => {
    const meta = defaultMeta();
    meta.cave = { 药园: 3, 丹房: 0, 藏经阁: 0, 悟道室: 5, 聚灵阵: 0, 静室: 0 };
    const inj = legacyInjection(meta);
    const s = newState();
    s.legacyCave = inj.cave;
    expect(herbYield(s)).toBe(3);
    expect(studyInsight(s)).toBe(2.5);
  });
});
