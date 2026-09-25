import {
  ALCHEMY_AUTO_MASTERY,
  ALCHEMY_BATCH_COUNT,
  ALCHEMY_CALM_NOISE,
  ALCHEMY_CALM_PULL,
  ALCHEMY_CALM_STABILITY,
  ALCHEMY_COOL_LOSS,
  ALCHEMY_CURVE_SWING,
  ALCHEMY_DRIFT,
  ALCHEMY_FAN_GAIN,
  ALCHEMY_FAN_NOISE,
  ALCHEMY_FUEL_PER_STEP,
  ALCHEMY_HEAT_COST,
  ALCHEMY_HEAT_GAIN,
  ALCHEMY_MASTERY_BONUS_CAP,
  ALCHEMY_MASTERY_BONUS_PER,
  ALCHEMY_MASTERY_MAX,
  ALCHEMY_MIXED_BONUS,
  ALCHEMY_NOISE_SCALE,
  ALCHEMY_SCHOOL_BONUS,
  ALCHEMY_STABILITY_PER_STEP,
  ALCHEMY_XIAN_SCORE,
  HERB_MARKET_INSIGHT_PER_TIER,
  HERB_MARKET_YEARLY_STOCK,
  PILL_BREAK_MULT,
  PILL_BUFF_YEARS,
  PILL_COOLDOWN_YEARS,
  PILL_GUARD_MULT,
  PILL_POTENCY_PER_GRADE,
  PILL_TOX_RATE,
  QUALITY_MULTS,
  QUALITY_NAMES,
} from './constants';
import { resonanceOf, schoolCount, toxicityGain } from './arts';
import { evalCondition, makeEvalCtx } from './conditions';
import type { ContentBundle, Herb, PillDef, Recipe } from './types/effects';
import type { Rng } from './types/rng';
import type { BatchState, RunState } from './types/run';

export function herbById(c: ContentBundle, id: string): Herb | undefined {
  return c.herbs?.find((h) => h.id === id);
}

export function pillById(c: ContentBundle, id: string): PillDef | undefined {
  return c.pills?.find((p) => p.id === id);
}

export function recipeById(c: ContentBundle, id: string): Recipe | undefined {
  return c.recipes?.find((r) => r.id === id);
}

export function qualityMult(quality: number): number {
  return QUALITY_MULTS[Math.min(6, Math.max(1, Math.round(quality)))] ?? 1;
}

export function qualityName(quality: number): string {
  return QUALITY_NAMES[Math.min(6, Math.max(1, Math.round(quality)))] ?? '中品';
}

// ── 库存 ──

export function herbCount(s: { herbs: Record<string, number> }, id: string): number {
  return s.herbs[id] ?? 0;
}

/** 材料齐备（含数量与是否有该药材定义） */
export function missingInputs(
  s: { herbs: Record<string, number> },
  recipe: Recipe,
  times = 1,
): { herb: string; need: number; have: number }[] {
  const out: { herb: string; need: number; have: number }[] = [];
  for (const input of recipe.inputs) {
    const need = input.count * times;
    const have = herbCount(s, input.herb);
    if (have < need) out.push({ herb: input.herb, need, have });
  }
  return out;
}

export function consumeInputs(
  s: { herbs: Record<string, number> },
  recipe: Recipe,
  times = 1,
): boolean {
  if (missingInputs(s, recipe, times).length > 0) return false;
  for (const input of recipe.inputs) {
    s.herbs[input.herb] = herbCount(s, input.herb) - input.count * times;
  }
  return true;
}

/** 药力封顶：投入药材的平均药力决定成品品质上限（低阶药材炼不出仙品） */
export function potencyCap(c: ContentBundle, recipe: Recipe): number {
  let total = 0;
  let count = 0;
  for (const input of recipe.inputs) {
    const potency = herbById(c, input.herb)?.potency ?? 0;
    total += potency * input.count;
    count += input.count;
  }
  if (count === 0) return 6;
  return Math.min(6, Math.max(1, 1 + Math.round(total / count / PILL_POTENCY_PER_GRADE)));
}

