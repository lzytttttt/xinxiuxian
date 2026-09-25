import type { BondType, Decision, DecisionKind, Fate } from './effects';
import type { LogLine } from './log';

export type Arc = 'mortal' | 'immortal';

export interface Realm {
  arc: Arc;
  stage: number;
  level: number;
}

export interface ConqueredItem {
  tier: number;
  name: string;
  year: number;
  power: number;
}

export interface FruitItem {
  tier: number;
  name: string;
  year: number;
  power: number;
}

export interface Bond {
  id: string;
  name: string;
  type: BondType;
  level: number;
  affinity: number;
  createdYear: number;
  seed: string;
}

export interface BondSystem {
  list: Bond[];
  nextId: number;
}

export interface ArtState {
  level: number;
  insight: number;
}

export interface RecipeState {
  known: boolean;
  mastery: number;
}

export interface SectState {
  id: string | null;
  rank: number;
  contribution: number;
  joinedYear: number | null;
  defections: number;
  tension: Record<string, number>;
}

export interface ScheduledEvent {
  eventId: string;
  year: number;
}

export interface DeferredEntry {
  eventId: string;
  /** 被推迟的年份；只在次年重试一次 */
  year: number;
}

export interface DecisionRecord {
  year: number;
  kind: DecisionKind;
  eventId: string;
  choiceId: string;
}

/** 战力构成的「最近变化」：记录引起变化的动作与幅度（面板页脚消费） */
export interface PowerTrail {
  label: string;
  /** 相对变化百分比（+18 表示 +18%） */
  pct: number;
  year: number;
}

export type BattlePolicy = 'manual' | 'yes' | 'no' | 'smart' | 'random';

export interface AutopilotConfig {
  battlePolicy: BattlePolicy;
  smartX: number;
}

export interface RunStats {
  years: number;
  events: number;
  encounters: number;
  battlesWon: number;
  battlesLost: number;
  escapes: number;
  artifacts: number;
  breakthroughs: number;
  decisions: number;
}

export interface RunState {
  runId: string;
  seed: string;
  life: number;
  createdAt: number;

  age: number;
  year: number;
  simPoints: number;
  cultivation: number;
  root: number;
  luck: number;
  artifactPower: number;
  artifactBonus: number;
  xianqi: number;
  chaosQi: number;
  realm: Realm;
  fates: Fate[];
  breakthroughMult: number;
  tribulationReqMult: number;
  yearsStayed: number;
  qiDeviationRisk: number;
  innate: number;
  brokeThisYear: boolean;
  pinnacleThisYear: boolean;
  tribPassed: number;
  gotSpecial: boolean;
  ascended: boolean;
  dead: boolean;
  ascendMode: string;
  endedReason: string | null;
  conquered: ConqueredItem[];
  fruits: FruitItem[];
  maxCount: Record<string, number>;

  arts: Record<string, ArtState>;
  slots: (string | null)[];
  insight: number;

  herbs: Record<string, number>;
  recipes: Record<string, RecipeState>;
  pills: Record<string, number>;
  toxicity: number;

  sect: SectState;

  bonds: BondSystem;

  flags: Record<string, number>;
  cooldowns: Record<string, number>;
  onceFired: string[];
  recencyQueue: string[];
  deferredQueue: DeferredEntry[];
  scheduled: ScheduledEvent[];
  chainDepth: number;
  decisionLog: DecisionRecord[];
  powerTrail: PowerTrail | null;

  battlePolicy: BattlePolicy;
  smartX: number;
  autopilot: AutopilotConfig | null;

  awaiting: Decision | null;

  stats: RunStats;
  eventLog: string[];
  log: LogLine[];
}
