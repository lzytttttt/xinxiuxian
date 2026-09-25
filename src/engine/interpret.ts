import { CHAIN_DEPTH_MAX, TOXICITY_MAX } from './constants';
import { evalCondition, makeEvalCtx, type EvalCtx } from './conditions';
import { readTarget } from './selectors';
import type {
  Choice,
  ContentBundle,
  Decision,
  DecisionChoice,
  DecisionKind,
  Effect,
  EventCategory,
  EventDef,
  Outcome,
  Target,
} from './types/effects';
import type { LogLine, LogTone, RunEndReason } from './types/log';
import type { Rng } from './types/rng';
import type { RunState } from './types/run';

export interface ApplyCtx {
  content: ContentBundle;
  rng: Rng;
  evalCtx?: EvalCtx;
}

export interface ResolveResult {
  ok: boolean;
  text: string;
  logs: LogLine[];
  chained: string[];
  scheduled: { eventId: string; year: number }[];
  ended: RunEndReason | null;
}

interface Env {
  s: RunState;
  ctx: EvalCtx;
  overlay: Map<string, number>;
  snap: Map<string, number>;
  logs: LogLine[];
  chained: string[];
  scheduled: { eventId: string; year: number }[];
  ended: RunEndReason | null;
}

function key(t: Target): string {
  return JSON.stringify(t);
}

function read(s: RunState, t: Target, overlay: Map<string, number>): number {
  const k = key(t);
  const v = overlay.get(k);
  return v !== undefined ? v : readTarget(s, t);
}

function write(s: RunState, t: Target, value: number): void {
  switch (t.k) {
    case 'cultivation':
      s.cultivation = value;
      return;
    case 'simPoints':
      s.simPoints = value;
      return;
    case 'root':
      s.root = value;
      return;
    case 'luck':
      s.luck = value;
      return;
    case 'artifactPower':
      s.artifactPower = value;
      return;
    case 'artifactBonus':
      s.artifactBonus = value;
      return;
    case 'xianqi':
      s.xianqi = value;
      return;
    case 'chaosQi':
      s.chaosQi = value;
      return;
    case 'insight':
      s.insight = value;
      return;
    case 'toxicity':
      s.toxicity = value;
      return;
    case 'herb':
      s.herbs[t.id] = value;
      return;
    case 'pill':
      s.pills[t.id] = value;
      return;
    case 'artLevel': {
      const art = s.arts[t.id] ?? { level: 0, insight: 0 };
      art.level = value;
      s.arts[t.id] = art;
      return;
    }
    case 'artInsight': {
      const art = s.arts[t.id] ?? { level: 0, insight: 0 };
      art.insight = value;
      s.arts[t.id] = art;
      return;
    }
    case 'sectContribution':
      s.sect.contribution = value;
      return;
    case 'sectRank':
      s.sect.rank = value;
      return;
    case 'bondLevel': {
      const bond = s.bonds.list.find((b) => b.id === t.id);
      if (bond) bond.level = value;
      return;
    }
    case 'bondAffinity': {
      const bond = s.bonds.list.find((b) => b.id === t.id);
      if (bond) bond.affinity = value;
      return;
    }
    case 'flag':
      s.flags[t.id] = value;
      return;
    case 'cooldown':
      s.cooldowns[t.id] = value;
      return;
    case 'realmLevel':
      s.realm.level = value;
      return;
    case 'yearsStayed':
      s.yearsStayed = value;
      return;
    default:
      return;
  }
}

