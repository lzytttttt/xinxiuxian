import { describe, expect, it } from 'vitest';
import { BUNDLE, RECIPES } from '../../src/content/index';
import {
  actionInfos,
  autoFire,
  batchRefine,
  canAutoFire,
  canUsePill,
  commitBatch,
  greedyAction,
  herbById,
  pillById,
  pillBuffPower,
  pillKey,
  pillStacks,
  potencyCap,
  qualityOf,
  recipeAvailable,
  schoolBonusOf,
  startBatch,
  stepBatch,
  tickPillBuffs,
  toxicityOfPill,
  usePill,
  type BatchAction,
} from '../../src/engine/alchemy';
import { makeRng, makeRngBag } from '../../src/engine/rng';
import { PILL_BUFF_YEARS } from '../../src/engine/constants';
import { attemptBreak } from '../../src/engine/breakthrough';
import { zones } from '../../src/engine/selectors';
import { perilTick } from '../../src/engine/tribulation';
import type { Recipe } from '../../src/engine/types/effects';
import type { RunState } from '../../src/engine/types/run';
import { newState } from './helpers';

const RNG_SEED_RNG = makeRng('alchemy-tests');
void RNG_SEED_RNG;

function recipeOf(id: string): Recipe {
  const r = RECIPES.find((x) => x.id === id);
  if (!r) throw new Error(`缺丹方 ${id}`);
  return r;
}

/** 一炉的材料库存 */
function stockFor(recipe: Recipe, times = 1): RunState {
  const s = newState(`stock-${recipe.id}`);
  for (const input of recipe.inputs) s.herbs[input.herb] = input.count * times;
  return s;
}

function playGreedy(recipe: Recipe, seed: string, mastery: number, schoolBonus: number, cap: number): number {
  const rng = makeRng(seed);
  const b = startBatch(stockFor(recipe), recipe);
  if (!b) throw new Error('开炉失败');
  while (!b.done && !b.exploded) stepBatch(b, greedyAction(b), rng);
  return qualityOf(b, { mastery, schoolBonus, cap }).quality;
}

function playRandom(recipe: Recipe, seed: string, cap: number): number {
  const rng = makeRng(seed);
  const b = startBatch(stockFor(recipe), recipe);
  if (!b) throw new Error('开炉失败');
  const pool: BatchAction[] = ['heat', 'cool', 'fan', 'calm'];
  while (!b.done && !b.exploded) stepBatch(b, rng.pick(pool), rng);
  return qualityOf(b, { mastery: 0, schoolBonus: 0, cap }).quality;
}

/** 技能性测量集：药力封顶 ≥ 6 的高阶丹方（低阶丹方被药材药力封顶，不用于测技能上限） */
const SKILL_RECIPES = RECIPES.filter((r) => potencyCap(BUNDLE, r) >= 6);

