import {
  BOND_AID_CAP,
  BOND_AID_PARTNER_EXTRA,
  BOND_AID_PER_LEVEL,
  BOND_AFFINITY_REQ,
  BOND_FLEE_AFFINITY,
  BOND_FRIEND_Z6_PER,
  BOND_INJURY_YEARS,
  BOND_LEVEL_MAX,
  BOND_MEET_RATE,
  BOND_MEET_TARGET,
  BOND_MEET_TYPES,
  BOND_LOSE_AFFINITY,
  BOND_NEGLECT_ALERT,
  BOND_PARTNER_CULT_PER,
  BOND_RIVAL_CHANCE,
  BOND_RIVAL_LOSE_AFFINITY,
  BOND_RIVAL_LOSE_CULT,
  BOND_RIVAL_WIN_CULT,
  BOND_STRAIN_AFFINITY,
  BOND_TEACHER_INSIGHT_PER,
  BOND_WIN_AFFINITY,
  ENEMY_COMBAT,
  NPC_GROWTH_MAX,
  NPC_GROWTH_MIN,
  NPC_MAX,
  NPC_ROOT_TIER_MAX,
  NPC_ROOT_TIER_MIN,
} from './constants';
import { breakChance, levelTier, powerOf } from './selectors';
import type { BondType, ContentBundle, Npc, OriginTag, PersonalityTag } from './types/effects';
import type { LogLine } from './types/log';
import type { Rng } from './types/rng';
import type { PastPartnerRef, RunState } from './types/run';

export const PERSONALITIES: readonly PersonalityTag[] = ['刚直', '狡黠', '淡泊', '痴狂', '仁厚', '孤傲'];
export const ORIGINS: readonly OriginTag[] = ['世家', '散修', '宗门', '妖族', '皇族', '乞儿'];

/** 羁绊生效的年份判定（受伤期内的 NPC 不计入助战、不随行） */
export function isActiveAt(npc: Npc, year: number): boolean {
  return npc.alive && npc.bondType !== null && npc.bondLevel > 0 && npc.injuredUntil <= year;
}

export function isActive(s: RunState, npc: Npc): boolean {
  return isActiveAt(npc, s.year);
}

export function npcById(s: RunState, id: string): Npc | undefined {
  return s.bonds.list.find((n) => n.id === id);
}

export function bondsOfType(s: RunState, type: BondType): Npc[] {
  return s.bonds.list.filter((n) => n.bondType === type && n.bondLevel > 0 && n.alive);
}

function npcName(rng: Rng, c: ContentBundle, gender: '男' | '女', fallbackIdx: number): string {
  const pools = c.names?.npc;
  if (!pools || pools.surnames.length === 0) return `无名氏${fallbackIdx}`;
  const surname = rng.pick(pools.surnames);
  const given = pools.givenM.length > 0 && gender === '男' ? rng.pick(pools.givenM) : rng.pick(pools.givenF);
  return `${surname}${given}`;
}

/** NPC 本赛季的同步成长比（rootTier 线性映射到 60%-90%） */
export function growthRatio(rootTier: number): number {
  const span = Math.max(1, NPC_ROOT_TIER_MAX - NPC_ROOT_TIER_MIN);
  const t = Math.min(1, Math.max(0, (rootTier - NPC_ROOT_TIER_MIN) / span));
  return NPC_GROWTH_MIN + (NPC_GROWTH_MAX - NPC_GROWTH_MIN) * t;
}

function npcLocalLevel(level: number): number {
  return level > 100 ? level - 100 : level;
}

export interface CreateNpcOptions {
  type: BondType;
  /** 稳定种子：同种子已存在则直接复用（内容侧让同一个 NPC 反复出场） */
  seed?: string;
  name?: string;
  gender?: '男' | '女';
  level?: number;
}

/**
 * 生成并登记一个 NPC（确定性：全部随机量取自 `bond` 流）。
 * 名单达 `NPC_MAX` 时不再新建，返回 null —— 内容侧应把 `bond create` 视为可能失败。
 */
export function createNpc(
  s: RunState,
  rng: Rng,
  c: ContentBundle,
  opts: CreateNpcOptions,
): Npc | null {
  if (opts.seed) {
    const existing = s.bonds.list.find((n) => n.seed === opts.seed);
    if (existing) return existing;
  }
  if (s.bonds.list.length >= NPC_MAX) return null;

  const id = `npc_${s.bonds.nextId}`;
  s.bonds.nextId += 1;
  const gender = opts.gender ?? (rng.chance(0.5) ? '男' : '女');
  const npc: Npc = {
    id,
    name: opts.name ?? npcName(rng, c, gender, s.bonds.nextId),
    gender,
    rootTier: rng.int(NPC_ROOT_TIER_MIN, NPC_ROOT_TIER_MAX),
    personality: rng.pick(PERSONALITIES),
    origin: rng.pick(ORIGINS),
    level: opts.level ?? Math.max(1, s.realm.level - rng.int(0, 12)),
    affinity: BOND_AFFINITY_REQ[1] ?? 20,
    bondType: opts.type,
    bondLevel: 1,
    alive: true,
    metYear: s.year,
    neglect: 0,
    injuredUntil: 0,
    seed: opts.seed ?? `${s.seed}:npc:${id}`,
  };
  s.bonds.list.push(npc);
  return npc;
}

