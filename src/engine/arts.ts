import {
  ART_INSIGHT_BASE,
  ART_INSIGHT_GROWTH,
  ART_LEVEL_MAX,
  ART_SLOTS_INITIAL,
  ART_SLOTS_TOTAL,
  MIXED_SCHOOLS_EACH,
  PLUNDER_SIM_PER_YEAR,
  POISON_BODY_TOX_MIN,
  RESONANCE_MONO2,
  RESONANCE_MONO4,
  RESONANCE_MONO6,
  RESONANCE_THREE2,
  RESONANCE_TWO3,
  SWORD_HEART_BASE,
  SWORD_HEART_LUCK,
  SWORD_HEART_NARROW_MAX,
  SWORD_HEART_PER_LUCK,
  STARTER_ART_LEVEL,
  SYNERGY_SCHOOLS,
  THUNDER_FAIL_LOSS,
  THUNDER_LUCKY_MULT,
  TOXICITY_DECAY_MULT,
  TOXICITY_GAIN_MULT,
  TREASURE_RATIO,
  Z3_TREASURE_MULT,
} from './constants';
import type { ArtDef, ContentBundle, SchoolId, ZoneId } from './types/effects';
import type { RunState } from './types/run';

export const SCHOOLS: readonly SchoolId[] = ['剑修', '丹修', '体修', '毒修', '雷修', '魔修'];

export function artById(c: ContentBundle, id: string): ArtDef | undefined {
  return c.arts?.find((a) => a.id === id);
}

/** 槽位解锁：初始 3；悟道室 L2 补 1、L4 再补 1（Phase 6）；道台现世补 1（本 Phase 实装） */
export function slotCountOf(caveStudy: number, hasDaoSeat: boolean): number {
  const cave = (caveStudy >= 2 ? 1 : 0) + (caveStudy >= 4 ? 1 : 0);
  return Math.min(ART_SLOTS_TOTAL, ART_SLOTS_INITIAL + cave + (hasDaoSeat ? 1 : 0));
}

export function slotCount(s: RunState): number {
  return slotCountOf(0, (s.flags['dao_seat'] ?? 0) > 0);
}

/** 已装备功法：slots 即权威集合（解锁范围由 equipArt 把关，读侧不做二次截断） */
export function equippedIds(s: RunState): string[] {
  return s.slots.filter((x): x is string => x !== null);
}

export function equippedArts(s: RunState, c: ContentBundle): ArtDef[] {
  return equippedIds(s)
    .map((id) => artById(c, id))
    .filter((a): a is ArtDef => a !== undefined);
}

export function schoolCounts(s: RunState, c: ContentBundle): Record<SchoolId, number> {
  const counts: Record<SchoolId, number> = { 剑修: 0, 丹修: 0, 体修: 0, 毒修: 0, 雷修: 0, 魔修: 0 };
  for (const art of equippedArts(s, c)) counts[art.school] += 1;
  return counts;
}

export function schoolCount(s: RunState, c: ContentBundle, school: SchoolId): number {
  return schoolCounts(s, c)[school] ?? 0;
}

/** 升到 `level` 的悟性成本：round(3 × 1.35^(level−2))；L2=3 … L10=33，满级累计 118 */
export function insightCost(level: number): number {
  if (level <= 1) return 0;
  return Math.round(ART_INSIGHT_BASE * Math.pow(ART_INSIGHT_GROWTH, level - 2));
}

export function upgradeCostOf(s: RunState, id: string, c: ContentBundle): number | null {
  const art = s.arts[id];
  const def = artById(c, id);
  if (!def || !art || art.level <= 0) return null;
  if (art.level >= ART_LEVEL_MAX) return null;
  return insightCost(art.level + 1);
}

/** 升级（消耗悟性）。返回是否升级成功 */
export function upgradeArt(s: RunState, id: string, c: ContentBundle): boolean {
  const cost = upgradeCostOf(s, id, c);
  if (cost === null || s.insight < cost) return false;
  const art = s.arts[id];
  if (!art) return false;
  s.insight -= cost;
  art.level += 1;
  art.insight += cost;
  return true;
}

export function isEquipped(s: RunState, id: string): boolean {
  return s.slots.includes(id);
}

/** 装备到首个空槽（仅在解锁范围内）。返回是否成功 */
export function equipArt(s: RunState, id: string, c: ContentBundle): boolean {
  const art = s.arts[id];
  if (!art || art.level <= 0) return false;
  if (isEquipped(s, id)) return false;
  if (!artById(c, id)) return false;
  const count = slotCount(s);
  for (let i = 0; i < count; i++) {
    if (s.slots[i] === null) {
      s.slots[i] = id;
      return true;
    }
  }
  return false;
}

export function unequipArt(s: RunState, id: string): boolean {
  const i = s.slots.indexOf(id);
  if (i < 0) return false;
  s.slots[i] = null;
  return true;
}

export function grantArt(s: RunState, id: string, c: ContentBundle): boolean {
  if (!artById(c, id)) return false;
  const art = s.arts[id] ?? { level: 0, insight: 0 };
  if (art.level === 0) art.level = 1;
  s.arts[id] = art;
  return true;
}

/** 入道起手功法：直接以 STARTER_ART_LEVEL 起手（开局三选一用；事件奖励仍为 1 级） */
export function grantStarterArt(s: RunState, id: string, c: ContentBundle): boolean {
  if (!grantArt(s, id, c)) return false;
  const art = s.arts[id];
  if (art && art.level < STARTER_ART_LEVEL) art.level = STARTER_ART_LEVEL;
  return true;
}

/** 功法被动：L 级贡献 = 值 × L（区内加法） */
export function artBonusOf(art: ArtDef, level: number, zone: ZoneId): number {
  const per = art.passives[zone];
  if (!per) return 0;
  return per * level;
}

