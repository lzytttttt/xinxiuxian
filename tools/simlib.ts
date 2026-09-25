import { TALENT_BASE, ART_LEVEL_MAX } from '../src/engine/constants';

/** 「正常」玩家只在悟性富余到此值以上时才用药市补货（保证 build 不被药铺挤垮） */
const HERB_MARKET_SURPLUS = 30;
import {
  equipArt,
  equippedIds,
  insightCost,
  slotCount,
  upgradeArt,
} from '../src/engine/arts';
import {
  buyMissing,
  canUsePill,
  craftExpect,
  missingInputs,
  pillStacks,
  realmTier,
  recipeAvailable,
  usePill,
} from '../src/engine/alchemy';
import { STARTER_ART_IDS } from '../src/content/arts/index';
import { drawFates } from '../src/engine/fate';
import { makeRngBag } from '../src/engine/rng';
import { runRun, type AnswerFn, type RunOptions } from '../src/engine/replay';
import { powerOf, zones } from '../src/engine/selectors';
import type { CharCard } from '../src/engine/newRun';
import type { ArtDef, ContentBundle, Decision, Fate, SchoolId } from '../src/engine/types/effects';
import type { LogLine } from '../src/engine/types/log';
import type { RngBag } from '../src/engine/types/rng';
import type { DecisionRecord, RunState } from '../src/engine/types/run';

export type EventPolicy = 'first' | 'random';

/** 构筑策略：`none` = 只入账不装备不升级；`greedy` = 按边际收益贪心装备 + 升级 */
export type BuildPolicy = 'none' | 'greedy';

/**
 * 丹药策略（验收 4.3 / 4.4 的三组对照）：
 * - `none`   完全不吃丹（基线）
 * - `normal` 正常玩家：能炼就炼，优先吃高品质成长丹，丹毒 >60 用疗毒丹
 * - `naive`  无脑嗑丹不修毒：来什么吃什么，从不洗毒
 * - `poison` 毒修嗑丹：同 naive，但刻意吃低品质丹把丹毒顶满（配合毒体）
 */
export type PillPolicy = 'none' | 'normal' | 'naive' | 'poison';

export interface SimOptions extends RunOptions {
  tier?: number;
  policy?: EventPolicy;
  build?: BuildPolicy;
  /** 开局功法：`best` = 取静态评分最高的入门功法（两群体一致） */
  starter?: 'best' | 'none';
  pills?: PillPolicy;
  /** 是否允许用药市（3.1/3.2/3.5 的构筑口径关掉它，避免药铺挤占悟性预算） */
  market?: boolean;
  /** 构筑偏好流派（毒修对照组用） */
  preferSchool?: SchoolId;
  /** 开局 flag（毒修对照组需要第 4 槽才够 4 门） */
  startFlags?: Record<string, number>;
}

export interface SimOutcome {
  seed: string;
  years: number;
  level: number;
  cultivation: number;
  root: number;
  luck: number;
  power: number;
  fates: string[];
  artifacts: number;
  eventIds: string[];
  ended: string | null;
  log: LogLine[];
  decisions: DecisionRecord[];
  /** 决策次数（含开局抽卡） */
  decisionCount: number;
  /** 选项点总数：各决策展示的可见选项数之和（含开局抽卡的 3 张） */
  optionPoints: number;
  state: RunState;
}

interface Tally {
  decisions: number;
  options: number;
}

function countDecision(tally: Tally, d: Decision): void {
  tally.decisions += 1;
  tally.options += d.choices.filter((c) => c.show).length;
}

export function cardForTier(tier: number, content: ContentBundle, rng: RngBag): CharCard {
  const value = Math.max(1, (TALENT_BASE[tier] ?? 0) + 5);
  const fates: Fate[] = drawFates(content.fates, rng.fate, 2, {});
  return {
    tier,
    value,
    luck: 20,
    simPoints: 90 + tier,
    fates,
    guard: false,
  };
}

