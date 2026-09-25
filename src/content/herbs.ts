import { defineHerb } from '../engine/registry';
import type { Herb, HerbNature, HerbTag } from '../engine/types/effects';

/* 药材表：每阶 6 味（阴阳平各 2），共 60 味。
   药力 = round((阶 × 8 + 8) × 系数)，系数按组内第 1/2/3/4/5/6 位取 0.85 / 1.0 / 1.15 / 0.85 / 1.0 / 1.15
   —— 同阶药材药力有高低，投入搭配决定品质上限（见 engine/alchemy.ts::potencyCap）。
   命名手工原创：丹方需要稳定的「名 ↔ id ↔ 药性」映射，不走组合生成器（见 v0.1.0-05 §三）。 */

interface Seed {
  id: string;
  name: string;
  nature: HerbNature;
  tags: HerbTag[];
}

const SEEDS: Record<number, Seed[]> = {
  1: [
    { id: 'herb_common', name: '寻常草药', nature: '平', tags: ['木'] },
    { id: 'herb_yunwu', name: '云雾草', nature: '平', tags: ['木'] },
    { id: 'herb_qingxin', name: '清心花', nature: '阴', tags: ['木', '魂'] },
    { id: 'herb_hanlu', name: '寒露果', nature: '阴', tags: ['寒'] },
    { id: 'herb_chiteng', name: '赤藤', nature: '阳', tags: ['火', '木'] },
    { id: 'herb_yinqi', name: '引气藤', nature: '阳', tags: ['木'] },
  ],
  2: [
    { id: 'herb_tiexian', name: '铁线莲', nature: '平', tags: ['木', '金'] },
    { id: 'herb_bailing', name: '百灵草', nature: '平', tags: ['木'] },
    { id: 'herb_youquan', name: '幽泉苔', nature: '阴', tags: ['寒', '木'] },
    { id: 'herb_yanxin', name: '焰心花', nature: '阳', tags: ['火'] },
    { id: 'herb_shishang', name: '石上蒲', nature: '平', tags: ['金'] },
    { id: 'herb_dugen', name: '毒根须', nature: '阴', tags: ['毒'] },
  ],
  3: [
    { id: 'herb_zhuoxin', name: '浊心莲', nature: '阴', tags: ['毒', '木'] },
    { id: 'herb_liuli', name: '琉璃果', nature: '平', tags: ['金'] },
    { id: 'herb_huoyun', name: '火云芝', nature: '阳', tags: ['火'] },
    { id: 'herb_hanjing', name: '寒晶髓', nature: '阴', tags: ['寒', '金'] },
    { id: 'herb_muxi', name: '木犀根', nature: '平', tags: ['木', '血'] },
    { id: 'herb_leizhu', name: '雷竹叶', nature: '阳', tags: ['雷'] },
  ],
  4: [
    { id: 'herb_baihua', name: '百花蜜露', nature: '平', tags: ['木', '血'] },
    { id: 'herb_wugu', name: '乌骨藤', nature: '阴', tags: ['毒', '血'] },
    { id: 'herb_zixia', name: '紫霞参', nature: '阳', tags: ['火', '木'] },
    { id: 'herb_hanshui', name: '寒水砂', nature: '阴', tags: ['寒', '金'] },
    { id: 'herb_jinying', name: '金萤粉', nature: '平', tags: ['金', '魂'] },
    { id: 'herb_leigen', name: '雷根藤', nature: '阳', tags: ['雷', '木'] },
  ],
  5: [
    { id: 'herb_xuelian', name: '雪魄莲', nature: '阴', tags: ['寒', '魂'] },
    { id: 'herb_yanlin', name: '焰鳞花', nature: '阳', tags: ['火', '血'] },
    { id: 'herb_shenmu', name: '沉木香', nature: '平', tags: ['木', '魂'] },
    { id: 'herb_duyan', name: '毒烟叶', nature: '阴', tags: ['毒'] },
    { id: 'herb_zhenjin', name: '真金砂', nature: '平', tags: ['金'] },
    { id: 'herb_leiying', name: '雷莺羽', nature: '阳', tags: ['雷', '金'] },
  ],
  6: [
    { id: 'herb_youlan', name: '幽兰蕊', nature: '阴', tags: ['木', '魂'] },
    { id: 'herb_chixiao', name: '赤霄花', nature: '阳', tags: ['火'] },
    { id: 'herb_yunmu', name: '云母石', nature: '平', tags: ['金', '木'] },
    { id: 'herb_hansui', name: '寒髓玉', nature: '阴', tags: ['寒', '金'] },
    { id: 'herb_wandu', name: '万毒藤', nature: '阴', tags: ['毒', '木'] },
    { id: 'herb_leiyin', name: '雷音草', nature: '阳', tags: ['雷', '魂'] },
  ],
  7: [
    { id: 'herb_jiuyou', name: '九幽苔', nature: '阴', tags: ['魂', '毒'] },
    { id: 'herb_fengxue', name: '凤血芝', nature: '阳', tags: ['血', '火'] },
    { id: 'herb_taixi', name: '太息木心', nature: '平', tags: ['木', '魂'] },
    { id: 'herb_xuanbing', name: '玄冰髓', nature: '阴', tags: ['寒', '金'] },
    { id: 'herb_ziyan', name: '紫炎果', nature: '阳', tags: ['火', '雷'] },
    { id: 'herb_jinsui', name: '金髓砂', nature: '平', tags: ['金', '血'] },
  ],
  8: [
    { id: 'herb_huanhun', name: '还魂草', nature: '平', tags: ['魂', '木'] },
    { id: 'herb_dugu', name: '毒蛊花', nature: '阴', tags: ['毒', '血'] },
    { id: 'herb_chiyu', name: '赤羽翎', nature: '阳', tags: ['火', '魂'] },
    { id: 'herb_hanpo', name: '寒魄玉', nature: '阴', tags: ['寒'] },
    { id: 'herb_leiji', name: '雷击木芯', nature: '阳', tags: ['雷', '木'] },
    { id: 'herb_zhenyin', name: '真银露', nature: '平', tags: ['金', '魂'] },
  ],
  9: [
    { id: 'herb_xianling', name: '仙灵藤', nature: '平', tags: ['木', '魂'] },
    { id: 'herb_minghe', name: '冥河花', nature: '阴', tags: ['魂', '毒'] },
    { id: 'herb_riyan', name: '日炎芝', nature: '阳', tags: ['火', '雷'] },
    { id: 'herb_yuehua', name: '月华霜', nature: '阴', tags: ['寒', '魂'] },
    { id: 'herb_zhulong', name: '烛龙血', nature: '阳', tags: ['血', '火'] },
    { id: 'herb_taixujing', name: '太虚金精', nature: '平', tags: ['金', '雷'] },
  ],
  10: [
    { id: 'herb_daoyun', name: '道韵花', nature: '平', tags: ['魂', '木'] },
    { id: 'herb_hundun', name: '混沌果', nature: '阳', tags: ['火', '雷', '血'] },
    { id: 'herb_jiuyin', name: '九阴髓', nature: '阴', tags: ['寒', '毒', '魂'] },
    { id: 'herb_tianlei', name: '天雷木', nature: '阳', tags: ['雷', '木'] },
    { id: 'herb_xuanhuang', name: '玄黄气', nature: '平', tags: ['金', '魂'] },
    { id: 'herb_shengxue', name: '圣血芝', nature: '阳', tags: ['血', '魂'] },
  ],
};

const FACTORS = [0.85, 1.0, 1.15, 0.85, 1.0, 1.15];

export const HERBS: Herb[] = Object.entries(SEEDS).flatMap(([rawTier, seeds]) => {
  const tier = Number(rawTier);
  return seeds.map((seed, i) =>
    defineHerb({
      id: seed.id,
      name: seed.name,
      tier,
      nature: seed.nature,
      potency: Math.round((tier * 8 + 8) * (FACTORS[i] ?? 1)),
      tags: seed.tags,
    }),
  );
});

export function herbsOfTier(tier: number): Herb[] {
  return HERBS.filter((h) => h.tier === tier);
}