/** 好感变动（唯一入口：正增益同时清零 neglect —— 互动即"见到人了"） */
export function addAffinity(s: RunState, id: string, delta: number): Npc | null {
  const npc = npcById(s, id);
  if (!npc) return null;
  npc.affinity = Math.min(100, Math.max(0, npc.affinity + delta));
  if (delta > 0) npc.neglect = 0;
  syncBondLevel(npc);
  return npc;
}

/** 好感越过门槛即晋级（"互动推进"）；降级不发生，除非关系破裂 */
export function syncBondLevel(npc: Npc): void {
  if (npc.bondType === null) return;
  while (npc.bondLevel < BOND_LEVEL_MAX && npc.affinity >= (BOND_AFFINITY_REQ[npc.bondLevel + 1] ?? 999)) {
    npc.bondLevel += 1;
  }
}

/** 关系破裂：保留 NPC 与一半好感，可再结其它关系 */
export function breakBond(s: RunState, id: string): Npc | null {
  const npc = npcById(s, id);
  if (!npc) return null;
  npc.bondType = null;
  npc.bondLevel = 0;
  npc.affinity = Math.floor(npc.affinity / 2);
  return npc;
}

export function retypeBond(s: RunState, id: string, type: BondType): Npc | null {
  const npc = npcById(s, id);
  if (!npc) return null;
  npc.bondType = type;
  syncBondLevel(npc);
  return npc;
}

/**
 * 助战加成：Σ(bondLevel × 3% + 道侣额外 5%)，**硬上限 30%**（G5 红线）。
 * 这是助战进入战斗判定的唯一出口 —— 任何路径都不得绕过这里的 `Math.min`。
 */
export function aidBonus(s: RunState): number {
  let sum = 0;
  for (const npc of s.bonds.list) {
    if (!isActive(s, npc)) continue;
    sum += npc.bondLevel * BOND_AID_PER_LEVEL;
    if (npc.bondType === '道侣') sum += BOND_AID_PARTNER_EXTRA;
  }
  return Math.min(BOND_AID_CAP, sum);
}

/** 随行的 NPC（助战文案与带人代价都按这个集合计） */
export function companions(s: RunState): Npc[] {
  return s.bonds.list.filter((n) => isActive(s, n));
}

/** 师徒：每年额外悟性 +Σ L */
export function teacherInsight(s: RunState): number {
  let v = 0;
  for (const npc of bondsOfType(s, '师徒')) v += npc.bondLevel * BOND_TEACHER_INSIGHT_PER;
  return v;
}

/** 挚友：Z6 的加法来源 Σ(L × 2%) */
export function friendZ6Bonus(s: RunState): number {
  let v = 0;
  for (const npc of bondsOfType(s, '挚友')) v += npc.bondLevel * BOND_FRIEND_Z6_PER;
  return v;
}

/** 道侣双修：静修年修为增益率的加法项 Σ(L × 0.05%) */
export function partnerCultRate(s: RunState): number {
  let v = 0;
  for (const npc of bondsOfType(s, '道侣')) v += npc.bondLevel * BOND_PARTNER_CULT_PER;
  return v;
}

/** 按类型挑一个关系对象：`top` 好感最高（默认），`low` 好感最低（背叛/破裂用） */
export function pickBond(s: RunState, type: BondType, pick: 'top' | 'low' = 'top'): Npc | null {
  const list = s.bonds.list.filter((n) => isActive(s, n) && n.bondType === type);
  if (list.length === 0) return null;
  const sorted = [...list].sort(
    (a, b) => (pick === 'top' ? b.affinity - a.affinity : a.affinity - b.affinity) || a.id.localeCompare(b.id),
  );
  return sorted[0] ?? null;
}

/** 生离死别：NPC 死亡后其提供的所有加成消失（羁绊不可逆的重量来源） */
export function killNpc(s: RunState, id: string): Npc | null {
  const npc = npcById(s, id);
  if (!npc) return null;
  npc.alive = false;
  npc.bondType = null;
  npc.bondLevel = 0;
  return npc;
}

/** 背叛前置条件：该类型下「好感 ≤ 30 或长期未互动」的关系数 */
export function bondStrainCount(
  s: RunState,
  type: BondType,
  minNeglect = BOND_NEGLECT_ALERT,
): number {
  return s.bonds.list.filter(
    (n) =>
      n.alive &&
      n.bondType === type &&
      n.bondLevel > 0 &&
      (n.affinity <= BOND_STRAIN_AFFINITY || n.neglect >= minNeglect),
  ).length;
}

