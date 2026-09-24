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
import { evalCondition, makeEvalCtx } from './conditions';
import { buildEncounter, encounterDecision, resolveEncounter, type EncounterPayload } from './encounter';
import { resolveArtifact } from './artifact';
import { interpolate, resolveChoice, clampAll } from './interpret';
import {
  insightPerYear,
  luckMult,
  powerOf,
  realmName,
  xianqiFateMult,
  xianqiRate,
} from './selectors';
import { perilTick, resolveAscensionChoice, runTribulation, shouldTribulate } from './tribulation';
import type { ContentBundle, Decision, EventDef } from './types/effects';
import type { LogLine, RunEndReason } from './types/log';
import type { RngBag } from './types/rng';
import type { RunState } from './types/run';

export interface TickResult {
  logs: LogLine[];
  pending: Decision | null;
  ended: RunEndReason | null;
}

function push(s: RunState, logs: LogLine[], line: LogLine): void {
  logs.push(line);
  s.log.push(line);
  if (s.log.length > LOG_LIMIT) s.log.splice(0, s.log.length - LOG_LIMIT);
}

function pickEvent(s: RunState, rng: RngBag, c: ContentBundle): EventDef | null {
  const evalCtx = makeEvalCtx(c, rng.event);
  const pool: [EventDef, number][] = [];
  for (const ev of c.events) {
    if (ev.weight <= 0) continue;
    if (ev.levelMin !== undefined && s.realm.level < ev.levelMin) continue;
    if (ev.levelMax !== undefined && s.realm.level > ev.levelMax) continue;
    if (ev.once && s.onceFired.includes(ev.id)) continue;
    if (ev.cooldownYears !== undefined && (s.cooldowns[ev.id] ?? 0) > s.year) continue;
    if (ev.maxCount !== undefined && (s.maxCount[ev.id] ?? 0) >= ev.maxCount) continue;
    if (s.recencyQueue.includes(ev.id)) continue;
    if (ev.requires && !evalCondition(s, ev.requires, evalCtx, `${ev.id}.req`)) continue;
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

function fireEvent(s: RunState, ev: EventDef, rng: RngBag, c: ContentBundle, logs: LogLine[]): void {
  const choice = ev.choices[0];
  if (!choice) return;
  const res = resolveChoice(s, ev, choice.id, { content: c, rng: rng.event }, realmName(s.realm.level));
  if (!res.ok) return;
  recordEvent(s, ev);
  s.eventLog.push(ev.id);
  push(s, logs, { cls: 'ev2', text: `${ev.title} · ${interpolate(ev.body, s, realmName(s.realm.level))}` });
  for (const line of res.logs) push(s, logs, line);
  for (const sched of res.scheduled) s.scheduled.push(sched);
  for (const id of res.chained) {
    const next = c.events.find((e) => e.id === id);
    if (next) fireEvent(s, next, rng, c, logs);
  }
}

function scheduledTick(s: RunState, rng: RngBag, c: ContentBundle, logs: LogLine[]): void {
  const due = s.scheduled.filter((x) => x.year <= s.year);
  if (due.length === 0) return;
  s.scheduled = s.scheduled.filter((x) => x.year > s.year);
  for (const item of due) {
    const ev = c.events.find((e) => e.id === item.eventId);
    if (ev) fireEvent(s, ev, rng, c, logs);
  }
}

function autoBattleChoice(s: RunState, payload: EncounterPayload, rng: RngBag): string {
  if (s.battlePolicy === 'yes') return 'fight';
  if (s.battlePolicy === 'no') return 'flee';
  if (s.battlePolicy === 'random') return rng.misc.chance(0.5) ? 'fight' : 'flee';
  if (s.battlePolicy === 'smart') {
    const mid = (payload.lo + payload.hi) / 2;
    return powerOf(s) >= mid * s.smartX ? 'fight' : 'flee';
  }
  return 'fight';
}

function encounterTick(s: RunState, rng: RngBag, c: ContentBundle, logs: LogLine[]): Decision | null {
  const rate = (s.pinnacleThisYear ? ENCOUNTER_RATE_PINNACLE : ENCOUNTER_RATE) * luckMult(s);
  if (!rng.encounter.chance(rate)) return null;
  const payload = buildEncounter(s, rng, c);
  if (s.battlePolicy === 'manual') {
    return encounterDecision(payload);
  }
  const choiceId = autoBattleChoice(s, payload, rng);
  for (const line of resolveEncounter(s, choiceId, payload, rng)) push(s, logs, line);
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

function toxicityTick(s: RunState): void {
  if (s.toxicity <= 0) return;
  const decay = Math.max(TOXICITY_DECAY_MIN, s.toxicity * TOXICITY_DECAY_RATE);
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
  push(s, logs, {
    cls: 'year',
    text: `第 ${s.year} 年 · ${s.age} 岁 · ${realmName(s.realm.level)}`,
  });

  for (const line of attemptBreak(s, rng)) push(s, logs, line);
  if (s.dead) return { logs, pending: null, ended: s.endedReason as RunEndReason | null };

  rootShiftTick(s, rng, logs);
  toxicityTick(s);
  s.insight += insightPerYear(s);
  scheduledTick(s, rng, c, logs);

  if (rng.event.chance(EVENT_RATE * luckMult(s))) {
    const ev = pickEvent(s, rng, c);
    if (ev) fireEvent(s, ev, rng, c, logs);
  }

  artifactTick(s, rng, c, logs);
  const pending = encounterTick(s, rng, c, logs);
  qiTick(s, rng, logs);
  for (const line of perilTick(s, rng)) push(s, logs, line);
  if (s.dead) return { logs, pending: null, ended: s.endedReason as RunEndReason | null };

  if (shouldTribulate(s)) {
    const trib = runTribulation(s, rng);
    for (const line of trib.logs) push(s, logs, line);
    if (trib.pending) {
      s.awaiting = trib.pending;
      return { logs, pending: trib.pending, ended: null };
    }
    if (s.dead) return { logs, pending: null, ended: s.endedReason as RunEndReason | null };
    if (s.ascendMode === 'zhengdao') return { logs, pending: null, ended: 'zhengdao' };
  }

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

  if (d.kind === 'encounter') {
    const payload = d.payload as EncounterPayload | undefined;
    if (payload && d.eventId.startsWith('enc_')) {
      for (const line of resolveEncounter(s, choiceId, payload, rng)) push(s, logs, line);
    } else {
      const next = c.events.find((e) => e.id === d.eventId);
      if (next) fireEvent(s, next, rng, c, logs);
    }
  } else if (d.kind === 'tribulation') {
    for (const line of resolveAscensionChoice(s, choiceId)) push(s, logs, line);
  }

  clampAll(s);
  if (s.dead) return { logs, pending: null, ended: s.endedReason as RunEndReason | null };
  if (s.endedReason === 'zhengdao' || s.endedReason === 'immortal') {
    return { logs, pending: null, ended: s.endedReason as RunEndReason };
  }
  return { logs, pending: null, ended: null };
}
