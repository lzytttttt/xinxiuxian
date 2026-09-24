import { FATE_ATTR_FULL, FATE_COLOR_RANGE, FATE_COLOR_WEIGHT } from './constants';
import type { Fate, FateAttr, FateColor } from './types/effects';
import type { Rng } from './types/rng';
import type { RunState } from './types/run';

export const FATE_ATTRS: readonly FateAttr[] = ['root', 'luck', 'xianqi', 'artifact', 'brk', 'trib'];

export const FATE_COLORS: readonly FateColor[] = ['green', 'blue', 'purple', 'gold'];

function colorWeights(goldBoost: number): [FateColor, number][] {
  return [
    ['green', FATE_COLOR_WEIGHT['green'] ?? 40],
    ['blue', FATE_COLOR_WEIGHT['blue'] ?? 30],
    ['purple', FATE_COLOR_WEIGHT['purple'] ?? 20],
    ['gold', (FATE_COLOR_WEIGHT['gold'] ?? 10) + goldBoost],
  ];
}

export function fateFull(attr: FateAttr): number {
  return FATE_ATTR_FULL[attr] ?? 10;
}

export function rollFateValue(attr: FateAttr, color: FateColor, rng: Rng): number {
  const [lo, hi] = FATE_COLOR_RANGE[color] ?? [0.05, 0.1];
  return Math.max(1, Math.round(fateFull(attr) * (lo + rng.next() * (hi - lo))));
}

export function midFateValue(attr: FateAttr, color: FateColor): number {
  const [lo, hi] = FATE_COLOR_RANGE[color] ?? [0.05, 0.1];
  return Math.max(1, Math.round(fateFull(attr) * ((lo + hi) / 2)));
}

export function pickFatePool(pool: Fate[], attr: FateAttr, color: FateColor): Fate | null {
  return pool.find((f) => f.attr === attr && f.color === color) ?? null;
}

export function drawFates(
  pool: Fate[],
  rng: Rng,
  count = 2,
  opts: { goldBoost?: number; forceGold?: boolean } = {},
): Fate[] {
  const goldBoost = opts.goldBoost ?? 0;
  const usedAttrs = new Set<FateAttr>();
  const out: Fate[] = [];
  const attrs = [...FATE_ATTRS];
  for (let i = 0; i < count; i++) {
    const remaining = attrs.filter((a) => !usedAttrs.has(a));
    if (remaining.length === 0) break;
    const attr = rng.pick(remaining);
    usedAttrs.add(attr);
    const color =
      opts.forceGold && i === 0 ? 'gold' : rng.weighted(colorWeights(goldBoost));
    const proto = pickFatePool(pool, attr, color);
    const value = rollFateValue(attr, color, rng);
    if (proto) {
      out.push({ ...proto, value });
    } else {
      out.push({
        id: `fate_${attr}_${color}`,
        name: attr,
        attr,
        color,
        value,
        text: '',
      });
    }
  }
  return out;
}

export function fateSum(fates: Fate[], attr: FateAttr): number {
  let total = 0;
  for (const f of fates) {
    if (f.attr === attr) total += f.value;
  }
  return total;
}

export function applyFates(s: RunState, fates: Fate[]): void {
  s.fates = fates;
  for (const f of fates) {
    switch (f.attr) {
      case 'root':
        s.root += f.value;
        break;
      case 'luck':
        s.luck += f.value;
        break;
      case 'artifact':
        s.artifactBonus += f.value;
        break;
      default:
        break;
    }
  }
  s.breakthroughMult = 1 + fateSum(fates, 'brk') / 100;
  s.tribulationReqMult = 1 - fateSum(fates, 'trib') / 100;
  if (s.tribulationReqMult < 0.1) s.tribulationReqMult = 0.1;
}
