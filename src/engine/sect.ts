import {
  DEFECT_EVENT,
  DEFECT_INVITE_COOLDOWN,
  SOFT_CAP_KNEE,
  SECT_ART_RANK,
  SECT_CONTRIB_BOND_PER,
  SECT_DEFECT_KEEP,
  SECT_DEFECT_TENSION,
  SECT_PROMOTE,
  SECT_RANK_NAMES,
  SECT_REFUSE_TENSION,
  SECT_STIPEND_HERB,
  SECT_STIPEND_INSIGHT,
  SECT_STIPEND_PILL,
  SECT_TENSION_DECAY,
  SECT_TENSION_MAX,
  TOURNAMENT_EVERY,
  TOURNAMENT_INSIGHT_TEN,
  TOURNAMENT_POOL_BASE,
  TOURNAMENT_POOL_PER_RANK,
  TOURNAMENT_REWARD_FIFTY,
  TOURNAMENT_REWARD_FIRST,
  TOURNAMENT_REWARD_TEN,
} from './constants';
import { bondsOfType } from './bonds';
import { buildEventDecision } from './interpret';
import { realmName, zones } from './selectors';
import type {
  Choice,
  ContentBundle,
  Decision,
  Effect,
  EventDef,
  MissionDef,
  SectDef,
} from './types/effects';
import type { LogLine } from './types/log';
import type { Rng } from './types/rng';
import type { RunState } from './types/run';

export function sectById(c: ContentBundle, id: string | null): SectDef | undefined {
  if (!id) return undefined;
  return c.sects?.find((s) => s.id === id);
}

export function rankName(rank: number): string {
  return SECT_RANK_NAMES[Math.max(0, Math.min(SECT_RANK_NAMES.length - 1, rank))] ?? '外门弟子';
}

export function sectName(c: ContentBundle, id: string | null): string {
  if (!id) return '无门无派';
  return sectById(c, id)?.name ?? id;
}

export function allSects(c: ContentBundle): SectDef[] {
  return c.sects ?? [];
}

// ── 入宗 / 叛宗 ──

function initTension(s: RunState, c: ContentBundle): void {
  s.sect.tension = {};
  for (const def of allSects(c)) s.sect.tension[def.id] = 0;
}

/**
 * 加入宗门。**换宗即叛宗**：已在他宗时转投会记 `defections++`，并按旧贡献的
 * `SECT_DEFECT_KEEP` 起算（见 v0.1.0-06 §三·2.4）。
 */
export function joinSect(s: RunState, id: string, c: ContentBundle, contribution = 0): boolean {
  if (!sectById(c, id)) return false;
  const prev = s.sect.id;
  const swapping = prev !== null && prev !== id;
  if (swapping) s.sect.defections += 1;
  s.sect.id = id;
  s.sect.rank = 0;
  s.sect.contribution = swapping ? Math.floor(s.sect.contribution * SECT_DEFECT_KEEP) : contribution;
  s.sect.joinedYear = s.year;
  if (prev === null) initTension(s, c);
  return true;
}

export function leaveSect(s: RunState, defect: boolean): void {
  s.sect.id = null;
  s.sect.rank = 0;
  s.sect.contribution = 0;
  s.sect.joinedYear = null;
  s.sect.tension = {};
  s.sect.inviteFrom = null;
  if (defect) s.sect.defections += 1;
}

/** 叛宗邀请的裁决：接受 → 转投邀请方；拒绝 → 张力回落、邀请方清空 */
export function decideDefect(s: RunState, accept: boolean, c: ContentBundle): LogLine[] {
  const from = s.sect.inviteFrom;
  if (!from) return [];
  const fromName = sectById(c, from)?.name ?? from;
  s.sect.inviteFrom = null;
  if (!accept) {
    refuseDefect(s, from);
    return [{ cls: 'ev2', text: `你谢绝了${fromName}的招揽，恩怨暂且揭过。` }];
  }
  const oldName = sectById(c, s.sect.id)?.name ?? '旧宗门';
  const kept = Math.floor(s.sect.contribution * SECT_DEFECT_KEEP);
  joinSect(s, from, c, 0);
  s.cooldowns[DEFECT_EVENT] = s.year + DEFECT_INVITE_COOLDOWN;
  const logs: LogLine[] = [
    { cls: 'gold', text: `你自${oldName}叛出，转投${fromName}门下。` },
  ];
  if (kept > 0) logs.push({ cls: 'ev2', text: `旧日功勋折去大半，新宗门许你 ${kept} 点贡献。` });
  logs.push({ cls: 'red', text: '叛徒之名传出，旧宗门的追杀令已在路上。' });
  return logs;
}

