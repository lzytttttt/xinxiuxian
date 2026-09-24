import type { Condition, ContentBundle } from './types/effects';
import type { Rng } from './types/rng';
import type { RunState } from './types/run';
import { readTarget, talentTier } from './selectors';

export interface EvalCtx {
  content: ContentBundle;
  rng: Rng;
  memo: Map<string, string>;
}

export function makeEvalCtx(content: ContentBundle, rng: Rng): EvalCtx {
  return { content, rng, memo: new Map() };
}

export function evalCondition(s: RunState, c: Condition, ctx: EvalCtx, path = ''): boolean {
  switch (c.op) {
    case 'always':
      return true;
    case 'never':
      return false;
    case 'and':
      return c.of.every((x, i) => evalCondition(s, x, ctx, `${path}.and${i}`));
    case 'or':
      return c.of.some((x, i) => evalCondition(s, x, ctx, `${path}.or${i}`));
    case 'not':
      return !evalCondition(s, c.of, ctx, `${path}.not`);
    case 'cmp': {
      const v = readTarget(s, c.target);
      switch (c.cmp) {
        case '<':
          return v < c.value;
        case '<=':
          return v <= c.value;
        case '==':
          return v === c.value;
        case '>=':
          return v >= c.value;
        case '>':
          return v > c.value;
        default:
          return false;
      }
    }
    case 'flag': {
      const v = s.flags[c.id] ?? 0;
      if (c.min !== undefined && v < c.min) return false;
      if (c.max !== undefined && v > c.max) return false;
      return true;
    }
    case 'sect':
      return s.sect.id === c.id;
    case 'rankAtLeast':
      return s.sect.rank >= c.rank;
    case 'school':
      // Phase 3 接入功法定义后按槽位统计
      return false;
    case 'bondType':
      return s.bonds.list.filter((b) => b.type === c.type).length >= c.countAtLeast;
    case 'hasPill':
      return (s.pills[c.id] ?? 0) >= (c.countAtLeast ?? 1);
    case 'hasHerb':
      return (s.herbs[c.id] ?? 0) >= (c.countAtLeast ?? 1);
    case 'toxicityAtMost':
      return s.toxicity <= c.value;
    case 'rootTierAtLeast':
      return talentTier(s.root) >= c.tier;
    case 'realmAtLeast':
      return s.realm.level >= c.level;
    case 'lifeAtLeast':
      return s.life >= c.n;
    case 'chance': {
      const key = `chance:${path}`;
      const hit = ctx.memo.get(key);
      if (hit !== undefined) return hit === '1';
      const ok = ctx.rng.chance(c.p);
      ctx.memo.set(key, ok ? '1' : '0');
      return ok;
    }
    case 'roll': {
      const key = `roll:${path}`;
      const hit = ctx.memo.get(key);
      if (hit !== undefined) return hit === '1';
      const table = ctx.content.rollTables.find((t) => t.id === c.table);
      if (!table) {
        ctx.memo.set(key, '0');
        return false;
      }
      const picked = ctx.rng.weighted(table.entries.map((e) => [e.value, e.weight] as const));
      const success = table.success ?? ['yes'];
      const ok = success.includes(picked);
      ctx.memo.set(key, ok ? '1' : '0');
      return ok;
    }
    default:
      return false;
  }
}