// ── 控火小游戏 ──

export type BatchAction = 'heat' | 'cool' | 'fan' | 'calm';

export interface ActionInfo {
  action: BatchAction;
  label: string;
  effect: string;
  cost: string;
  enabled: boolean;
  reason: string;
}

const ACTION_LABELS: Record<BatchAction, { label: string; effect: string; cost: string }> = {
  heat: { label: '添柴', effect: `升温 +${ALCHEMY_HEAT_GAIN}`, cost: `燃料 −${ALCHEMY_HEAT_COST}` },
  cool: { label: '撤火', effect: `降温 −${ALCHEMY_COOL_LOSS}`, cost: '—' },
  fan: { label: '扇风', effect: `下一步 +${ALCHEMY_FAN_GAIN}`, cost: `噪声 +${ALCHEMY_FAN_NOISE}` },
  calm: {
    label: '稳火',
    effect: `火候微调 · 噪声 −${ALCHEMY_CALM_NOISE}`,
    cost: `稳定 −${ALCHEMY_CALM_STABILITY}`,
  },
};

/** 曲线在步 `t` 的目标温度（t 从 0 到 steps−1） */
export function targetAt(b: BatchState, t: number): number {
  const span = Math.max(1, b.steps - 1);
  const k = Math.min(1, Math.max(0, t / span));
  switch (b.curve) {
    case 'rise':
      return b.base - ALCHEMY_CURVE_SWING + 2 * ALCHEMY_CURVE_SWING * k;
    case 'fall':
      return b.base + ALCHEMY_CURVE_SWING - 2 * ALCHEMY_CURVE_SWING * k;
    case 'pulse':
      return b.base + ALCHEMY_CURVE_SWING * Math.sin(2 * Math.PI * k);
    default:
      return b.base;
  }
}

export function startBatch(s: { herbs: Record<string, number> }, recipe: Recipe): BatchState | null {
  if (!consumeInputs(s, recipe)) return null;
  return {
    recipeId: recipe.id,
    t: 0,
    steps: recipe.furnace.steps,
    temp: recipe.furnace.targetTemp,
    fuel: Math.ceil(recipe.furnace.steps * ALCHEMY_FUEL_PER_STEP),
    base: recipe.furnace.targetTemp,
    target: recipe.furnace.targetTemp,
    curve: recipe.furnace.curve,
    noise: recipe.furnace.noise,
    tolerance: recipe.furnace.tolerance,
    stability: Math.ceil(recipe.furnace.steps * ALCHEMY_STABILITY_PER_STEP),
    trackError: 0,
    fanBonus: 0,
    exploded: false,
    done: false,
  };
}

export function actionInfos(b: BatchState): ActionInfo[] {
  return (Object.keys(ACTION_LABELS) as BatchAction[]).map((action) => {
    const meta = ACTION_LABELS[action];
    let enabled = !b.done && !b.exploded;
    let reason = enabled ? '' : '本炉已结束';
    if (enabled && action === 'heat' && b.fuel < ALCHEMY_HEAT_COST) {
      enabled = false;
      reason = '燃料不足';
    }
    if (enabled && action === 'calm' && b.stability <= 0) {
      enabled = false;
      reason = '稳定度耗尽';
    }
    return { action, ...meta, enabled, reason };
  });
}

