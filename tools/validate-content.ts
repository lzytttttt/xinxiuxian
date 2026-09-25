import { BUNDLE } from '../src/content/index';
import { evalCondition, makeEvalCtx } from '../src/engine/conditions';
import { createRun } from '../src/engine/newRun';
import { makeRngBag } from '../src/engine/rng';
import type {
  ArtDef,
  BondType,
  Condition,
  ContentBundle,
  Effect,
  EventDef,
  Herb,
  PillDef,
  Recipe,
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
  arts?: ArtDef[];
  pills?: PillDef[];
  herbs?: Herb[];
  recipes?: Recipe[];
}

/** 引擎侧消费的 flag（不在内容里读，拦截「死 flag」误报） */
const ENGINE_FLAGS = new Set(['dao_seat']);

const SCHOOL_SET = new Set(['剑修', '丹修', '体修', '毒修', '雷修', '魔修']);
const ZONE_SET = new Set(['z1', 'z2', 'z3', 'z4', 'z6']);
const PILL_TYPE_SET = new Set(['聚气', '洗髓', '天机', '炼宝', '破境', '护劫', '疗毒']);
const HERB_TAG_SET = new Set(['火', '寒', '毒', '木', '金', '血', '雷', '魂']);
const HERB_NATURE_SET = new Set(['阳', '阴', '平']);
const CURVE_SET = new Set(['flat', 'rise', 'fall', 'pulse']);

function checkArts(arts: ArtDef[] | undefined): void {
  if (!arts) return;
  const ids = new Set<string>();
  const perSchool = new Map<string, number>();
  for (const art of arts) {
    if (ids.has(art.id)) error('功法 id 唯一', `${art.id} 重复`);
    ids.add(art.id);
    if (!SCHOOL_SET.has(art.school)) error('功法流派合法', `${art.id}: 未知流派 ${art.school}`);
    perSchool.set(art.school, (perSchool.get(art.school) ?? 0) + 1);
    const zones = Object.keys(art.passives);
    if (zones.length === 0) error('功法至少一个被动', `${art.id}: passives 为空`);
    for (const [zone, per] of Object.entries(art.passives)) {
      if (!ZONE_SET.has(zone)) error('功法乘区合法', `${art.id}: 未知乘区 ${zone}`);
      if (!(per > 0)) error('功法被动为正', `${art.id}.${zone} = ${per}`);
      if (per > 0.2) warn('功法被动量级', `${art.id}.${zone} = ${per}/级（>0.2，注意触顶）`);
    }
    if (art.requires) {
      const conds: Condition[] = [art.requires];
      for (const c of conds) {
        walkCondition(c, (x) => {
          if (x.op === 'chance' || x.op === 'roll')
            error('功法 requires 不得含随机节点', `${art.id}: 功法门槛必须是确定条件`);
        });
      }
    }
  }
  for (const [school, n] of perSchool) {
    if (n < 4) warn('流派功法数', `${school} 只有 ${n} 门（<4，凑不齐一条共鸣线）`);
  }
}

function checkHerbs(herbs: Herb[] | undefined): void {
  if (!herbs) return;
  const ids = new Set<string>();
  const perTier = new Map<number, number>();
  for (const herb of herbs) {
    if (ids.has(herb.id)) error('药材 id 唯一', `${herb.id} 重复`);
    ids.add(herb.id);
    if (!(herb.tier >= 1 && herb.tier <= 10)) error('药材阶位 1-10', `${herb.id}: tier=${herb.tier}`);
    if (!HERB_NATURE_SET.has(herb.nature)) error('药材药性合法', `${herb.id}: ${herb.nature}`);
    if (!(herb.potency > 0)) error('药力为正', `${herb.id}: potency=${herb.potency}`);
    if (herb.tags.length === 0) warn('药材至少一个标签', `${herb.id}: tags 为空`);
    for (const tag of herb.tags) {
      if (!HERB_TAG_SET.has(tag)) error('药材标签合法', `${herb.id}: 未知标签 ${tag}`);
    }
    perTier.set(herb.tier, (perTier.get(herb.tier) ?? 0) + 1);
  }
  for (const tier of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const n = perTier.get(tier) ?? 0;
    if (n === 0) error('每阶都有药材', `${tier} 阶无药材（丹方会缺料）`);
    else if (n < 4) warn('每阶药材数', `${tier} 阶只有 ${n} 味（<4，搭配空间小）`);
  }
}

