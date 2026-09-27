import {
  ACHIEVEMENTS,
  goldBoostOf,
  newlyUnlocked,
  type AchievementFacts,
} from '../content/achievements';
import { PAST_LIVES_LIMIT, PAST_PARTNERS_LIMIT } from '../engine/constants';
import { partnerOnRunEnd } from '../engine/bonds';
import { codexCountOf, legacyPointsOf, orBit, type LegacyBreakdown } from '../engine/meta';
import type { ContentBundle } from '../engine/types/effects';
import type { LifeSummary, MetaState } from '../engine/types/meta';
import type { PastPartnerRef, RunState } from '../engine/types/run';

/* 局末结算。**纯函数，无 store / 无 DOM**——UI 的 `useMetaStore` 与无头的 `tools/sim.ts --lives`
   共用同一条结算路径，避免"模拟器与真实游戏算出不同传承点"。 */

export interface SettleInput {
  state: RunState;
  content: ContentBundle;
  /** 局末总战力 */
  power: number;
}

export interface SettleResult {
  meta: MetaState;
  /** 本局结算到的传承点 */
  gained: number;
  unlocked: string[];
  breakdown: LegacyBreakdown;
}

/** 丹药栈按 `id` / `id#qN` 分品质存，图鉴按 id 去重计数 */
function distinctPillCount(pills: Record<string, number>): number {
  const ids = new Set<string>();
  for (const [k, v] of Object.entries(pills)) {
    if (v > 0) ids.add(k.split('#')[0] as string);
  }
  return ids.size;
}

function recordCodex(prev: MetaState, s: RunState, c: ContentBundle): MetaState['codex'] {
  let encounters = prev.codex.encounters;
  // 机缘档位只存在于决策记录里（`enc_tier{N}`），RunState 本身不留档位字段
  for (const d of s.decisionLog) {
    if (d.kind !== 'encounter') continue;
    const tier = Number(d.eventId.replace('enc_tier', ''));
    if (Number.isFinite(tier) && tier >= 1) encounters = orBit(encounters, tier - 1);
  }
  let artifacts = prev.codex.artifacts;
  for (const f of [...s.fruits, ...s.conquered]) {
    if (f.tier >= 1) artifacts = orBit(artifacts, f.tier - 1);
  }
  let realms = prev.codex.realms;
  if (s.realm.level >= 1 && s.realm.level <= 20) realms = orBit(realms, s.realm.level - 1);
  let arts = prev.codex.arts;
  (c.arts ?? []).forEach((def, i) => {
    if ((s.arts[def.id]?.level ?? 0) > 0) arts = orBit(arts, i);
  });
  let herbs = prev.codex.herbs;
  (c.herbs ?? []).forEach((def, i) => {
    if ((s.herbs[def.id] ?? 0) > 0) herbs = orBit(herbs, i);
  });
  let pills = prev.codex.pills;
  (c.pills ?? []).forEach((def, i) => {
    for (const [k, v] of Object.entries(s.pills)) {
      if (v > 0 && k.split('#')[0] === def.id) {
        pills = orBit(pills, i);
        break;
      }
    }
  });
  return { encounters, artifacts, realms, pills, arts, herbs };
}

/**
 * 顺序很重要：图鉴 / 宗门职位 / 前世道侣先落地，再据此组 `AchievementFacts`，
 * 最后才结算成就与传承点——所以本局挣到的图鉴与职位**当世就计入**传承分。
 */
