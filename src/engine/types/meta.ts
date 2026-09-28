import type { AutopilotConfig, CaveLevels } from './run';
import type { RunEndReason } from './log';

export interface LifeSummary {
  life: number;
  level: number;
  power: number;
  years: number;
  reason: RunEndReason;
  ascendMode: string;
  fates: string[];
}

export interface PastPartner {
  name: string;
  seed: string;
  life: number;
  level: number;
}

export interface MetaTotals {
  runs: number;
  years: number;
  ascensions: number;
  zhengdao: number;
  bestLevel: number;
}

export interface CodexBits {
  encounters: string;
  artifacts: string;
  realms: string;
  pills: string;
  arts: string;
  herbs: string;
}

export interface MetaState {
  version: 1;
  legacyPoints: number;
  lifetimeLegacy: number;
  cave: CaveLevels;
  unlocks: { arts: string[]; recipes: string[]; sects: string[] };
  sectLegacy: Record<string, number>;
  pastLives: LifeSummary[];
  pastPartners: PastPartner[];
  /** 已购道统 id。**与 `unlocks` 分开**——`unlocks` 是「曾经见过」，整包注入会破 6.1 */
  doctrines: string[];
  achievements: string[];
  codex: CodexBits;
  pity: number;
  autoPolicy: AutopilotConfig;
  totals: MetaTotals;
}
