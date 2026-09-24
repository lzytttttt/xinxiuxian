import {
  ARTIFACT_POWER_MULT,
  ARTIFACT_RATE_BASE,
  ARTIFACT_RATE_STEP,
  ENEMY_COMBAT,
  ENEMY_TIER_NAMES,
} from './constants';
import { tierWeights } from './encounter';
import { levelTier } from './selectors';
import type { ContentBundle } from './types/effects';
import type { LogLine } from './types/log';
import type { RngBag } from './types/rng';
import type { RunState } from './types/run';

export interface ArtifactPayload {
  tier: number;
  power: number;
  gain: number;
  name: string;
}

export function pickArtifactTier(s: RunState, rng: RngBag): number {
  const ownTier = levelTier(s.realm.level);
  const w = tierWeights(ownTier);
  const pairs: [number, number][] = [];
  for (let t = 1; t <= 20; t++) pairs.push([t, w[t] ?? 0]);
  const rolled = rng.artifact.weighted(pairs);
  const pity = ownTier >= 4 ? ownTier - 2 : 0;
  return Math.max(rolled, pity);
}

export function subdueRate(ownTier: number, artifactTier: number): number {
  if (ownTier >= artifactTier) return 1;
  const diff = artifactTier - ownTier;
  return Math.max(0, (ARTIFACT_RATE_BASE - ARTIFACT_RATE_STEP * (diff - 1)) / 100);
}

export function buildArtifact(s: RunState, rng: RngBag, c: ContentBundle): ArtifactPayload {
  const tier = pickArtifactTier(s, rng);
  const range = ENEMY_COMBAT[tier] ?? [1, 1];
  const power = rng.artifact.int(range[0], range[1]);
  const list = c.names?.artifact[String(tier)];
  const name =
    list && list.length > 0 ? rng.artifact.pick(list) : `${ENEMY_TIER_NAMES[tier] ?? ''}法宝`;
  return { tier, power, gain: Math.round(power * ARTIFACT_POWER_MULT), name };
}

export function resolveArtifact(s: RunState, rng: RngBag, c: ContentBundle): LogLine[] {
  const payload = buildArtifact(s, rng, c);
  const ownTier = levelTier(s.realm.level);
  const rate = subdueRate(ownTier, payload.tier);
  if (rng.artifact.chance(rate)) {
    s.artifactPower += payload.gain;
    s.fruits.push({ tier: payload.tier, name: payload.name, year: s.year, power: payload.power });
    s.stats.artifacts += 1;
    return [
      {
        cls: 'rare',
        text: `${payload.name}被你收入囊中，法宝之力 +${payload.gain}。`,
      },
    ];
  }
  return [{ cls: 'year', text: `${payload.name}灵光一闪，挣脱而去，只留下空荡的回响。` }];
}