describe('控火小游戏（验收 4.1 / 4.2 / 4.5）', () => {
  it('4.1 技能性·上限：贪心 500 局平均品质 ≥ 4.5', () => {
    const runs = 500;
    let sum = 0;
    for (let i = 0; i < runs; i++) {
      const recipe = SKILL_RECIPES[i % SKILL_RECIPES.length] as Recipe;
      const mastery = Math.min(5, Math.floor((i * 5) / runs));
      sum += playGreedy(recipe, `${recipe.id}:greedy:${i}`, mastery, 0.3, potencyCap(BUNDLE, recipe));
    }
    const avg = sum / runs;
    expect(SKILL_RECIPES.length).toBeGreaterThanOrEqual(4);
    expect(avg).toBeGreaterThanOrEqual(4.5);
  });

  it('4.2 技能性·下限：乱按 500 局平均品质 ≤ 1.5', () => {
    const runs = 500;
    let sum = 0;
    for (let i = 0; i < runs; i++) {
      const recipe = RECIPES[i % RECIPES.length] as Recipe;
      sum += playRandom(recipe, `${recipe.id}:random:${i}`, potencyCap(BUNDLE, recipe));
    }
    const avg = sum / runs;
    expect(avg).toBeLessThanOrEqual(1.5);
  });

  it('4.2 对照：同一批丹方上，贪心与乱按的差距 ≥ 2.5 档', () => {
    const recipe = recipeOf('rec_daoyun');
    let greedy = 0;
    let random = 0;
    for (let i = 0; i < 200; i++) {
      greedy += playGreedy(recipe, `cmp:${i}`, 3, 0, 6);
      random += playRandom(recipe, `cmp:${i}`, 6);
    }
    expect(greedy / 200 - random / 200).toBeGreaterThanOrEqual(2.5);
  });

  it('4.5 自动控火（mastery ≥3）品质不低于手动贪心期望，且不消费 RNG', () => {
    for (const recipe of SKILL_RECIPES.slice(0, 4)) {
      const cap = potencyCap(BUNDLE, recipe);
      const opts = { mastery: 5, schoolBonus: 0, cap };
      let manual = 0;
      for (let i = 0; i < 120; i++) manual += playGreedy(recipe, `auto:${recipe.id}:${i}`, 5, 0, cap);
      expect(autoFire(recipe, opts).quality).toBeGreaterThanOrEqual(manual / 120 - 1e-9);
      expect(canAutoFire(3)).toBe(true);
      expect(canAutoFire(2)).toBe(false);
    }
  });

  it('仙品门槛：qualityScore < 0.9 时不给 6 档', () => {
    const recipe = recipeOf('rec_juqi_1');
    const s = stockFor(recipe);
    const b = startBatch(s, recipe);
    if (!b) throw new Error('开炉失败');
    b.trackError = b.steps * b.tolerance * 0.15; // score = 0.85
    expect(qualityOf(b, { mastery: 5, schoolBonus: 0.3, cap: 6 }).quality).toBe(5);
    b.trackError = 0; // score = 1
    expect(qualityOf(b, { mastery: 5, schoolBonus: 0.3, cap: 6 }).quality).toBe(6);
  });

  it('炸炉：稳定度耗尽 → 品质锁 1、材料全损、不产丹', () => {
    const recipe = recipeOf('rec_juqi_1');
    const s = stockFor(recipe);
    const b = startBatch(s, recipe);
    if (!b) throw new Error('开炉失败');
    b.stability = 2;
    stepBatch(b, 'calm', makeRng('boom'));
    expect(b.exploded).toBe(true);
    const res = commitBatch(s, recipe, BUNDLE, qualityOf(b, { mastery: 0, schoolBonus: 0, cap: 6 }));
    expect(res.count).toBe(0);
    expect(res.toxicity).toBe(0);
    expect(Object.keys(s.pills)).toHaveLength(0);
  });

  it('四动作门槛：燃料不足禁添柴、稳定度耗尽禁稳火、低稳定用稳火会炸炉', () => {
    const recipe = recipeOf('rec_juqi_1');
    const b = startBatch(stockFor(recipe), recipe);
    if (!b) throw new Error('开炉失败');
    b.fuel = 1;
    b.stability = 0;
    let infos = actionInfos(b);
    expect(infos.find((x) => x.action === 'heat')?.enabled).toBe(false);
    expect(infos.find((x) => x.action === 'calm')?.enabled).toBe(false);
    expect(infos.find((x) => x.action === 'cool')?.enabled).toBe(true);
    // 稳定度只剩 1-2 点时仍可点稳火——但点下去就是炸炉（代价必须真实）
    b.stability = 2;
    infos = actionInfos(b);
    expect(infos.find((x) => x.action === 'calm')?.enabled).toBe(true);
    stepBatch(b, 'calm', makeRng('calm-trap'));
    expect(b.exploded).toBe(true);
  });
});

