import { doctrinesOf, type Doctrine } from '../content/doctrines';
import type { StartEffects } from '../engine/replay';
import type { ContentBundle } from '../engine/types/effects';

/**
 * 道统的购买与起手包解析。**边界层职责**：引擎不认道统表，只接收已解析的原始效果
 * （验收 6.3 的同一套边界纪律，`pastPartner` 与 `cave` 同此办理）。
 */

export function buyableDoctrines(c: ContentBundle): Doctrine[] {
  return doctrinesOf(c);
}

export function canBuyDoctrine(id: string, cost: number, points: number, owned: readonly string[]): boolean {
  return !owned.includes(id) && points >= cost;
}

export interface BuyResult {
  ok: boolean;
  points: number;
  doctrines: string[];
}

/** 余额不足或已拥有时原样返回 */
export function buyDoctrine(
  id: string,
  cost: number,
  points: number,
  owned: readonly string[],
): BuyResult {
  if (!canBuyDoctrine(id, cost, points, owned)) return { ok: false, points, doctrines: [...owned] };
  return { ok: true, points: points - cost, doctrines: [...owned, id] };
}

/**
 * 已购道统 → 起手包。**幂等**：`ownedIds` 本身已去重，重复买入不会叠加两次。
 *
 * 功法只给持有（L1）不占槽——占槽与升级仍要玩家自己付悟性。
 * 这是 6.1 要求的"起跑线而非上限"：道统买不到灵根、突破概率与寿元。
 */
export function doctrineEffects(ownedIds: readonly string[], c: ContentBundle): StartEffects {
  const byId = new Map(doctrinesOf(c).map((d) => [d.id, d]));
  const art: string[] = [];
  const recipe: string[] = [];
  const herb: [string, number][] = [];
  for (const id of ownedIds) {
    const d = byId.get(id);
    if (!d) continue;
    if (d.kind === 'art') art.push(d.target);
    else if (d.kind === 'recipe') recipe.push(d.target);
    else herb.push([d.target, d.amount]);
  }
  return { art, recipe, herb };
}
