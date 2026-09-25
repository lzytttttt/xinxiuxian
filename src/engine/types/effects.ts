import type { LogTone, RunEndReason } from './log';

export type SchoolId = '剑修' | '丹修' | '体修' | '毒修' | '雷修' | '魔修';

export type BondType = '道侣' | '师徒' | '挚友' | '宿敌' | '同门';

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
