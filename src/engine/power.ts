import { WEAK_RATIO } from './constants';
import { escapeRate, powerOf, levelTier } from './selectors';
import type { Rng } from './types/rng';
import type { RunState } from './types/run';

export type BattleResult = 'win' | 'draw' | 'lose';

export function totalPower(s: RunState): number {
  return powerOf(s);
}

export function displayInterval(power: number, rng: Rng): { lo: number; hi: number } {
  const lo = Math.max(1, Math.round(power * (0.6 + rng.next() * 0.3)));
  const hi = Math.round(power * (1.1 + rng.next() * 0.4));
  return { lo, hi };
}

export function battleOutcome(ownPower: number, hiddenPower: number, rng: Rng): BattleResult {
  if (ownPower > hiddenPower) return 'win';
  if (ownPower < hiddenPower * WEAK_RATIO) return 'lose';
  const roll = rng.next();
  if (roll < 1 / 3) return 'win';
  if (roll < 2 / 3) return 'draw';
  return 'lose';
}

export function escapeChance(s: RunState, encTier: number): number {
  return escapeRate(s.realm.level, encTier);
}

export function ownTier(s: RunState): number {
  return levelTier(s.realm.level);
}