function checkPills(pills: PillDef[] | undefined): void {
  if (!pills) return;
  const ids = new Set<string>();
  const perType = new Map<string, number>();
  for (const pill of pills) {
    if (ids.has(pill.id)) error('丹药 id 唯一', `${pill.id} 重复`);
    ids.add(pill.id);
    if (!PILL_TYPE_SET.has(pill.type)) error('丹药类型合法', `${pill.id}: ${pill.type}`);
    if (!(pill.tier >= 1 && pill.tier <= 10)) error('丹药阶位 1-10', `${pill.id}: tier=${pill.tier}`);
    if (!(pill.base > 0)) error('丹药基准效果为正', `${pill.id}: base=${pill.base}`);
    if (!(pill.zoneBase > 0)) error('丹药药力为正', `${pill.id}: zoneBase=${pill.zoneBase}`);
    if (pill.zoneBase > 0.5) warn('丹药药力量级', `${pill.id}: zoneBase=${pill.zoneBase}（>0.5，Z5 易触顶）`);
    perType.set(pill.type, (perType.get(pill.type) ?? 0) + 1);
  }
  for (const type of PILL_TYPE_SET) {
    if ((perType.get(type) ?? 0) === 0) error('七类丹药齐备', `缺少「${type}」类丹药`);
  }
}

