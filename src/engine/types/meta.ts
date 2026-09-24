import type { AutopilotConfig } from './run';
import type { RunEndReason } from './log';

export type RoomId = '药园' | '丹房' | '藏经阁' | '悟道室' | '聚灵阵' | '静室';

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

export interface UiSettings {
  reducedMotion: boolean;
  visualIntensity: 'low' | 'mid' | 'high';
  textSpeed: number;
  tickMs: number;
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
}

export interface MetaState {
  version: 1;
  legacyPoints: number;
  lifetimeLegacy: number;
  cave: Record<RoomId, number>;
  unlocks: { arts: string[]; recipes: string[]; sects: string[] };
  sectLegacy: Record<string, number>;
  pastLives: LifeSummary[];
  pastPartners: PastPartner[];
  achievements: string[];
  codex: CodexBits;
  pity: number;
  autoPolicy: AutopilotConfig;
  settings: UiSettings;
  totals: MetaTotals;
}
