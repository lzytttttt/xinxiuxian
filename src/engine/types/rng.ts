export type StreamName =
  | 'break'
  | 'encounter'
  | 'artifact'
  | 'event'
  | 'fate'
  | 'root'
  | 'luck'
  | 'alchemy'
  | 'tribulation'
  | 'bond'
  | 'sect'
  | 'reward'
  | 'misc';

export interface Rng {
  next(): number;
  int(a: number, b: number): number;
  chance(p: number): boolean;
  pick<T>(xs: readonly T[]): T;
  weighted<T>(xs: readonly (readonly [T, number])[]): T;
}

export type RngBag = Record<StreamName, Rng>;
