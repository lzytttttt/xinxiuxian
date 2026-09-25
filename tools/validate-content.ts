import { BUNDLE } from '../src/content/index';
import { evalCondition, makeEvalCtx } from '../src/engine/conditions';
import { createRun } from '../src/engine/newRun';
import { makeRngBag } from '../src/engine/rng';
import type {
  BondType,
  Condition,
  ContentBundle,
  Effect,
  EventDef,
} from '../src/engine/types/effects';
import type { RunState } from '../src/engine/types/run';

interface Finding {
  level: 'error' | 'warning';
  rule: string;
  detail: string;
}

const findings: Finding[] = [];
const error = (rule: string, detail: string): void => {
  findings.push({ level: 'error', rule, detail });
};
const warn = (rule: string, detail: string): void => {
  findings.push({ level: 'warning', rule, detail });
};

const TARGET_KINDS = new Set([
  'cultivation',
  'simPoints',
  'root',
  'luck',
  'artifactPower',
  'artifactBonus',
  'xianqi',
  'chaosQi',
  'insight',
  'toxicity',
  'herb',
  'pill',
  'artLevel',
  'artInsight',
  'sectContribution',
  'sectRank',
  'bondLevel',
  'bondAffinity',
  'flag',
  'cooldown',
  'realmLevel',
  'yearsStayed',
]);

interface Tables {
  arts?: { id: string }[];
  pills?: { id: string }[];
  herbs?: { id: string }[];
  recipes?: { id: string }[];
}

function walkCondition(c: Condition, visit: (x: Condition) => void): void {
  visit(c);
  switch (c.op) {
    case 'and':
    case 'or':
      for (const sub of c.of) walkCondition(sub, visit);
      return;
    case 'not':
      walkCondition(c.of, visit);
      return;
    default:
      return;
  }
}

function walkEffects(effects: Effect[], visit: (e: Effect) => void): void {
  for (const e of effects) {
    visit(e);
    if (e.op === 'if') {
      walkCondition(e.cond, () => undefined);
      walkEffects(e.then, visit);
      if (e.else) walkEffects(e.else, visit);
    }
  }
}

function collectConditions(ev: EventDef, into: Condition[]): void {
  if (ev.requires) into.push(ev.requires);
  for (const ch of ev.choices) {
    if (ch.show) into.push(ch.show);
    if (ch.enable) into.push(ch.enable);
    for (const o of ch.outcomes) {
      if (o.when) into.push(o.when);
    }
  }
}

function collectEffects(ev: EventDef, into: Effect[]): void {
  for (const ch of ev.choices) {
    if (ch.cost) into.push(...ch.cost);
    for (const o of ch.outcomes) into.push(...o.effects);
  }
}

/** 条件树内 chance 节点路径唯一（结构路径按索引构造，重引用才会撞路径） */
function checkChancePaths(ev: EventDef): void {
  const seen = new Set<string>();
  const walk = (c: Condition, path: string): void => {
    if (c.op === 'chance') {
      if (seen.has(path)) error('chance 路径唯一', `${ev.id}: 路径 ${path} 出现两个 chance 节点`);
      seen.add(path);
      return;
    }
    if (c.op === 'and' || c.op === 'or') {
      c.of.forEach((sub, i) => walk(sub, `${path}.${c.op}${i}`));
      return;
    }
    if (c.op === 'not') walk(c.of, `${path}.not`);
  };
  const conds: Condition[] = [];
  collectConditions(ev, conds);
  conds.forEach((c, i) => walk(c, `c${i}`));
}

function checkOutcomeFallback(ev: EventDef): void {
  for (const ch of ev.choices) {
    if (ch.outcomes.length === 0) {
      error('outcome 非空', `${ev.id}.${ch.id}: outcomes 为空`);
      continue;
    }
    const weighted = ch.outcomes.filter((o) => o.weight !== undefined);
    const unweighted = ch.outcomes.filter((o) => o.weight === undefined);
    if (weighted.length > 0 && unweighted.length > 0) {
      warn('加权与无权重混用', `${ev.id}.${ch.id}: 加权 outcome 存在时无权重项只在 when 过滤后兜底`);
    }
    if (weighted.length === 0) {
      const firstFallback = ch.outcomes.findIndex((o) => o.when === undefined);
      if (firstFallback >= 0 && firstFallback !== ch.outcomes.length - 1) {
        error('兜底 outcome 末尾', `${ev.id}.${ch.id}: 无 when 的兜底 outcome 不在数组末尾`);
      }
    }
  }
}

function checkChoiceAlwaysAvailable(ev: EventDef): void {
  const hasUnconditional = ev.choices.some((ch) => ch.show === undefined);
  if (!hasUnconditional) {
    error('至少一个无条件选项', `${ev.id}: 所有选项都带 show 条件，可能全不可见（软锁）`);
  }
}

