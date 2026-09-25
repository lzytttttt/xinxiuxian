import type { LogTone, RunEndReason } from './log';

export type SchoolId = '剑修' | '丹修' | '体修' | '毒修' | '雷修' | '魔修';

/** 战力构成乘区：Z5 本 Phase 无内容侧来源，故不入 id 集合 */
export type ZoneId = 'z1' | 'z2' | 'z3' | 'z4' | 'z6';

export interface ArtDef {
  id: string;
  name: string;
  school: SchoolId;
  /** 1 凡 / 2 灵 / 3 玄 / 4 地 / 5 天，仅影响获取权重与文案 */
  quality: 1 | 2 | 3 | 4 | 5;
  /** 每级增量；L 级贡献 = 值 × L（区内加法） */
  passives: Partial<Record<ZoneId, number>>;
  text: string;
  requires?: Condition;
}

export type BondType = '道侣' | '师徒' | '挚友' | '宿敌' | '同门';

// ── Phase 4：药材 / 丹药 / 丹方 ──
export type HerbTag = '火' | '寒' | '毒' | '木' | '金' | '血' | '雷' | '魂';
export type HerbNature = '阳' | '阴' | '平';

export interface Herb {
  id: string;
  name: string;
  tier: number;
  nature: HerbNature;
  /** 药力：不足则成品品质封顶（见 engine/alchemy.ts::potencyCap） */
  potency: number;
  tags: HerbTag[];
}

export type PillType = '聚气' | '洗髓' | '天机' | '炼宝' | '破境' | '护劫' | '疗毒';

export interface PillDef {
  id: string;
  name: string;
  type: PillType;
  tier: number;
  /** 中品（quality = 3）基准效果；实际 = base × 品质倍率 */
  base: number;
  /** 服后进入乘区 `zone` 的药力（中品基准），持续 PILL_BUFF_YEARS 年 */
  zoneBase: number;
  /** 药力落点：聚气/破境/护劫/疗毒 → z5；洗髓 → z2；炼宝 → z3；天机 → z6（对齐 04-arts-build 面板口径） */
  zone: 'z2' | 'z3' | 'z5' | 'z6';
  text: string;
}

export type TempCurve = 'flat' | 'rise' | 'fall' | 'pulse';

export interface Recipe {
  id: string;
  name: string;
  tier: number;
  type: PillType;
  inputs: { herb: string; count: number }[];
  furnace: {
    targetTemp: number;
    curve: TempCurve;
    steps: number;
    noise: number;
    tolerance: number;
  };
  /** 产出的丹药 id（同一种丹药可由多张丹方炼出） */
  pill: string;
  /** 流派专属丹方（解锁条件之外再要求对应流派功法数） */
  school?: SchoolId;
  /** 确定性解锁条件；禁 chance/roll（校验器强制） */
  unlock: Condition;
  baseGrade: number;
}

export type FateAttr = 'root' | 'luck' | 'xianqi' | 'artifact' | 'brk' | 'trib';

export type FateColor = 'green' | 'blue' | 'purple' | 'gold';

export interface Fate {
  id: string;
  name: string;
  attr: FateAttr;
  color: FateColor;
  value: number;
  text: string;
}

export type Target =
  | { k: 'cultivation' }
  | { k: 'simPoints' }
  | { k: 'root' }
  | { k: 'luck' }
  | { k: 'artifactPower' }
  | { k: 'artifactBonus' }
  | { k: 'xianqi' }
  | { k: 'chaosQi' }
  | { k: 'insight' }
  | { k: 'toxicity' }
  | { k: 'herb'; id: string }
  | { k: 'pill'; id: string }
  | { k: 'artLevel'; id: string }
  | { k: 'artInsight'; id: string }
  | { k: 'sectContribution' }
  | { k: 'sectRank' }
  | { k: 'bondLevel'; id: string }
  | { k: 'bondAffinity'; id: string }
  | { k: 'flag'; id: string }
  | { k: 'cooldown'; id: string }
  | { k: 'realmLevel' }
  | { k: 'yearsStayed' };

export type Cmp = '<' | '<=' | '==' | '>=' | '>';

