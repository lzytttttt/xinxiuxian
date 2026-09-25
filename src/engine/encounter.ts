import {
  BATTLE_WIN_CULT_PCT,
  ENEMY_COMBAT,
  ENEMY_TIER_NAMES,
  ESCAPE_LOSE_SIM_SCALE,
  IMM_BATTLE_LOSS_HI,
  IMM_BATTLE_LOSS_LO,
  IMM_ESCAPE_LOSS_HI,
  IMM_ESCAPE_LOSS_LO,
  TIER_WEIGHTS,
} from './constants';
import { battleOutcome, displayInterval } from './power';
import { hasSynergy, swordNarrow } from './arts';
import { escapeRate, levelTier, powerOf } from './selectors';
import type { ContentBundle, Decision } from './types/effects';
import type { LogLine } from './types/log';
import type { RngBag } from './types/rng';
import type { RunState } from './types/run';

export interface EncounterPayload {
  tier: number;
  power: number;
  lo: number;
  hi: number;
  name: string;
}

export function tierWeights(ownTier: number): number[] {
  const w: number[] = [0];
  for (let t = 1; t <= 20; t++) {
    w.push(TIER_WEIGHTS[((t - 1) % 10) + 1] ?? 1);
  }
  if (ownTier >= 2) {
    for (let t = ownTier; t <= 20; t++) w[t] = (w[t] ?? 0) + (ownTier - 1);
  }
  return w;
}

export function pickEnemyTier(s: RunState, rng: RngBag): number {
  const ownTier = levelTier(s.realm.level);
  const w = tierWeights(ownTier);
  const pairs: [number, number][] = [];
  for (let t = 1; t <= 20; t++) pairs.push([t, w[t] ?? 0]);
  const rolled = rng.encounter.weighted(pairs);
  const pity = ownTier >= 3 ? ownTier - 1 : 0;
  return Math.max(rolled, pity);
}

function tierRange(tier: number): [number, number] {
  const row = ENEMY_COMBAT[tier];
  if (!row) return [1, 1];
  return [row[0], row[1]];
}

function pickName(tier: number, c: ContentBundle, rng: RngBag): string {
  const list = c.names?.encounter[String(tier)];
  if (list && list.length > 0) return rng.encounter.pick(list);
  return `${ENEMY_TIER_NAMES[tier] ?? ''}妖物`;
}

export function buildEncounter(s: RunState, rng: RngBag, c: ContentBundle): EncounterPayload {
  const tier = pickEnemyTier(s, rng);
  const [lo, hi] = tierRange(tier);
  const power = rng.encounter.int(lo, hi);
  const iv = displayInterval(power, rng.encounter, swordNarrow(s, c));
  return { tier, power, lo: iv.lo, hi: iv.hi, name: pickName(tier, c, rng) };
}

export function encounterDecision(payload: EncounterPayload, narrowed = false): Decision {
  const head = narrowed ? '（剑心通明：气息的轮廓清晰了些）' : '';
  return {
    source: 'system',
    kind: 'encounter',
    eventId: `enc_tier${payload.tier}`,
    title: '机缘',
    body: `${head}${payload.name}拦在你前路，气息隐而不发，你只能隐约觉出它的战力在 ${formatPower(payload.lo)} 到 ${formatPower(payload.hi)} 之间。`,
    choices: [
      { id: 'fight', label: '出手争夺', show: true, enable: true, hint: { risk: 2, reward: 3 } },
      { id: 'flee', label: '退避三舍', show: true, enable: true, hint: { risk: 0, reward: 0 } },
    ],
    payload,
  };
}

export function formatPower(v: number): string {
  if (v >= 100_000_000) return `约 ${(v / 100_000_000).toFixed(1)} 亿`;
  if (v >= 10_000) return `约 ${Math.round(v / 10_000)} 万`;
  return `约 ${Math.max(1, Math.round(v))}`;
}

export function resolveEncounter(
  s: RunState,
  choiceId: string,
  payload: EncounterPayload,
  rng: RngBag,
  c: ContentBundle,
): LogLine[] {
  const logs: LogLine[] = [];
  const own = powerOf(s, c);
  const immortal = s.realm.arc === 'immortal';

  if (choiceId === 'flee') {
    const tier = payload.tier;
    const rate = escapeRate(s.realm.level, tier);
    if (rng.encounter.chance(rate)) {
      s.stats.escapes += 1;
      logs.push({ cls: 'year', text: `你且战且退，甩开了${payload.name}。` });
    } else {
      if (immortal) {
        const loss = s.cultivation * (IMM_ESCAPE_LOSS_LO + rng.encounter.next() * (IMM_ESCAPE_LOSS_HI - IMM_ESCAPE_LOSS_LO));
        s.cultivation = Math.max(0, s.cultivation - loss);
      } else {
        const loss = Math.round(ESCAPE_LOSE_SIM_SCALE * rng.encounter.next() * tier + 1);
        s.simPoints = Math.max(0, s.simPoints - loss);
      }
      logs.push({ cls: 'red', text: `你转身欲走，却被${payload.name}缠住，脱身时已受了暗伤。` });
    }
    return logs;
  }

  const result = battleOutcome(own, payload.power, rng.encounter);
  s.stats.encounters += 1;
  if (result === 'win') {
    s.stats.battlesWon += 1;
    s.cultivation += payload.power * BATTLE_WIN_CULT_PCT;
    const pool = rng.encounter.int(payload.tier, payload.tier * 2);
    const gains = { simPoints: 0, root: 0, luck: 0 };
    for (let i = 0; i < pool; i++) {
      const roll = rng.encounter.int(0, 2);
      if (roll === 0) gains.simPoints += 1;
      else if (roll === 1) gains.root += 1;
      else gains.luck += 1;
    }
    s.simPoints += gains.simPoints;
    s.root += gains.root;
    s.luck += gains.luck;
    s.conquered.push({ tier: payload.tier, name: payload.name, year: s.year, power: payload.power });
    let plunder = 0;
    if (hasSynergy(s, c, 'plunder')) {
      plunder = rng.encounter.int(1, payload.tier);
      s.simPoints += plunder;
    }
    logs.push({
      cls: 'gold',
      text: `你击溃了${payload.name}，修为大涨（灵根 +${gains.root}、气运 +${gains.luck}、模拟点 +${gains.simPoints}${plunder > 0 ? `，掠夺 +${plunder}` : ''}）。`,
    });
    return logs;
  }
  if (result === 'draw') {
    logs.push({ cls: 'ev2', text: `你与${payload.name}势均力敌，纠缠许久各自退开，谁也奈何不了谁。` });
    return logs;
  }
  s.stats.battlesLost += 1;
  if (immortal) {
    const loss = s.cultivation * (IMM_BATTLE_LOSS_LO + rng.encounter.next() * (IMM_BATTLE_LOSS_HI - IMM_BATTLE_LOSS_LO));
    s.cultivation = Math.max(0, s.cultivation - loss);
  } else {
    const loss = rng.encounter.int(1, payload.tier + 1);
    s.simPoints = Math.max(0, s.simPoints - loss);
  }
  logs.push({ cls: 'red', text: `你不敌${payload.name}，重伤而退。` });
  return logs;
}
