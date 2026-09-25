import { attemptBreak } from './breakthrough';
import {
  ARTIFACT_RATE,
  ARTIFACT_RATE_PINNACLE,
  CHAOS_CULT_HI,
  CHAOS_CULT_LO,
  CHAOS_RATE,
  ENCOUNTER_RATE,
  ENCOUNTER_RATE_PINNACLE,
  EVENT_RATE,
  LOG_LIMIT,
  RECENCY_LIMIT,
  ROOT_SHIFT_AGE_MAX,
  ROOT_SHIFT_HI,
  ROOT_SHIFT_LO,
  ROOT_SHIFT_MAX_INNATE,
  ROOT_SHIFT_RATE,
  TOXICITY_DECAY_MIN,
  TOXICITY_DECAY_RATE,
} from './constants';
import { plunderDrain, swordNarrow, toxicityDecayMult } from './arts';
import { tickPillBuffs } from './alchemy';
import { evalCondition, makeEvalCtx } from './conditions';
import { buildEncounter, encounterDecision, resolveEncounter, type EncounterPayload } from './encounter';
import { resolveArtifact } from './artifact';
import { buildEventDecision, interpolate, resolveChoice, clampAll } from './interpret';
import {
  insightPerYear,
  luckMult,
  powerOf,
  realmName,
  recordPowerTrail,
  xianqiFateMult,
  xianqiRate,
} from './selectors';
import { perilTick, resolveAscensionChoice, runTribulation, shouldTribulate } from './tribulation';
import type {
  ContentBundle,
  Decision,
  DecisionKind,
  EventDef,
} from './types/effects';
import type { LogLine, RunEndReason } from './types/log';
import type { RngBag } from './types/rng';
import type { RunState } from './types/run';

export interface TickResult {
  logs: LogLine[];
  pending: Decision | null;
  ended: RunEndReason | null;
}

/** 槽 14 仲裁优先级：天劫 > 机缘 > 羁绊 > 宗门 > 丹药 > 世界/链式 */
const PRIORITY: readonly DecisionKind[] = [
  'tribulation',
  'encounter',
  'bond',
  'sect',
  'alchemy',
  'world',
];

function rank(kind: DecisionKind): number {
  const i = PRIORITY.indexOf(kind);
  return i < 0 ? PRIORITY.length : i;
}

interface Candidate {
  ev: EventDef | null;
  decision: Decision;
  deferred: boolean;
}

function push(s: RunState, logs: LogLine[], line: LogLine): void {
  logs.push(line);
  s.log.push(line);
  if (s.log.length > LOG_LIMIT) s.log.splice(0, s.log.length - LOG_LIMIT);
}

function isEligible(s: RunState, ev: EventDef, c: ContentBundle, rng: RngBag): boolean {
  if (ev.weight <= 0) return false;
  if (ev.levelMin !== undefined && s.realm.level < ev.levelMin) return false;
  if (ev.levelMax !== undefined && s.realm.level > ev.levelMax) return false;
  if (ev.once && s.onceFired.includes(ev.id)) return false;
  if (ev.cooldownYears !== undefined && (s.cooldowns[ev.id] ?? 0) > s.year) return false;
  if (ev.maxCount !== undefined && (s.maxCount[ev.id] ?? 0) >= ev.maxCount) return false;
  if (s.recencyQueue.includes(ev.id)) return false;
  if (s.deferredQueue.some((d) => d.eventId === ev.id)) return false;
  if (ev.requires && !evalCondition(s, ev.requires, makeEvalCtx(c, rng.event), `${ev.id}.req`)) {
    return false;
  }
  return true;
}

function pickEvent(s: RunState, rng: RngBag, c: ContentBundle): EventDef | null {
  const pool: [EventDef, number][] = [];
  for (const ev of c.events) {
    if (!isEligible(s, ev, c, rng)) continue;
    pool.push([ev, ev.weight]);
  }
  if (pool.length === 0) return null;
  return rng.event.weighted(pool);
}

function recordEvent(s: RunState, ev: EventDef): void {
  s.maxCount[ev.id] = (s.maxCount[ev.id] ?? 0) + 1;
  if (ev.once) s.onceFired.push(ev.id);
  if (ev.cooldownYears !== undefined) s.cooldowns[ev.id] = s.year + ev.cooldownYears;
  s.recencyQueue.push(ev.id);
  if (s.recencyQueue.length > RECENCY_LIMIT) s.recencyQueue.shift();
  s.stats.events += 1;
}

interface Pending {
  ev: EventDef;
  decision: Decision;
}

function present(s: RunState, ev: EventDef, d: Decision, logs: LogLine[]): void {
  recordEvent(s, ev);
  s.eventLog.push(ev.id);
  push(s, logs, { cls: 'ev2', text: `${d.title} · ${d.body}` });
}