function boundsOf(t: Target): readonly [number, number] {
  switch (t.k) {
    case 'cultivation':
    case 'simPoints':
    case 'artifactPower':
    case 'artifactBonus':
    case 'insight':
    case 'xianqi':
    case 'chaosQi':
    case 'yearsStayed':
      return [0, Number.POSITIVE_INFINITY];
    case 'toxicity':
      return [0, TOXICITY_MAX];
    case 'root':
      return [1, Number.POSITIVE_INFINITY];
    case 'luck':
    case 'sectContribution':
    case 'bondAffinity':
    case 'herb':
    case 'pill':
    case 'artLevel':
    case 'artInsight':
    case 'flag':
    case 'cooldown':
      return [0, Number.POSITIVE_INFINITY];
    case 'sectRank':
      return [0, 4];
    case 'bondLevel':
      return [0, 5];
    case 'realmLevel':
      return [1, 200];
    default:
      return [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
  }
}

export function clampAll(s: RunState): void {
  const targets: Target[] = [
    { k: 'cultivation' },
    { k: 'simPoints' },
    { k: 'root' },
    { k: 'luck' },
    { k: 'artifactPower' },
    { k: 'artifactBonus' },
    { k: 'toxicity' },
    { k: 'insight' },
    { k: 'sectRank' },
    { k: 'yearsStayed' },
  ];
  for (const t of targets) {
    const v = readTarget(s, t);
    const [lo, hi] = boundsOf(t);
    const clamped = Math.min(hi, Math.max(lo, v));
    if (clamped !== v) write(s, t, clamped);
  }
}

function collectPctTargets(effects: Effect[], into: Map<string, Target>): void {
  for (const e of effects) {
    if (e.op === 'pct' && e.base !== 'live') into.set(key(e.target), e.target);
    if (e.op === 'if') {
      collectPctTargets(e.then, into);
      if (e.else) collectPctTargets(e.else, into);
    }
  }
}

function applyOne(env: Env, e: Effect, path: string): void {
  const { s, overlay } = env;
  switch (e.op) {
    case 'add':
    case 'sub': {
      const delta = e.op === 'add' ? e.value : -e.value;
      overlay.set(key(e.target), read(s, e.target, overlay) + delta);
      return;
    }
    case 'pct': {
      const cur = read(s, e.target, overlay);
      const base =
        e.base === 'live' ? cur : (env.snap.get(key(e.target)) ?? read(s, e.target, overlay));
      overlay.set(key(e.target), cur + (base * e.value) / 100);
      return;
    }
    case 'set':
      overlay.set(key(e.target), e.value);
      return;
    case 'mul':
      overlay.set(key(e.target), read(s, e.target, overlay) * e.value);
      return;
    case 'clamp': {
      const v = read(s, e.target, overlay);
      const lo = e.lo ?? Number.NEGATIVE_INFINITY;
      const hi = e.hi ?? Number.POSITIVE_INFINITY;
      overlay.set(key(e.target), Math.min(hi, Math.max(lo, v)));
      return;
    }
    case 'setFlag':
      s.flags[e.id] = e.value ?? 1;
      return;
    case 'incFlag':
      s.flags[e.id] = (s.flags[e.id] ?? 0) + (e.value ?? 1);
      return;
    case 'clearFlag':
      s.flags[e.id] = 0;
      return;
    case 'setCooldown':
      s.cooldowns[e.id] = s.year + (e.years ?? 10);
      return;
    case 'grantPill':
      s.pills[e.id] = (s.pills[e.id] ?? 0) + e.count;
      return;
    case 'grantHerb':
      s.herbs[e.id] = (s.herbs[e.id] ?? 0) + e.count;
      return;
    case 'grantArt': {
      const art = s.arts[e.id] ?? { level: 1, insight: 0 };
      if (art.level === 0) art.level = 1;
      s.arts[e.id] = art;
      return;
    }
    case 'learnRecipe': {
      const rec = s.recipes[e.id] ?? { known: false, mastery: 0 };
      rec.known = true;
      s.recipes[e.id] = rec;
      return;
    }
    case 'gainInsight':
      overlay.set(key({ k: 'insight' }), read(s, { k: 'insight' }, overlay) + e.value);
      return;
    case 'addToxicity':
      overlay.set(key({ k: 'toxicity' }), read(s, { k: 'toxicity' }, overlay) + e.value);
      return;
    case 'bond':
      // Phase 5：羁绊系统未建，此处不产生状态变更
      return;
    case 'sectJoin':
      s.sect.id = e.id;
      s.sect.joinedYear = s.year;
      return;
    case 'sectLeave':
      s.sect.id = null;
      s.sect.rank = 0;
      if (e.defect) s.sect.defections += 1;
      return;
    case 'chain':
      env.chained.push(e.eventId);
      return;
    case 'schedule':
      env.scheduled.push({ eventId: e.eventId, year: s.year + e.inYears });
      return;
    case 'log':
      env.logs.push({ cls: e.tone ?? 'ev1', text: e.text });
      return;
    case 'endRun':
      env.ended = e.reason;
      return;
    case 'if': {
      const hit = evalCondition(s, e.cond, env.ctx, `${path}.if`);
      const branch = hit ? e.then : e.else ?? [];
      for (let i = 0; i < branch.length; i++) {
        applyOne(env, branch[i] as Effect, `${path}.if${hit ? 't' : 'f'}${i}`);
      }
      return;
    }
    default:
      return;
  }
}

function applyList(env: Env, effects: Effect[], path: string): void {
  for (let i = 0; i < effects.length; i++) {
    applyOne(env, effects[i] as Effect, `${path}.${i}`);
  }
}

function commit(env: Env): void {
  for (const [k, v] of env.overlay) {
    write(env.s, JSON.parse(k) as Target, v);
  }
  env.overlay.clear();
}

export function canPayCost(
  s: RunState,
  cost: Effect[] | undefined,
  ctx: ApplyCtx,
  evalCtx?: EvalCtx,
): boolean {
  if (!cost || cost.length === 0) return true;
  const env: Env = {
    s,
    ctx: evalCtx ?? ctx.evalCtx ?? makeEvalCtx(ctx.content, ctx.rng),
    overlay: new Map(),
    snap: new Map(),
    logs: [],
    chained: [],
    scheduled: [],
    ended: null,
  };
  applyList(env, cost, 'cost');
  for (const [k, v] of env.overlay) {
    const t = JSON.parse(k) as Target;
    const [lo] = boundsOf(t);
    if (v < lo) return false;
  }
  return true;
}

function pickOutcome(
  s: RunState,
  outcomes: Outcome[],
  ctx: EvalCtx,
  rng: Rng,
  path: string,
): Outcome | null {
  const passing = outcomes.filter(
    (o, i) => o.when === undefined || evalCondition(s, o.when, ctx, `${path}.o${i}`),
  );
  if (passing.length === 0) return null;
  const weighted = passing.filter((o) => o.weight !== undefined);
  if (weighted.length > 0) {
    return rng.weighted(weighted.map((o) => [o, o.weight ?? 0] as const));
  }
  return passing[0] ?? null;
}

export function interpolate(text: string, s: RunState, realm: string): string {
  return text
    .replaceAll('{level}', String(s.realm.level))
    .replaceAll('{realm}', realm)
    .replaceAll('{age}', String(s.age));
}

export interface ResolveOptions {
  /** `trust`：闸门已在决策生成时求值并固化，跳过重复求值（防 chance 节点双重消费） */
  gates?: 'eval' | 'trust';
}

function applyChainFlags(s: RunState, event: EventDef): void {
  if (event.chain?.consumesFlag) s.flags[event.chain.consumesFlag] = 0;
  if (event.chain?.setsFlag) s.flags[event.chain.setsFlag] = 1;
}

export function resolveChoice(
  s: RunState,
  event: EventDef,
  choiceId: string,
  ctx: ApplyCtx,
  realmName: string,
  opts: ResolveOptions = {},
): ResolveResult {
  const choice = event.choices.find((c) => c.id === choiceId);
  const empty: ResolveResult = {
    ok: false,
    text: '',
    logs: [],
    chained: [],
    scheduled: [],
    ended: null,
  };
  if (!choice) return empty;
  const evalCtx = ctx.evalCtx ?? makeEvalCtx(ctx.content, ctx.rng);
  if (opts.gates !== 'trust') {
    if (choice.show && !evalCondition(s, choice.show, evalCtx, `${event.id}.${choiceId}.show`)) {
      return empty;
    }
    if (choice.enable && !evalCondition(s, choice.enable, evalCtx, `${event.id}.${choiceId}.enable`)) {
      return empty;
    }
    if (!canPayCost(s, choice.cost, ctx, evalCtx)) return empty;
  }

  const env: Env = {
    s,
    ctx: evalCtx,
    overlay: new Map(),
    snap: new Map(),
    logs: [],
    chained: [],
    scheduled: [],
    ended: null,
  };
  if (choice.cost) applyList(env, choice.cost, `${event.id}.${choiceId}.cost`);
  commit(env);

  const outcome = pickOutcome(s, choice.outcomes, evalCtx, ctx.rng, `${event.id}.${choiceId}`);
  if (!outcome) {
    applyChainFlags(s, event);
    return { ...empty, ok: true };
  }

  const pctTargets = new Map<string, Target>();
  collectPctTargets(outcome.effects, pctTargets);
  for (const [k, t] of pctTargets) env.snap.set(k, readTarget(s, t));
  applyList(env, outcome.effects, `${event.id}.${choiceId}.outcome`);
  commit(env);
  clampAll(s);

  const tone: LogTone = outcome.tone ?? 'ev1';
  const text = interpolate(outcome.text, s, realmName);
  const lines: LogLine[] = [{ cls: tone, text }, ...env.logs];

  if (env.chained.length > 0) {
    if (s.chainDepth >= CHAIN_DEPTH_MAX) {
      env.chained = [];
    } else {
      s.chainDepth += 1;
    }
  }

  if (env.ended) {
    s.endedReason = env.ended;
    if (env.ended !== 'immortal' && env.ended !== 'zhengdao') s.dead = true;
  }
  applyChainFlags(s, event);

  return {
    ok: true,
    text,
    logs: lines,
    chained: env.chained,
    scheduled: env.scheduled,
    ended: env.ended,
  };
}

const TARGET_LABELS: Record<string, string> = {
  cultivation: '修为',
  simPoints: '模拟点',
  root: '灵根',
  luck: '气运',
  artifactPower: '法宝之力',
  artifactBonus: '法宝加成',
  xianqi: '仙灵气',
  chaosQi: '混沌气',
  insight: '悟性',
  toxicity: '丹毒',
  herb: '药材',
  pill: '丹药',
  artLevel: '功法',
  artInsight: '功法感悟',
  sectContribution: '宗门贡献',
  sectRank: '宗门职位',
  bondLevel: '羁绊等级',
  bondAffinity: '羁绊好感',
  realmLevel: '境界',
  yearsStayed: '滞留年数',
};

export function formatCost(cost: Effect[] | undefined): string | undefined {
  if (!cost || cost.length === 0) return undefined;
  const parts: string[] = [];
  for (const e of cost) {
    if (!('target' in e)) continue;
    const label = TARGET_LABELS[e.target.k] ?? e.target.k;
    const id = 'id' in e.target ? (e.target.id as string) : '';
    if (e.op === 'sub' || e.op === 'add') {
      parts.push(`${label}${id ? `·${id}` : ''}${e.op === 'sub' ? '−' : '+'}${e.value}`);
    } else if (e.op === 'pct') {
      parts.push(`${label}±${e.value}%`);
    }
  }
  return parts.length > 0 ? parts.join('、') : undefined;
}

const KIND_BY_CATEGORY: Record<EventCategory, DecisionKind> = {
  world: 'world',
  encounter: 'encounter',
  bond: 'bond',
  sect: 'sect',
  alchemy: 'alchemy',
  chain: 'world',
  tribulation: 'tribulation',
  fate: 'world',
};

/**
 * 决策生成时求值并**固化**每个选项的 show/enable 与代价可支付性。
 * 结算走 `gates: 'trust'`，同一 chance 节点在一次事件内只消费一次 RNG。
 */
export function buildEventDecision(
  s: RunState,
  event: EventDef,
  content: ContentBundle,
  rng: Rng,
  realmName: string,
): Decision {
  const evalCtx = makeEvalCtx(content, rng);
  const ctx: ApplyCtx = { content, rng, evalCtx };
  const choices: DecisionChoice[] = event.choices.map((c: Choice) => {
    const shown =
      c.show === undefined || evalCondition(s, c.show, evalCtx, `${event.id}.${c.id}.show`);
    const affordable = shown && canPayCost(s, c.cost, ctx, evalCtx);
    const enabled =
      affordable &&
      (c.enable === undefined || evalCondition(s, c.enable, evalCtx, `${event.id}.${c.id}.enable`));
    const ch: DecisionChoice = { id: c.id, label: c.label, show: shown, enable: enabled };
    if (!enabled && c.disabledReason) ch.disabledReason = c.disabledReason;
    const costLabel = formatCost(c.cost);
    if (costLabel) ch.costLabel = costLabel;
    if (c.hint) ch.hint = c.hint;
    return ch;
  });
  return {
    source: 'event',
    kind: KIND_BY_CATEGORY[event.category],
    eventId: event.id,
    title: event.title,
    body: interpolate(event.body, s, realmName),
    choices,
  };
}
