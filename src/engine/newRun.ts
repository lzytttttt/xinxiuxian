import { COMBAT_COEF, PITY_TRIGGER, TALENT_BASE, TIER_WEIGHTS } from './constants';
import { drawFates } from './fate';
import { talentTier } from './selectors';
import type { ContentBundle, Fate } from './types/effects';
import type { RngBag } from './types/rng';
import type { RunState } from './types/run';

export interface CharCard {
  tier: number;
  value: number;
  luck: number;
  simPoints: number;
  fates: Fate[];
  guard: boolean;
}

function pickTier(rng: RngBag, goldBoost: number, guard: boolean): number {
  if (guard) return 10;
  const pairs: [number, number][] = [];
  for (let t = 1; t <= 10; t++) {
    pairs.push([t, (TIER_WEIGHTS[t] ?? 1) + (t >= 6 ? goldBoost : 0)]);
  }
  return rng.root.weighted(pairs);
}

function rollTierValue(rng: RngBag, tier: number): number {
  return (TALENT_BASE[tier] ?? 0) + rng.root.int(1, 10);
}

export function drawCard(
  rng: RngBag,
  c: ContentBundle,
  opts: { goldBoost?: number; guard?: boolean } = {},
): CharCard {
  const guard = opts.guard ?? false;
  const goldBoost = opts.goldBoost ?? 0;
  const tier = pickTier(rng, goldBoost, guard);
  const value = guard ? Math.max(rollTierValue(rng, 10), 91) : rollTierValue(rng, tier);
  const luckTier = pickTier(rng, goldBoost, false);
  const luckRoll = rollTierValue(rng, luckTier);
  const luck = Math.max(luckRoll, rng.luck.int(Math.floor(value / 3), Math.floor(value / 2)));
  const simPoints = rng.misc.int(70 + tier, 110 + tier);
  const fates = drawFates(c.fates, rng.fate, 2, { goldBoost, forceGold: guard });
  return { tier, value, luck, simPoints, fates, guard };
}

export function drawCards(
  rng: RngBag,
  c: ContentBundle,
  opts: { goldBoost?: number; guard?: boolean } = {},
): CharCard[] {
  const guard = opts.guard ?? false;
  const cards: CharCard[] = [];
  for (let i = 0; i < 3; i++) {
    cards.push(
      drawCard(rng, c, {
        ...(opts.goldBoost !== undefined ? { goldBoost: opts.goldBoost } : {}),
        guard: guard && i === 0,
      }),
    );
  }
  cards.sort((a, b) => b.value - a.value || b.luck - a.luck || b.simPoints - a.simPoints);
  return cards;
}

export function pityGuard(pity: number): boolean {
  return pity >= PITY_TRIGGER;
}

export function createRun(
  seed: string,
  life: number,
  card: CharCard,
  rng: RngBag,
  opts: { runId: string; createdAt: number; battlePolicy?: RunState['battlePolicy'] },
): RunState {
  const tier = talentTier(card.value);
  const initial = (COMBAT_COEF[tier] ?? 1) * card.value * (0.75 + rng.break.next() * 0.5);
  return {
    runId: opts.runId,
    seed,
    life,
    createdAt: opts.createdAt,
    age: 0,
    year: 0,
    simPoints: card.simPoints,
    cultivation: initial,
    root: card.value,
    luck: card.luck,
    artifactPower: 0,
    artifactBonus: 100,
    xianqi: 0,
    chaosQi: 0,
    realm: { arc: 'mortal', stage: 1, level: 1 },
    fates: card.fates,
    breakthroughMult: 1,
    tribulationReqMult: 1,
    yearsStayed: 0,
    qiDeviationRisk: 0,
    innate: card.value,
    brokeThisYear: false,
    pinnacleThisYear: false,
    tribPassed: 0,
    gotSpecial: false,
    ascended: false,
    dead: false,
    ascendMode: '',
    endedReason: null,
    conquered: [],
    fruits: [],
    maxCount: {},
    arts: {},
    slots: [null, null, null, null, null, null],
    insight: 0,
    herbs: { herb_common: 6, herb_yunwu: 6, herb_qingxin: 6, herb_hanlu: 6, herb_chiteng: 6, herb_yinqi: 6 },
    recipes: {},
    pills: {},
    toxicity: 0,
    pillBuffs: [],
    pillBreakMult: 1,
    pillGuardMult: 1,
    pillCooldown: {},
    sect: { id: null, rank: 0, contribution: 0, joinedYear: null, defections: 0, tension: {} },
    bonds: { list: [], nextId: 1 },
    flags: {},
    cooldowns: {},
    onceFired: [],
    recencyQueue: [],
    deferredQueue: [],
    scheduled: [],
    chainDepth: 0,
    decisionLog: [],
    powerTrail: null,
    battlePolicy: opts.battlePolicy ?? 'manual',
    smartX: 1,
    autopilot: null,
    awaiting: null,
    stats: {
      years: 0,
      events: 0,
      encounters: 0,
      battlesWon: 0,
      battlesLost: 0,
      escapes: 0,
      artifacts: 0,
      breakthroughs: 0,
      decisions: 0,
    },
    eventLog: [],
    log: [],
  };
}