/** 即时结算（单选项事件 / 退化事件 / 链式后续），可能再产生链式决策 */
function resolveInline(
  s: RunState,
  ev: EventDef,
  choiceId: string,
  rng: RngBag,
  c: ContentBundle,
  logs: LogLine[],
): Pending | null {
  const res = resolveChoice(
    s,
    ev,
    choiceId,
    { content: c, rng: rng.event },
    realmName(s.realm.level),
    { gates: 'trust' },
  );
  if (!res.ok) return null;
  recordEvent(s, ev);
  s.eventLog.push(ev.id);
  push(s, logs, { cls: 'ev2', text: `${ev.title} · ${interpolate(ev.body, s, realmName(s.realm.level))}` });
  for (const line of res.logs) push(s, logs, line);
  for (const sched of res.scheduled) s.scheduled.push(sched);
  return handleChains(s, res.chained, rng, c, logs);
}

/**
 * 构建事件：可见选项 ≥2 且至少一个可选 → 返回待裁决的决策；
 * 否则即时结算（软锁防护：全部选项置灰时退化为单选）。
 */
function fireOrDecide(
  s: RunState,
  ev: EventDef,
  rng: RngBag,
  c: ContentBundle,
  logs: LogLine[],
): Pending | null {
  const decision = buildEventDecision(s, ev, c, rng.event, realmName(s.realm.level));
  const visible = decision.choices.filter((ch) => ch.show);
  const playable = visible.filter((ch) => ch.enable);
  if (visible.length >= 2 && playable.length >= 1) return { ev, decision };
  const fallback = playable[0] ?? visible[0] ?? decision.choices[0];
  if (!fallback) return null;
  return resolveInline(s, ev, fallback.id, rng, c, logs);
}

function handleChains(
  s: RunState,
  ids: string[],
  rng: RngBag,
  c: ContentBundle,
  logs: LogLine[],
): Pending | null {
  for (let i = 0; i < ids.length; i++) {
    const next = c.events.find((e) => e.id === ids[i]);
    if (!next) continue;
    const pending = fireOrDecide(s, next, rng, c, logs);
    if (pending) {
      present(s, next, pending.decision, logs);
      for (const rest of ids.slice(i + 1)) s.deferredQueue.push({ eventId: rest, year: s.year });
      return pending;
    }
  }
  return null;
}

function eventTick(s: RunState, rng: RngBag, c: ContentBundle, logs: LogLine[]): Pending | null {
  if (!rng.event.chance(EVENT_RATE * luckMult(s))) return null;
  const ev = pickEvent(s, rng, c);
  if (!ev) return null;
  return fireOrDecide(s, ev, rng, c, logs);
}

function scheduledTick(s: RunState, rng: RngBag, c: ContentBundle, logs: LogLine[]): Pending | null {
  const due = s.scheduled.filter((x) => x.year <= s.year);
  if (due.length === 0) return null;
  s.scheduled = s.scheduled.filter((x) => x.year > s.year);
  for (let i = 0; i < due.length; i++) {
    const ev = c.events.find((e) => e.id === due[i]?.eventId);
    if (!ev) continue;
    const pending = fireOrDecide(s, ev, rng, c, logs);
    if (pending) {
      for (const rest of due.slice(i + 1)) s.deferredQueue.push({ eventId: rest.eventId, year: s.year });
      return pending;
    }
  }
  return null;
}

/** 槽 14 仲裁：deferred 重试优先，同级按优先级取一，落选顺延（最多一次） */
function arbitrate(
  s: RunState,
  fresh: Candidate[],
  c: ContentBundle,
  rng: RngBag,
  logs: LogLine[],
): Decision | null {
  const retry = s.deferredQueue.filter((entry) => entry.year < s.year);
  s.deferredQueue = s.deferredQueue.filter((entry) => entry.year >= s.year);

  const all: Candidate[] = [];
  for (const entry of retry) {
    const ev = c.events.find((e) => e.id === entry.eventId);
    if (!ev || !isEligible(s, ev, c, rng)) continue;
    const pending = fireOrDecide(s, ev, rng, c, logs);
    if (pending) all.push({ ev, decision: pending.decision, deferred: true });
  }
  all.push(...fresh);
  if (all.length === 0) return null;

  all.sort(
    (a, b) => rank(a.decision.kind) - rank(b.decision.kind) || Number(b.deferred) - Number(a.deferred),
  );
  const winner = all[0];
  if (!winner) return null;
  for (const loser of all.slice(1)) {
    if (!loser.deferred) s.deferredQueue.push({ eventId: loser.decision.eventId, year: s.year });
  }
  if (winner.ev) present(s, winner.ev, winner.decision, logs);
  return winner.decision;
}

