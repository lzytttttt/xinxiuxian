import { artBonusOf, artById, artifactZoneMult, equippedIds, poisonBodyBonus, resonanceOf } from './arts';
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
  POWER_PRODUCT_MAX,
  REALM_MAX_MORTAL,
  SEG_BOUNDS,
  SIM_LOWWATER,
  SOFT_CAP_KNEE,
  SOFT_CAP_SLOPE,
  SPIRIT_DIV,
  STAGE_IMMORTAL,
  STAGE_MORTAL,
  TALENT_BASE,
  XIANQI_RATE,
  XIANQI_RATE_MAX,
  Z2_TIER_BASE,
  Z2_TIER_STEP,
  Z3_LOG_COEF,
  Z5_TOX_DIV,
  Z5_TOX_PENALTY_MAX,
  Z6_FATE_COEF,
  Z6_LUCK_DIV,
  ZONE_CAPS,
} from './constants';
import type { Arc, RunState } from './types/run';
import type { ContentBundle, Target } from './types/effects';

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

export function powerOf(s: RunState, c: ContentBundle): number {
  return zones(s, c).finalPower;
}

export type ZoneSourceKind =
  | 'art'
  | 'pill'
  | 'fate'
  | 'bond'
  | 'cave'
  | 'base'
  | 'synergy'
  | 'cap';

export interface ZoneSource {
  label: string;
  delta: number;
  kind: ZoneSourceKind;
}

export interface ZoneDetail {
  mult: number;
  cap: number;
  atCap: boolean;
  sources: ZoneSource[];
}

export interface ZoneBreakdown {
  /** 基础战力（G1 红线，不含乘区） */
  base: number;
  z1: ZoneDetail;
  z2: ZoneDetail;
  z3: ZoneDetail;
  z4: ZoneDetail;
  z5: ZoneDetail;
  z6: ZoneDetail;
  resonance: { id: string; name: string; mult: number; extra: string };
  rawProduct: number;
  softCapped: number;
  capApplied: boolean;
  finalPower: number;
}

/** 基础战力：G1 红线，任何 Phase 都不得改动 */
export function basePowerOf(s: RunState): number {
  return s.cultivation * (1 + s.root / SPIRIT_DIV) + s.artifactPower * (s.artifactBonus / ARTIFACT_BASE);
}

/** 软封顶（25× 以下不触发；超过后对数压缩，硬上限 POWER_PRODUCT_MAX） */
export function softCap(p: number): number {
  if (p <= SOFT_CAP_KNEE) return p;
  return Math.min(POWER_PRODUCT_MAX, SOFT_CAP_KNEE * (1 + Math.log(p / SOFT_CAP_KNEE) * SOFT_CAP_SLOPE));
}

function zoneOf(
  zone: keyof typeof ZONE_CAPS,
  rawSources: ZoneSource[],
  opts: { floor?: number; post?: { label: string; mult: number; kind: ZoneSourceKind } } = {},
): ZoneDetail {
  const cap = ZONE_CAPS[zone];
  // 0 值来源不上面板（保持面板可读；求和仍精确）
  const sources = rawSources.filter((src) => Math.abs(src.delta) > 1e-9);
  let sum = 0;
  for (const src of sources) sum += src.delta;
  let mult = Math.max(opts.floor ?? 0.1, 1 + sum);
  const atCap = mult >= cap - 1e-12;
  if (mult > cap) {
    sources.push({ label: '硬上限截断', delta: cap - mult, kind: 'cap' });
    mult = cap;
  }
  if (opts.post && opts.post.mult !== 1) {
    const before = mult;
    mult = mult * opts.post.mult;
    sources.push({ label: opts.post.label, delta: mult - before, kind: opts.post.kind });
  }
  return { mult, cap, atCap, sources };
}

