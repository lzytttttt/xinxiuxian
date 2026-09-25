import { defineRecipe } from '../engine/registry';
import type { Condition, Recipe, SchoolId, TempCurve } from '../engine/types/effects';
import type { PillType } from '../engine/types/effects';

/* 丹方表：35 张（1-3 阶 12 / 4-6 阶 12 / 7-9 阶 8 / 10 阶 3）。
   火候参数分档（与控火常量一起决定技能性，见 doc/v0.1.0-05 §三）：
     1-3 阶 steps 8-10、tolerance 4.5；4-6 阶 10-12、4.4；7-9 阶 13-15、4.3；10 阶 16、4.25。
   noise 随阶递增（0.030 → 0.090）；curve 前期 flat/rise，中期起引入 fall/pulse。 */

const always: Condition = { op: 'always' };
const realm = (level: number): Condition => ({ op: 'realmAtLeast', level });
const flag = (id: string): Condition => ({ op: 'flag', id, min: 1 });
const and = (...of: Condition[]): Condition => ({ op: 'and', of });

function rec(
  id: string,
  name: string,
  tier: number,
  type: PillType,
  pill: string,
  inputs: [string, number][],
  curve: TempCurve,
  steps: number,
  noise: number,
  tolerance: number,
  unlock: Condition,
  school?: SchoolId,
): Recipe {
  const furnace = { targetTemp: 52 + ((tier * 7 + steps * 2) % 34), curve, steps, noise, tolerance };
  return defineRecipe({
    id,
    name,
    tier,
    type,
    pill,
    inputs: inputs.map(([herb, count]) => ({ herb, count })),
    furnace,
    ...(school ? { school } : {}),
    unlock,
    baseGrade: Math.min(6, 1 + Math.round(tier / 2)),
  });
}