/** 天劫抢占时，其余候选全部顺延 */
function deferAll(s: RunState, candidates: Candidate[]): void {
  for (const candidate of candidates) {
    if (!candidate.deferred) {
      s.deferredQueue.push({ eventId: candidate.decision.eventId, year: s.year });
    }
  }
}

function autoBattleChoice(
  s: RunState,
  payload: EncounterPayload,
  rng: RngBag,
  c: ContentBundle,
): string {
  if (s.battlePolicy === 'yes') return 'fight';
  if (s.battlePolicy === 'no') return 'flee';
  if (s.battlePolicy === 'random') return rng.misc.chance(0.5) ? 'fight' : 'flee';
  if (s.battlePolicy === 'smart') {
    const mid = (payload.lo + payload.hi) / 2;
    return powerOf(s, c) >= mid * s.smartX ? 'fight' : 'flee';
  }
  return 'fight';
}

function encounterTick(s: RunState, rng: RngBag, c: ContentBundle, logs: LogLine[]): Decision | null {
  const rate = (s.pinnacleThisYear ? ENCOUNTER_RATE_PINNACLE : ENCOUNTER_RATE) * luckMult(s);
  if (!rng.encounter.chance(rate)) return null;
  const payload = buildEncounter(s, rng, c);
  if (s.battlePolicy === 'manual') {
    return encounterDecision(payload, swordNarrow(s, c) > 0);
  }
  const choiceId = autoBattleChoice(s, payload, rng, c);
  for (const line of resolveEncounter(s, choiceId, payload, rng, c)) push(s, logs, line);
  return null;
}

function artifactTick(s: RunState, rng: RngBag, c: ContentBundle, logs: LogLine[]): void {
  const rate = (s.pinnacleThisYear ? ARTIFACT_RATE_PINNACLE : ARTIFACT_RATE) * luckMult(s);
  if (!rng.artifact.chance(rate)) return;
  for (const line of resolveArtifact(s, rng, c)) push(s, logs, line);
}

function qiTick(s: RunState, rng: RngBag, logs: LogLine[]): void {
  const mult = luckMult(s) * xianqiFateMult(s);
  if (s.realm.arc === 'immortal') {
    if (rng.misc.chance(CHAOS_RATE * mult)) {
      s.chaosQi += 1;
      const gain = rng.misc.int(CHAOS_CULT_LO, CHAOS_CULT_HI);
      s.cultivation += gain;
      push(s, logs, { cls: 'xian', text: '一缕混沌气落入识海，修为随之暴涨。' });
    }
    return;
  }
  const rate = xianqiRate(s);
  if (rate > 0 && rng.luck.chance(rate * mult)) {
    s.xianqi += 1;
    push(s, logs, { cls: 'xian', text: '你于呼吸吐纳间凝出一缕仙灵气。' });
  }
}

function rootShiftTick(s: RunState, rng: RngBag, logs: LogLine[]): void {
  if (s.innate >= ROOT_SHIFT_MAX_INNATE) return;
  if (s.age < 1 || s.age > ROOT_SHIFT_AGE_MAX) return;
  if (!rng.root.chance(ROOT_SHIFT_RATE)) return;
  const next = rng.root.int(ROOT_SHIFT_LO, ROOT_SHIFT_HI);
  s.root = next;
  s.gotSpecial = true;
  push(s, logs, {
    cls: 'special',
    text: '一夜之间，你体内灵根竟自行蜕变换骨，资质脱胎换骨！',
  });
}

function toxicityTick(s: RunState, c: ContentBundle): void {
  if (s.toxicity <= 0) return;
  const decay =
    Math.max(TOXICITY_DECAY_MIN, s.toxicity * TOXICITY_DECAY_RATE) * toxicityDecayMult(s, c);
  s.toxicity = Math.max(0, s.toxicity - decay);
}