export type Condition =
  | { op: 'always' }
  | { op: 'never' }
  | { op: 'and'; of: Condition[] }
  | { op: 'or'; of: Condition[] }
  | { op: 'not'; of: Condition }
  | { op: 'cmp'; target: Target; cmp: Cmp; value: number }
  | { op: 'flag'; id: string; min?: number; max?: number }
  | { op: 'sect'; id: string }
  | { op: 'rankAtLeast'; rank: number }
  | { op: 'school'; id: SchoolId; countAtLeast: number }
  | { op: 'bondType'; type: BondType; countAtLeast: number }
  | { op: 'hasPill'; id: string; countAtLeast?: number }
  | { op: 'hasHerb'; id: string; countAtLeast?: number }
  | { op: 'toxicityAtMost'; value: number }
  | { op: 'rootTierAtLeast'; tier: number }
  | { op: 'realmAtLeast'; level: number }
  | { op: 'lifeAtLeast'; n: number }
  | { op: 'chance'; p: number }
  | { op: 'roll'; table: string };

export type Effect =
  | { op: 'add' | 'sub'; target: Target; value: number }
  | { op: 'pct'; target: Target; value: number; base?: 'snapshot' | 'live' }
  | { op: 'set' | 'mul'; target: Target; value: number }
  | { op: 'clamp'; target: Target; lo?: number; hi?: number }
  | { op: 'setFlag' | 'incFlag'; id: string; value?: number }
  | { op: 'clearFlag'; id: string }
  | { op: 'setCooldown'; id: string; years?: number }
  | { op: 'grantPill'; id: string; count: number }
  | { op: 'grantHerb'; id: string; count: number }
  | { op: 'grantArt'; id: string }
  | { op: 'learnRecipe'; id: string }
  | { op: 'gainInsight'; value: number }
  | { op: 'addToxicity'; value: number }
  | {
      op: 'bond';
      action: 'create' | 'levelUp' | 'break' | 'retype';
      type?: BondType;
      id?: string;
      npcSeed?: string;
    }
  | { op: 'sectJoin'; id: string }
  | { op: 'sectLeave'; defect: boolean }
  | { op: 'chain'; eventId: string }
  | { op: 'schedule'; eventId: string; inYears: number }
  | { op: 'log'; text: string; tone?: LogTone }
  | { op: 'endRun'; reason: RunEndReason }
  | { op: 'if'; cond: Condition; then: Effect[]; else?: Effect[] };

export interface Outcome {
  when?: Condition;
  weight?: number;
  text: string;
  tone?: LogTone;
  effects: Effect[];
}

export interface Choice {
  id: string;
  label: string;
  show?: Condition;
  enable?: Condition;
  disabledReason?: string;
  cost?: Effect[];
  outcomes: Outcome[];
  hint?: { risk: 0 | 1 | 2 | 3; reward: 0 | 1 | 2 | 3 };
}

export type EventCategory =
  | 'world'
  | 'encounter'
  | 'bond'
  | 'sect'
  | 'alchemy'
  | 'chain'
  | 'tribulation'
  | 'fate';

export interface EventDef {
  id: string;
  title: string;
  category: EventCategory;
  body: string;
  tierMin?: number;
  tierMax?: number;
  levelMin?: number;
  levelMax?: number;
  weight: number;
  once?: boolean;
  maxCount?: number;
  cooldownYears?: number;
  requires?: Condition;
  school?: SchoolId[];
  tags?: string[];
  choices: Choice[];
  chain?: { setsFlag?: string; consumesFlag?: string };
}

export interface RollTable {
  id: string;
  entries: { value: string; weight: number }[];
  /** `roll` 条件判定为真的条目；缺省 ['yes'] */
  success?: string[];
}

export interface NameTables {
  encounter: Record<string, string[]>;
  artifact: Record<string, string[]>;
}

export interface ContentBundle {
  events: EventDef[];
  fates: Fate[];
  rollTables: RollTable[];
  /** Phase 3：功法表；缺省为空（引擎测试可用不带动功法的 fixture bundle） */
  arts?: ArtDef[];
  /** Phase 4：药材 / 丹药 / 丹方；缺省为空 */
  herbs?: Herb[];
  pills?: PillDef[];
  recipes?: Recipe[];
  names?: NameTables;
}

export type DecisionKind = 'tribulation' | 'encounter' | 'bond' | 'sect' | 'alchemy' | 'world';

export interface DecisionChoice {
  id: string;
  label: string;
  show: boolean;
  enable: boolean;
  disabledReason?: string;
  costLabel?: string;
  /** 该选项的悟性代价（供策略与 UI 判断能否为升级保留悟性） */
  insightCost?: number;
  hint?: { risk: 0 | 1 | 2 | 3; reward: 0 | 1 | 2 | 3 };
}

export interface Decision {
  /** 判别：`event` = 内容事件决策；`system` = 机缘/天劫等引擎系统决策 */
  source: 'event' | 'system';
  kind: DecisionKind;
  eventId: string;
  title: string;
  body: string;
  choices: DecisionChoice[];
  payload?: unknown;
}