/** 拒绝叛宗邀请：张力回落 */
export function refuseDefect(s: RunState, sectId: string): void {
  addTension(s, sectId, -SECT_REFUSE_TENSION);
}

// ── 张力 ──

export function tensionOf(s: RunState, id: string): number {
  return s.sect.tension[id] ?? 0;
}

export function addTension(s: RunState, id: string, delta: number): number {
  const next = Math.max(0, Math.min(SECT_TENSION_MAX, tensionOf(s, id) + delta));
  s.sect.tension[id] = next;
  return next;
}

export function tensionTick(s: RunState): void {
  for (const [id, v] of Object.entries(s.sect.tension)) {
    if (v > 0) s.sect.tension[id] = Math.max(0, v - SECT_TENSION_DECAY);
  }
}

/** 满足叛宗条件的对方宗门（张力 ≥ 80；入宗年当年不触发，给玩家一局缓冲） */
export function defectTargets(s: RunState): string[] {
  if (s.sect.id === null) return [];
  return Object.entries(s.sect.tension)
    .filter(([id, v]) => id !== s.sect.id && v >= SECT_DEFECT_TENSION)
    .map(([id]) => id);
}

// ── 贡献与晋升 ──

/** 同门羁绊：每级 +10%（唯一入口 —— 所有贡献都从这里过） */
export function contributionMult(s: RunState): number {
  let v = 1;
  if (s.sect.id === null) return v;
  for (const npc of bondsOfType(s, '同门')) v += npc.bondLevel * SECT_CONTRIB_BOND_PER;
  return v;
}

export function addContribution(s: RunState, value: number): number {
  if (s.sect.id === null || value <= 0) return 0;
  const gained = Math.round(value * contributionMult(s));
  s.sect.contribution += gained;
  return gained;
}

/** 达到门槛即在当年晋升（单向，贡献不清零）；返回新职位名或 null */
export function promoteIfEligible(s: RunState): string | null {
  if (s.sect.id === null) return null;
  let promoted: string | null = null;
  while (s.sect.rank < SECT_PROMOTE.length - 1) {
    const need = SECT_PROMOTE[s.sect.rank + 1] ?? Number.POSITIVE_INFINITY;
    if (s.sect.contribution < need) break;
    s.sect.rank += 1;
    promoted = rankName(s.sect.rank);
  }
  return promoted;
}

// ── 俸禄（tick 槽 6） ──

/** 俸禄药材/丹药按此档发放（对齐当前境界档） */
export function stipendTier(s: RunState): number {
  const immortal = s.realm.arc === 'immortal';
  const own = immortal ? s.realm.level - 100 : s.realm.level;
  const tier = Math.ceil(Math.min(100, Math.max(1, own)) / 10);
  return Math.max(1, Math.min(10, tier));
}

function herbPool(c: ContentBundle, tier: number): string[] {
  const ids = (c.herbs ?? []).filter((h) => h.tier === tier).map((h) => h.id);
  if (ids.length > 0) return ids;
  return (c.herbs ?? []).map((h) => h.id);
}

function pillPool(c: ContentBundle, tier: number): string[] {
  const exact = (c.pills ?? []).filter((p) => p.type === '聚气' && p.tier === tier).map((p) => p.id);
  if (exact.length > 0) return exact;
  return (c.pills ?? []).filter((p) => p.type === '聚气').map((p) => p.id);
}

export interface Stipend {
  insight: number;
  herbs: { id: string; count: number }[];
  pills: { id: string; count: number }[];
}

/** 计算当年俸禄（不发，UI 与结算共用；纯函数） */
export function stipendOf(s: RunState, c: ContentBundle): Stipend | null {
  const def = sectById(c, s.sect.id);
  if (!def) return null;
  const rank = Math.max(0, Math.min(SECT_STIPEND_INSIGHT.length - 1, s.sect.rank));
  const insight = (SECT_STIPEND_INSIGHT[rank] ?? 0) + (def.perk.insightBonus ?? 0);
  const herbMult = def.perk.herbMult ?? 1;
  const herbCount = Math.floor((SECT_STIPEND_HERB[rank] ?? 0) * herbMult);
  const pillCount = SECT_STIPEND_PILL[rank] ?? 0;
  const tier = stipendTier(s);
  const out: Stipend = { insight, herbs: [], pills: [] };
  if (herbCount > 0) {
    const pool = herbPool(c, tier);
    // 按年份轮转（确定性，不消费 RNG）：同年只发一味，避免库存里塞满同一种草
    const id = pool.length > 0 ? pool[s.year % pool.length] : undefined;
    if (id) out.herbs.push({ id, count: herbCount });
  }
  if (pillCount > 0) {
    const pool = pillPool(c, tier);
    const id = pool.length > 0 ? pool[s.year % pool.length] : undefined;
    if (id) out.pills.push({ id, count: pillCount });
  }
  return out;
}

