import {
  CAVE_ALCHEMY_QUALITY_PER,
  CAVE_HERB_SURVEY,
  CAVE_PLUNDER_RELIEF_PER,
  CAVE_SCRIPT_DISCOUNT_PER,
  CAVE_STUDY_INSIGHT_PER,
  CAVE_Z1_ARRAY_PER,
  CAVE_Z1_MEDITATION_PER,
  CAVE_ROOM_STUDY,
} from './constants';
import type { CaveLevels, RoomId, RunState } from './types/run';

export const ROOMS: readonly RoomId[] = ['药园', '丹房', '藏经阁', '悟道室', '聚灵阵', '静室'];

export const ROOM_META: Readonly<Record<RoomId, { base: number; effect: string }>> = {
  药园: { base: 20, effect: `每年产「等级」株药材` },
  丹房: { base: 25, effect: `炼丹品质 +等级 × ${CAVE_ALCHEMY_QUALITY_PER}` },
  藏经阁: { base: 30, effect: `功法升级悟性 −等级 × ${CAVE_SCRIPT_DISCOUNT_PER * 100}%` },
  悟道室: { base: 35, effect: `悟性 +等级 × ${CAVE_STUDY_INSIGHT_PER}/年；L2、L4 各补一个功法槽` },
  聚灵阵: { base: 30, effect: `Z1 +等级 × ${CAVE_Z1_ARRAY_PER * 100}%` },
  静室: {
    base: 40,
    effect: `Z1 +等级 × ${CAVE_Z1_MEDITATION_PER * 100}%；额外模拟点消耗 −等级 × ${CAVE_PLUNDER_RELIEF_PER * 100}%`,
  },
};

export function emptyCave(): CaveLevels {
  return { 药园: 0, 丹房: 0, 藏经阁: 0, 悟道室: 0, 聚灵阵: 0, 静室: 0 };
}

export function caveLevel(s: RunState, room: RoomId): number {
  return s.legacyCave[room] ?? 0;
}

/** 药园年产（株/年）。分配由 `caveTick` 用年份轮转，不消耗 RNG——黄金回归（1.1）不允许多抽一次 */
export function herbYield(s: RunState): number {
  return caveLevel(s, '药园');
}

/** 丹房：并入炼丹品质加成的门派/共鸣/宗门那一层 */
export function alchemyQualityBonus(s: RunState): number {
  return caveLevel(s, '丹房') * CAVE_ALCHEMY_QUALITY_PER;
}

/** 藏经阁：功法升级悟性折扣比例（0-0.25） */
export function scriptDiscount(s: RunState): number {
  return caveLevel(s, '藏经阁') * CAVE_SCRIPT_DISCOUNT_PER;
}

/** 悟道室：每年额外悟性 */
export function studyInsight(s: RunState): number {
  return caveLevel(s, CAVE_ROOM_STUDY) * CAVE_STUDY_INSIGHT_PER;
}

/** 聚灵阵 + 静室：Z1 合计加成。Z1 有 ×3.0 硬上限（验收 6.2） */
export function z1CaveBonus(s: RunState): number {
  return (
    caveLevel(s, '聚灵阵') * CAVE_Z1_ARRAY_PER + caveLevel(s, '静室') * CAVE_Z1_MEDITATION_PER
  );
}

/**
 * 静室对「每年额外模拟点消耗」的减免倍率。
 *
 * **只作用于额外消耗（魔修协同的掠夺），不碰基础寿元**——`simPoints` 在本项目里就是寿元，
 * 整体下调等于直接买等级，与验收 6.1（20 世 ≤ 1.35×）正面相撞。理由见 v0.1.0-07 §三·2。
 */
export function plunderRelief(s: RunState): number {
  return Math.max(0, 1 - caveLevel(s, '静室') * CAVE_PLUNDER_RELIEF_PER);
}

/** 药园每年产出的药材 id：六种基础药材按年份轮转（确定性，不抽 RNG） */
export function herbOfYear(year: number): string {
  return CAVE_HERB_SURVEY[year % CAVE_HERB_SURVEY.length] as string;
}
