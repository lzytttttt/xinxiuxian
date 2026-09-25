import { defineArt } from '../../engine/registry';
import type { ArtDef } from '../../engine/types/effects';

/* 六流派各 7 门，共 42 门。被动按「每级增量」声明，L 级贡献 = 值 × L（区内加法）。
   z4 为各流派主被动（功法自身强度），其余乘区为流派特色（z1 修为 / z2 灵根 / z3 法宝 / z6 气运命格）。
   Z5 无内容侧来源：它由丹毒惩罚与毒体协同构成（丹药 buff 属 Phase 4）。 */

const JIAN: ArtDef[] = [
  defineArt({
    id: 'art_jian_yi',
    name: '剑意诀',
    school: '剑修',
    quality: 1,
    passives: { z1: 0.0629, z4: 0.0707},
    text: '以心御剑，剑未出鞘而意已至。',
  }),
  defineArt({
    id: 'art_jian_xin',
    name: '剑心通明',
    school: '剑修',
    quality: 2,
    passives: { z1: 0.055, z4: 0.0629, z6: 0.0314},
    text: '剑心澄澈，照见来路与去处。',
  }),
  defineArt({
    id: 'art_qing_feng',
    name: '青锋剑典',
    school: '剑修',
    quality: 2,
    passives: { z1: 0.0629, z4: 0.0785},
    text: '青锋所指，一线天开。',
  }),
  defineArt({
    id: 'art_wan_jian',
    name: '万剑归宗',
    school: '剑修',
    quality: 3,
    passives: { z4: 0.0707, z1: 0.0472},
    text: '万剑朝宗，一念齐发。',
  }),
  defineArt({
    id: 'art_zhan_tian',
    name: '斩天拔剑术',
    school: '剑修',
    quality: 3,
    passives: { z1: 0.0785},
    text: '拔剑即斩天，一击之后不回头。',
  }),
  defineArt({
    id: 'art_you_long',
    name: '游龙剑气',
    school: '剑修',
    quality: 4,
    passives: { z1: 0.0233, z4: 0.0233, z2: 0.0133},
    text: '剑气如游龙，去留皆由心。',
  }),
  defineArt({
    id: 'art_wu_wo_jian',
    name: '无我剑道',
    school: '剑修',
    quality: 5,
    passives: { z1: 0.0266, z4: 0.0332, z6: 0.0133},
    text: '无我无剑，天地皆是锋芒。',
  }),
];

const DAN: ArtDef[] = [
  defineArt({
    id: 'art_dan_ding',
    name: '丹鼎诀',
    school: '丹修',
    quality: 1,
    passives: { z1: 0.0629, z2: 0.0314},
    text: '鼎中三味火，炼尽草木精。',
  }),
  defineArt({
    id: 'art_qing_nang',
    name: '青囊录',
    school: '丹修',
    quality: 2,
    passives: { z1: 0.055, z2: 0.0472},
    text: '囊中草木，皆是活人之术。',
  }),
  defineArt({
    id: 'art_bai_cao',
    name: '百草心经',
    school: '丹修',
    quality: 2,
    passives: { z1: 0.055, z2: 0.0314},
    text: '识得百草性，方知药与毒同源。',
  }),
  defineArt({
    id: 'art_yin_yang_lu',
    name: '阴阳炉火术',
    school: '丹修',
    quality: 3,
    passives: { z1: 0.0472, z3: 0.0472},
    text: '阴阳二火相济，炉中自成天地。',
  }),
  defineArt({
    id: 'art_jiu_zhuan',
    name: '九转还丹诀',
    school: '丹修',
    quality: 3,
    passives: { z1: 0.0785},
    text: '九转功成，一粒还丹换骨髓。',
  }),
  defineArt({
    id: 'art_ling_shu',
    name: '灵枢丹经',
    school: '丹修',
    quality: 4,
    passives: { z1: 0.02, z2: 0.0233, z6: 0.0133},
    text: '灵枢所指，药性与经络相合。',
  }),
  defineArt({
    id: 'art_da_dao_dan',
    name: '大道炼丹术',
    school: '丹修',
    quality: 5,
    passives: { z1: 0.0298, z4: 0.02},
    text: '以身为炉，以道为火。',
  }),
];