/** 发放当年俸禄（晋升判定先跑，再按新职位发） */
export function stipendTick(s: RunState, c: ContentBundle): LogLine[] {
  const logs: LogLine[] = [];
  if (s.sect.id === null) return logs;
  const promoted = promoteIfEligible(s);
  if (promoted) logs.push({ cls: 'gold', text: `宗门论功，你晋为${promoted}。` });
  const stipend = stipendOf(s, c);
  if (!stipend) return logs;
  s.insight += stipend.insight;
  for (const h of stipend.herbs) s.herbs[h.id] = (s.herbs[h.id] ?? 0) + h.count;
  for (const p of stipend.pills) s.pills[p.id] = (s.pills[p.id] ?? 0) + p.count;
  return logs;
}

// ── 大比（每 20 年，界面而非打断） ──

export function tournamentDue(s: RunState): boolean {
  if (s.sect.id === null) return false;
  if (s.year <= 0 || s.year % TOURNAMENT_EVERY !== 0) return false;
  return s.sect.lastTournament !== s.year;
}

/**
 * 同境界弟子池里的名次（1 = 夺魁）。
 *
 * **口径**：大比比的是「同境界」，所以境界带来的基础战力对所有弟子是一样的，真正分出高下的是
 * **构筑**（六乘区乘积）。故按 `rawProduct` 相对软封顶拐点 `SOFT_CAP_KNEE` 的对数位置排名：
 * 乘积 1（无构筑）→ 垫底；乘积 25（触到软封顶）→ 夺魁。
 * 早期版本用 `ENEMY_COMBAT` 档位区间做参照，实测玩家乘区一开就恒为第 1 名（p50=1），
 * 等于每 20 年白送一门宗门功法 —— 见 v0.1.0-06 §七。
 */
export function tournamentPlace(s: RunState, c: ContentBundle): number {
  const pool = TOURNAMENT_POOL_BASE + TOURNAMENT_POOL_PER_RANK * s.sect.rank;
  const product = Math.max(1, zones(s, c).rawProduct);
  const pct = Math.min(1, Math.max(0, Math.log(product) / Math.log(SOFT_CAP_KNEE)));
  return 1 + Math.floor((1 - pct) * (pool - 1));
}

export interface TournamentResult {
  place: number;
  logs: LogLine[];
}

export function runTournament(s: RunState, c: ContentBundle): TournamentResult | null {
  if (!tournamentDue(s)) return null;
  const def = sectById(c, s.sect.id);
  if (!def) return null;
  s.sect.lastTournament = s.year;
  const place = tournamentPlace(s, c);
  s.sect.tournamentPlaces.push(place);
  const logs: LogLine[] = [];
  if (place === 1) {
    addContribution(s, TOURNAMENT_REWARD_FIRST);
    const art = def.arts.find((id) => (s.arts[id]?.level ?? 0) <= 0);
    if (art) {
      s.arts[art] = { level: 1, insight: 0 };
      logs.push({ cls: 'gold', text: `大比夺魁！你从藏经阁取走${artName(c, art)}。` });
    } else {
      s.insight += TOURNAMENT_INSIGHT_TEN;
      logs.push({ cls: 'gold', text: '大比夺魁！宗门功法已尽得，长老另赏你悟性。' });
    }
    logs.push({ cls: 'gold', text: `你在${def.name}大比中位列第一，贡献 +${TOURNAMENT_REWARD_FIRST}。` });
    return { place, logs };
  }
  if (place <= 10) {
    addContribution(s, TOURNAMENT_REWARD_TEN);
    s.insight += TOURNAMENT_INSIGHT_TEN;
    logs.push({
      cls: 'ev2',
      text: `大比名列第 ${place}，贡献 +${TOURNAMENT_REWARD_TEN}、悟性 +${TOURNAMENT_INSIGHT_TEN}。`,
    });
    return { place, logs };
  }
  if (place <= 50) {
    addContribution(s, TOURNAMENT_REWARD_FIFTY);
    logs.push({ cls: 'ev2', text: `大比名列第 ${place}，贡献 +${TOURNAMENT_REWARD_FIFTY}。` });
    return { place, logs };
  }
  logs.push({ cls: 'ev2', text: `大比第 ${place} 名，未入前五十。` });
  return { place, logs };
}

