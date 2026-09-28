import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { doctrinesOf, ART_DOCTRINES } from '../../src/content/doctrines';
import { canBuyDoctrine, buyDoctrine, doctrineEffects } from '../../src/store/doctrines';
import { defaultMeta } from '../../src/store/persistence';
import { BUNDLE } from '../../src/content/index';
import { runRun } from '../../src/engine/replay';
import { makeRngBag } from '../../src/engine/rng';
import { drawCard } from '../../src/engine/newRun';
import { zones } from '../../src/engine/selectors';

/* 前世道统（v0.1.0-08 §三·4）：传承点在洞府满级之后的第二出口。
   核心断言只有一条——**买不到概率**。Phase 5 的 5.1 与 Phase 6 的 6.1
   都在"资源最终都会折成等级"这个坑里栽过，这里是第三次。 */

const catalog = doctrinesOf(BUNDLE);

describe('道统表', () => {
  it('三类都有条目，且每类非空', () => {
    for (const kind of ['art', 'recipe', 'herb'] as const) {
      expect(catalog.filter((d) => d.kind === kind).length).toBeGreaterThan(0);
    }
  });

  it('落点 id 全部能在内容表里找到（丹方/药材是从内容表实算的，不手抄）', () => {
    const artIds = new Set((BUNDLE.arts ?? []).map((a) => a.id));
    const recIds = new Set((BUNDLE.recipes ?? []).map((r) => r.id));
    const herbIds = new Set((BUNDLE.herbs ?? []).map((h) => h.id));
    for (const d of catalog) {
      const pool = d.kind === 'art' ? artIds : d.kind === 'recipe' ? recIds : herbIds;
      expect(pool.has(d.target), `${d.id} → ${d.target}`).toBe(true);
    }
  });

  it('id 唯一，成本为正，每条都有一句人话说明', () => {
    const ids = new Set<string>();
    for (const d of catalog) {
      expect(ids.has(d.id), d.id).toBe(false);
      ids.add(d.id);
      expect(d.cost).toBeGreaterThan(0);
      expect(d.text.length).toBeGreaterThan(4);
    }
  });

  it('全表总价高于洞府满级的 2846 —— 传承点不够全买，这正是设计意图', () => {
    const total = catalog.reduce((a, d) => a + d.cost, 0);
    expect(total).toBeGreaterThan(2846);
  });

  it('功法道统的落点是各流派的高阶功法，不是起步功法', () => {
    for (const d of ART_DOCTRINES) {
      expect(d.target).not.toBe('art_jian_yi');
    }
  });
});

describe('购买', () => {
  const cheapest = catalog.slice().sort((a, b) => a.cost - b.cost)[0]!;

  it('余额不足买不了', () => {
    expect(canBuyDoctrine(cheapest.id, cheapest.cost, cheapest.cost - 1, [])).toBe(false);
    expect(buyDoctrine(cheapest.id, cheapest.cost, cheapest.cost - 1, []).ok).toBe(false);
  });

  it('买得起的扣点并入库', () => {
    const res = buyDoctrine(cheapest.id, cheapest.cost, cheapest.cost + 50, []);
    expect(res.ok).toBe(true);
    expect(res.points).toBe(50);
    expect(res.doctrines).toEqual([cheapest.id]);
  });

  it('同一条不能买第二次', () => {
    expect(canBuyDoctrine(cheapest.id, cheapest.cost, 99999, [cheapest.id])).toBe(false);
  });
});

describe('起手包只给「持有」，不给「更强」（验收 6.1 的结构前提）', () => {
  /** **两次必须同种子**：唯一变量是道统，否则抽到的命帖本身就不同，比的就不是道统了 */
  const newRun = (doctrines: string[]) => {
    const seed = 'doc-test-fixed';
    const rng = makeRngBag(seed);
    const out = runRun(
      BUNDLE,
      {
        seed,
        maxYears: 1,
        card: drawCard(rng, BUNDLE, {}),
        ...(doctrines.length > 0 ? { startEffects: doctrineEffects(doctrines, BUNDLE) } : {}),
      },
      () => 'a',
    );
    return out.state;
  };

  const allIds = catalog.map((d) => d.id);

  it('道统全买满时，灵根 / 气运 / 寿元 / 突破倍率与裸局完全一致', () => {
    const bare = newRun([]);
    const full = newRun(allIds);
    // 这四项就是 6.1 的三个破线路径 + 概率表
    expect(full.root).toBe(bare.root);
    expect(full.luck).toBe(bare.luck);
    expect(full.simPoints).toBe(bare.simPoints);
    expect(full.breakthroughMult).toBe(bare.breakthroughMult);
    expect(full.tribulationReqMult).toBe(bare.tribulationReqMult);
  });

  it('道统全买满时，功法持有增加但**不占功法槽**', () => {
    const bare = newRun([]);
    const full = newRun(allIds);
    const ownedCount = (s: typeof bare): number => Object.values(s.arts).filter((a) => a.level > 0).length;
    expect(ownedCount(full)).toBeGreaterThan(ownedCount(bare));
    // 槽位仍由悟道室等条件决定，道统不插队
    expect(full.slots.filter((x) => x !== null).length).toBe(bare.slots.filter((x) => x !== null).length);
  });

  it('持有 ≠ 装配：战力要玩家自己把功法排进槽位才涨 —— 这是最强的防碾压结构', () => {
    const bare = newRun([]);
    const full = newRun(allIds);
    // 持有但未装备：战力纹丝不动
    expect(zones(full, BUNDLE).finalPower).toBe(zones(bare, BUNDLE).finalPower);

    // 排进一个空槽后才生效
    const free = full.slots.findIndex((x) => x === null);
    expect(free).toBeGreaterThanOrEqual(0);
    const target = catalog.find((d) => d.kind === 'art')?.target as string;
    full.slots[free] = target;
    expect(zones(full, BUNDLE).finalPower).toBeGreaterThan(zones(bare, BUNDLE).finalPower);
  });
});

describe('道统与 unlocks 分开（6.1 的关键防线）', () => {
  it('`unlocks` 记的是「曾经见过」，不参与起手注入', () => {
    const meta = defaultMeta();
    meta.unlocks.arts = ART_DOCTRINES.map((d) => d.target);
    // 买了道统才会进 meta.doctrines；unlocks 满仓但 doctrines 为空时，起手包是空的
    expect(doctrineEffects(meta.doctrines, BUNDLE).art).toEqual([]);
  });

  it('空 doctrines 时 `runOptions` 不设 startEffects，黄金回归路径不受影响', () => {
    const source = readFileSync('tools/simlib.ts', 'utf8');
    expect(source).toContain('if (opts.doctrines && opts.doctrines.length > 0)');
  });
});