const TI: ArtDef[] = [
  defineArt({
    id: 'art_tie_gu',
    name: '铁骨诀',
    school: '体修',
    quality: 1,
    passives: { z1: 0.0707},
    text: '骨如精铁，皮若老树。',
  }),
  defineArt({
    id: 'art_long_xiang',
    name: '龙象般若功',
    school: '体修',
    quality: 2,
    passives: { z1: 0.0785, z3: 0.0314},
    text: '一龙一象之力，尽在一身。',
  }),
  defineArt({
    id: 'art_bu_huai',
    name: '不坏金身',
    school: '体修',
    quality: 3,
    passives: { z3: 0.0629, z1: 0.0472},
    text: '身如金铸，刀斧难伤。',
  }),
  defineArt({
    id: 'art_lian_ti_zhen',
    name: '炼体真解',
    school: '体修',
    quality: 3,
    passives: { z1: 0.0629, z4: 0.0629, z3: 0.0472},
    text: '以血肉为鼎，以痛楚为火。',
  }),
  defineArt({
    id: 'art_ju_ling',
    name: '巨灵神力',
    school: '体修',
    quality: 4,
    passives: { z1: 0.0298, z4: 0.0298},
    text: '举手投足，皆有万钧之力。',
  }),
  defineArt({
    id: 'art_xuan_gui',
    name: '玄龟吐纳法',
    school: '体修',
    quality: 4,
    passives: { z1: 0.0233, z3: 0.0233, z4: 0.02},
    text: '息如玄龟，寿与山齐。',
  }),
  defineArt({
    id: 'art_rou_shen',
    name: '肉身成圣',
    school: '体修',
    quality: 5,
    passives: { z1: 0.0332, z3: 0.02},
    text: '不假外物，此身即是道场。',
  }),
];

const DU: ArtDef[] = [
  defineArt({
    id: 'art_wan_du',
    name: '万毒真经',
    school: '毒修',
    quality: 1,
    passives: { z1: 0.0629, z4: 0.0707},
    text: '万毒入体，皆为养料。',
  }),
  defineArt({
    id: 'art_bai_du',
    name: '百毒不侵',
    school: '毒修',
    quality: 2,
    passives: { z1: 0.055, z4: 0.055, z6: 0.0314},
    text: '毒中之毒，反成正道之基。',
  }),
  defineArt({
    id: 'art_hua_du',
    name: '化毒为养',
    school: '毒修',
    quality: 2,
    passives: { z1: 0.0629, z4: 0.0629, z2: 0.0314},
    text: '腐草化萤，毒亦能养人。',
  }),
  defineArt({
    id: 'art_shi_gu',
    name: '蚀骨阴火',
    school: '毒修',
    quality: 3,
    passives: { z1: 0.0707, z4: 0.0785},
    text: '阴火蚀骨，不闻其声。',
  }),
  defineArt({
    id: 'art_wu_du_lian',
    name: '五毒炼体术',
    school: '毒修',
    quality: 3,
    passives: { z1: 0.0629, z4: 0.0314},
    text: '五毒淬体，皮肉重生。',
    requires: { op: 'cmp', target: { k: 'toxicity' }, cmp: '>=', value: 60 },
  }),
  defineArt({
    id: 'art_gu_dao',
    name: '蛊道真解',
    school: '毒修',
    quality: 4,
    passives: { z1: 0.0332},
    text: '以蛊为兵，人不知而自溃。',
    requires: { op: 'cmp', target: { k: 'toxicity' }, cmp: '>=', value: 60 },
  }),
  defineArt({
    id: 'art_du_long',
    name: '毒龙噬天',
    school: '毒修',
    quality: 5,
    passives: { z1: 0.0266, z4: 0.0365},
    text: '毒龙出渊，天地失色。',
  }),
];

