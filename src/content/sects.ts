import { defineSect } from '../engine/registry';
import type { SectDef } from '../engine/types/effects';

/* 六个单流派宗门 + 两个混元宗门。混元宗门给跨流派抗性与轻突破，是「万法归一」「阴阳互济」的捷径。
   perk 的接线点见 v0.1.0-06 §三·2.1：breakBonus → breakthrough、alchemyBonus → alchemy、
   toxMult → arts.toxicityGain、artifactBonus → selectors.z3、plunderSim → tick 槽 6、
   damageMult → encounter 战败损失、perilMult → tribulation.perilTick、insightBonus → stipendOf。 */

export const SECTS: SectDef[] = [
  defineSect({
    id: 'sect_taixu',
    name: '太虚剑宗',
    schools: ['剑修'],
    mixed: false,
    text: '剑意凌厉，唯攻不守。宗内不设丹房，只设剑冢 —— 断了剑的人，自己再去寻一把。',
    perk: { artifactBonus: 0.1 },
    arts: ['art_sect_taixu'],
  }),
  defineSect({
    id: 'sect_qingnang',
    name: '青囊谷',
    schools: ['丹修'],
    mixed: false,
    text: '悬壶济世，丹火不熄。谷中弟子入门先学辨草，三年后才准碰炉。',
    perk: { alchemyBonus: 0.2, herbMult: 1.5 },
    arts: ['art_sect_qingnang'],
  }),
  defineSect({
    id: 'sect_xuanyue',
    name: '玄岳门',
    schools: ['体修'],
    mixed: false,
    text: '肉身如岳，万法不侵。门中无经卷，只有一条上山的路。',
    perk: { damageMult: 0.7 },
    arts: ['art_sect_xuanyue'],
  }),
  defineSect({
    id: 'sect_wandu',
    name: '万毒窟',
    schools: ['毒修'],
    mixed: false,
    text: '以毒证道，百毒不侵。窟中长老说：怕毒的人，本就不该来。',
    perk: { toxMult: 0.75 },
    arts: ['art_sect_wandu'],
  }),
  defineSect({
    id: 'sect_jiuxiao',
    name: '九霄雷府',
    schools: ['雷修'],
    mixed: false,
    text: '掌天雷罚，一念断罪。府中弟子入门第一课，是在雷池边站满一日。',
    perk: { breakBonus: 0.04 },
    arts: ['art_sect_jiuxiao'],
  }),
  defineSect({
    id: 'sect_youming',
    name: '幽冥魔宗',
    schools: ['魔修'],
    mixed: false,
    text: '逆天而行，掠夺成道。宗内不论出身，只论谁能活着回来。',
    perk: { plunderSim: 1 },
    arts: ['art_sect_youming'],
  }),
  defineSect({
    id: 'sect_taiyi',
    name: '太乙符宗',
    schools: ['雷修', '体修'],
    mixed: true,
    text: '以符驭法，以阵困仙。符宗不设流派，六法皆可入符。',
    perk: { breakBonus: 0.02, artifactBonus: 0.05 },
    arts: ['art_sect_taiyi'],
  }),
  defineSect({
    id: 'sect_tianyin',
    name: '天音寺',
    schools: ['丹修', '体修'],
    mixed: true,
    text: '梵音洗心，心境不染。寺中不炼杀伐之器，只炼一味心药。',
    perk: { toxMult: 0.85, perilMult: 0.8, insightBonus: 1 },
    arts: ['art_sect_tianyin'],
  }),
];
