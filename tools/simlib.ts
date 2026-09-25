import { TALENT_BASE } from '../src/engine/constants';
import { drawFates } from '../src/engine/fate';
import { makeRngBag } from '../src/engine/rng';
import { runRun, type AnswerFn, type RunOptions } from '../src/engine/replay';
import type { CharCard } from '../src/engine/newRun';
import type { ContentBundle, Decision, Fate } from '../src/engine/types/effects';
import type { LogLine } from '../src/engine/types/log';
import type { RngBag } from '../src/engine/types/rng';
import type { DecisionRecord, RunState } from '../src/engine/types/run';

export type EventPolicy = 'first' | 'random';

export interface SimOptions extends RunOptions {
  tier?: number;
  policy?: EventPolicy;
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
function autoAnswer(policy: EventPolicy, seed: string, tally: Tally): AnswerFn {
  const rng = makeRngBag(`${seed}:policy`);
  return (d: Decision) => {
    countDecision(tally, d);
    if (d.source === 'system' && d.kind === 'encounter') return 'fight';
    if (d.source === 'system' && d.kind === 'tribulation') return 'continue';
    const playable = d.choices.filter((c) => c.show && c.enable);
    if (playable.length === 0) return d.choices[0]?.id ?? 'resolve';
    if (policy === 'random') return rng.misc.pick(playable).id;
    return playable[0]!.id;
  };
}

const CARD_OPTIONS = 3;

function toOutcome(opts: SimOptions, out: ReturnType<typeof runRun>, tally: Tally): SimOutcome {
  const s = out.state;
  return {
    seed: opts.seed,
    years: out.years,
    level: s.realm.level,
    cultivation: Math.round(s.cultivation),
    root: s.root,
    luck: s.luck,
    power: Math.round(
      s.cultivation * (1 + s.root / 500) + s.artifactPower * (s.artifactBonus / 100),
    ),
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
  card: CharCard | ((rng: RngBag) => CharCard) | undefined,
): RunOptions {
  const out: RunOptions = { seed: opts.seed };
  if (opts.maxYears !== undefined) out.maxYears = opts.maxYears;
  if (opts.battlePolicy !== undefined) out.battlePolicy = opts.battlePolicy;
  if (card) out.card = card;
  return out;
}

export function simulate(content: ContentBundle, opts: SimOptions): SimOutcome {
  const card =
    opts.tier !== undefined ? (bag: RngBag) => cardForTier(opts.tier!, content, bag) : undefined;
  const tally: Tally = { decisions: 0, options: 0 };
  const out = runRun(
    content,
    runOptions(opts, card),
    autoAnswer(opts.policy ?? 'first', opts.seed, tally),
  );
  return toOutcome(opts, out, tally);
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
  const out = runRun(content, runOptions(opts, card), answer);
  if (cursor !== decisions.length) {
    throw new Error(`重放分歧：有 ${decisions.length - cursor} 条记录未被消费`);
  }
  return toOutcome(opts, out, tally);
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