function checkTargetsAndPct(ev: EventDef): void {
  const effects: Effect[] = [];
  collectEffects(ev, effects);
  for (const e of effects) {
    if ('target' in e) {
      if (!TARGET_KINDS.has(e.target.k)) {
        error('target 合法', `${ev.id}: 未知 target.k = ${e.target.k}`);
      }
      if (e.op === 'pct' && Math.abs(e.value) > 100) {
        warn('pct 范围', `${ev.id}: pct ${e.target.k} = ${e.value}%（>100%）`);
      }
    }
  }
}

function checkRealmField(ev: EventDef): void {
  if ('realm' in (ev as unknown as Record<string, unknown>)) {
    error('不得有 realm 字段', `${ev.id}: 位面门控必须走 levelMin/levelMax`);
  }
}

function checkOnceMaxCount(ev: EventDef): void {
  if (ev.once && ev.maxCount !== undefined) {
    warn('once 与 maxCount 冲突', `${ev.id}: 两者同时出现，maxCount 不生效`);
  }
}

function checkGrants(ev: EventDef, tables: Tables): void {
  const effects: Effect[] = [];
  collectEffects(ev, effects);
  const check = (kind: string, id: string, table: { id: string }[] | undefined): void => {
    if (!table || table.length === 0) return;
    if (!table.some((x) => x.id === id)) error('grant.id 可解析', `${ev.id}: ${kind} ${id} 不存在`);
  };
  for (const e of effects) {
    if (e.op === 'grantPill') check('pill', e.id, tables.pills);
    if (e.op === 'grantHerb') check('herb', e.id, tables.herbs);
    if (e.op === 'grantArt') check('art', e.id, tables.arts);
    if (e.op === 'learnRecipe') check('recipe', e.id, tables.recipes);
  }
}

/** 可达性探针：把 chance/roll 视为"可能通过"，只检验其余门槛 */
function relax(c: Condition): Condition {
  if (c.op === 'chance' || c.op === 'roll') return { op: 'always' };
  if (c.op === 'and' || c.op === 'or') return { op: c.op, of: c.of.map(relax) };
  if (c.op === 'not') return { op: 'not', of: relax(c.of) };
  return c;
}

interface ProbeNeeds {
  flags: string[];
  pills: string[];
  herbs: string[];
  sects: string[];
  bondTypes: BondType[];
  maxLife: number;
  minToxicity: number;
}

function collectNeeds(content: ContentBundle): ProbeNeeds {
  const needs: ProbeNeeds = {
    flags: [],
    pills: [],
    herbs: [],
    sects: [],
    bondTypes: [],
    maxLife: 1,
    minToxicity: 100,
  };
  const push = <T>(xs: T[], x: T): void => {
    if (!xs.includes(x)) xs.push(x);
  };
  for (const ev of content.events) {
    const conds: Condition[] = [];
    collectConditions(ev, conds);
    const effects: Effect[] = [];
    collectEffects(ev, effects);
    for (const e of effects) if (e.op === 'if') conds.push(e.cond);
    for (const c of conds) {
      walkCondition(c, (x) => {
        if (x.op === 'flag') push(needs.flags, x.id);
        if (x.op === 'hasPill') push(needs.pills, x.id);
        if (x.op === 'hasHerb') push(needs.herbs, x.id);
        if (x.op === 'sect') push(needs.sects, x.id);
        if (x.op === 'bondType') push(needs.bondTypes, x.type);
        if (x.op === 'lifeAtLeast') needs.maxLife = Math.max(needs.maxLife, x.n);
        if (x.op === 'toxicityAtMost') needs.minToxicity = Math.min(needs.minToxicity, x.value);
      });
    }
  }
  return needs;
}

function probeState(seed: string, level: number, variant: number, needs: ProbeNeeds): RunState {
  const rng = makeRngBag(seed);
  const s = createRun(
    seed,
    1,
    { tier: 5, value: 50, luck: 20, simPoints: 120, fates: [], guard: false },
    rng,
    { runId: seed, createdAt: 0, battlePolicy: 'manual' },
  );
  s.realm.level = level;
  s.realm.arc = level > 100 ? 'immortal' : 'mortal';
  if (variant >= 1) {
    for (const f of needs.flags) s.flags[f] = 1;
    for (const p of needs.pills) s.pills[p] = 99;
    for (const h of needs.herbs) s.herbs[h] = 99;
    for (const bt of needs.bondTypes) {
      for (let i = 0; i < 10; i++) {
        s.bonds.list.push({
          id: `probe-${bt}-${i}`,
          name: '探针',
          type: bt,
          level: 5,
          affinity: 100,
          createdYear: 0,
          seed: 'probe',
        });
      }
    }
    s.sect.rank = 4;
    s.root = 100;
    s.life = needs.maxLife;
    s.toxicity = needs.minToxicity;
  }
  if (variant >= 2) {
    const sectId = needs.sects[variant - 2];
    if (sectId) s.sect.id = sectId;
  }
  return s;
}

