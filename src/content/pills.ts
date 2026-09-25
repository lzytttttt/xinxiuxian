import { definePill } from '../engine/registry';
import type { PillDef } from '../engine/types/effects';

/* 七类丹药（每类 1-3 档）。效果以**中品**（quality = 3，倍率 ×1.0）为基准：
   实际效果 = base × 品质倍率；药力 = zoneBase × 品质倍率，持续 4 年（见 engine/alchemy.ts）。
   `base` 对「破境」存的是百分比（25 → 突破概率 ×1.25），仅供展示与公式对齐。 */

export const PILLS: PillDef[] = [
  // 聚气：通用成长 + Z5 药力主来源
  definePill({ id: 'pill_juqi_1', name: '聚气丹', type: '聚气', tier: 2, base: 8, zoneBase: 0.50, zone: 'z5', text: '丹入腹中，修为如添薪之火。' }),
  definePill({ id: 'pill_juqi_2', name: '聚气还元丹', type: '聚气', tier: 5, base: 11, zoneBase: 0.46, zone: 'z5', text: '药力绵长，数日不散，行功一日抵得十日。' }),
  definePill({ id: 'pill_juqi_3', name: '聚气归真丹', type: '聚气', tier: 9, base: 15, zoneBase: 0.52, zone: 'z5', text: '丹成之时丹房生香，一口吞下，气机如江河归海。' }),

  // 洗髓：灵根 +N（抬 Z2 与天赋档）
  definePill({ id: 'pill_xisui_1', name: '洗髓丹', type: '洗髓', tier: 3, base: 3, zoneBase: 0.20, zone: 'z2', text: '骨节咯咯作响，经脉中浊气自毛孔散出。' }),
  definePill({ id: 'pill_xisui_2', name: '换骨洗髓丹', type: '洗髓', tier: 7, base: 5, zoneBase: 0.24, zone: 'z2', text: '一夜换骨，晨起时你自己的气息都陌生了几分。' }),
  definePill({ id: 'pill_xisui_3', name: '脱胎洗髓丹', type: '洗髓', tier: 10, base: 7, zoneBase: 0.28, zone: 'z2', text: '旧躯如蜕，新骨生辉，资质已非昨日之你。' }),

  // 天机：气运 +N（四个概率通道 + 天劫侥幸）
  definePill({ id: 'pill_tianji_1', name: '天机丹', type: '天机', tier: 3, base: 3, zoneBase: 0.22, zone: 'z6', text: '冥冥中似有一线气机被拨正。' }),
  definePill({ id: 'pill_tianji_2', name: '窥天丹', type: '天机', tier: 7, base: 5, zoneBase: 0.28, zone: 'z6', text: '一瞬之间，你看见了三条本该错过的路。' }),
  definePill({ id: 'pill_tianji_3', name: '夺天丹', type: '天机', tier: 10, base: 7, zoneBase: 0.34, zone: 'z6', text: '天机被你强夺一线，命中多了三分变数。' }),

  // 炼宝：法宝之力 +N%（抬 Z3）
  definePill({ id: 'pill_lianbao_1', name: '炼宝丹', type: '炼宝', tier: 4, base: 6, zoneBase: 0.30, zone: 'z3', text: '丹气附着法器，宝光隐隐更深了一层。' }),
  definePill({ id: 'pill_lianbao_2', name: '养宝丹', type: '炼宝', tier: 8, base: 10, zoneBase: 0.40, zone: 'z3', text: '法器如活物般吐纳丹气，锋芒愈发内敛。' }),

  // 破境：本年突破概率 ×1.25（大境界顶不可用）
  definePill({ id: 'pill_pojing_1', name: '破境丹', type: '破境', tier: 4, base: 25, zoneBase: 0.30, zone: 'z5', text: '药力直冲关隘，壁障在气机下摇摇欲坠。' }),
  definePill({ id: 'pill_pojing_2', name: '开天破境丹', type: '破境', tier: 8, base: 25, zoneBase: 0.50, zone: 'z5', text: '关隘如纸，一线天光自裂隙中照下。' }),

  // 护劫：渡劫要求 −12%（九重天劫期间效果覆盖全部九重）
  definePill({ id: 'pill_hujie_1', name: '护劫丹', type: '护劫', tier: 5, base: 12, zoneBase: 0.24, zone: 'z5', text: '周身起了一层看不见的护罩，雷气近身便散。' }),
  definePill({ id: 'pill_hujie_2', name: '镇雷护劫丹', type: '护劫', tier: 9, base: 12, zoneBase: 0.32, zone: 'z5', text: '丹力沉稳如岳，劫雷再烈也压不垮你的脊梁。' }),

  // 疗毒：丹毒 −N（不走丹火不侵减半）
  definePill({ id: 'pill_liaodu_1', name: '净毒丹', type: '疗毒', tier: 4, base: 30, zoneBase: 0.06, zone: 'z5', text: '经脉中沉积的焦苦随着一口浊血吐出。' }),
  definePill({ id: 'pill_liaodu_2', name: '洗毒还清丹', type: '疗毒', tier: 8, base: 45, zoneBase: 0.08, zone: 'z5', text: '药力涤荡周身，多年暗毒一朝洗净。' }),
  definePill({ id: 'pill_liaodu_3', name: '九转净毒丹', type: '疗毒', tier: 10, base: 60, zoneBase: 0.14, zone: 'z5', text: '九转药力过处，经脉澄澈如新凿之泉。' }),
];