/** 无头应答策略：事件取第一个可选项（或确定性随机），机缘争夺，天劫续命。 */
function autoAnswer(
  policy: EventPolicy,
  seed: string,
  tally: Tally,
  build: BuildPolicy,
): AnswerFn {
  const rng = makeRngBag(`${seed}:policy`);
  return (d: Decision, s: RunState) => {
    countDecision(tally, d);
    if (d.source === 'system' && d.kind === 'encounter') return 'fight';
    if (d.source === 'system' && d.kind === 'tribulation') return 'continue';
    const playable = d.choices.filter((c) => c.show && c.enable);
    if (playable.length === 0) return d.choices[0]?.id ?? 'resolve';
    if (policy === 'random') return rng.misc.pick(playable).id;
    if (build === 'greedy') {
      // 构筑群体：悟性紧缺时先攒悟性（选不要悟性的选项），宽裕时为升级保留额度
      const reserve = Math.max(6, Math.floor(s.insight / 3));
      const first = playable[0]!;
      if (s.insight < 15) {
        const free = playable.find((ch) => (ch.insightCost ?? 0) === 0);
        if (free && (first.insightCost ?? 0) > 0) return free.id;
      }
      const cheap = playable.find((ch) => (ch.insightCost ?? 0) <= reserve);
      if ((first.insightCost ?? 0) > reserve && cheap) return cheap.id;
    }
    return playable[0]!.id;
  };
}

const CARD_OPTIONS = 3;

/** 静态评分：仅用玩家可见的被动数值排序（不使用隐藏战力） */
export function artStaticScore(art: ArtDef): number {
  return (
    (art.passives.z4 ?? 0) * 10 +
    (art.passives.z1 ?? 0) * 8 +
    (art.passives.z3 ?? 0) * 6 +
    (art.passives.z2 ?? 0) * 4 +
    (art.passives.z6 ?? 0) * 4
  );
}

/** 开局三选一的模拟选择：取静态评分最高者 */
export function bestStarter(content: ContentBundle): string | null {
  const pool = (content.arts ?? []).filter((a) => STARTER_ART_IDS.includes(a.id));
  if (pool.length === 0) return null;
  return [...pool].sort((a, b) => artStaticScore(b) - artStaticScore(a) || a.id.localeCompare(b.id))[0]?.id ?? null;
}

/** 构筑策略：贪心装备 + 按「边际倍率 / 悟性成本」升级（用克隆状态精确求边际，不使用隐藏信息） */
export function buildStep(s: RunState, content: ContentBundle, preferSchool?: SchoolId): void {
  const count = slotCount(s);
  for (;;) {
    let equipped = 0;
    for (let i = 0; i < count; i++) if (s.slots[i] !== null) equipped += 1;
    const z = zones(s, content);
    if (equipped < count) {
      const slot = s.slots.indexOf(null);
      let bestId: string | null = null;
      let bestRatio = 1 + 1e-9;
      for (const art of content.arts ?? []) {
        const st = s.arts[art.id];
        if (!st || st.level <= 0 || s.slots.includes(art.id)) continue;
        if (preferSchool && art.school !== preferSchool) continue;
        const probe: RunState = { ...s, slots: [...s.slots] };
        probe.slots[slot] = art.id;
        const ratio = zones(probe, content).finalPower / Math.max(1, z.finalPower);
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = art.id;
        }
      }
      if (bestId && equipArt(s, bestId, content)) continue;
      // 偏好流派已铺满 → 退回通用贪心
      if (preferSchool) {
        preferSchool = undefined;
        continue;
      }
    }
    let upId: string | null = null;
    let upRate = 0;
    for (const id of equippedIds(s)) {
      const st = s.arts[id];
      if (!st || st.level >= ART_LEVEL_MAX) continue;
      const cost = insightCost(st.level + 1);
      if (s.insight < cost) continue;
      const probe: RunState = {
        ...s,
        arts: { ...s.arts, [id]: { level: st.level + 1, insight: st.insight + cost } },
      };
      const gain = zones(probe, content).finalPower / Math.max(1, z.finalPower) - 1;
      const rate = gain / cost;
      if (rate > upRate + 1e-12) {
        upRate = rate;
        upId = id;
      }
    }
    if (!upId || !upgradeArt(s, upId, content)) break;
  }
}

/**
 * 丹药策略一步（每年一次）。炼丹用贪心期望品质（不消费 RNG），服丹按策略选栈。
 * 这是验收 4.3/4.4 的对照组实验装置：三组只差这一个函数的行为。
 */
