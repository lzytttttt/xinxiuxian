import { TALENT_BASE } from '../src/engine/constants';
import { drawFates } from '../src/engine/fate';
import { makeRngBag } from '../src/engine/rng';
import { applyChoice, rollYear } from '../src/engine/tick';
import { createRun, drawCard, type CharCard } from '../src/engine/newRun';
import type { ContentBundle, Fate } from '../src/engine/types/effects';
import type { LogLine } from '../src/engine/types/log';
import type { RngBag } from '../src/engine/types/rng';
import type { RunState } from '../src/engine/types/run';

export interface SimOptions {
  seed: string;
  life?: number;
  tier?: number;
  maxYears?: number;
  battlePolicy?: RunState['battlePolicy'];
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
  state: RunState;
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

export function simulate(content: ContentBundle, opts: SimOptions): SimOutcome {
  const maxYears = opts.maxYears ?? 200;
  const rng = makeRngBag(opts.seed);
  const card: CharCard =
    opts.tier !== undefined
      ? cardForTier(opts.tier, content, rng)
      : drawCardFor(content, rng);
  const s = createRun(opts.seed, 1, card, rng, {
    runId: `${opts.seed}#1`,
    createdAt: 0,
    battlePolicy: opts.battlePolicy ?? 'manual',
  });
  const fullLog: LogLine[] = [...s.log];
  let ended: string | null = null;

  for (let i = 0; i < maxYears; i++) {
    if (s.dead) break;
    const r = rollYear(s, rng, content);
    fullLog.push(...r.logs);
    if (r.ended) {
      ended = r.ended;
      if (!r.pending) break;
    }
    if (r.pending) {
      const choiceId = r.pending.kind === 'tribulation' ? 'continue' : 'fight';
      const applied = applyChoice(s, r.pending, choiceId, rng, content);
      fullLog.push(...applied.logs);
      if (applied.ended) {
        ended = applied.ended;
        break;
      }
    }
    if (s.dead) {
      ended = ended ?? (s.endedReason as string | null);
      break;
    }
    if (s.endedReason) {
      ended = s.endedReason;
      break;
    }
  }

  return {
    seed: opts.seed,
    years: s.year,
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
    ended,
    log: fullLog,
    state: s,
  };
}

function drawCardFor(content: ContentBundle, rng: RngBag): CharCard {
  return drawCard(rng, content, {});
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