/** 单步推进：动作 → 被动漂移 → 目标推进 → 累计误差 → 稳定性/炸炉判定 */
export function stepBatch(b: BatchState, action: BatchAction, rng: Rng): void {
  if (b.done || b.exploded) return;
  const info = actionInfos(b).find((x) => x.action === action);
  if (!info?.enabled) return;

  let temp = b.temp + b.fanBonus;
  let noise = b.noise;
  let stability = b.stability;
  let fuel = b.fuel;
  switch (action) {
    case 'heat':
      temp += ALCHEMY_HEAT_GAIN;
      fuel -= ALCHEMY_HEAT_COST;
      break;
    case 'cool':
      temp -= ALCHEMY_COOL_LOSS;
      break;
    case 'fan':
      b.fanBonus = ALCHEMY_FAN_GAIN;
      noise += ALCHEMY_FAN_NOISE;
      break;
    case 'calm':
      temp += (targetAt(b, b.t) - temp) * ALCHEMY_CALM_PULL;
      noise = Math.max(0, noise - ALCHEMY_CALM_NOISE);
      stability -= ALCHEMY_CALM_STABILITY;
      break;
  }
  if (action !== 'fan') b.fanBonus = 0;

  const target = targetAt(b, b.t);
  temp += (target - temp) * ALCHEMY_DRIFT + gauss(rng) * noise * ALCHEMY_NOISE_SCALE;
  b.trackError += Math.abs(temp - target);

  b.t += 1;
  b.temp = temp;
  b.noise = noise;
  b.stability = stability;
  b.fuel = fuel;
  b.target = targetAt(b, b.t);
  if (b.stability < 0) {
    b.exploded = true;
    b.done = true;
  }
  if (b.t >= b.steps) b.done = true;
}