function sampleStates(content: ContentBundle): RunState[] {
  const needs = collectNeeds(content);
  const variants = 2 + needs.sects.length;
  const states: RunState[] = [];
  for (let level = 1; level <= 200; level++) {
    for (let v = 0; v < variants; v++) {
      states.push(probeState(`probe-${level}-${v}`, level, v, needs));
    }
  }
  return states;
}

function eligibleIn(s: RunState, ev: EventDef, content: ContentBundle): boolean {
  if (ev.weight <= 0) return false;
  if (ev.levelMin !== undefined && s.realm.level < ev.levelMin) return false;
  if (ev.levelMax !== undefined && s.realm.level > ev.levelMax) return false;
  if (ev.requires) {
    const ctx = makeEvalCtx(content, makeRngBag(`${ev.id}:probe`).event);
    if (!evalCondition(s, relax(ev.requires), ctx, `${ev.id}.probe`)) return false;
  }
  return true;
}

function main(): void {  const content = BUNDLE as ContentBundle & Tables;
  const stats = process.argv.includes('--stats');
  const skipReach = process.argv.includes('--no-reach');

  const ids = new Set<string>();
  const flagWrites = new Map<string, string[]>();
  const flagReads = new Map<string, string[]>();
  const add = (map: Map<string, string[]>, id: string, ev: string): void => {
    const list = map.get(id) ?? [];
    list.push(ev);
    map.set(id, list);
  };

  for (const ev of content.events) {
    if (ids.has(ev.id)) error('事件 id 唯一', `${ev.id} 重复`);
    ids.add(ev.id);
    checkRealmField(ev);
    checkOnceMaxCount(ev);
    checkOutcomeFallback(ev);
    checkChoiceAlwaysAvailable(ev);
    checkChancePaths(ev);
    checkTargetsAndPct(ev);
    checkGrants(ev, content);

    const effects: Effect[] = [];
    collectEffects(ev, effects);
    for (const e of effects) {
      if (e.op === 'setFlag' || e.op === 'incFlag' || e.op === 'clearFlag') add(flagWrites, e.id, ev.id);
    }
    if (ev.chain?.setsFlag) add(flagWrites, ev.chain.setsFlag, ev.id);
    const conds: Condition[] = [];
    collectConditions(ev, conds);
    for (const c of conds) {
      walkCondition(c, (x) => {
        if (x.op === 'flag') add(flagReads, x.id, ev.id);
      });
    }
    for (const e of effects) {
      if (e.op === 'if') {
        walkCondition(e.cond, (x) => {
          if (x.op === 'flag') add(flagReads, x.id, ev.id);
        });
      }
    }
    if (ev.chain?.consumesFlag) add(flagReads, ev.chain.consumesFlag, ev.id);
  }

  for (const [flag, readers] of flagReads) {
    if (!flagWrites.has(flag)) {
      error('孤儿 flag（读无写）', `${flag} 被 ${readers.join('、')} 读取，但无任何写入方`);
    }
  }
  for (const [flag, writers] of flagWrites) {
    if (!flagReads.has(flag)) {
      warn('死 flag（写无读）', `${flag} 被 ${writers.join('、')} 写入，但无任何读取方`);
    }
  }

  const unreachable: string[] = [];
  if (!skipReach) {
    const states = sampleStates(content);
    for (const ev of content.events) {
      if (!states.some((s) => eligibleIn(s, ev, content))) unreachable.push(ev.id);
    }
    for (const id of unreachable) error('事件可达', `${id}: 采样状态中无任何状态可使其进入事件池`);
  }

  const byCategory = new Map<string, number>();
  let choiceTotal = 0;
  let multiChoice = 0;
  let choicePoints = 0;
  for (const ev of content.events) {
    byCategory.set(ev.category, (byCategory.get(ev.category) ?? 0) + 1);
    choiceTotal += ev.choices.length;
    choicePoints += ev.choices.length;
    if (ev.choices.length >= 2) multiChoice += 1;
  }

  const errors = findings.filter((f) => f.level === 'error');
  const warnings = findings.filter((f) => f.level === 'warning');

  if (stats) {
    console.log('── 内容统计 ──');
    console.log(`事件数: ${content.events.length}`);
    console.log(`选项总数: ${choiceTotal}，平均选项数: ${(choiceTotal / content.events.length).toFixed(2)}`);
    console.log(`多选项事件（≥2）: ${multiChoice}`);
    console.log(`事件池分布: ${[...byCategory.entries()].map(([k, v]) => `${k} ${v}`).join(' / ')}`);
    console.log(`覆盖事件: ${content.events.length - unreachable.length}/${content.events.length}`);
    if (content.arts?.length) console.log(`功法: ${content.arts.length}`);
    console.log('');
  }

  for (const f of findings) {
    const tag = f.level === 'error' ? 'ERROR' : 'WARN ';
    console.log(`${tag} [${f.rule}] ${f.detail}`);
  }
  console.log(`\n校验完成：${errors.length} error / ${warnings.length} warning`);
  process.exitCode = errors.length > 0 ? 1 : 0;
}

main();
