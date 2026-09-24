import {
  AGE_COEF_LATE,
  AGE_COEF_TEEN,
  AGE_COEF_TEEN_MAX,
  AGE_COEF_YOUNG,
  AGE_COEF_YOUNG_MAX,
  ARTIFACT_BASE,
  BREAK_CHANCE,
  BREAK_CHANCE2,
  COMBAT_COEF,
  COMBAT_COEF2,
  ESCAPE_SAME,
  ESCAPE_STEP,
  LIFESPAN_GAIN,
  LUCK_DIV,
  REALM_MAX_MORTAL,
  SEG_BOUNDS,
  SIM_LOWWATER,
  SPIRIT_DIV,
  STAGE_IMMORTAL,
  STAGE_MORTAL,
  TALENT_BASE,
  XIANQI_RATE,
  XIANQI_RATE_MAX,
} from './constants';
import type { Arc, RunState } from './types/run';
import type { Target } from './types/effects';

export function luckMult(s: RunState): number {
  return 1 + s.luck / LUCK_DIV;
}

export function levelTier(level: number): number {
  return Math.min(20, Math.max(1, Math.ceil(level / 10)));
}

export function localLevel(s: RunState): number {
  return s.realm.arc === 'immortal' ? s.realm.level - 100 : s.realm.level;
}

export function localTier(s: RunState): number {
  return s.realm.arc === 'immortal'
    ? levelTier(s.realm.level - 100) + 10
    : levelTier(s.realm.level);
}

export function talentTier(root: number): number {
  if (root > 100) return 10;
  for (let t = 10; t >= 1; t--) {
    if (root >= (TALENT_BASE[t] as number)) return t;
  }
  return 1;
}

export function talentBaseOf(tier: number, root: number): number {
  if (tier === 10 && root > 100) return 90;
  return TALENT_BASE[tier] ?? 0;
}

export function talentMult(root: number): number {
  const tier = talentTier(root);
  return 1 + (root - talentBaseOf(tier, root)) / 100;
}

export function segOf(level: number): number {
  const lvl = Math.min(100, Math.max(1, level));
  for (let i = 0; i < SEG_BOUNDS.length; i++) {
    if (lvl <= (SEG_BOUNDS[i] as number)) return i;
  }
  return SEG_BOUNDS.length - 1;
}

export function breakChance(tier: number, localLvl: number, arc: Arc): number {
  const table = arc === 'immortal' ? BREAK_CHANCE2 : BREAK_CHANCE;
  const row = table[Math.min(10, Math.max(1, tier)) - 1];
  if (!row) return 0;
  return row[segOf(localLvl)] ?? 0;
}

export function combatCoef(tier: number, arc: Arc): number {
  const table = arc === 'immortal' ? COMBAT_COEF2 : COMBAT_COEF;
  return table[Math.min(10, Math.max(1, tier))] ?? 0;
}

export function escapeRate(level: number, encTier: number): number {
  const own = levelTier(level);
  if (own > encTier) return 1;
  if (own === encTier) return ESCAPE_SAME;
  return Math.max(0, ESCAPE_SAME - ESCAPE_STEP * (encTier - own));
}

export function powerOf(s: RunState): number {
  return (
    s.cultivation * (1 + s.root / SPIRIT_DIV) + s.artifactPower * (s.artifactBonus / ARTIFACT_BASE)
  );
}

export function xianqiFateMult(s: RunState): number {
  let v = 0;
  for (const f of s.fates) {
    if (f.attr === 'xianqi') v += f.value;
  }
  return 1 + v / 100;
}

export function localStage(level: number): number {
  const local = level > REALM_MAX_MORTAL ? level - REALM_MAX_MORTAL : level;
  return Math.min(10, Math.max(1, Math.ceil(local / 10)));
}

export function heavyOf(level: number): number {
  return level % 10 === 0 ? 10 : level % 10;
}

const HEAVY_NAMES = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

export function heavyLabel(level: number): string {
  return `${HEAVY_NAMES[heavyOf(level) - 1] ?? ''}重`;
}

export function stageName(level: number): string {
  const stage = localStage(level);
  return level <= REALM_MAX_MORTAL
    ? STAGE_MORTAL[stage - 1] ?? ''
    : STAGE_IMMORTAL[stage - 1] ?? '';
}

export function realmName(level: number): string {
  return `${stageName(level)}${heavyLabel(level)}`;
}

export function lifespanGain(newLevel: number): number {
  let gain = 0;
  for (const [at, value] of LIFESPAN_GAIN) {
    if (newLevel >= at) gain = value;
  }
  return gain;
}

export function ageCoef(s: RunState): number {
  if (s.age <= AGE_COEF_YOUNG_MAX) return AGE_COEF_YOUNG;
  if (s.age <= AGE_COEF_TEEN_MAX) return AGE_COEF_TEEN;
  if (s.age > s.simPoints * SIM_LOWWATER) return AGE_COEF_LATE;
  return 1;
}

export function xianqiRate(s: RunState): number {
  if (s.realm.arc === 'immortal') return 0;
  if (s.realm.level >= REALM_MAX_MORTAL) return XIANQI_RATE_MAX;
  if (s.realm.level >= 91) return XIANQI_RATE;
  return 0;
}

export function insightPerYear(s: RunState): number {
  return 1 + Math.floor(s.realm.level / 20);
}

export function readTarget(s: RunState, t: Target): number {
  switch (t.k) {
    case 'cultivation':
      return s.cultivation;
    case 'simPoints':
      return s.simPoints;
    case 'root':
      return s.root;
    case 'luck':
      return s.luck;
    case 'artifactPower':
      return s.artifactPower;
    case 'artifactBonus':
      return s.artifactBonus;
    case 'xianqi':
      return s.xianqi;
    case 'chaosQi':
      return s.chaosQi;
    case 'insight':
      return s.insight;
    case 'toxicity':
      return s.toxicity;
    case 'herb':
      return s.herbs[t.id] ?? 0;
    case 'pill':
      return s.pills[t.id] ?? 0;
    case 'artLevel':
      return s.arts[t.id]?.level ?? 0;
    case 'artInsight':
      return s.arts[t.id]?.insight ?? 0;
    case 'sectContribution':
      return s.sect.contribution;
    case 'sectRank':
      return s.sect.rank;
    case 'bondLevel':
      return s.bonds.list.find((b) => b.id === t.id)?.level ?? 0;
    case 'bondAffinity':
      return s.bonds.list.find((b) => b.id === t.id)?.affinity ?? 0;
    case 'flag':
      return s.flags[t.id] ?? 0;
    case 'cooldown':
      return s.cooldowns[t.id] ?? 0;
    case 'realmLevel':
      return s.realm.level;
    case 'yearsStayed':
      return s.yearsStayed;
    default:
      return 0;
  }
}
