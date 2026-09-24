import type { NameTables } from '../../engine/types/effects';
import {
  ARTIFACT_MATS,
  ARTIFACT_NOUNS,
  ARTIFACT_SUFFIX,
  BANDS,
  BLOCKLIST,
  COMPAT,
  MODS,
  NAME_LENGTH,
  NOUNS,
  RANK,
  type Mod,
  type Noun,
} from './pools';

const TARGET_PER_TIER = 120;
const CAP_PER_TIER = 260;

function lengthOk(name: string, tier: number): boolean {
  const rule = NAME_LENGTH.find((r) => tier <= r.maxTier);
  if (!rule) return true;
  return name.length >= rule.lo && name.length <= rule.hi;
}

function compatOk(mod: Mod, noun: Noun): boolean {
  if (mod.tags.length === 0) return true;
  const allowed = new Set<string>();
  for (const tag of mod.tags) {
    for (const cls of COMPAT[tag] ?? []) allowed.add(cls);
  }
  if (allowed.size === 0) return true;
  return allowed.has(noun.cls);
}

function sharesChar(a: string, b: string): boolean {
  for (const ch of a) {
    if (b.includes(ch)) return true;
  }
  return false;
}

interface Pair {
  mod: Mod;
  noun: Noun;
  bands: number[];
}

function pairsFor(kind: 'encounter' | 'artifact'): Pair[] {
  const mods = kind === 'encounter' ? MODS : ARTIFACT_MATS;
  const nouns = kind === 'encounter' ? NOUNS : ARTIFACT_NOUNS;
  const out: Pair[] = [];
  for (const mod of mods) {
    for (const noun of nouns) {
      const bands = mod.bands.filter((b) => noun.bands.includes(b));
      if (bands.length === 0) continue;
      if (!compatOk(mod, noun)) continue;
      if (sharesChar(mod.text, noun.text)) continue;
      out.push({ mod, noun, bands });
    }
  }
  return out;
}

function combosFor(kind: 'encounter' | 'artifact', band: number): string[] {
  const pairs = pairsFor(kind);
  const extras =
    kind === 'encounter' ? RANK[band] ?? [''] : ARTIFACT_SUFFIX[band] ?? [''];
  const out: string[] = [];
  for (const pair of pairs) {
    if (!pair.bands.includes(band)) continue;
    for (const extra of extras) {
      const name = `${pair.mod.text}${pair.noun.text}${extra}`;
      if (BLOCKLIST.includes(name)) {
        throw new Error(`gen-names: 组合命中屏蔽项「${name}」（词池或屏蔽表被改动）`);
      }
      out.push(name);
    }
  }
  return out;
}

function fillFrom(
  source: string[],
  tiers: number[],
  buckets: Map<number, string[]>,
  used: Set<string>,
): void {
  for (let i = 0; i < source.length; i++) {
    const name = source[i];
    if (name === undefined || used.has(name)) continue;
    let placed = false;
    for (let k = 0; k < tiers.length && !placed; k++) {
      const tier = tiers[(i + k) % tiers.length];
      if (tier === undefined) continue;
      const bucket = buckets.get(tier);
      if (!bucket || bucket.length >= CAP_PER_TIER) continue;
      if (!lengthOk(name, tier)) continue;
      used.add(name);
      bucket.push(name);
      placed = true;
    }
  }
}

function shortTiers(tiers: number[], buckets: Map<number, string[]>): number[] {
  return tiers.filter((t) => (buckets.get(t) ?? []).length < TARGET_PER_TIER);
}

export function generateNames(): NameTables {
  const tables: NameTables = { encounter: {}, artifact: {} };
  const used = new Set<string>();

  for (const kind of ['encounter', 'artifact'] as const) {
    const perBand = BANDS.map((_, band) => combosFor(kind, band));
    for (let band = 0; band < BANDS.length; band++) {
      const tiers = BANDS[band]?.tiers ?? [];
      const buckets = new Map<number, string[]>();
      for (const tier of tiers) buckets.set(tier, []);
      fillFrom(perBand[band] ?? [], tiers, buckets, used);
      const sources = [band - 1, band + 1, band - 2, band + 2];
      for (const src of sources) {
        if (shortTiers(tiers, buckets).length === 0) break;
        if (src < 0 || src >= perBand.length) continue;
        fillFrom(perBand[src] ?? [], tiers, buckets, used);
      }
      for (const tier of tiers) {
        tables[kind][String(tier)] = buckets.get(tier) ?? [];
      }
    }
  }
  return tables;
}

export function crossTierDuplicates(tables: NameTables): string[] {
  const seen = new Map<string, string>();
  const dups: string[] = [];
  for (const kind of ['encounter', 'artifact'] as const) {
    for (const [tier, list] of Object.entries(tables[kind])) {
      for (const name of list) {
        const prev = seen.get(name);
        if (prev !== undefined) dups.push(`${name}（${prev} 与 ${kind}${tier}）`);
        else seen.set(name, `${kind}${tier}`);
      }
    }
  }
  return dups;
}

export function tierCounts(tables: NameTables, kind: 'encounter' | 'artifact'): number[] {
  return Object.values(tables[kind]).map((list) => list.length);
}
