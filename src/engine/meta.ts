import {
  CAVE_COST_GROWTH,
  CAVE_LEVEL_MAX,
  LEGACY_ACHIEVEMENT_PER,
  LEGACY_ASCEND_PER,
  LEGACY_CODEX_DIV,
  LEGACY_DEFECTION_MULT,
  LEGACY_LEVEL_DIV,
  LEGACY_PARTNER_LEVEL_PER,
  LEGACY_PAST_PARTNER_PER,
  LEGACY_SECT_RANK_PER,
} from './constants';
import { ROOM_META } from './cave';
import type { CaveLevels, RoomId } from './types/run';

/**
 * 跨局层公式。**本文件不 import 跨局状态类型**（验收 6.3 红线）：只吃普通结构体，
 * 由 store / simlib 边界层把 `MetaState` + 结算结果组装成 `LegacySources` 再传进来。
 */

// ── 传承点 ──

/** 局末结算的全部输入。字段都是标量或普通 map，引擎不认识 `MetaState` */
export interface LegacySources {
  /** 历史最高等级（跨局累加取 max） */
  bestLevel: number;
  /** 飞升次数 */
  ascensions: number;
  /** 证道次数 */
  zhengdao: number;
  /** 图鉴收集总数 */
  codexCount: number;
  /** 各宗门历史最高职位 */
  sectLegacy: Record<string, number>;
  /** 已解锁成就数 */
  achievements: number;
  /** 历史最高道侣羁绊等级 */
  partnerLevel: number;
  /** 历史羁绊总数 */
  pastPartnerCount: number;
  /** 本局叛宗次数 */
  defections: number;
}

export interface LegacyBreakdown {
  境界分: number;
  飞升分: number;
  图鉴分: number;
  宗门分: number;
  成就分: number;
  羁绊分: number;
  叛宗系数: number;
  total: number;
}

export function legacyPointsOf(src: LegacySources): LegacyBreakdown {
  const realm = Math.floor(Math.max(0, src.bestLevel) / LEGACY_LEVEL_DIV);
  const ascend = (src.ascensions + src.zhengdao) * LEGACY_ASCEND_PER;
  const codex = Math.floor(Math.max(0, src.codexCount) / LEGACY_CODEX_DIV);
  let sect = 0;
  for (const rank of Object.values(src.sectLegacy)) {
    if (rank > 0) sect += rank * LEGACY_SECT_RANK_PER;
  }
  const achievement = Math.max(0, src.achievements) * LEGACY_ACHIEVEMENT_PER;
  const bond =
    Math.max(0, src.partnerLevel) * LEGACY_PARTNER_LEVEL_PER +
    Math.max(0, src.pastPartnerCount) * LEGACY_PAST_PARTNER_PER;
  const defectionMult = src.defections > 0 ? LEGACY_DEFECTION_MULT : 1;
  const base = realm + ascend + codex + sect + achievement + bond;
  return {
    境界分: realm,
    飞升分: ascend,
    图鉴分: codex,
    宗门分: sect,
    成就分: achievement,
    羁绊分: bond,
    叛宗系数: defectionMult,
    total: Math.round(base * defectionMult),
  };
}

// ── 洞府升级 ──

/** 从 `level` 升到 `level+1` 的传承点成本：round(base × 1.6^level) */
export function caveUpgradeCost(room: RoomId, level: number): number {
  return Math.round((ROOM_META[room].base ?? 0) * Math.pow(CAVE_COST_GROWTH, level));
}

/** 从 0 升到 `level` 的累计成本 */
export function caveTotalCost(room: RoomId, level: number): number {
  let total = 0;
  for (let i = 0; i < level; i++) total += caveUpgradeCost(room, i);
  return total;
}

/** 六室全满的总成本（2846） */
export function caveFullCost(): number {
  let total = 0;
  for (const room of Object.keys(ROOM_META) as RoomId[]) {
    total += caveTotalCost(room, CAVE_LEVEL_MAX);
  }
  return total;
}

export function canUpgradeCave(cave: CaveLevels, room: RoomId, points: number): boolean {
  const level = cave[room] ?? 0;
  if (level >= CAVE_LEVEL_MAX) return false;
  return points >= caveUpgradeCost(room, level);
}

/** 升级一间洞府。余额不足或已满级时原样返回 */
export function upgradeCave(
  cave: CaveLevels,
  room: RoomId,
  points: number,
): { cave: CaveLevels; spent: number; points: number } {
  const level = cave[room] ?? 0;
  if (level >= CAVE_LEVEL_MAX) return { cave, spent: 0, points };
  const cost = caveUpgradeCost(room, level);
  if (points < cost) return { cave, spent: 0, points };
  return {
    cave: { ...cave, [room]: level + 1 },
    spent: cost,
    points: points - cost,
  };
}

// ── 图鉴位串（每个十六进制字符存 4 位，见 product/08-legacy-cave.md §五） ──

const HEX = '0123456789abcdef';
const POPCOUNT: readonly number[] = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];

export function orBit(bits: string, index: number): string {
  if (index < 0) return bits;
  const nib = Math.floor(index / 4);
  const shift = index % 4;
  const chars = bits.padEnd(nib + 1, '0').split('');
  const cur = parseInt(chars[nib] as string, 16);
  chars[nib] = HEX[((Number.isNaN(cur) ? 0 : cur) | (1 << shift)) & 0xf] as string;
  return chars.join('');
}

export function hasBit(bits: string, index: number): boolean {
  if (index < 0) return false;
  const nib = Math.floor(index / 4);
  if (nib >= bits.length) return false;
  const cur = parseInt(bits[nib] as string, 16);
  if (Number.isNaN(cur)) return false;
  return ((cur >> (index % 4)) & 1) === 1;
}

export function countBits(bits: string): number {
  let n = 0;
  for (let i = 0; i < bits.length; i++) {
    const v = parseInt(bits[i] as string, 16);
    if (!Number.isNaN(v)) n += POPCOUNT[v] ?? 0;
  }
  return n;
}

/** 与持久化侧的图鉴结构同构；此处刻意不 import 跨局状态类型（验收 6.3：引擎不读跨局层） */
export interface CodexLike {
  encounters: string;
  artifacts: string;
  realms: string;
  pills: string;
  arts: string;
  herbs: string;
}

export function codexCountOf(codex: CodexLike): number {
  return (
    countBits(codex.encounters) +
    countBits(codex.artifacts) +
    countBits(codex.realms) +
    countBits(codex.pills) +
    countBits(codex.arts) +
    countBits(codex.herbs)
  );
}