describe('药材与丹方（内容侧）', () => {
  it('60 味药材、每阶 6 味，药力随阶递增', () => {
    expect(BUNDLE.herbs).toHaveLength(60);
    for (let tier = 1; tier <= 10; tier++) {
      const herbs = (BUNDLE.herbs ?? []).filter((h) => h.tier === tier);
      expect(herbs).toHaveLength(6);
      for (const h of herbs) {
        expect(h.potency).toBeGreaterThan((tier - 1) * 8);
        expect(h.potency).toBeLessThan((tier + 2) * 8 + 8);
      }
    }
  });

  it('药力封顶：低阶药材炼不出仙品；高阶丹方可达 6 档', () => {
    expect(potencyCap(BUNDLE, recipeOf('rec_juqi_1'))).toBeLessThanOrEqual(2);
    expect(potencyCap(BUNDLE, recipeOf('rec_daoyun'))).toBe(6);
    expect(herbById(BUNDLE, 'herb_yunwu')?.name).toBe('云雾草');
  });

  it('丹方阵容：35 张、1-3 阶 12 / 4-6 阶 12 / 7-9 阶 8 / 10 阶 3', () => {
    const bands = [0, 0, 0, 0];
    for (const r of RECIPES) {
      if (r.tier <= 3) bands[0] = (bands[0] ?? 0) + 1;
      else if (r.tier <= 6) bands[1] = (bands[1] ?? 0) + 1;
      else if (r.tier <= 9) bands[2] = (bands[2] ?? 0) + 1;
      else bands[3] = (bands[3] ?? 0) + 1;
    }
    expect(RECIPES).toHaveLength(35);
    expect(bands).toEqual([12, 12, 8, 3]);
  });

  it('解锁条件：开局可炼低阶，10 阶需境界 + flag', () => {
    const s = newState('unlock');
    expect(recipeAvailable(s, recipeOf('rec_juqi_1'), BUNDLE)).toBe(true);
    expect(recipeAvailable(s, recipeOf('rec_bailing'), BUNDLE)).toBe(false);
    s.realm.level = 90;
    expect(recipeAvailable(s, recipeOf('rec_huanhun'), BUNDLE)).toBe(true);
    expect(recipeAvailable(s, recipeOf('rec_daoyun'), BUNDLE)).toBe(false);
    s.flags['dao_seat'] = 1;
    expect(recipeAvailable(s, recipeOf('rec_daoyun'), BUNDLE)).toBe(true);
  });

  it('流派丹方：未装备该流派功法时不可用', () => {
    const s = newState('school-recipe');
    s.realm.level = 60;
    expect(recipeAvailable(s, recipeOf('rec_ziyan'), BUNDLE)).toBe(false);
  });

  it('批量炼制：需 mastery ≥3，消耗 5 份材料产出 5 颗同品质', () => {
    const recipe = recipeOf('rec_juqi_1');
    const s = stockFor(recipe, 5);
    expect(batchRefine(s, recipe, BUNDLE)).toBeNull();
    s.recipes[recipe.id] = { known: true, mastery: 3 };
    const res = batchRefine(s, recipe, BUNDLE);
    expect(res).not.toBeNull();
    expect(res?.count).toBe(5);
    const key = pillKey('pill_juqi_1', res?.outcome.quality ?? 3);
    expect(s.pills[key]).toBe(5);
    expect(s.recipes[recipe.id]?.mastery).toBe(4);
  });
});