function artSources(
  s: RunState,
  c: ContentBundle,
  zone: 'z1' | 'z2' | 'z3' | 'z4' | 'z6',
): ZoneSource[] {
  const out: ZoneSource[] = [];
  for (const id of equippedIds(s)) {
    const def = artById(c, id);
    const st = s.arts[id];
    if (!def || !st || st.level <= 0) continue;
    const delta = artBonusOf(def, st.level, zone);
    if (delta > 0) out.push({ label: `${def.name} L${st.level}`, delta, kind: 'art' });
  }
  return out;
}

/**
 * 六乘区明细。**这是面板与引擎共用的唯一数据源**——
 * 面板逐项 Δ 之和 + 1 必须精确等于 `mult`（验收 3.4）。
 */
export function zones(s: RunState, c: ContentBundle): ZoneBreakdown {
  const base = basePowerOf(s);

  const z1 = zoneOf('z1', artSources(s, c, 'z1'));

  const z2Sources: ZoneSource[] = [
    {
      label: '天赋灵根',
      delta: Math.max(0, talentTier(s.root) - (Z2_TIER_BASE - 1)) * Z2_TIER_STEP,
      kind: 'base',
    },
    ...artSources(s, c, 'z2'),
  ];
  const z2 = zoneOf('z2', z2Sources);

  const artMult = artifactZoneMult(s, c);
  const artDelta = Z3_LOG_COEF * Math.log10(1 + s.artifactPower * artMult);
  const artBaseDelta = Z3_LOG_COEF * Math.log10(1 + s.artifactPower);
  const z3Sources: ZoneSource[] = [];
  if (artBaseDelta > 0) z3Sources.push({ label: '法宝之力', delta: artBaseDelta, kind: 'base' });
  if (artDelta > artBaseDelta) {
    z3Sources.push({ label: '炼宝诀', delta: artDelta - artBaseDelta, kind: 'synergy' });
  }
  z3Sources.push(...artSources(s, c, 'z3'));
  const z3 = zoneOf('z3', z3Sources);

  const resonance = resonanceOf(s, c);
  const z4 = zoneOf('z4', artSources(s, c, 'z4'), {
    post: { label: resonance.name, mult: resonance.mult, kind: 'synergy' },
  });

  const z5Sources: ZoneSource[] = [];
  if (s.toxicity > 0) {
    z5Sources.push({
      label: '丹毒',
      delta: -Math.min(Z5_TOX_PENALTY_MAX, s.toxicity / Z5_TOX_DIV),
      kind: 'base',
    });
  }
  const poison = poisonBodyBonus(s, c);
  if (poison > 0) z5Sources.push({ label: '毒体', delta: poison, kind: 'synergy' });
  const z5 = zoneOf('z5', z5Sources, { floor: 1 - Z5_TOX_PENALTY_MAX });

  const z6Sources: ZoneSource[] = [{ label: '气运', delta: s.luck / Z6_LUCK_DIV, kind: 'base' }];
  for (const f of s.fates) {
    const delta = f.value * Z6_FATE_COEF;
    if (delta > 0) z6Sources.push({ label: `命格·${f.name}`, delta, kind: 'fate' });
  }
  z6Sources.push(...artSources(s, c, 'z6'));
  const z6 = zoneOf('z6', z6Sources);

  const rawProduct = z1.mult * z2.mult * z3.mult * z4.mult * z5.mult * z6.mult;
  const softCapped = softCap(rawProduct);
  return {
    base,
    z1,
    z2,
    z3,
    z4,
    z5,
    z6,
    resonance,
    rawProduct,
    softCapped,
    capApplied: softCapped < rawProduct - 1e-12,
    finalPower: base * softCapped,
  };
}

/** 记录战力最近变化（面板页脚）。变化小于 0.01% 不记 */
export function recordPowerTrail(
  s: RunState,
  c: ContentBundle,
  label: string,
  before: number,
): void {
  if (before <= 0) return;
  const after = powerOf(s, c);
  const pct = ((after - before) / before) * 100;
  if (Math.abs(pct) < 0.01) return;
  s.powerTrail = { label, pct: Math.round(pct * 10) / 10, year: s.year };
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
