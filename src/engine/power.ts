import { WEAK_RATIO } from './constants';
import { escapeRate, powerOf, levelTier } from './selectors';
import type { ContentBundle } from './types/effects';
import type { Rng } from './types/rng';
import type { RunState } from './types/run';

export type BattleResult = 'win' | 'draw' | 'lose';

export function totalPower(s: RunState, c: ContentBundle): number {
  return powerOf(s, c);
}

/** `narrow` = 区间收窄比例（0~0.5，剑心通明；硬上限见 SWORD_HEART_NARROW_MAX） */
export function displayInterval(
  power: number,
  rng: Rng,
  narrow = 0,
): { lo: number; hi: number } {
  const k = 1 - Math.min(0.5, Math.max(0, narrow));
  const lo = Math.max(1, Math.round(power * (1 + (0.6 + rng.next() * 0.3 - 1) * k)));
  const hi = Math.round(power * (1 + (1.1 + rng.next() * 0.4 - 1) * k));
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