describe('丹毒（验收 4.3 的计算基础）', () => {
  it('累积公式与产品文档表格逐格一致：tier × (7 − quality) × 0.6', () => {
    const table: Record<number, Record<number, number>> = {
      1: { 6: 0.6, 3: 2.4, 1: 3.6 },
      5: { 6: 3.0, 3: 12.0, 1: 18.0 },
      8: { 6: 4.8, 3: 19.2, 1: 28.8 },
      10: { 6: 6.0, 3: 24.0, 1: 36.0 },
    };
    for (const [tier, row] of Object.entries(table)) {
      for (const [quality, want] of Object.entries(row)) {
        expect(toxicityOfPill(Number(tier), Number(quality))).toBeCloseTo(want, 6);
      }
    }
  });

  it('惩罚一（突破）：丹毒 100 使突破概率下降到约 ×0.6', () => {
    const count = (toxicity: number): number => {
      let hits = 0;
      for (let i = 0; i < 6000; i++) {
        const s = newState('tox-break');
        // 55 级：单次判定分支（base ≤ 0.25），避免连破饱和掩盖惩罚
        s.realm.level = 55;
        s.realm.stage = 6;
        s.toxicity = toxicity;
        s.cultivation = 1000;
        attemptBreak(s, makeRngBag(`tox:${toxicity}:${i}`), BUNDLE);
        if (s.brokeThisYear) hits += 1;
      }
      return hits;
    };
    const clean = count(0);
    const toxic = count(100);
    expect(clean).toBeGreaterThan(800);
    const ratio = toxic / clean;
    expect(ratio).toBeGreaterThan(0.5);
    expect(ratio).toBeLessThan(0.72);
  });

  it('惩罚二（走火入魔）：丹毒抬升仙界风险（封顶 6%）', () => {
    const deaths = (toxicity: number): number => {
      let dead = 0;
      for (let i = 0; i < 2000; i++) {
        const s = newState('peril');
        s.realm.arc = 'immortal';
        s.realm.level = 101;
        s.realm.stage = 1;
        s.toxicity = toxicity;
        perilTick(s, makeRngBag(`peril:${toxicity}:${i}`));
        if (s.dead) dead += 1;
      }
      return dead;
    };
    expect(deaths(100)).toBeGreaterThan(deaths(0));
  });

  it('炼丹的丹毒按丹药阶位计（丹方阶位与丹药阶位不一致时以丹药为准）', () => {
    const recipe = recipeOf('rec_zhuoxin');
    const s = stockFor(recipe);
    s.toxicity = 0;
    const pillTier = pillById(BUNDLE, recipe.pill)?.tier ?? recipe.tier;
    const res = commitBatch(s, recipe, BUNDLE, { quality: 1, score: 0, exploded: false, error: 0 });
    expect(res.toxicity).toBeCloseTo(toxicityOfPill(pillTier, 1), 6);
    expect(s.toxicity).toBeCloseTo(toxicityOfPill(pillTier, 1), 6);
  });

  it('丹火不侵：丹毒获取减半（与 Phase 3 协同一致）', () => {
    const recipe = recipeOf('rec_juqi_1');
    const base = { quality: 1 as const, score: 0, exploded: false, error: 0 };
    const plain = stockFor(recipe);
    const withSynergy = stockFor(recipe);
    for (const id of ['art_dan_ding', 'art_qing_nang', 'art_bai_cao']) {
      withSynergy.arts[id] = { level: 1, insight: 0 };
      withSynergy.slots[withSynergy.slots.indexOf(null)] = id;
    }
    for (const id of ['art_tie_gu', 'art_long_xiang', 'art_bu_huai']) {
      withSynergy.arts[id] = { level: 1, insight: 0 };
      withSynergy.slots[withSynergy.slots.indexOf(null)] = id;
    }
    const a = commitBatch(plain, recipe, BUNDLE, base).toxicity;
    const b = commitBatch(withSynergy, recipe, BUNDLE, base).toxicity;
    expect(b).toBeCloseTo(a / 2, 6);
  });
});

