import type { Rng, RngBag, StreamName } from './types/rng';

export const STREAM_NAMES: readonly StreamName[] = [
  'break',
  'encounter',
  'artifact',
  'event',
  'fate',
  'root',
  'luck',
  'alchemy',
  'tribulation',
  'bond',
  'sect',
  'reward',
  'misc',
];

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(a: number): () => number {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed: string): Rng {
  const next = mulberry32(xmur3(seed)());
  return {
    next,
    int(a: number, b: number): number {
      if (b < a) return a;
      return a + Math.floor(next() * (b - a + 1));
    },
    chance(p: number): boolean {
      return next() < p;
    },
    pick<T>(xs: readonly T[]): T {
      const x = xs[Math.floor(next() * xs.length)];
      if (x === undefined) throw new Error('rng.pick: empty array');
      return x;
    },
    weighted<T>(xs: readonly (readonly [T, number])[]): T {
      let total = 0;
      for (const [, w] of xs) total += w;
      let roll = next() * total;
      for (const [v, w] of xs) {
        roll -= w;
        if (roll <= 0) return v;
      }
      const last = xs[xs.length - 1];
      if (last === undefined) throw new Error('rng.weighted: empty array');
      return last[0];
    },
  };
}

export function makeRngBag(seed: string): RngBag {
  const bag = {} as RngBag;
  for (const name of STREAM_NAMES) {
    bag[name] = makeRng(`${seed}:${name}`);
  }
  return bag;
}
