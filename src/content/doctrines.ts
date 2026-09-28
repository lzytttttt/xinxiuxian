import type { ContentBundle, SchoolId } from '../engine/types/effects';

/**
 * 前世道统：洞府满级之后传承点的第二出口（v0.1.0-08 §三·4）。
 *
 * **落点纪律**：每一份道统的收益最终落在已封顶的乘区（Z1 ×3.0 / Z4 ×2.5 / Z5 ×2.0）
 * 或纯资源侧，**没有一条能买到概率**——不碰灵根档位、不碰 `breakChance`、不碰基础寿元。
 * 这是 Phase 5 的 5.1 与 Phase 6 的 6.1 两次栽过的同一个坑（"资源最终都会折成等级"）。
 *
 * **为什么不复用 `MetaState.unlocks`**：`unlocks` 累积的是「你曾经见过」，
 * 第 10 世时它会攒下几十门功法。整包注入等于跨局白送构筑，直接破 6.1。
 * 道统因此是**独立的小集合**：只有玩家花传承点显式买下的那几条才永久生效。
 */

export type DoctrineKind = 'art' | 'recipe' | 'herb';

export interface Doctrine {
  id: string;
  name: string;
  kind: DoctrineKind;
  /** 落点 id：功法 id / 丹方 id / 药材 id */
  target: string;
  /** 药材类的起手持有株数 */
  amount: number;
  cost: number;
  text: string;
}

/** 六流派各两门顶阶功法（玄品 q4 / 天品 q5），它们是各流派乘区贡献最高的两门 */
const ART_SEEDS: readonly {
  id: string;
  name: string;
  school: SchoolId;
  target: string;
  cost: number;
}[] = [
  { id: 'doc_art_jian_q4', name: '游龙剑气', school: '剑修', target: 'art_you_long', cost: 130 },
  { id: 'doc_art_jian_q5', name: '无我剑道', school: '剑修', target: 'art_wu_wo_jian', cost: 220 },
  { id: 'doc_art_dan_q4', name: '灵枢丹经', school: '丹修', target: 'art_ling_shu', cost: 130 },
  { id: 'doc_art_dan_q5', name: '大道炼丹术', school: '丹修', target: 'art_da_dao_dan', cost: 220 },
  { id: 'doc_art_ti_q4', name: '巨灵神力', school: '体修', target: 'art_ju_ling', cost: 130 },
  { id: 'doc_art_ti_q5', name: '肉身成圣', school: '体修', target: 'art_rou_shen', cost: 220 },
  { id: 'doc_art_du_q4', name: '蛊道真解', school: '毒修', target: 'art_gu_dao', cost: 130 },
  { id: 'doc_art_du_q5', name: '毒龙噬天', school: '毒修', target: 'art_du_long', cost: 220 },
  { id: 'doc_art_lei_q4', name: '天雷引', school: '雷修', target: 'art_tian_lei', cost: 130 },
  { id: 'doc_art_lei_q5', name: '雷帝经', school: '雷修', target: 'art_lei_di', cost: 220 },
  { id: 'doc_art_mo_q4', name: '万魔归元功', school: '魔修', target: 'art_wan_mo', cost: 130 },
  { id: 'doc_art_mo_q5', name: '天魔解体大法', school: '魔修', target: 'art_tian_mo', cost: 220 },
];

const PILL_TYPES = ['聚气', '洗髓', '天机', '炼宝', '破境', '护劫', '疗毒'] as const;

const RECIPE_COST: Record<(typeof PILL_TYPES)[number], number> = {
  聚气: 70,
  洗髓: 90,
  天机: 130,
  炼宝: 160,
  破境: 230,
  护劫: 230,
  疗毒: 180,
};

const HERB_TIERS = [1, 3, 5, 7, 9, 10] as const;
const HERB_AMOUNT_BASE = 8;
const HERB_AMOUNT_PER_TIER = 3;
const HERB_COST_BASE = 40;
const HERB_COST_PER_TIER = 22;

function artDoctrines(): Doctrine[] {
  return ART_SEEDS.map((s) => ({
    id: s.id,
    name: `${s.school}·${s.name}`,
    kind: 'art',
    target: s.target,
    amount: 0,
    cost: s.cost,
    text: `起手即持「${s.name}」一级。占槽要自己排，升级仍要悟性。`,
  }));
}

/** 每类丹药取该类**最高阶**的一张丹方。落点从内容表实算，避免手抄 35 个 id 后与 `recipes.ts` 漂移 */
function recipeDoctrines(c: ContentBundle): Doctrine[] {
  const out: Doctrine[] = [];
  for (const type of PILL_TYPES) {
    const best = (c.recipes ?? [])
      .filter((r) => r.type === type)
      .sort((a, b) => b.tier - a.tier || a.id.localeCompare(b.id))[0];
    if (!best) continue;
    out.push({
      id: `doc_rec_${type}`,
      name: `${type}丹方`,
      kind: 'recipe',
      target: best.id,
      amount: 0,
      cost: RECIPE_COST[type],
      text: `起手即知「${best.name}」（${best.tier} 阶）。药材仍要自己去寻。`,
    });
  }
  return out;
}

/** 药圃：按药材阶给一份起手存量，样本取该阶 id 最小的一味 */
function herbDoctrines(c: ContentBundle): Doctrine[] {
  const out: Doctrine[] = [];
  for (const tier of HERB_TIERS) {
    const best = (c.herbs ?? [])
      .filter((h) => h.tier === tier)
      .sort((a, b) => a.id.localeCompare(b.id))[0];
    if (!best) continue;
    const amount = HERB_AMOUNT_BASE + tier * HERB_AMOUNT_PER_TIER;
    out.push({
      id: `doc_herb_t${tier}`,
      name: `${tier} 阶药圃`,
      kind: 'herb',
      target: best.id,
      amount,
      cost: HERB_COST_BASE + tier * HERB_COST_PER_TIER,
      text: `起手即持「${best.name}」× ${amount}。丹毒与药力一样会涨。`,
    });
  }
  return out;
}

/** 完整道统表。依赖内容包是因为丹方与药材的落点 id 由内容表决定 */
export function doctrinesOf(c: ContentBundle): Doctrine[] {
  return [...artDoctrines(), ...recipeDoctrines(c), ...herbDoctrines(c)];
}

/** 无头工具（`tools/simlib.ts`）与测试用的简表：只含不依赖内容包的功法道统 */
export const ART_DOCTRINES: readonly Doctrine[] = ART_SEEDS.map((s) => ({
  id: s.id,
  name: `${s.school}·${s.name}`,
  kind: 'art' as const,
  target: s.target,
  amount: 0,
  cost: s.cost,
  text: `起手即持「${s.name}」一级。占槽要自己排，升级仍要悟性。`,
}));

export function doctrineById(list: readonly Doctrine[], id: string): Doctrine | undefined {
  return list.find((d) => d.id === id);
}