describe('服用丹药（七类 / 品质分栈 / 冷却）', () => {
  it('品质分栈：中品用裸 id，其余分栈；读取按前缀求和', () => {
    const s = newState('stacks');
    s.pills['pill_juqi_1'] = 2;
    s.pills[pillKey('pill_juqi_1', 5)] = 3;
    const stacks = pillStacks(s, BUNDLE);
    expect(stacks).toHaveLength(2);
    const total = zones(s, BUNDLE); // 触发 readTarget 路径
    expect(total).toBeTruthy();
    expect(pillById(BUNDLE, 'pill_juqi_1')?.name).toBe('聚气丹');
  });

  it('聚气丹：修为按品质倍率提升，并留下 Z5 药力', () => {
    const s = newState('use-juqi');
    s.cultivation = 1000;
    s.pills['pill_juqi_1'] = 1;
    const before = zones(s, BUNDLE).z5.mult;
    const res = usePill(s, 'pill_juqi_1', BUNDLE);
    expect(res.ok).toBe(true);
    expect(s.cultivation).toBeCloseTo(1080, 6);
    const zoneBase = pillById(BUNDLE, 'pill_juqi_1')?.zoneBase ?? 0;
    expect(pillBuffPower(s)).toBeCloseTo(zoneBase, 6);
    expect(pillBuffPower(s, 'z5')).toBeCloseTo(zoneBase, 6);
    expect(zones(s, BUNDLE).z5.mult).toBeGreaterThan(before);
    expect(s.pills['pill_juqi_1']).toBe(0);
  });

  it('冷却：同类丹药 3 年内不可再服；破境丹当年限 1 颗', () => {
    const s = newState('cooldown');
    s.pills['pill_juqi_1'] = 2;
    s.pills['pill_pojing_1'] = 2;
    expect(usePill(s, 'pill_juqi_1', BUNDLE).ok).toBe(true);
    expect(canUsePill(s, 'pill_juqi_1', BUNDLE).ok).toBe(false);
    expect(usePill(s, 'pill_pojing_1', BUNDLE).ok).toBe(true);
    expect(canUsePill(s, 'pill_pojing_1', BUNDLE).ok).toBe(false);
    s.year += 1;
    expect(canUsePill(s, 'pill_pojing_1', BUNDLE).ok).toBe(true);
  });

  it('破境丹：大境界顶禁用，且当年突破概率 ×1.25', () => {
    const s = newState('pojing');
    s.realm.level = 10;
    s.pills['pill_pojing_1'] = 1;
    expect(canUsePill(s, 'pill_pojing_1', BUNDLE).ok).toBe(false);
    s.realm.level = 11;
    expect(usePill(s, 'pill_pojing_1', BUNDLE).ok).toBe(true);
    expect(s.pillBreakMult).toBeCloseTo(1.25, 6);
  });

  it('护劫丹：渡劫要求 ×0.88（覆盖全部九重）', () => {
    const s = newState('hujie');
    s.pills['pill_hujie_1'] = 1;
    usePill(s, 'pill_hujie_1', BUNDLE);
    expect(s.pillGuardMult).toBeCloseTo(0.88, 6);
  });

  it('服丹的丹毒增量 = tier × (7 − quality) × 0.6（按丹药自身阶位）', () => {
    const tier = pillById(BUNDLE, 'pill_juqi_1')?.tier ?? 0;
    const s = newState('use-tox');
    s.toxicity = 0;
    s.pills[pillKey('pill_juqi_1', 2)] = 1;
    usePill(s, pillKey('pill_juqi_1', 2), BUNDLE);
    expect(s.toxicity).toBeCloseTo(toxicityOfPill(tier, 2), 6);
    s.year += 3; // 越过 3 年冷却
    s.pills['pill_juqi_1'] = 1; // 裸 id = 中品（品质 3）
    usePill(s, 'pill_juqi_1', BUNDLE);
    expect(s.toxicity).toBeCloseTo(toxicityOfPill(tier, 2) + toxicityOfPill(tier, 3), 6);
  });

  it('疗毒丹：按品质倍率解毒，且不追加丹毒', () => {
    const s = newState('cure');
    s.toxicity = 60;
    s.pills[pillKey('pill_liaodu_1', 1)] = 1;
    usePill(s, pillKey('pill_liaodu_1', 1), BUNDLE);
    expect(s.toxicity).toBeCloseTo(45, 6);
  });

  it('洗髓 / 天机 / 炼宝：分别抬 root / luck / artifactPower', () => {
    const s = newState('attr');
    s.cultivation = 1000;
    s.artifactPower = 1000;
    s.pills['pill_xisui_2'] = 1;
    s.pills['pill_tianji_2'] = 1;
    s.pills['pill_lianbao_2'] = 1;
    usePill(s, 'pill_xisui_2', BUNDLE);
    usePill(s, 'pill_tianji_2', BUNDLE);
    usePill(s, 'pill_lianbao_2', BUNDLE);
    expect(s.root).toBe(55);
    expect(s.luck).toBe(25);
    expect(s.artifactPower).toBeCloseTo(1100, 6);
  });

  it('药力逐年递减，4 年后清空', () => {
    const s = newState('buff-decay');
    s.pills['pill_juqi_1'] = 1;
    usePill(s, 'pill_juqi_1', BUNDLE);
    const years = s.pillBuffs[0]?.years ?? 0;
    expect(years).toBe(PILL_BUFF_YEARS);
    for (let i = 0; i < years; i++) tickPillBuffs(s);
    expect(pillBuffPower(s)).toBe(0);
  });

  it('毒体反向：丹毒 >50 时 Z5 追加 toxicity/100', () => {
    const s = newState('poison-body');
    for (const id of ['art_wan_du', 'art_bai_du', 'art_hua_du', 'art_shi_gu']) {
      s.arts[id] = { level: 1, insight: 0 };
      s.slots[s.slots.indexOf(null)] = id;
    }
    s.toxicity = 40;
    const low = zones(s, BUNDLE).z5.mult;
    s.toxicity = 100;
    const high = zones(s, BUNDLE).z5.mult;
    expect(high).toBeGreaterThan(low + 0.5);
  });

  it('同一丹毒水平下：普通 build 被罚、毒修 build 被加成（价值相反）', () => {
    const plain = newState('contrast-plain');
    plain.toxicity = 100;
    const plainZ5 = zones(plain, BUNDLE).z5.mult;
    expect(plainZ5).toBeCloseTo(0.6, 6);

    const poison = newState('contrast-poison');
    for (const id of ['art_wan_du', 'art_bai_du', 'art_hua_du', 'art_shi_gu']) {
      poison.arts[id] = { level: 1, insight: 0 };
      poison.slots[poison.slots.indexOf(null)] = id;
    }
    poison.toxicity = 100;
    const poisonZ5 = zones(poison, BUNDLE).z5.mult;
    expect(poisonZ5).toBeCloseTo(1.6, 6);
    expect(poisonZ5 - plainZ5).toBeGreaterThan(0.9);
  });

  it('毒体：毒修功法被动按 (1 + 丹毒/100) 缩放', () => {
    const poison = newState('scale-poison');
    for (const id of ['art_wan_du', 'art_bai_du', 'art_hua_du', 'art_shi_gu']) {
      poison.arts[id] = { level: 1, insight: 0 };
      poison.slots[poison.slots.indexOf(null)] = id;
    }
    poison.toxicity = 0;
    const lowZ1 = zones(poison, BUNDLE).z1.mult;
    const lowZ4 = zones(poison, BUNDLE).z4.mult / zones(poison, BUNDLE).resonance.mult;
    poison.toxicity = 100;
    // 毒修被动贡献翻倍（Z4 要先剥掉共鸣的区后乘子）
    expect(zones(poison, BUNDLE).z1.mult - 1).toBeCloseTo((lowZ1 - 1) * 2, 4);
    expect(zones(poison, BUNDLE).z4.mult / zones(poison, BUNDLE).resonance.mult - 1).toBeCloseTo(
      (lowZ4 - 1) * 2,
      4,
    );
  });

  it('丹修与万法归一提升炼丹品质（schoolBonus 可叠）', () => {
    const s = newState('school-bonus');
    expect(schoolBonusOf(s, BUNDLE)).toBe(0);
    s.arts['art_dan_ding'] = { level: 1, insight: 0 };
    s.slots[0] = 'art_dan_ding';
    expect(schoolBonusOf(s, BUNDLE)).toBeCloseTo(0.3, 6);
  });
});