/** 宿敌参照战力：按境界档取该档敌区间中值 */
function rivalPower(npc: Npc): number {
  const immortal = npc.level > 100;
  const tier = levelTier(immortal ? npc.level - 100 : npc.level) + (immortal ? 10 : 0);
  const row = ENEMY_COMBAT[Math.min(ENEMY_COMBAT.length - 1, tier)];
  if (!row) return 1;
  return (row[0] + row[1]) / 2;
}

/**
 * 年常邂逅：小概率结识一个新人（关系类型限挚友/同门/宿敌）。
 * **产品文档的偏差点**：原文说羁绊事件是唯一来源；实测 35 个羁绊事件在约 200 个事件的池子里
 * 被稀释到每局 1-2 次，凑不出「3-5 段羁绊」。故把"结识"下沉为年度机制，
 * 事件则负责**深化与转折**（升级、背叛、离别）。记入 v0.1.0-06 §七。
 */
export function bondMeetTick(s: RunState, rng: Rng, c: ContentBundle): LogLine[] {
  const alive = s.bonds.list.filter((n) => n.alive).length;
  if (alive >= BOND_MEET_TARGET) return [];
  if (!rng.chance(BOND_MEET_RATE)) return [];
  const type = rng.pick(BOND_MEET_TYPES) as BondType;
  const npc = createNpc(s, rng, c, { type });
  if (!npc) return [];
  return [{ cls: 'ev2', text: `你在途中结识了${npc.name}（${npc.personality}·${npc.origin}），此后可算${type}。` }];
}

/**
 * 羁绊年度结算：NPC 同步成长（走同一张突破表）→ 宿敌论剑。
 * 好感自然衰减**不做**（那是"随机背刺"的来源）；neglect 每个成长年 +1，
 * 只有互动才能清零 —— 背叛因此永远是玩家行为的结果。
 */
export function bondTick(s: RunState, rng: Rng, c: ContentBundle): LogLine[] {
  const logs: LogLine[] = [];
  for (const npc of s.bonds.list) {
    if (!npc.alive) continue;
    npc.neglect += 1;
    const target = Math.floor(s.realm.level * growthRatio(npc.rootTier));
    if (npc.level >= target) continue;
    const p = breakChance(npc.rootTier, npcLocalLevel(npc.level), npc.level > 100 ? 'immortal' : 'mortal');
    if (rng.chance(p / 100)) npc.level += 1;
  }

  for (const npc of bondsOfType(s, '宿敌')) {
    if (npc.injuredUntil > s.year) continue;
    if (!rng.chance(BOND_RIVAL_CHANCE)) continue;
    const win = powerOf(s, c) >= rivalPower(npc);
    if (win) {
      s.cultivation += s.cultivation * BOND_RIVAL_WIN_CULT;
      addAffinity(s, npc.id, 1);
      logs.push({ cls: 'gold', text: `论剑之约：你压过${npc.name}一线，修为又进一层。` });
    } else {
      s.cultivation = Math.max(0, s.cultivation * (1 - BOND_RIVAL_LOSE_CULT));
      addAffinity(s, npc.id, -BOND_RIVAL_LOSE_AFFINITY);
      logs.push({ cls: 'red', text: `论剑再负于${npc.name}，你受了些暗伤。` });
    }
  }
  return logs;
}

/** 带人代价：胜 +2 / 败 −5 且伤停 3 年 / 逃跑 −10 */
export function companionCost(
  s: RunState,
  outcome: 'win' | 'lose' | 'flee',
): LogLine[] {
  const logs: LogLine[] = [];
  const list = companions(s);
  if (list.length === 0) return logs;
  if (outcome === 'win') {
    for (const npc of list) addAffinity(s, npc.id, BOND_WIN_AFFINITY);
    return logs;
  }
  if (outcome === 'lose') {
    for (const npc of list) {
      addAffinity(s, npc.id, -BOND_LOSE_AFFINITY);
      npc.injuredUntil = s.year + BOND_INJURY_YEARS;
    }
    logs.push({
      cls: 'red',
      text: `${list.map((n) => n.name).join('、')}为护你而伤，需静养 ${BOND_INJURY_YEARS} 年。`,
    });
    return logs;
  }
  for (const npc of list) addAffinity(s, npc.id, -BOND_FLEE_AFFINITY);
  logs.push({ cls: 'ev2', text: `你带着${list.map((n) => n.name).join('、')}转身就走，他们脸上掠过一丝失望。` });
  return logs;
}

/** 局末：道侣且羁绊 ≥ 4 才有资格进入下一世的重逢池 */
export function partnerOnRunEnd(s: RunState): PastPartnerRef | null {
  const lover = s.bonds.list.find((n) => n.bondType === '道侣' && n.alive && n.bondLevel >= 4);
  if (!lover) return null;
  return { name: lover.name, seed: lover.seed, level: lover.bondLevel };
}

/** 可被事件选中的 NPC 候选（已死亡/无关系的不入池） */
export function bondCandidates(s: RunState, type?: BondType): Npc[] {
  return s.bonds.list.filter((n) => n.alive && (type === undefined || n.bondType === type));
}