export function settleRun(prev: MetaState, input: SettleInput): SettleResult {
  const { state: s, content: c, power } = input;

  const sectLegacy = { ...prev.sectLegacy };
  if (s.sect.id !== null && s.sect.rank > 0) {
    sectLegacy[s.sect.id] = Math.max(sectLegacy[s.sect.id] ?? 0, s.sect.rank);
  }

  const partner = partnerOnRunEnd(s);
  const pastPartners = partner
    ? [
        { name: partner.name, seed: partner.seed, life: s.life, level: partner.level },
        ...prev.pastPartners.filter((p) => p.seed !== partner.seed),
      ].slice(0, PAST_PARTNERS_LIMIT)
    : prev.pastPartners;

  const codex = recordCodex(prev, s, c);
  const unlocks = {
    arts: [...new Set([...prev.unlocks.arts, ...Object.keys(s.arts)])],
    recipes: [
      ...new Set([
        ...prev.unlocks.recipes,
        ...Object.entries(s.recipes)
          .filter(([, v]) => v.known)
          .map(([k]) => k),
      ]),
    ],
    sects: [...new Set([...prev.unlocks.sects, ...(s.sect.id ? [s.sect.id] : [])])],
  };

  const summary: LifeSummary = {
    life: s.life,
    level: s.realm.level,
    power: Math.round(power),
    years: s.stats.years,
    reason: (s.endedReason ?? 'simDepleted') as LifeSummary['reason'],
    ascendMode: s.ascendMode,
    fates: s.fates.map((f) => f.name),
  };
  const pastLives = [summary, ...prev.pastLives].slice(0, PAST_LIVES_LIMIT);

  const totals = {
    runs: prev.totals.runs + 1,
    years: prev.totals.years + s.stats.years,
    ascensions: prev.totals.ascensions + (s.ascended ? 1 : 0),
    zhengdao: prev.totals.zhengdao + (s.ascendMode === 'zhengdao' ? 1 : 0),
    bestLevel: Math.max(prev.totals.bestLevel, s.realm.level),
  };

  const sectRanks = Object.values(sectLegacy).reduce((a, b) => a + b, 0);
  const sectBest = Object.values(sectLegacy).reduce((a, b) => Math.max(a, b), 0);
  const partnerBest = pastPartners.reduce((a, b) => Math.max(a, b.level), 0);
  const caveLevels = Object.values(prev.cave).reduce((a, b) => a + b, 0);

  const facts: AchievementFacts = {
    life: totals.runs,
    level: s.realm.level,
    root: s.root,
    luck: s.luck,
    years: s.stats.years,
    breakthroughs: s.stats.breakthroughs,
    events: s.stats.events,
    encounters: s.stats.encounters,
    battlesWon: s.stats.battlesWon,
    escapes: s.stats.escapes,
    artifacts: s.fruits.length,
    conquered: s.conquered.length,
    fates: s.fates.length,
    pillStacks: distinctPillCount(s.pills),
    tribulations: s.tribPassed,
    ascensions: totals.ascensions,
    zhengdao: totals.zhengdao,
    bestPower: Math.max(bestPowerOf(prev), power),
    codexCount: codexCountOf(codex),
    sectRanks,
    sectBest,
    partners: pastPartners.length,
    partnerBest,
    bondsTotal: s.bonds.list.filter((n) => n.alive && n.bondType !== null).length,
    legacy: prev.lifetimeLegacy,
    achievements: prev.achievements.length,
    caveLevels,
  };

  const unlocked = newlyUnlocked(facts, prev.achievements);
  const achievements = [...prev.achievements, ...unlocked];

  const breakdown = legacyPointsOf({
    bestLevel: totals.bestLevel,
    ascensions: totals.ascensions,
    zhengdao: totals.zhengdao,
    codexCount: facts.codexCount,
    sectLegacy,
    achievements: achievements.length,
    partnerLevel: partnerBest,
    pastPartnerCount: pastPartners.length,
    defections: s.sect.defections,
  });

  return {
    gained: breakdown.total,
    breakdown,
    unlocked,
    meta: {
      ...prev,
      legacyPoints: prev.legacyPoints + breakdown.total,
      lifetimeLegacy: prev.lifetimeLegacy + breakdown.total,
      unlocks,
      sectLegacy,
      pastLives,
      pastPartners,
      achievements,
      codex,
      totals,
    },
  };
}

/** 历史最高总战力存在 `pastLives` 里（`MetaTotals` 没有这个字段） */
export function bestPowerOf(meta: MetaState): number {
  return meta.pastLives.reduce((a, b) => Math.max(a, b.power), 0);
}

/** 下一世注入引擎的跨局数据（引擎不读 MetaState，验收 6.3） */
export function legacyInjection(meta: MetaState): {
  cave: MetaState['cave'];
  pastPartner: PastPartnerRef | null;
  goldBoost: number;
} {
  const top = meta.pastPartners[0];
  return {
    cave: meta.cave,
    pastPartner: top ? { name: top.name, seed: top.seed, level: top.level } : null,
    goldBoost: goldBoostOf(meta.achievements),
  };
}

export { ACHIEVEMENTS };