const LEI: ArtDef[] = [
  defineArt({
    id: 'art_wu_lei',
    name: '五雷正法',
    school: '雷修',
    quality: 1,
    passives: { z1: 0.0629, z4: 0.0707},
    text: '五雷齐落，邪祟辟易。',
  }),
  defineArt({
    id: 'art_zi_xiao',
    name: '紫霄神雷',
    school: '雷修',
    quality: 2,
    passives: { z1: 0.0785},
    text: '紫霄之雷，起于九霄之上。',
  }),
  defineArt({
    id: 'art_lei_dun',
    name: '雷遁术',
    school: '雷修',
    quality: 2,
    passives: { z1: 0.055, z4: 0.0629, z2: 0.0314},
    text: '身化电光，瞬息十丈。',
  }),
  defineArt({
    id: 'art_lei_ting',
    name: '雷霆淬体',
    school: '雷修',
    quality: 3,
    passives: { z1: 0.0629, z3: 0.0314},
    text: '引雷入体，筋骨为薪。',
  }),
  defineArt({
    id: 'art_tian_lei',
    name: '天雷引',
    school: '雷修',
    quality: 4,
    passives: { z1: 0.0233, z4: 0.0233, z3: 0.0133},
    text: '手持天雷，不与凡俗言。',
  }),
  defineArt({
    id: 'art_jiu_tian',
    name: '九天神雷真解',
    school: '雷修',
    quality: 4,
    passives: { z1: 0.0266, z4: 0.0332, z6: 0.0133},
    text: '雷起九天，一线破万法。',
  }),
  defineArt({
    id: 'art_lei_di',
    name: '雷帝经',
    school: '雷修',
    quality: 5,
    passives: { z4: 0.0332, z1: 0.02},
    text: '雷霆所至，皆为我土。',
  }),
];

const MO: ArtDef[] = [
  defineArt({
    id: 'art_xue_mo',
    name: '血魔功',
    school: '魔修',
    quality: 1,
    passives: { z1: 0.0785},
    text: '血气上涌，功力一日千里。',
  }),
  defineArt({
    id: 'art_shi_hun',
    name: '噬魂大法',
    school: '魔修',
    quality: 2,
    passives: { z1: 0.0629, z4: 0.0707, z6: 0.0314},
    text: '吞魂噬魄，来者不拒。',
  }),
  defineArt({
    id: 'art_mo_yan',
    name: '魔焰真经',
    school: '魔修',
    quality: 2,
    passives: { z1: 0.0629, z4: 0.0314},
    text: '魔焰无形，焚心为上。',
  }),
  defineArt({
    id: 'art_duo_ling',
    name: '夺灵诀',
    school: '魔修',
    quality: 3,
    passives: { z1: 0.0707, z3: 0.0314},
    text: '夺人所养，为己所用。',
  }),
  defineArt({
    id: 'art_ni_tian',
    name: '逆天改命术',
    school: '魔修',
    quality: 3,
    passives: { z1: 0.0707, z6: 0.0629},
    text: '命数既定，偏要改它一改。',
  }),
  defineArt({
    id: 'art_wan_mo',
    name: '万魔归元功',
    school: '魔修',
    quality: 4,
    passives: { z1: 0.0266, z4: 0.0332, z6: 0.0133},
    text: '万魔俯首，尽归一元。',
  }),
  defineArt({
    id: 'art_tian_mo',
    name: '天魔解体大法',
    school: '魔修',
    quality: 5,
    passives: { z1: 0.0365, z4: 0.0133},
    text: '一身修为，尽化天魔。',
  }),
];

export const ARTS: ArtDef[] = [...JIAN, ...DAN, ...TI, ...DU, ...LEI, ...MO];

export const JIAN_ARTS = JIAN;
export const DAN_ARTS = DAN;
export const TI_ARTS = TI;
export const DU_ARTS = DU;
export const LEI_ARTS = LEI;
export const MO_ARTS = MO;

/** 入道三选一池：每个流派一门入门功法（六抽三） */
export const STARTER_ART_IDS: readonly string[] = [
  'art_jian_yi',
  'art_dan_ding',
  'art_tie_gu',
  'art_bai_du',
  'art_wu_lei',
  'art_xue_mo',
];

export function artName(c: { arts?: ArtDef[] }, id: string): string {
  return c.arts?.find((a) => a.id === id)?.name ?? id;
}