export function pillStep(
  s: RunState,
  content: ContentBundle,
  policy: PillPolicy,
  market = true,
): void {
  if (policy === 'none') return;

  // naive/poison = 真正"无脑"：一年能炼几炉炼几炉、能嗑几颗嗑几颗（受炼丹冷却与材料限制）
  const insightAtStepStart = s.insight;
  const greedyIntake = 3;
  const recipes = [...(content.recipes ?? [])].sort((a, b) => {
    // 「正常」玩家先炼成长丹，疗毒丹只在丹毒高时补炼
    const cureA = a.type === '疗毒' ? 1 : 0;
    const cureB = b.type === '疗毒' ? 1 : 0;
    if (cureA !== cureB) return cureA - cureB;
    return a.tier - b.tier;
  });
  let crafts = 0;
  const craftedTypes = new Set<string>();
  for (const recipe of recipes) {
    if (crafts >= greedyIntake) break;
    if (recipe.type === '疗毒' && policy === 'normal' && s.toxicity <= 60) continue;
    // 同一年内不重复炼同一类丹：让聚气/洗髓/天机/炼宝四路药力都能挂上
    if (craftedTypes.has(recipe.type)) continue;
    if (!recipeAvailable(s, recipe, content)) continue;
    if (missingInputs(s, recipe, 1).length > 0) {
      // 药市补货：正常玩家只用**富余**悟性买药（功法升级优先，药铺不会挤掉 build）；
      // 无脑/毒修玩家有多少花多少 —— 这正是"不修毒"的行为特征之一
      // 药市按「每年预算」花悟性（而非余额阈值）：功法升级的悟性预算不被挤占，
      // 这也是 3.5（L90 悟性仍够满 2 门）与 Z5（药力不断档）能同时成立的前提
      const budget = policy === 'normal' ? 10 : policy === 'naive' ? 12 : 8;
      const spent = s.insight - insightAtStepStart;
      if (spent >= budget) continue;
      const before = s.insight;
      buyMissing(s, content, recipe);
      if (s.insight === before) continue;
    }
    if (missingInputs(s, recipe, 1).length > 0) continue;
    craftExpect(s, recipe, content);
    craftedTypes.add(recipe.type);
    crafts += 1;
  }

  const usable = pillStacks(s, content).filter((x) => canUsePill(s, x.key, content).ok);
  if (usable.length === 0) return;
  const cure = usable.find((x) => x.def.type === '疗毒');
  const growth = usable.filter((x) => x.def.type !== '疗毒');

  if (policy === 'normal') {
    if (cure && s.toxicity > 60) {
      usePill(s, cure.key, content);
      return;
    }
    // 正常玩家按品质从高到低嗑，一年最多 3 颗（保持药力不断档）
    for (const stack of [...growth].sort((a, b) => b.quality - a.quality).slice(0, 3)) {
      if (canUsePill(s, stack.key, content).ok) usePill(s, stack.key, content);
    }
    return;
  }

  // naive / poison：从不洗毒；poison 刻意吃最低品质（丹毒越高越好）
  const pool = policy === 'poison' ? [...growth].sort((a, b) => a.quality - b.quality) : growth;
  for (const stack of pool.slice(0, greedyIntake)) {
    if (canUsePill(s, stack.key, content).ok) usePill(s, stack.key, content);
  }
}

function toOutcome(
  content: ContentBundle,
  opts: SimOptions,
  out: ReturnType<typeof runRun>,
  tally: Tally,
): SimOutcome {
  const s = out.state;
  return {
    seed: opts.seed,
    years: out.years,
    level: s.realm.level,
    cultivation: Math.round(s.cultivation),
    root: s.root,
    luck: s.luck,
    power: Math.round(powerOf(s, content)),
    fates: s.fates.map((f) => `${f.id}:${f.value}`),
    artifacts: s.fruits.length,
    eventIds: [...s.eventLog],
    ended: out.ended,
    log: out.logs,
    decisions: out.decisions,
    decisionCount: tally.decisions + 1,
    optionPoints: tally.options + CARD_OPTIONS,
    state: s,
  };
}

function runOptions(
  opts: SimOptions,
  content: ContentBundle,
  card: CharCard | ((rng: RngBag) => CharCard) | undefined,
): RunOptions {
  const out: RunOptions = { seed: opts.seed };
  if (opts.maxYears !== undefined) out.maxYears = opts.maxYears;
  if (opts.battlePolicy !== undefined) out.battlePolicy = opts.battlePolicy;
  if (opts.startFlags) out.startFlags = opts.startFlags;
  if (card) out.card = card;
  const starterId = opts.starter === 'none' ? null : bestStarter(content);
  if (starterId) out.startArts = [starterId];
  const build = opts.build ?? 'none';
  const pills = opts.pills ?? 'none';
  const userOnYear = opts.onYear;
  if (build === 'greedy' || userOnYear || pills !== 'none') {
    out.onYear = (s, year) => {
      if (build === 'greedy') buildStep(s, content, opts.preferSchool);
      if (pills !== 'none') pillStep(s, content, pills, opts.market ?? true);
      if (userOnYear) userOnYear(s, year);
    };
  }
  return out;
}

