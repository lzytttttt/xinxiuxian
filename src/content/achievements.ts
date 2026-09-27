/* 成就定义（约 80 条，九组）。
   判据全部读 `AchievementFacts`（纯标量，由 store 在局末组装）——成就不碰 RunState/MetaState，
   因此可以被 tests 与 tools 直接构造。`bonus` 是给**气运抽取**的百分点加成（累加，上限见
   ACHIEVEMENT_BONUS_CAP），不进突破概率表，也不进天劫阈值（验收 6.3）。 */

import { ACHIEVEMENT_BONUS_CAP } from '../engine/constants';

export type AchievementGroup =
  | '灵根与境界'
  | '个人修为'
  | '法宝'
  | '总战力'
  | '渡劫'
  | '飞升成仙'
  | '仙界篇'
  | '图鉴'
  | '宗门羁绊传承';

export interface AchievementFacts {
  life: number;
  level: number;
  root: number;
  luck: number;
  years: number;
  breakthroughs: number;
  events: number;
  encounters: number;
  battlesWon: number;
  escapes: number;
  artifacts: number;
  conquered: number;
  fates: number;
  pillStacks: number;
  tribulations: number;
  ascensions: number;
  zhengdao: number;
  bestPower: number;
  codexCount: number;
  sectRanks: number;
  sectBest: number;
  partners: number;
  partnerBest: number;
  bondsTotal: number;
  legacy: number;
  achievements: number;
  caveLevels: number;
}

export interface Achievement {
  id: string;
  name: string;
  group: AchievementGroup;
  desc: string;
  bonus: number;
  need: (f: AchievementFacts) => boolean;
}

function def(
  id: string,
  group: AchievementGroup,
  name: string,
  desc: string,
  need: (f: AchievementFacts) => boolean,
  bonus = 0,
): Achievement {
  return { id, group, name, desc, bonus, need };
}

const REACH = (lv: number) => (f: AchievementFacts): boolean => f.level >= lv;