/** Box-Muller：一次消费两个均匀样本，保证与种子严格对应 */
function gauss(rng: Rng): number {
  const u = Math.max(1e-9, rng.next());
  const v = rng.next();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function qualityScoreOf(b: BatchState): number {
  const denom = Math.max(1e-9, b.steps * b.tolerance);
  return 1 - Math.min(1, Math.max(0, b.trackError / denom));
}

/** 当时的门派与共鸣加成（丹修 +0.3；万法归一 +0.2；可叠） */
export function schoolBonusOf(s: RunState, c: ContentBundle): number {
  let bonus = 0;
  if (schoolCount(s, c, '丹修') > 0) bonus += ALCHEMY_SCHOOL_BONUS;
  if (resonanceOf(s, c).id === 'three2') bonus += ALCHEMY_MIXED_BONUS;
  return bonus;
}

export function masteryBonusOf(mastery: number): number {
  return Math.min(ALCHEMY_MASTERY_BONUS_CAP, Math.max(0, mastery) * ALCHEMY_MASTERY_BONUS_PER);
}

export interface BatchOutcome {
  quality: number;
  score: number;
  exploded: boolean;
  error: number;
}

/**
 * 结算品质。`mastery`/`schoolBonus`/`cap` 全部由外部传入（纯函数，便于测试与自动控火复用）。
 * 炸炉 → 锁 1；药力不足 → 按 cap 封顶；仙品需 score ≥ ALCHEMY_XIAN_SCORE。
 */
export function qualityOf(
  b: BatchState,
  opts: { mastery: number; schoolBonus: number; cap: number },
): BatchOutcome {
  const score = qualityScoreOf(b);
  if (b.exploded) return { quality: 1, score, exploded: true, error: b.trackError };
  let q = Math.round(1 + score * 5 + masteryBonusOf(opts.mastery) + opts.schoolBonus);
  q = Math.min(6, Math.max(1, q));
  if (q >= 6 && score < ALCHEMY_XIAN_SCORE) q = 5;
  return { quality: Math.min(q, Math.max(1, opts.cap)), score, exploded: false, error: b.trackError };
}

/** 一炉的丹毒（品质越好越轻；丹火不侵 ×0.5 由调用方经 toxicityGain 施加） */
export function toxicityOfPill(tier: number, quality: number): number {
  return tier * (7 - quality) * PILL_TOX_RATE;
}

export function canAutoFire(mastery: number): boolean {
  return mastery >= ALCHEMY_AUTO_MASTERY;
}

export function batchCount(): number {
  return ALCHEMY_BATCH_COUNT;
}

// ── 贪心策略 / 自动控火 / 批量炼制 ──

/**
 * 贪心：每步选「使下一步误差最小」的动作（预测含回归漂移，不含噪声）。
 * 这是自动控火与技能性测试（验收 4.1）共用的策略定义。
 */
export function greedyAction(b: BatchState): BatchAction {
  const targetNext = targetAt(b, b.t + 1);
  // 稳火会吃掉 3 点稳定度，稳定度不足时最优策略直接回避（否则会把自己炸了炉）
  const candidates = actionInfos(b).filter(
    (x) => x.enabled && !(x.action === 'calm' && b.stability < ALCHEMY_CALM_STABILITY),
  );
  let best: BatchAction = 'calm';
  let bestErr = Number.POSITIVE_INFINITY;
  let bestCost = Number.POSITIVE_INFINITY;
  for (const info of candidates) {
    let temp = b.temp + b.fanBonus;
    let extraCost = 0;
    switch (info.action) {
      case 'heat':
        temp += ALCHEMY_HEAT_GAIN;
        break;
      case 'cool':
        temp -= ALCHEMY_COOL_LOSS;
        break;
      case 'fan':
        temp += ALCHEMY_FAN_GAIN;
        extraCost = 1; // 抬噪声：同误差时劣后于添柴
        break;
      case 'calm':
        temp += (targetNext - temp) * ALCHEMY_CALM_PULL;
        extraCost = 0.5; // 耗稳定度：同误差时劣后于撤火
        break;
    }
    const predicted = temp + (targetNext - temp) * ALCHEMY_DRIFT;
    const err = Math.abs(predicted - targetNext);
    if (err < bestErr - 1e-9 || (Math.abs(err - bestErr) <= 1e-9 && extraCost < bestCost)) {
      bestErr = err;
      bestCost = extraCost;
      best = info.action;
    }
  }
  return best;
}

/**
 * 自动控火：按贪心走完整炉，**不消费 RNG**（噪声期望为 0，取期望值品质）。
 * 因此结果对给定 (丹方, 精通, 加成, 药力) 完全确定，重放安全。
 */
export function autoFire(
  recipe: Recipe,
  opts: { mastery: number; schoolBonus: number; cap: number },
): BatchOutcome {
  const b = startBatch({ herbs: fakeStockFor(recipe) }, recipe);
  if (!b) {
    return { quality: 1, score: 0, exploded: false, error: Number.POSITIVE_INFINITY };
  }
  while (!b.done && !b.exploded) stepBatch(b, greedyAction(b), NO_NOISE_RNG);
  return qualityOf(b, opts);
}

/** 自动控火用的零噪声 RNG：`next()` 取 1 → Box-Muller 的 gauss 恰为 0 */
const NO_NOISE_RNG: Rng = {
  next: () => 1,
  int: (a) => a,
  chance: () => false,
  pick: (xs) => {
    const x = xs[0];
    if (x === undefined) throw new Error('NO_NOISE_RNG.pick: empty');
    return x;
  },
  weighted: (xs) => {
    const x = xs[0];
    if (x === undefined) throw new Error('NO_NOISE_RNG.weighted: empty');
    return x[0];
  },
};

function fakeStockFor(recipe: Recipe): Record<string, number> {
  const stock: Record<string, number> = {};
  for (const input of recipe.inputs) stock[input.herb] = input.count;
  return stock;
}

export interface CraftResult {
  outcome: BatchOutcome;
  /** 产出的丹方 id */
  recipeId: string;
  /** 入库键（`pillId` 或 `pillId#qN`） */
  key: string;
  count: number;
  toxicity: number;
}

/** 把一炉结果落进 RunState：丹药入库（按品质分栈）+ 精通 +1 + 丹毒。炸炉则材料全损、不产丹 */
export function commitBatch(
  s: RunState,
  recipe: Recipe,
  c: ContentBundle,
  outcome: BatchOutcome,
  count = 1,
): CraftResult {
  const n = outcome.exploded ? 0 : count;
  const key = pillKey(recipe.pill, outcome.quality);
  if (n > 0) s.pills[key] = (s.pills[key] ?? 0) + n;
  const rec = s.recipes[recipe.id] ?? { known: true, mastery: 0 };
  rec.known = true;
  rec.mastery = Math.min(ALCHEMY_MASTERY_MAX, rec.mastery + 1);
  s.recipes[recipe.id] = rec;
  // 丹毒按**丹药自身阶位**计（同一丹药可由不同阶丹方炼出，丹药才是物品）
  const pillTier = pillById(c, recipe.pill)?.tier ?? recipe.tier;
  const tox = outcome.exploded
    ? 0
    : toxicityGain(s, c, toxicityOfPill(pillTier, outcome.quality) * n);
  if (tox > 0) s.toxicity = Math.min(100, s.toxicity + tox);
  return { outcome, recipeId: recipe.id, key, count: n, toxicity: tox };
}

/** UI/测试入口：一炉结束（正常或炸炉）后结算并入库 */
export function resolveBatch(
  s: RunState,
  recipe: Recipe,
  batch: BatchState,
  c: ContentBundle,
): CraftResult {
  const outcome = qualityOf(batch, {
    mastery: s.recipes[recipe.id]?.mastery ?? 0,
    schoolBonus: schoolBonusOf(s, c),
    cap: potencyCap(c, recipe),
  });
  return commitBatch(s, recipe, c, outcome, 1);
}

/** 批量炼制：消耗 5 份材料、跑一次贪心、产出 5 颗同品质（中位品质的具象化） */
export function batchRefine(
  s: RunState,
  recipe: Recipe,
  c: ContentBundle,
): CraftResult | null {
  const mastery = s.recipes[recipe.id]?.mastery ?? 0;
  if (!canAutoFire(mastery)) return null;
  if (!consumeInputs(s, recipe, ALCHEMY_BATCH_COUNT)) return null;
  const outcome = autoFire(recipe, {
    mastery,
    schoolBonus: schoolBonusOf(s, c),
    cap: potencyCap(c, recipe),
  });
  return commitBatch(s, recipe, c, outcome, ALCHEMY_BATCH_COUNT);
}

/** 自动控火并入库（mastery ≥ 门槛后可用） */
export function autoFireAndCommit(
  s: RunState,
  recipe: Recipe,
  c: ContentBundle,
): CraftResult | null {
  const mastery = s.recipes[recipe.id]?.mastery ?? 0;
  if (!canAutoFire(mastery)) return null;
  if (!consumeInputs(s, recipe, 1)) return null;
  const outcome = autoFire(recipe, {
    mastery,
    schoolBonus: schoolBonusOf(s, c),
    cap: potencyCap(c, recipe),
  });
  return commitBatch(s, recipe, c, outcome, 1);
}

/**
 * 熟练玩家的期望品质炼制（等价于贪心手动控火，不消费 RNG）。
 * 无精通门槛：供无头模拟（tools/simlib.ts）与平衡对照使用；真人 UI 走 autoFireAndCommit。
 */
export function craftExpect(s: RunState, recipe: Recipe, c: ContentBundle): CraftResult | null {
  if (!consumeInputs(s, recipe, 1)) return null;
  const outcome = autoFire(recipe, {
    mastery: s.recipes[recipe.id]?.mastery ?? 0,
    schoolBonus: schoolBonusOf(s, c),
    cap: potencyCap(c, recipe),
  });
  return commitBatch(s, recipe, c, outcome, 1);
}

// ── 药市：以悟性易药材（Phase 4 的可持续药材来源；药园属 Phase 6、宗门属 Phase 5） ──

/** 当前境界档位（1-10）：凡界按等级，仙界按 localLevel */
export function realmTier(s: RunState): number {
  const local = s.realm.arc === 'immortal' ? s.realm.level - 100 : s.realm.level;
  return Math.min(10, Math.max(1, Math.ceil(local / 10)));
}

export interface MarketOffer {
  herb: Herb;
  price: number;
}

/** 药市供货：不高于「当前档位 +1」的药材（高境界也能补低阶常备药，否则中阶丹方永远缺料） */
export function marketOffers(s: RunState, c: ContentBundle): MarketOffer[] {
  const tier = realmTier(s);
  const hi = Math.min(10, tier + 1);
  return (c.herbs ?? [])
    .filter((h) => h.tier <= hi)
    .map((herb) => ({ herb, price: Math.max(1, Math.ceil((herb.tier * HERB_MARKET_INSIGHT_PER_TIER) / 2)) }));
}

/** 购买药材：消耗悟性 + 每年限购（用 flag 记账，不新增存档字段） */
export function buyHerb(s: RunState, c: ContentBundle, herbId: string, count: number): boolean {
  const offer = marketOffers(s, c).find((o) => o.herb.id === herbId);
  if (!offer || count <= 0) return false;
  if ((s.flags['market_year'] ?? -1) !== s.year) {
    s.flags['market_year'] = s.year;
    s.flags['market_bought'] = 0;
  }
  const bought = s.flags['market_bought'] ?? 0;
  if (bought + count > HERB_MARKET_YEARLY_STOCK) return false;
  const cost = offer.price * count;
  if (s.insight < cost) return false;
  s.insight -= cost;
  s.flags['market_bought'] = bought + count;
  s.herbs[herbId] = (s.herbs[herbId] ?? 0) + count;
  return true;
}

/** 缺料时自动补货（无头模拟与 UI 的"补齐"按钮共用）：逐味补足，悟性不够就停 */
export function buyMissing(s: RunState, c: ContentBundle, recipe: Recipe): number {
  let bought = 0;
  for (const miss of missingInputs(s, recipe, 1)) {
    const need = miss.need - miss.have;
    for (let i = 0; i < need; i++) {
      if (!buyHerb(s, c, miss.herb, 1)) break;
      bought += 1;
    }
  }
  return bought;
}

// ── 丹药：分栈、服用、药力 ──

/** 中品（3）用裸 id；其余品质用 `id#q<N>` 分栈（历史事件发放的丹药视为中品） */
export function pillKey(pillId: string, quality: number): string {
  const q = Math.min(6, Math.max(1, Math.round(quality)));
  return q === 3 ? pillId : `${pillId}#q${q}`;
}

export function parsePillKey(key: string): { pillId: string; quality: number } {
  const at = key.indexOf('#q');
  if (at < 0) return { pillId: key, quality: 3 };
  return { pillId: key.slice(0, at), quality: Number(key.slice(at + 2)) || 3 };
}

export interface PillStack {
  key: string;
  def: PillDef;
  quality: number;
  count: number;
}

export function pillStacks(s: RunState, c: ContentBundle): PillStack[] {
  const out: PillStack[] = [];
  for (const [key, count] of Object.entries(s.pills)) {
    if (count <= 0) continue;
    const { pillId, quality } = parsePillKey(key);
    const def = pillById(c, pillId);
    if (!def) continue;
    out.push({ key, def, quality, count });
  }
  out.sort((a, b) => a.def.tier - b.def.tier || b.quality - a.quality || a.key.localeCompare(b.key));
  return out;
}

/** 丹方是否可用（`known` 或 unlock 条件成立；unlock 必须是确定性条件） */
export function recipeAvailable(s: RunState, recipe: Recipe, c: ContentBundle): boolean {
  if (s.recipes[recipe.id]?.known) return true;
  if (recipe.school && schoolCount(s, c, recipe.school) <= 0) return false;
  return evalUnlock(s, recipe, c);
}

function evalUnlock(s: RunState, recipe: Recipe, c: ContentBundle): boolean {
  return evalCondition(s, recipe.unlock, makeEvalCtx(c, UNLOCK_RNG), `${recipe.id}.unlock`);
}

/** unlock 求值专用：确定性条件，`chance/roll` 一律视为不通过（校验器已禁） */
const UNLOCK_RNG: Rng = {
  next: () => 0.5,
  int: (a, b) => Math.floor((a + b) / 2),
  chance: () => false,
  pick: (xs) => {
    const x = xs[0];
    if (x === undefined) throw new Error('UNLOCK_RNG.pick: empty');
    return x;
  },
  weighted: (xs) => {
    const x = xs[0];
    if (x === undefined) throw new Error('UNLOCK_RNG.weighted: empty');
    return x[0];
  },
};

export interface UseCheck {
  ok: boolean;
  reason: string;
}

/** 大境界顶：10 / 20 / … / 200 级（破境丹在此禁用，必须靠 pinnacleUp） */
export function atStageTop(level: number): boolean {
  return level % 10 === 0;
}

export function canUsePill(s: RunState, key: string, c: ContentBundle): UseCheck {
  const { pillId } = parsePillKey(key);
  const def = pillById(c, pillId);
  if (!def) return { ok: false, reason: '未知丹药' };
  if ((s.pills[key] ?? 0) <= 0) return { ok: false, reason: '存量不足' };
  if (s.dead) return { ok: false, reason: '已身殒' };
  const until = s.pillCooldown[`pill:${pillId}`] ?? 0;
  if (until > s.year) return { ok: false, reason: `药力未散（${until - s.year} 年后可再服）` };
  if (def.type === '破境' && atStageTop(s.realm.level)) {
    return { ok: false, reason: '大境界顶不可借用外力' };
  }
  return { ok: true, reason: '' };
}

export interface UseResult {
  ok: boolean;
  reason: string;
  text: string;
  quality: number;
}

/** 服用一颗丹药：即时效果 × 品质倍率 + 药力入 Z5 + 丹毒累积 */
export function usePill(s: RunState, key: string, c: ContentBundle): UseResult {
  const check = canUsePill(s, key, c);
  const { pillId, quality } = parsePillKey(key);
  const def = pillById(c, pillId);
  if (!check.ok || !def) return { ok: false, reason: check.reason, text: '', quality };
  const mult = qualityMult(quality);
  const amount = def.base * mult;

  s.pills[key] = (s.pills[key] ?? 0) - 1;
  switch (def.type) {
    case '聚气':
      s.cultivation += (s.cultivation * amount) / 100;
      break;
    case '洗髓':
      s.root += Math.round(amount);
      break;
    case '天机':
      s.luck += Math.round(amount);
      break;
    case '炼宝':
      s.artifactPower += (s.artifactPower * amount) / 100;
      break;
    case '破境':
      s.pillBreakMult = Math.max(s.pillBreakMult, 1 + (PILL_BREAK_MULT - 1) * mult);
      break;
    case '护劫':
      s.pillGuardMult = Math.min(s.pillGuardMult, 1 - (1 - PILL_GUARD_MULT) * mult);
      break;
    case '疗毒':
      s.toxicity = Math.max(0, s.toxicity - amount);
      break;
  }

  if (def.type !== '疗毒') {
    const tox = toxicityGain(s, c, toxicityOfPill(def.tier, quality));
    s.toxicity = Math.min(100, s.toxicity + tox);
  } else {
    s.toxicity = Math.max(0, s.toxicity);
  }

  const buff = s.pillBuffs.find((x) => x.type === def.type);
  const power = def.zoneBase * mult;
  if (buff) {
    buff.power = Math.max(buff.power, power);
    buff.years = Math.max(buff.years, PILL_BUFF_YEARS);
    buff.pillId = def.id;
  } else {
    s.pillBuffs.push({ pillId: def.id, type: def.type, zone: def.zone, power, years: PILL_BUFF_YEARS });
  }

  s.pillCooldown[`pill:${pillId}`] =
    s.year + (def.type === '破境' || def.type === '护劫' ? 1 : PILL_COOLDOWN_YEARS);
  if (def.type === '护劫') s.pillCooldown['pill:hejie-active'] = s.year + 1;

  return { ok: true, reason: '', text: def.text, quality };
}

/** 指定乘区的药力合计（供 selectors.ts::zones 使用） */
export function pillBuffPower(s: RunState, zone: 'z2' | 'z3' | 'z5' | 'z6' = 'z5'): number {
  let sum = 0;
  for (const buff of s.pillBuffs) {
    if (buff.zone === zone) sum += buff.power;
  }
  return sum;
}

/** 逐年递减药力；年初与年末各调用一次幂等（>=0 才保留） */
export function tickPillBuffs(s: RunState): void {
  if (s.pillBuffs.length === 0) return;
  const next: typeof s.pillBuffs = [];
  for (const buff of s.pillBuffs) {
    const years = buff.years - 1;
    if (years > 0) next.push({ ...buff, years });
  }
  s.pillBuffs = next;
}

export { ALCHEMY_MASTERY_MAX };