export function simulate(content: ContentBundle, opts: SimOptions): SimOutcome {
  // 显式 card > tier 固定卡 > 引擎现抽（三者互斥）
  const card =
    opts.card ??
    (opts.tier !== undefined ? (bag: RngBag) => cardForTier(opts.tier!, content, bag) : undefined);
  const tally: Tally = { decisions: 0, options: 0 };
  const out = runRun(
    content,
    runOptions(opts, content, card),
    autoAnswer(opts.policy ?? 'first', opts.seed, tally, opts.build ?? 'none'),
  );
  return toOutcome(content, opts, out, tally);
}

/**
 * 严格重放：按记录的 `(year, kind, eventId, choiceId)` 依次应答；
 * 任一记录与实际 pending 不匹配即抛错（不静默继续）。
 */
export function replayRun(
  content: ContentBundle,
  opts: SimOptions,
  decisions: DecisionRecord[],
): SimOutcome {
  const card =
    opts.tier !== undefined ? (bag: RngBag) => cardForTier(opts.tier!, content, bag) : undefined;
  const tally: Tally = { decisions: 0, options: 0 };
  let cursor = 0;
  const answer: AnswerFn = (d, s) => {
    const rec = decisions[cursor];
    if (!rec) {
      throw new Error(
        `重放中断：缺少第 ${cursor} 条记录（实际 pending 为 ${s.year} 年 ${d.kind} ${d.eventId}）`,
      );
    }
    if (rec.year !== s.year || rec.kind !== d.kind || rec.eventId !== d.eventId) {
      throw new Error(
        `重放分歧：第 ${cursor} 条记录为 ${rec.year} 年 ${rec.kind} ${rec.eventId}，实际为 ${s.year} 年 ${d.kind} ${d.eventId}`,
      );
    }
    cursor += 1;
    countDecision(tally, d);
    return rec.choiceId;
  };
  const out = runRun(content, runOptions(opts, content, card), answer);
  if (cursor !== decisions.length) {
    throw new Error(`重放分歧：有 ${decisions.length - cursor} 条记录未被消费`);
  }
  return toOutcome(content, opts, out, tally);
}

export function logDigest(log: LogLine[]): string {
  return JSON.stringify(log);
}

export interface GoldenEntry {
  seed: string;
  level: number;
  cultivation: number;
  fates: string[];
  artifacts: number;
  eventIds: string[];
}

export function goldenEntry(o: SimOutcome): GoldenEntry {
  return {
    seed: o.seed,
    level: o.level,
    cultivation: o.cultivation,
    fates: o.fates,
    artifacts: o.artifacts,
    eventIds: o.eventIds,
  };
}

export function goldenSnapshot(content: ContentBundle, count = 50, maxYears = 200): GoldenEntry[] {
  const out: GoldenEntry[] = [];
  for (let i = 0; i < count; i++) {
    const seed = `golden-${String(i).padStart(3, '0')}`;
    out.push(goldenEntry(simulate(content, { seed, maxYears })));
  }
  return out;
}

export interface CalibrateRow {
  tier: number;
  p10: number;
  p50: number;
  p90: number;
  samples: number;
}

function percentile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * q)));
  return sorted[idx] ?? 0;
}

export function calibrate(content: ContentBundle, samplesPerTier = 200, maxYears = 200): CalibrateRow[] {
  const rows: CalibrateRow[] = [];
  for (let tier = 1; tier <= 10; tier++) {
    const levels: number[] = [];
    for (let i = 0; i < samplesPerTier; i++) {
      const seed = `cal-t${tier}-${String(i).padStart(4, '0')}`;
      levels.push(simulate(content, { seed, tier, maxYears }).level);
    }
    levels.sort((a, b) => a - b);
    rows.push({
      tier,
      p10: percentile(levels, 0.1),
      p50: percentile(levels, 0.5),
      p90: percentile(levels, 0.9),
      samples: levels.length,
    });
  }
  return rows;
}