export const ACHIEVEMENTS: readonly Achievement[] = [
  // ── 灵根与境界 ──
  def('ach_root_t1', '灵根与境界', '踏入仙途', '境界达到炼气一层', REACH(1)),
  def('ach_realm_10', '灵根与境界', '小成', '境界达到筑基十层', REACH(10)),
  def('ach_realm_20', '灵根与境界', '道基已成', '境界达到金丹十层', REACH(20)),
  def('ach_realm_30', '灵根与境界', '元婴出世', '境界达到元婴十层', REACH(30)),
  def('ach_realm_50', '灵根与境界', '半步化神', '境界达到化神十层', REACH(50)),
  def('ach_realm_70', '灵根与境界', '炼虚后期', '境界达到炼虚十层', REACH(70)),
  def('ach_realm_90', '灵根与境界', '大乘圆满', '境界达到大乘十层', REACH(90)),
  def('ach_root_80', '灵根与境界', '天灵根', '单世灵根达到 80', (f) => f.root >= 80),
  def('ach_root_100', '灵根与境界', '仙品灵根', '单世灵根达到 100', (f) => f.root >= 100, 1),
  def('ach_luck_100', '灵根与境界', '鸿运当头', '单世气运达到 100', (f) => f.luck >= 100, 1),
  def('ach_luck_200', '灵根与境界', '天命所归', '单世气运达到 200', (f) => f.luck >= 200, 1),
  def('ach_fates_2', '灵根与境界', '双命格', '入道时抽到两个命格', (f) => f.fates >= 2),
  def('ach_fates_4', '灵根与境界', '四命格加身', '累计命格数达到 4', (f) => f.fates >= 4, 1),

  // ── 个人修为 ──
  def('ach_year_30', '个人修为', '而立', '单世修行 30 年', (f) => f.years >= 30),
  def('ach_year_60', '个人修为', '花甲', '单世修行 60 年', (f) => f.years >= 60),
  def('ach_year_100', '个人修为', '百岁长生', '单世修行 100 年', (f) => f.years >= 100, 1),
  def('ach_year_150', '个人修为', '一百五十载', '单世修行 150 年', (f) => f.years >= 150, 1),
  def('ach_brk_10', '个人修为', '小有所成', '单世突破 10 次', (f) => f.breakthroughs >= 10),
  def('ach_brk_30', '个人修为', '一路破境', '单世突破 30 次', (f) => f.breakthroughs >= 30, 1),
  def('ach_brk_50', '个人修为', '势如破竹', '单世突破 50 次', (f) => f.breakthroughs >= 50, 1),
  def('ach_event_20', '个人修为', '阅历渐丰', '单世触发 20 个事件', (f) => f.events >= 20),
  def('ach_event_60', '个人修为', '阅尽风波', '单世触发 60 个事件', (f) => f.events >= 60),
  def('ach_event_100', '个人修为', '世事洞明', '单世触发 100 个事件', (f) => f.events >= 100, 1),

  // ── 机缘与战斗 ──
  def('ach_enc_5', '个人修为', '初历风险', '单世遇机缘 5 次', (f) => f.encounters >= 5),
  def('ach_enc_20', '个人修为', '行走四方', '单世遇机缘 20 次', (f) => f.encounters >= 20),
  def('ach_enc_50', '个人修为', '身经百战', '单世遇机缘 50 次', (f) => f.encounters >= 50, 1),
  def('ach_win_10', '个人修为', '十战十胜', '单世战斗胜利 10 次', (f) => f.battlesWon >= 10),
  def('ach_win_30', '个人修为', '百战之身', '单世战斗胜利 30 次', (f) => f.battlesWon >= 30, 1),
  def('ach_escape_5', '个人修为', '全身而退', '单世脱身 5 次', (f) => f.escapes >= 5),
  def('ach_escape_15', '个人修为', '趋吉避凶', '单世脱身 15 次', (f) => f.escapes >= 15, 1),

  // ── 法宝 ──
  def('ach_art_1', '法宝', '初得法宝', '单世得法宝 1 件', (f) => f.artifacts >= 1),
  def('ach_art_5', '法宝', '法宝盈囊', '单世得法宝 5 件', (f) => f.artifacts >= 5),
  def('ach_art_15', '法宝', '藏珍无数', '单世得法宝 15 件', (f) => f.artifacts >= 15, 1),
  def('ach_art_30', '法宝', '法宝如山', '单世得法宝 30 件', (f) => f.artifacts >= 30, 1),
  def('ach_conquer_3', '法宝', '降而有得', '单世降服法宝 3 件', (f) => f.conquered >= 3),
  def('ach_conquer_10', '法宝', '万宝之主', '单世降服法宝 10 件', (f) => f.conquered >= 10, 1),
  def('ach_pill_10', '法宝', '丹箧盈满', '局末持有 10 类丹药', (f) => f.pillStacks >= 10),
  def('ach_pill_25', '法宝', '百药齐备', '局末持有 25 类丹药', (f) => f.pillStacks >= 25, 1),

  // ── 总战力 ──
  def('ach_pow_1e4', '总战力', '初具锋芒', '历史最高总战力达到 1 万', (f) => f.bestPower >= 1e4),
  def('ach_pow_1e5', '总战力', '名动一方', '历史最高总战力达到 10 万', (f) => f.bestPower >= 1e5),
  def('ach_pow_1e6', '总战力', '威震八荒', '历史最高总战力达到 100 万', (f) => f.bestPower >= 1e6, 1),
  def('ach_pow_1e7', '总战力', '一域无敌', '历史最高总战力达到 1000 万', (f) => f.bestPower >= 1e7, 1),
  def('ach_pow_1e8', '总战力', '天下闻名', '历史最高总战力达到 1 亿', (f) => f.bestPower >= 1e8, 1),
  def('ach_pow_1e9', '总战力', '举世皆知', '历史最高总战力达到 10 亿', (f) => f.bestPower >= 1e9, 2),
  def('ach_pow_1e10', '总战力', '不朽传奇', '历史最高总战力达到 100 亿', (f) => f.bestPower >= 1e10, 2),

  // ── 渡劫 ──
  def('ach_trib_1', '渡劫', '初逢天劫', '渡过天劫 1 次', (f) => f.tribulations >= 1),
  def('ach_trib_3', '渡劫', '三劫临身', '累计渡过天劫 3 次', (f) => f.tribulations >= 3, 1),
  def('ach_trib_6', '渡劫', '六劫不倒', '累计渡过天劫 6 次', (f) => f.tribulations >= 6, 1),
  def('ach_trib_9', '渡劫', '九劫圆满', '累计渡过天劫 9 次', (f) => f.tribulations >= 9, 2),
  def('ach_trib_18', '渡劫', '十八重劫', '累计渡过天劫 18 次', (f) => f.tribulations >= 18, 2),
  def('ach_trib_30', '渡劫', '劫上加劫', '累计渡过天劫 30 次', (f) => f.tribulations >= 30, 2),
  def('ach_zhengdao_1', '渡劫', '证道成圣', '首次证道', (f) => f.zhengdao >= 1, 3),
  def('ach_zhengdao_3', '渡劫', '道心通明', '累计证道 3 次', (f) => f.zhengdao >= 3, 3),

  // ── 飞升成仙 ──
  def('ach_asc_1', '飞升成仙', '白日飞升', '首次飞升仙界', (f) => f.ascensions >= 1, 1),
  def('ach_asc_3', '飞升成仙', '三度飞升', '累计飞升 3 次', (f) => f.ascensions >= 3, 1),
  def('ach_asc_6', '飞升成仙', '六登仙阙', '累计飞升 6 次', (f) => f.ascensions >= 6, 2),
  def('ach_asc_10', '飞升成仙', '十世飞升', '累计飞升 10 次', (f) => f.ascensions >= 10, 2),
  def('ach_life_2', '飞升成仙', '二世轮回', '走到第 2 世', (f) => f.life >= 2),
  def('ach_life_5', '飞升成仙', '五世同修', '走到第 5 世', (f) => f.life >= 5, 1),
  def('ach_life_10', '飞升成仙', '十世不辍', '走到第 10 世', (f) => f.life >= 10, 2),
  def('ach_life_20', '飞升成仙', '二十世轮回', '走到第 20 世', (f) => f.life >= 20, 3),

  // ── 仙界篇 ──
  def('ach_imm_year_10', '仙界篇', '仙居十载', '单世在仙界修行 10 年', (f) => f.level > 100 && f.years >= 10),
  def('ach_imm_105', '仙界篇', '真仙之境', '境界进入仙界五层以上', REACH(105), 1),
  def('ach_imm_110', '仙界篇', '金仙圆满', '境界达到仙界十层', REACH(110), 2),
  def('ach_imm_comeback', '仙界篇', '谪仙归来', '飞升后再走到大乘圆满', (f) => f.ascensions >= 2 && REACH(90)(f)),
  def('ach_imm_pill', '仙界篇', '仙丹在手', '局末持有 15 类丹药且已飞升', (f) => f.ascensions >= 1 && f.pillStacks >= 15, 1),
  def('ach_imm_art', '仙界篇', '仙器在手', '飞升后仍能得法宝 10 件', (f) => f.ascensions >= 1 && f.artifacts >= 10),
  def('ach_imm_trib', '仙界篇', '仙劫余生', '飞升后仍渡过 3 次天劫', (f) => f.ascensions >= 1 && f.tribulations >= 6, 2),
  def('ach_imm_mix', '仙界篇', '仙凡皆历', '同一世既飞升又证道', (f) => f.ascensions >= 1 && f.zhengdao >= 1, 3),

  // ── 图鉴 ──
  def('ach_codex_20', '图鉴', '略有收集', '图鉴收集 20 条', (f) => f.codexCount >= 20),
  def('ach_codex_100', '图鉴', '博览群物', '图鉴收集 100 条', (f) => f.codexCount >= 100, 1),
  def('ach_codex_300', '图鉴', '见多识广', '图鉴收集 300 条', (f) => f.codexCount >= 300, 1),
  def('ach_codex_600', '图鉴', '洞悉万物', '图鉴收集 600 条', (f) => f.codexCount >= 600, 2),
  def('ach_codex_1000', '图鉴', '博物通志', '图鉴收集 1000 条', (f) => f.codexCount >= 1000, 2),
  def('ach_codex_2000', '图鉴', '天地尽录', '图鉴收集 2000 条', (f) => f.codexCount >= 2000, 3),
  def('ach_codex_3000', '图鉴', '道尽其妙', '图鉴收集 3000 条', (f) => f.codexCount >= 3000, 3),
  def('ach_ach_10', '图鉴', '初窥门径', '解锁 10 个成就', (f) => f.achievements >= 10),
  def('ach_ach_40', '图鉴', '成就斐然', '解锁 40 个成就', (f) => f.achievements >= 40, 1),
  def('ach_ach_all', '图鉴', '万法归一', '解锁全部成就', (f) => f.achievements >= ACHIEVEMENTS.length, 3),

  // ── 宗门 · 羁绊 · 传承 ──
  def('ach_sect_1', '宗门羁绊传承', '入门', '历史宗门职位达到 1 级', (f) => f.sectBest >= 1),
  def('ach_sect_2', '宗门羁绊传承', '内门弟子', '历史宗门职位达到 2 级', (f) => f.sectBest >= 2),
  def('ach_sect_3', '宗门羁绊传承', '一峰长老', '历史宗门职位达到 3 级', (f) => f.sectBest >= 3, 1),
  def('ach_sect_4', '宗门羁绊传承', '一宗之主', '历史宗门职位达到 4 级', (f) => f.sectBest >= 4, 2),
  def('ach_sect_all', '宗门羁绊传承', '八宗宗主', '八个宗门都担任过 3 级以上', (f) => f.sectRanks >= 24, 3),
  def('ach_bond_3', '宗门羁绊传承', '三友在侧', '历史羁绊总数达到 3', (f) => f.partners >= 3),
  def('ach_bond_8', '宗门羁绊传承', '故交满天下', '历史羁绊总数达到 8', (f) => f.partners >= 8, 1),
  def('ach_bond_partner5', '宗门羁绊传承', '道侣情深', '道侣羁绊等级达到 5', (f) => f.partnerBest >= 5, 1),
  def('ach_bond_live5', '宗门羁绊传承', '众星拱月', '单世存活羁绊达到 5 段', (f) => f.bondsTotal >= 5, 1),
  def('ach_legacy_100', '宗门羁绊传承', '传承初成', '累计传承点达到 100', (f) => f.legacy >= 100),
  def('ach_legacy_500', '宗门羁绊传承', '洞府有成', '累计传承点达到 500', (f) => f.legacy >= 500, 1),
  def('ach_legacy_1500', '宗门羁绊传承', '洞天洞地', '累计传承点达到 1500', (f) => f.legacy >= 1500, 2),
  def('ach_legacy_2846', '宗门羁绊传承', '六室俱满', '六间洞府全部满级', (f) => f.caveLevels >= 30, 3),
  def('ach_ach_bonus_max', '宗门羁绊传承', '气运加身', '成就气运加成累计达到上限', (f) => f.achievements >= 40, 2),
];

export const ACHIEVEMENT_GROUPS: readonly AchievementGroup[] = [
  '灵根与境界',
  '个人修为',
  '法宝',
  '总战力',
  '渡劫',
  '飞升成仙',
  '仙界篇',
  '图鉴',
  '宗门羁绊传承',
];

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/** 结算：返回本次新解锁的成就 id（已解锁的不重复返回） */
export function newlyUnlocked(facts: AchievementFacts, owned: readonly string[]): string[] {
  const has = new Set(owned);
  const out: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (has.has(a.id)) continue;
    if (a.need(facts)) out.push(a.id);
  }
  return out;
}

/** 已解锁成就累计给出的气运抽取加成（百分点），受 ACHIEVEMENT_BONUS_CAP 封顶 */
export function goldBoostOf(owned: readonly string[]): number {
  let sum = 0;
  for (const a of ACHIEVEMENTS) {
    if (owned.includes(a.id)) sum += a.bonus;
  }
  return Math.min(ACHIEVEMENT_BONUS_CAP, sum);
}