function checkRecipes(recipes: Recipe[] | undefined, tables: Tables): void {
  if (!recipes) return;
  const ids = new Set<string>();
  const pillIds = new Set((tables.pills ?? []).map((p) => p.id));
  const herbTiers = new Map((tables.herbs ?? []).map((h) => [h.id, h.tier]));
  for (const recipe of recipes) {
    if (ids.has(recipe.id)) error('丹方 id 唯一', `${recipe.id} 重复`);
    ids.add(recipe.id);
    if (!(recipe.tier >= 1 && recipe.tier <= 10)) error('丹方阶位 1-10', `${recipe.id}: tier=${recipe.tier}`);
    if (!PILL_TYPE_SET.has(recipe.type) || recipe.type !== (tables.pills ?? []).find((p) => p.id === recipe.pill)?.type) {
      error('丹方类型与产出丹药一致', `${recipe.id}: type=${recipe.type} pill=${recipe.pill}`);
    }
    if (!pillIds.has(recipe.pill)) error('丹方产出可解析', `${recipe.id}: pill ${recipe.pill} 不存在`);
    if (recipe.school && !SCHOOL_SET.has(recipe.school)) error('丹方流派合法', `${recipe.id}: ${recipe.school}`);
    if (recipe.inputs.length === 0) error('丹方需材料', `${recipe.id}: inputs 为空`);
    for (const input of recipe.inputs) {
      const tier = herbTiers.get(input.herb);
      if (tier === undefined) error('丹方材料可解析', `${recipe.id}: herb ${input.herb} 不存在`);
      if (!(input.count > 0)) error('材料数量为正', `${recipe.id}.${input.herb} = ${input.count}`);
      if (tier !== undefined && Math.abs(tier - recipe.tier) > 1) {
        warn('材料阶位贴近丹方', `${recipe.id}(${recipe.tier} 阶) 用 ${tier} 阶药材 ${input.herb}`);
      }
    }
    const f = recipe.furnace;
    if (!CURVE_SET.has(f.curve)) error('火候曲线合法', `${recipe.id}: ${f.curve}`);
    if (!(f.steps >= 4 && f.steps <= 20)) error('火候步数 4-20', `${recipe.id}: steps=${f.steps}`);
    if (!(f.noise >= 0 && f.noise <= 0.5)) error('噪声范围', `${recipe.id}: noise=${f.noise}`);
    if (!(f.tolerance > 0 && f.tolerance <= 20)) error('容差范围', `${recipe.id}: tolerance=${f.tolerance}`);
    if (!(f.targetTemp >= 20 && f.targetTemp <= 100)) error('目标温度 20-100', `${recipe.id}: ${f.targetTemp}`);
    if (!(recipe.baseGrade >= 1 && recipe.baseGrade <= 6)) error('品质基准 1-6', `${recipe.id}: ${recipe.baseGrade}`);
    walkCondition(recipe.unlock, (x) => {
      if (x.op === 'chance' || x.op === 'roll') {
        error('丹方 unlock 必须确定性', `${recipe.id}: unlock 不得含 ${x.op} 节点`);
      }
    });
  }
  const perTierBand = { low: 0, mid: 0, high: 0, top: 0 };
  for (const r of recipes) {
    if (r.tier <= 3) perTierBand.low += 1;
    else if (r.tier <= 6) perTierBand.mid += 1;
    else if (r.tier <= 9) perTierBand.high += 1;
    else perTierBand.top += 1;
  }
  if (perTierBand.low < 8) warn('丹方阶位分布', `1-3 阶只有 ${perTierBand.low} 张`);
  if (perTierBand.mid < 8) warn('丹方阶位分布', `4-6 阶只有 ${perTierBand.mid} 张`);
  if (perTierBand.high < 6) warn('丹方阶位分布', `7-9 阶只有 ${perTierBand.high} 张`);
  if (perTierBand.top < 2) warn('丹方阶位分布', `10 阶只有 ${perTierBand.top} 张`);
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

function main(): void {
  const content = BUNDLE as ContentBundle & Tables;
  const stats = process.argv.includes('--stats');
  const skipReach = process.argv.includes('--no-reach');

  checkArts(content.arts);
  checkHerbs(content.herbs);
  checkPills(content.pills);
  checkRecipes(content.recipes, content);

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

  // 丹方 unlock 也读 flag（如 10 阶丹方要求 dan_hall）
  for (const recipe of content.recipes ?? []) {
    walkCondition(recipe.unlock, (x) => {
      if (x.op === 'flag') add(flagReads, x.id, recipe.id);
    });
  }

  for (const [flag, readers] of flagReads) {
    if (!flagWrites.has(flag)) {
      error('孤儿 flag（读无写）', `${flag} 被 ${readers.join('、')} 读取，但无任何写入方`);
    }
  }
  for (const [flag, writers] of flagWrites) {
    if (!flagReads.has(flag) && !ENGINE_FLAGS.has(flag)) {
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
    if (content.arts?.length) {
      const perSchool = new Map<string, number>();
      for (const a of content.arts) perSchool.set(a.school, (perSchool.get(a.school) ?? 0) + 1);
      console.log(`功法: ${content.arts.length}（${[...perSchool.entries()].map(([k, v]) => `${k} ${v}`).join(' / ')}）`);
      const granting = content.events.filter((ev) =>
        ev.choices.some((ch) => ch.outcomes.some((o) => o.effects.some((e) => e.op === 'grantArt'))),
      ).length;
      console.log(`发放功法的事件: ${granting}`);
    }
    if (content.herbs?.length) {
      const perTier = new Map<number, number>();
      for (const h of content.herbs) perTier.set(h.tier, (perTier.get(h.tier) ?? 0) + 1);
      console.log(
        `药材: ${content.herbs.length}（各阶 ${Array.from({ length: 10 }, (_, i) => perTier.get(i + 1) ?? 0).join('/')}）`,
      );
      const herbGranting = content.events.filter((ev) =>
        ev.choices.some((ch) => ch.outcomes.some((o) => o.effects.some((e) => e.op === 'grantHerb'))),
      ).length;
      console.log(`发放药材的事件: ${herbGranting}`);
    }
    if (content.pills?.length) {
      const perType = new Map<string, number>();
      for (const p of content.pills) perType.set(p.type, (perType.get(p.type) ?? 0) + 1);
      console.log(`丹药: ${content.pills.length}（${[...perType.entries()].map(([k, v]) => `${k} ${v}`).join(' / ')}）`);
    }
    if (content.recipes?.length) {
      const bands = { 低阶: 0, 中阶: 0, 高阶: 0, 顶阶: 0 };
      for (const r of content.recipes) {
        if (r.tier <= 3) bands.低阶 += 1;
        else if (r.tier <= 6) bands.中阶 += 1;
        else if (r.tier <= 9) bands.高阶 += 1;
        else bands.顶阶 += 1;
      }
      console.log(
        `丹方: ${content.recipes.length}（1-3 阶 ${bands.低阶} / 4-6 阶 ${bands.中阶} / 7-9 阶 ${bands.高阶} / 10 阶 ${bands.顶阶}）`,
      );
      const learn = content.events.filter((ev) =>
        ev.choices.some((ch) => ch.outcomes.some((o) => o.effects.some((e) => e.op === 'learnRecipe'))),
      ).length;
      console.log(`授予丹方的事件: ${learn}`);
    }
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