export type ResonanceId = 'none' | 'mono2' | 'mono4' | 'mono6' | 'three2' | 'two3';

export interface Resonance {
  id: ResonanceId;
  name: string;
  mult: number;
  extra: string;
}

const RESONANCE_NAMES: Record<ResonanceId, string> = {
  none: '散修',
  mono2: '共鸣·一重',
  mono4: '共鸣·二重',
  mono6: '共鸣·极意',
  three2: '万法归一',
  two3: '阴阳互济',
};

function resonanceResult(id: ResonanceId, mult: number, extra = ''): Resonance {
  return { id, name: RESONANCE_NAMES[id], mult, extra };
}

/** 共鸣判定（统计已装备功法）。优先级：极意 > 阴阳互济 > 万法归一 > 二重 > 一重 > 散修 */
export function resonanceOf(s: RunState, c: ContentBundle): Resonance {
  const counts = Object.values(schoolCounts(s, c));
  const max = Math.max(0, ...counts);
  const atLeast2 = counts.filter((n) => n >= 2).length;
  const exactly3 = counts.filter((n) => n === 3).length;
  if (max >= 6) return resonanceResult('mono6', RESONANCE_MONO6, '解锁该流派极意');
  if (exactly3 === 2) return resonanceResult('two3', RESONANCE_TWO3, '丹毒衰减 ×1.5');
  if (atLeast2 >= 3) return resonanceResult('three2', RESONANCE_THREE2, '丹药品质 +10%');
  if (max >= 4) return resonanceResult('mono4', RESONANCE_MONO4);
  if (max >= 2) return resonanceResult('mono2', RESONANCE_MONO2);
  return resonanceResult('none', 1);
}

export type SynergyId =
  | 'swordHeart'
  | 'poisonBody'
  | 'fireImmunity'
  | 'treasureArt'
  | 'thunderBody'
  | 'plunder';

export interface Synergy {
  id: SynergyId;
  name: string;
  desc: string;
  active: boolean;
}

/** 六条协同（本 Phase 全部判定可生效；部分效果的载体随 Phase 4/5/6 接入） */
export function synergiesOf(s: RunState, c: ContentBundle): Record<SynergyId, boolean> {
  const n = schoolCounts(s, c);
  return {
    swordHeart: (n['剑修'] ?? 0) >= SYNERGY_SCHOOLS && s.luck >= SWORD_HEART_LUCK,
    poisonBody: (n['毒修'] ?? 0) >= SYNERGY_SCHOOLS,
    fireImmunity: (n['丹修'] ?? 0) >= MIXED_SCHOOLS_EACH && (n['体修'] ?? 0) >= MIXED_SCHOOLS_EACH,
    treasureArt:
      (n['体修'] ?? 0) >= SYNERGY_SCHOOLS && s.artifactPower > s.cultivation * TREASURE_RATIO,
    thunderBody: (n['雷修'] ?? 0) >= SYNERGY_SCHOOLS,
    plunder: (n['魔修'] ?? 0) >= SYNERGY_SCHOOLS,
  };
}

export function hasSynergy(s: RunState, c: ContentBundle, id: SynergyId): boolean {
  return synergiesOf(s, c)[id] ?? false;
}

/** 剑心通明收窄比例（0 = 未生效）；硬上限 50%（G3） */
export function swordNarrow(s: RunState, c: ContentBundle): number {
  if (!hasSynergy(s, c, 'swordHeart')) return 0;
  return Math.min(SWORD_HEART_NARROW_MAX, SWORD_HEART_BASE + s.luck * SWORD_HEART_PER_LUCK);
}

/** 丹火不侵：丹毒获取 ×0.5（Phase 4 丹药走同一入口，事件加毒在本 Phase 即生效） */
export function toxicityGain(s: RunState, c: ContentBundle, value: number): number {
  return hasSynergy(s, c, 'fireImmunity') ? value * TOXICITY_GAIN_MULT : value;
}

/** 丹火不侵：丹毒衰减 ×2 */
export function toxicityDecayMult(s: RunState, c: ContentBundle): number {
  return hasSynergy(s, c, 'fireImmunity') ? TOXICITY_DECAY_MULT : 1;
}

/** 雷罚加身：天劫侥幸概率 ×1.5 */
export function luckyTribMult(s: RunState, c: ContentBundle): number {
  return hasSynergy(s, c, 'thunderBody') ? THUNDER_LUCKY_MULT : 1;
}

/** 毒体：丹毒 > 50 时 Z5 的额外来源 */
export function poisonBodyBonus(s: RunState, c: ContentBundle): number {
  if (!hasSynergy(s, c, 'poisonBody')) return 0;
  if (s.toxicity <= POISON_BODY_TOX_MIN) return 0;
  return s.toxicity / 100;
}

/** 炼宝诀：Z3 中法宝之力的计入倍率 */
export function artifactZoneMult(s: RunState, c: ContentBundle): number {
  return hasSynergy(s, c, 'treasureArt') ? Z3_TREASURE_MULT : 1;
}

/** 雷修核心：突破概率随已装备雷修功法提升 */
export function thunderBreakMult(s: RunState, c: ContentBundle): number {
  return 1 + 0.02 * schoolCount(s, c, '雷修');
}

/** 雷罚加身：突破失败（当年未破境）时的修为损失比例 */
export function thunderFailLoss(s: RunState, c: ContentBundle): number {
  return hasSynergy(s, c, 'thunderBody') ? THUNDER_FAIL_LOSS : 0;
}

/** 掠夺：每年额外消耗的模拟点 */
export function plunderDrain(s: RunState, c: ContentBundle): number {
  return hasSynergy(s, c, 'plunder') ? PLUNDER_SIM_PER_YEAR : 0;
}