export function rollYear(s: RunState, rng: RngBag, c: ContentBundle): TickResult {
  const logs: LogLine[] = [];
  if (s.dead) return { logs, pending: null, ended: s.endedReason as RunEndReason | null };

  s.age += 1;
  s.year += 1;
  s.stats.years += 1;
  s.brokeThisYear = false;
  s.pinnacleThisYear = false;
  s.chainDepth = 0;
  // 丹药本年状态归零：破境丹的倍率与护劫丹的要求只在服用当年有效
  s.pillBreakMult = 1;
  s.pillGuardMult = 1;
  push(s, logs, {
    cls: 'year',
    text: `第 ${s.year} 年 · ${s.age} 岁 · ${realmName(s.realm.level)}`,
  });

  for (const line of attemptBreak(s, rng, c)) push(s, logs, line);
  if (s.dead) return { logs, pending: null, ended: s.endedReason as RunEndReason | null };

  rootShiftTick(s, rng, logs);
  toxicityTick(s, c);
  tickPillBuffs(s);
  s.insight += insightPerYear(s);
  const drain = plunderDrain(s, c);
  if (drain > 0) s.simPoints = Math.max(0, s.simPoints - drain);

  const candidates: Candidate[] = [];
  const schedPending = scheduledTick(s, rng, c, logs);
  if (schedPending) candidates.push({ ...schedPending, deferred: false });
  const evPending = eventTick(s, rng, c, logs);
  if (evPending) candidates.push({ ...evPending, deferred: false });

  artifactTick(s, rng, c, logs);
  const encDec = encounterTick(s, rng, c, logs);
  if (encDec) candidates.push({ ev: null, decision: encDec, deferred: false });

  qiTick(s, rng, logs);
  for (const line of perilTick(s, rng)) push(s, logs, line);
  if (s.dead) return { logs, pending: null, ended: s.endedReason as RunEndReason | null };

  if (shouldTribulate(s)) {
    const trib = runTribulation(s, rng, c);
    for (const line of trib.logs) push(s, logs, line);
    if (trib.pending) {
      deferAll(s, candidates);
      s.awaiting = trib.pending;
      return { logs, pending: trib.pending, ended: null };
    }
    if (s.dead) return { logs, pending: null, ended: s.endedReason as RunEndReason | null };
    if (s.ascendMode === 'zhengdao') return { logs, pending: null, ended: 'zhengdao' };
  }

  const pending = arbitrate(s, candidates, c, rng, logs);

  if (!s.dead && s.age > s.simPoints) {
    s.dead = true;
    s.endedReason = 'simDepleted';
    push(s, logs, { cls: 'dead', text: '模拟点耗尽，你的寿元走到了尽头。' });
    return { logs, pending, ended: 'simDepleted' };
  }

  if (pending) s.awaiting = pending;
  return { logs, pending, ended: null };
}

export function applyChoice(
  s: RunState,
  d: Decision,
  choiceId: string,
  rng: RngBag,
  c: ContentBundle,
): TickResult {
  const logs: LogLine[] = [];
  s.stats.decisions += 1;
  s.awaiting = null;
  let followUp: Decision | null = null;
  const powerBefore = powerOf(s, c);

  if (d.source === 'system' && d.kind === 'encounter') {
    const payload = d.payload as EncounterPayload | undefined;
    if (payload) {
      for (const line of resolveEncounter(s, choiceId, payload, rng, c)) push(s, logs, line);
    }
  } else if (d.source === 'system' && d.kind === 'tribulation') {
    for (const line of resolveAscensionChoice(s, choiceId)) push(s, logs, line);
  } else {
    const ev = c.events.find((e) => e.id === d.eventId);
    if (ev) {
      const resolved = resolveChoice(
        s,
        ev,
        choiceId,
        { content: c, rng: rng.event },
        realmName(s.realm.level),
        { gates: 'trust' },
      );
      if (resolved.ok) {
        for (const line of resolved.logs) push(s, logs, line);
        for (const sched of resolved.scheduled) s.scheduled.push(sched);
        const pending = handleChains(s, resolved.chained, rng, c, logs);
        if (pending) followUp = pending.decision;
      } else {
        // 防御：非法 choiceId（UI 不应发生）退化为第一个可选项，避免静默空过
        const fallback = d.choices.find((ch) => ch.show && ch.enable);
        if (fallback) {
          const retry = resolveChoice(
            s,
            ev,
            fallback.id,
            { content: c, rng: rng.event },
            realmName(s.realm.level),
            { gates: 'trust' },
          );
          if (retry.ok) {
            for (const line of retry.logs) push(s, logs, line);
            for (const sched of retry.scheduled) s.scheduled.push(sched);
            const pending = handleChains(s, retry.chained, rng, c, logs);
            if (pending) followUp = pending.decision;
          }
        }
      }
    }
  }

  s.decisionLog.push({ year: s.year, kind: d.kind, eventId: d.eventId, choiceId });
  clampAll(s);
  recordPowerTrail(s, c, d.title, powerBefore);
  if (followUp) s.awaiting = followUp;
  if (s.dead) return { logs, pending: followUp, ended: s.endedReason as RunEndReason | null };
  if (s.endedReason === 'zhengdao' || s.endedReason === 'immortal') {
    return { logs, pending: followUp, ended: s.endedReason as RunEndReason };
  }
  return { logs, pending: followUp, ended: null };
}