function artName(c: ContentBundle, id: string): string {
  return c.arts?.find((a) => a.id === id)?.name ?? id;
}

// ── 宗门任务 ──

export function missionAvailable(s: RunState, m: MissionDef): boolean {
  if (s.sect.id === null) return false;
  if (m.sect !== '*' && m.sect !== s.sect.id) return false;
  if (s.sect.rank < m.minRank) return false;
  if (s.realm.level < m.levelMin || s.realm.level > m.levelMax) return false;
  if ((s.cooldowns[m.id] ?? 0) > s.year) return false;
  return true;
}

export function pickMissions(s: RunState, c: ContentBundle): MissionDef[] {
  return (c.missions ?? []).filter((m) => missionAvailable(s, m));
}

/** 把任务包装成事件：贡献与张力由引擎统一附加到每个 outcome（写手不必重复声明） */
export function missionAsEvent(m: MissionDef): EventDef {
  const extra: Effect[] = [{ op: 'gainContribution', value: m.contribution }];
  if (m.tensionTo) extra.push({ op: 'addTension', sect: m.tensionTo.sect, value: m.tensionTo.delta });
  const choices: Choice[] = m.choices.map((ch) => ({
    ...ch,
    outcomes: ch.outcomes.map((o) => ({ ...o, effects: [...o.effects, ...extra] })),
  }));
  return { id: m.id, title: m.title, category: 'sect', body: m.body, weight: 1, choices };
}

/**
 * 接取任务 → 生成待裁决决策（与内容事件走同一条 `buildEventDecision` + `applyChoice` 路径）。
 * 冷却在这里就打上 —— 接取即消耗，中途放弃也不退还（与炼丹"弃炉报废"同一取向）。
 */
export function acceptMission(
  s: RunState,
  m: MissionDef,
  c: ContentBundle,
  rng: Rng,
): Decision | null {
  if (!missionAvailable(s, m)) return null;
  s.cooldowns[m.id] = s.year + m.cooldownYears;
  return buildEventDecision(s, missionAsEvent(m), c, rng, realmName(s.realm.level));
}

export function missionById(c: ContentBundle, id: string): MissionDef | undefined {
  return c.missions?.find((m) => m.id === id);
}

/**
 * 按 id 取事件：先查事件池，再查任务表（任务被 `acceptMission` 包装成事件后走同一条结算路径，
 * 所以 `applyChoice` 必须也能按 id 找到它）。
 */
export function eventOrMission(c: ContentBundle, id: string): EventDef | undefined {
  const ev = c.events.find((e) => e.id === id);
  if (ev) return ev;
  const m = missionById(c, id);
  return m ? missionAsEvent(m) : undefined;
}

/** 宗门功法是否已开放（真传弟子起） */
export function sectArtUnlocked(s: RunState): boolean {
  return s.sect.id !== null && s.sect.rank >= SECT_ART_RANK;
}

// ── 宗门 perk 访问器（全部按「未入宗 = 中性值」返回） ──

function perk(s: RunState, c: ContentBundle): SectDef['perk'] | undefined {
  return sectById(c, s.sect.id)?.perk;
}

export function sectBreakBonus(s: RunState, c: ContentBundle): number {
  return perk(s, c)?.breakBonus ?? 0;
}

export function sectAlchemyBonus(s: RunState, c: ContentBundle): number {
  return perk(s, c)?.alchemyBonus ?? 0;
}

export function sectToxMult(s: RunState, c: ContentBundle): number {
  return perk(s, c)?.toxMult ?? 1;
}

export function sectHerbMult(s: RunState, c: ContentBundle): number {
  return perk(s, c)?.herbMult ?? 1;
}

export function sectArtifactBonus(s: RunState, c: ContentBundle): number {
  return perk(s, c)?.artifactBonus ?? 0;
}

export function sectPlunderSim(s: RunState, c: ContentBundle): number {
  return perk(s, c)?.plunderSim ?? 0;
}

export function sectDamageMult(s: RunState, c: ContentBundle): number {
  return perk(s, c)?.damageMult ?? 1;
}

export function sectPerilMult(s: RunState, c: ContentBundle): number {
  return perk(s, c)?.perilMult ?? 1;
}