export const RECIPES: Recipe[] = [
  // ── 1-3 阶（12） ──
  rec('rec_juqi_1', '聚气丹方·初篇', 1, '聚气', 'pill_juqi_1', [['herb_yunwu', 2], ['herb_yinqi', 1]], 'flat', 8, 0.03, 4.5, always),
  rec('rec_yangqi', '养气散方', 1, '聚气', 'pill_juqi_1', [['herb_chiteng', 2], ['herb_common', 2]], 'rise', 8, 0.032, 4.5, always),
  rec('rec_qingxin', '清心丸方', 1, '疗毒', 'pill_liaodu_1', [['herb_qingxin', 2], ['herb_hanlu', 1]], 'flat', 9, 0.034, 4.5, always),
  rec('rec_guben', '固本方', 2, '洗髓', 'pill_xisui_1', [['herb_tiexian', 2], ['herb_bailing', 2]], 'flat', 9, 0.038, 4.5, always),
  rec('rec_bidu', '辟毒散方', 2, '疗毒', 'pill_liaodu_1', [['herb_dugen', 2], ['herb_youquan', 1]], 'fall', 9, 0.040, 4.5, always),
  rec('rec_nuanxin', '暖心丹方', 2, '聚气', 'pill_juqi_1', [['herb_yanxin', 2], ['herb_shishang', 1]], 'rise', 10, 0.042, 4.5, always),
  rec('rec_shiling', '石灵散方', 2, '炼宝', 'pill_lianbao_1', [['herb_shishang', 2], ['herb_tiexian', 1]], 'flat', 9, 0.040, 4.5, realm(12)),
  rec('rec_bailing', '百灵膏方', 3, '聚气', 'pill_juqi_1', [['herb_bailing', 2], ['herb_muxi', 2]], 'flat', 10, 0.045, 4.5, realm(15)),
  rec('rec_liuli', '琉璃丹方', 3, '炼宝', 'pill_lianbao_1', [['herb_liuli', 2], ['herb_hanjing', 1]], 'fall', 10, 0.046, 4.5, realm(18)),
  rec('rec_mingmu', '明目丹方', 3, '天机', 'pill_tianji_1', [['herb_qingxin', 2], ['herb_liuli', 1]], 'flat', 10, 0.045, 4.5, realm(18)),
  rec('rec_zhuoxin', '浊心解毒方', 3, '疗毒', 'pill_liaodu_1', [['herb_zhuoxin', 2], ['herb_dugen', 2]], 'pulse', 10, 0.048, 4.5, realm(20)),
  rec('rec_huoyun', '火云丹方', 3, '聚气', 'pill_juqi_1', [['herb_huoyun', 2], ['herb_chiteng', 2]], 'rise', 10, 0.048, 4.5, realm(20)),

  // ── 4-6 阶（12） ──
  rec('rec_baihua', '百花养元丹方', 4, '聚气', 'pill_juqi_2', [['herb_baihua', 2], ['herb_zixia', 2], ['herb_muxi', 2]], 'flat', 11, 0.052, 4.4, realm(26)),
  rec('rec_wugu', '乌骨洗髓方', 4, '洗髓', 'pill_xisui_1', [['herb_wugu', 2], ['herb_baihua', 2]], 'pulse', 11, 0.054, 4.4, realm(28)),
  rec('rec_hanjing', '寒晶炼宝方', 4, '炼宝', 'pill_lianbao_1', [['herb_hanjing', 2], ['herb_hanshui', 2]], 'fall', 11, 0.052, 4.4, realm(28)),
  rec('rec_ziwei', '紫薇天机方', 4, '天机', 'pill_tianji_1', [['herb_zixia', 2], ['herb_jinying', 2]], 'flat', 11, 0.055, 4.4, realm(30)),
  rec('rec_pojing', '破境丹方', 4, '破境', 'pill_pojing_1', [['herb_zixia', 3], ['herb_leigen', 2]], 'rise', 12, 0.056, 4.4, realm(30)),
  rec('rec_jiedu', '解毒真方', 4, '疗毒', 'pill_liaodu_1', [['herb_wugu', 3], ['herb_duyan', 2]], 'pulse', 11, 0.058, 4.4, realm(30)),
  rec('rec_xuelian', '雪莲养魂丹方', 5, '聚气', 'pill_juqi_2', [['herb_xuelian', 2], ['herb_shenmu', 2]], 'fall', 12, 0.060, 4.4, realm(34)),
  rec('rec_yanlin', '焰鳞活血方', 5, '炼宝', 'pill_lianbao_1', [['herb_yanlin', 2], ['herb_zhenjin', 2]], 'rise', 12, 0.060, 4.4, realm(36)),
  rec('rec_zhenjin', '真金护劫方', 5, '护劫', 'pill_hujie_1', [['herb_zhenjin', 2], ['herb_leiying', 2]], 'flat', 12, 0.062, 4.4, realm(38)),
  rec('rec_duyan', '毒烟淬体方', 5, '洗髓', 'pill_xisui_1', [['herb_duyan', 3], ['herb_wugu', 2]], 'pulse', 12, 0.064, 4.4, realm(36), '毒修'),
  rec('rec_youlan', '幽兰凝气方', 6, '聚气', 'pill_juqi_2', [['herb_youlan', 2], ['herb_yunmu', 2]], 'flat', 12, 0.064, 4.4, realm(42)),
  rec('rec_wandu', '万毒归元方', 6, '天机', 'pill_tianji_2', [['herb_wandu', 3], ['herb_duyan', 2]], 'pulse', 12, 0.068, 4.4, realm(44), '毒修'),

  // ── 7-9 阶（8） ──
  rec('rec_fengxue', '凤血续命丹方', 7, '聚气', 'pill_juqi_2', [['herb_fengxue', 2], ['herb_jinsui', 2]], 'flat', 13, 0.068, 4.3, realm(58)),
  rec('rec_xuanbing', '玄冰洗髓方', 7, '洗髓', 'pill_xisui_2', [['herb_xuanbing', 3], ['herb_jiuyou', 2]], 'fall', 13, 0.070, 4.3, realm(60)),
  rec('rec_taixi', '太息养魂丹方', 7, '天机', 'pill_tianji_2', [['herb_taixi', 2], ['herb_jiuyou', 2]], 'flat', 13, 0.070, 4.3, realm(60)),
  rec('rec_ziyan', '紫炎炼宝方', 7, '炼宝', 'pill_lianbao_2', [['herb_ziyan', 3], ['herb_fengxue', 2]], 'rise', 13, 0.072, 4.3, realm(62), '丹修'),
  rec('rec_huanhun', '还魂丹方', 8, '聚气', 'pill_juqi_3', [['herb_huanhun', 3], ['herb_zhenyin', 2]], 'pulse', 14, 0.076, 4.3, realm(68)),
  rec('rec_chiyu', '赤羽破境方', 8, '破境', 'pill_pojing_2', [['herb_chiyu', 3], ['herb_leiji', 3]], 'rise', 14, 0.078, 4.3, realm(70)),
  rec('rec_dugu', '毒蛊镇雷方', 8, '护劫', 'pill_hujie_1', [['herb_dugu', 3], ['herb_minghe', 3]], 'pulse', 14, 0.080, 4.3, realm(70), '毒修'),
  rec('rec_hanpo', '寒魄净毒方', 9, '疗毒', 'pill_liaodu_2', [['herb_hanpo', 3], ['herb_yuehua', 3]], 'fall', 15, 0.084, 4.3, realm(76)),

  // ── 10 阶（3） ──
  rec('rec_daoyun', '道韵聚气丹方', 10, '聚气', 'pill_juqi_3', [['herb_daoyun', 4], ['herb_hundun', 3], ['herb_xuanhuang', 3]], 'pulse', 16, 0.088, 4.25, and(realm(88), flag('dao_seat'))),
  rec('rec_hundun', '混沌炼宝丹方', 10, '炼宝', 'pill_lianbao_2', [['herb_hundun', 4], ['herb_tianlei', 3], ['herb_shengxue', 3]], 'rise', 16, 0.090, 4.25, and(realm(90), flag('dan_hall'))),
  rec('rec_jiuyin', '九阴洗髓丹方', 10, '洗髓', 'pill_xisui_3', [['herb_jiuyin', 4], ['herb_minghe', 3], ['herb_yuehua', 3]], 'fall', 16, 0.090, 4.25, and(realm(92), flag('dan_hall'))),
];
