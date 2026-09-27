export const REALM_MAX_MORTAL = 100;
export const REALM_MAX_IMMORTAL = 200;

export const SPIRIT_DIV = 500;
export const ARTIFACT_BASE = 100;
export const LUCK_DIV = 1000;
export const IMMORTAL_BOOST = 12;
export const ARTIFACT_POWER_MULT = 0.1;
export const ARTIFACT_RATE_BASE = 50;
export const ARTIFACT_RATE_STEP = 5;
export const ESCAPE_SAME = 0.9;
export const ESCAPE_STEP = 0.05;
export const WEAK_RATIO = 0.9;
export const CHAIN_MULT = 0.6;
export const IMM_CHAIN_MULT = 0.7;
export const GATE_PENALTY = 0.5;
export const LUCK_TRIB_DIV = 5000;
export const XIANQI_RATE = 1 / 1500;
export const XIANQI_RATE_MAX = 1 / 1250;
export const CHAOS_RATE = 1 / 100;
export const CHAOS_CULT_LO = 20_000_000;
export const CHAOS_CULT_HI = 40_000_000;
export const EVENT_RATE = 0.1;
export const ARTIFACT_RATE = 0.05;
export const ARTIFACT_RATE_PINNACLE = 0.5;
export const ENCOUNTER_RATE = 0.05;
export const ENCOUNTER_RATE_PINNACLE = 0.3;
export const ROOT_SHIFT_RATE = 1 / 10000;
export const ROOT_SHIFT_MAX_INNATE = 60;
export const ROOT_SHIFT_AGE_MAX = 6;
export const ROOT_SHIFT_LO = 70;
export const ROOT_SHIFT_HI = 100;
export const TOXICITY_MAX = 100;
export const TOXICITY_DECAY_RATE = 0.08;
export const TOXICITY_DECAY_MIN = 1;
export const TOXICITY_BREAK_PENALTY = 250;
export const TOXICITY_PERIL_BONUS = 500;
export const INSIGHT_PER_LEVEL = 20;
export const CHAIN_DEPTH_MAX = 3;
export const LOG_LIMIT = 300;
export const RECENCY_LIMIT = 20;
export const ASCEND_EXP = 1000;
export const PITY_TRIGGER = 100;
export const SIM_MAX_IMMORTAL = 999_999;

export const TIER_WEIGHTS: readonly number[] = [0, 33, 25, 11, 9, 7, 5, 4, 3, 2, 1];

export const TALENT_BASE: readonly number[] = [0, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

export const TALENT_NAMES: readonly string[] = [
  '杂灵根',
  '五灵根',
  '四灵根',
  '三灵根',
  '双灵根',
  '异灵根',
  '地灵根',
  '天灵根',
  '灵体',
  '道体',
];

export const COMBAT_COEF: readonly number[] = [0, 1.0, 1.5, 2.2, 3.2, 4.5, 6.3, 8.8, 12, 16, 22];

// 外推表 1：仙界升级系数。锚点：飞升后战力需从百万量级进入千万量级，且满级苦修
// rand(50,100)×COMBAT_COEF2[档]×1000 需能在仙界 150-250 年内把战力推到 10^10 量级
// （证道天劫首重 612 亿）。取 COMBAT_COEF×120 → 档 10 = 2640，满级苦修 1.3-2.6 亿/年。
export const COMBAT_COEF2: readonly number[] = COMBAT_COEF.map((x) => x * 120);

export const BREAK_CHANCE: readonly (readonly number[])[] = [
  [20, 10, 5, 2, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  [40, 20, 10, 5, 2, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  [60, 40, 20, 10, 5, 2, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  [80, 60, 40, 20, 10, 5, 2, 0.5, 0.5, 0.5, 0.5, 0.5],
  [100, 80, 60, 40, 20, 10, 5, 2, 0.5, 0.5, 0.5, 0.5],
  [120, 100, 80, 60, 40, 20, 10, 5, 2, 0.5, 0.5, 0.5],
  [150, 120, 100, 80, 60, 30, 15, 5, 2, 1, 0.75, 0.5],
  [200, 160, 133, 113, 80, 48, 24, 10, 4, 1.5, 1.2, 0.6],
  [250, 180, 166, 136, 100, 66, 34, 14, 7, 3.5, 1.4, 0.7],
  [300, 240, 200, 160, 120, 80, 40, 20, 10, 5, 2, 1],
];

// 外推表 2：仙界突破表。锚点：wiki 只给出档 10 首段 420% → 末段 4%、档 1 首段 20% → 末段 0.05%。
// 首段 = 凡界首段 ×(1 + 0.4×档序/9)，末段 = 0.05×80^(档序/9)，中间沿行做端点几何插值，
// 并以「凡界同位置 ×0.5」为下限保护（末段恒 ≥0.05）。
function deriveBreakChance2(): readonly (readonly number[])[] {
  const cols = 12;
  return BREAK_CHANCE.map((row, i) => {
    const first = (row[0] ?? 1) * (1 + (0.4 * i) / 9);
    const last = 0.05 * Math.pow(80, i / 9);
    const ratio = Math.pow(last / first, 1 / (cols - 1));
    const guard = Math.max(((row[cols - 1] ?? 0.5) * 0.5), 0.05);
    return Array.from({ length: cols }, (_, j) =>
      Math.round(Math.max(first * Math.pow(ratio, j), guard) * 100) / 100,
    );
  });
}

export const BREAK_CHANCE2: readonly (readonly number[])[] = deriveBreakChance2();

export const SEG_BOUNDS: readonly number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];

export const LIFESPAN_GAIN: readonly (readonly [number, number])[] = [
  [55, 1],
  [66, 2],
  [76, 3],
  [86, 4],
  [91, 5],
  [96, 8],
  [100, 100],
];

export const AGE_COEF_YOUNG = 1.2;
export const AGE_COEF_TEEN = 1.1;
export const AGE_COEF_LATE = 0.95;
export const AGE_COEF_YOUNG_MAX = 12;
export const AGE_COEF_TEEN_MAX = 18;
export const SIM_LOWWATER = 0.9;
export const STATIC_CULT_LO = 0.0005;
export const STATIC_CULT_HI = 0.001;
export const MAX_LEVEL_CULT_LO = 50;
export const MAX_LEVEL_CULT_HI = 100;
export const MAX_LEVEL_CULT_IMMORTAL_MULT = 1000;

export const STAGE_MORTAL: readonly string[] = [
  '练气',
  '筑基',
  '金丹',
  '结婴',
  '化神',
  '出窍',
  '反虚',
  '合体',
  '大乘',
  '渡劫',
];

export const STAGE_IMMORTAL: readonly string[] = [
  '仙人',
  '真仙',
  '天仙',
  '玄仙',
  '金仙',
  '太乙',
  '大罗',
  '准圣',
  '混元',
  '道祖',
];

export const STAGE_PEAK: readonly string[] = [
  '丹田气机凝实如珠，一层无形的壁障应声而破',
  '周身灵力骤然凝液，道基就此铸成',
  '丹田灵力疯狂旋涌，一粒金丹破关而出',
  '金丹寸寸碎裂，一道元婴自其中睁开了双眼',
  '神识如潮漫过千里山河，元神的轮廓渐渐清晰',
  '元神出窍而立，举目四望，天地骤然宽广',
  '周身虚实交错，你终于窥见了天地间那缕若有若无的道',
  '元神与肉身彻底交融，一身气息再无半分破绽',
  '气机凝实如渊似海，一步踏出便可碎裂山河',
  '',
  '周身仙元如潮，凡躯早已褪尽，只余一道道韵',
  '仙骨生辉，举手投足间已是天人之姿',
  '一身仙力与天地共鸣，云海翻涌皆随你一念',
  '玄之又玄，众妙之门已在你眼前半开',
  '一缕金光自眉心升起，照破万法',
  '太乙道果将成，周身法则如星辰环绕',
  '举手投足皆合大道，一念可演万千世界',
  '半步踏入混元，天地已在你脚下',
  '混元道体将成，只差最后一线',
  '',
];

export const STAGE_ENTER: readonly string[] = [
  '气感初生，自此踏入仙途',
  '灵液还丹，可称一方修士',
  '金丹既成，寿元与手段皆非昔比',
  '元婴坐镇丹田，一念可通千里',
  '元神凝形，举手投足皆带天地之力',
  '元神离体，天地在你眼中再不同',
  '虚实之间，你已触及大道的边角',
  '神形合一，世间少有敌手',
  '大乘气机，一步便是山河',
  '劫云在望，行至凡界尽头',
  '仙元入体，你已是仙域中人',
  '仙骨加身，寿与天齐的起点',
  '仙力共鸣，云海为你的心念所动',
  '玄门半开，众妙自此可窥',
  '金光破妄，万法在你不值一哂',
  '太乙道果将熟，星辰绕身而行',
  '大罗气度，一念可演世界生灭',
  '半步混元，天地在脚下铺展',
  '混元将成，只余一线之隔',
  '道祖圆满，超脱在望',
];

// 外推表 3：仙界档位战力。锚点：wiki「11-20 档递进，20 档 1000 亿-3000 亿」。
// 字面「每档 ×10」会得到 10^15 量级，与端点 3×10^11 不符；以端点为真做几何递进：
// hi(20)/hi(10) = 10^5 → 每档 ×10^0.5 ≈ 3.1623，lo 恒为 hi/3。
function buildEnemyCombat(): readonly (readonly [number, number])[] {
  const tiers: [number, number][] = [
    [0, 0],
    [30, 100],
    [100, 300],
    [300, 1000],
    [1000, 3000],
    [3000, 10000],
    [10000, 30000],
    [30000, 100000],
    [100000, 300000],
    [300000, 1000000],
    [1000000, 3000000],
  ];
  for (let i = 0; i < 10; i++) {
    const prevHi = (tiers[tiers.length - 1] as [number, number])[1];
    const hi = Math.round(prevHi * Math.pow(10, 0.5));
    tiers.push([Math.round(hi / 3), hi]);
  }
  return tiers;
}

export const ENEMY_COMBAT: readonly (readonly [number, number])[] = buildEnemyCombat();

export const ENEMY_TIER_NAMES: readonly string[] = [
  '',
  '练气级',
  '筑基级',
  '金丹级',
  '结婴级',
  '化神级',
  '出窍级',
  '反虚级',
  '合体级',
  '大乘级',
  '渡劫级',
  '仙人级',
  '真仙级',
  '天仙级',
  '玄仙级',
  '金仙级',
  '太乙级',
  '大罗级',
  '准圣级',
  '混元级',
  '道祖级',
];

export const TRIB_REQ: readonly number[] = [
  2_500_000,
  2_600_000,
  2_700_000,
  2_850_000,
  3_000_000,
  3_250_000,
  3_500_000,
  3_850_000,
  4_250_000,
];

export const TRIB_MULT: readonly number[] = [1.01, 1.02, 1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.1];

export const TRIB_BONUS = 10_000_000;

export const TRIB_REQ2: readonly number[] = [
  61_200_000_000,
  64_600_000_000,
  68_000_000_000,
  71_400_000_000,
  74_800_000_000,
  78_200_000_000,
  81_600_000_000,
  85_000_000_000,
  88_400_000_000,
];

export const TRIB_MULT2: readonly number[] = [1.03, 1.05, 1.07, 1.09, 1.12, 1.15, 1.18, 1.22, 1.3];

export const TRIB_BONUS2 = 5_000_000_000;

export const IMM_GATE_REQ: readonly number[] = [
  269_000_000,
  386_000_000,
  557_000_000,
  794_000_000,
  1_110_000_000,
  1_540_000_000,
  2_160_000_000,
  3_050_000_000,
  6_040_000_000,
];

export const IMM_GATE_PASS: readonly number[] = [0.95, 0.9, 0.86, 0.82, 0.78, 0.74, 0.7, 0.66, 0.62];

export const IMM_GATE_PASS_MIN = 0.05;
export const IMM_GATE_PASS_MAX = 0.97;
export const IMM_GATE_RATIO_LO = 0.3;
export const IMM_GATE_RATIO_HI = 3;
export const IMM_GATE_RATIO_EXP = 0.6;
export const IMM_GATE_CULT_MULT = 1.12;

export const IMM_PERIL_BASE = 0.004;
export const IMM_PERIL_SLOPE = 0.00008;
export const IMM_PERIL_MAX = 0.06;
export const IMM_PERIL_LOSS_LO = 0.03;
export const IMM_PERIL_LOSS_HI = 0.08;

export const BATTLE_WIN_CULT_PCT = 0.15;
export const BATTLE_LOSE_SIM_MAX = 1;
export const IMM_BATTLE_LOSS_LO = 0.005;
export const IMM_BATTLE_LOSS_HI = 0.02;
export const ESCAPE_LOSE_SIM_SCALE = 0.2;
export const IMM_ESCAPE_LOSS_LO = 0.003;
export const IMM_ESCAPE_LOSS_HI = 0.012;

export const TRIB_LUCKY_DIV = LUCK_TRIB_DIV;

export const FATE_DRAW_SCALE = 2;

export const FATE_COLOR_WEIGHT: Record<string, number> = {
  green: 40,
  blue: 30,
  purple: 20,
  gold: 10,
};

export const FATE_COLOR_RANGE: Record<string, readonly [number, number]> = {
  green: [0.05, 0.1],
  blue: [0.1, 0.3],
  purple: [0.4, 0.6],
  gold: [0.6, 1.0],
};

export const FATE_COLOR_NAMES: Record<string, string> = {
  green: '绿',
  blue: '蓝',
  purple: '紫',
  gold: '金',
};

export const FATE_ATTR_FULL: Record<string, number> = {
  root: 10,
  luck: 10,
  xianqi: 50,
  artifact: 30,
  brk: 20,
  trib: 10,
};

export const FATE_ATTR_NAMES: Record<string, string> = {
  root: '灵根',
  luck: '气运',
  xianqi: '仙灵气概率',
  artifact: '法宝加成',
  brk: '突破概率',
  trib: '天劫要求',
};

export const PITY_POINTS: readonly number[] = [0, 5, 4, 3, 2, 1];

// ── Phase 3：六乘区（数值预算表见 doc/product/04-arts-build.md） ──
export const ZONE_CAPS: Readonly<Record<'z1' | 'z2' | 'z3' | 'z4' | 'z5' | 'z6', number>> = {
  z1: 3.0,
  z2: 2.2,
  z3: 3.5,
  z4: 2.5,
  z5: 2.0,
  z6: 1.8,
};
export const SOFT_CAP_KNEE = 25;
export const SOFT_CAP_SLOPE = 0.5;
/** 软封顶后乘积的硬上限（验收 3.3：满乘区 ≤ 40） */
export const POWER_PRODUCT_MAX = 40;
/** Z3 = 1 + Z3_LOG_COEF × log10(1 + 法宝之力)，系数按预算表标定 */
export const Z3_LOG_COEF = 0.25;
/** 炼宝诀：法宝之力按 1.5 倍计入 Z3 */
export const Z3_TREASURE_MULT = 1.5;
export const TREASURE_RATIO = 0.5;
/** Z2 天赋灵根：tier ≥ 6 起每档 +1% */
export const Z2_TIER_BASE = 6;
export const Z2_TIER_STEP = 0.01;
export const Z6_LUCK_DIV = 2000;
export const Z6_FATE_COEF = 0.02;
export const Z5_TOX_DIV = 250;
export const Z5_TOX_PENALTY_MAX = 0.4;
export const Z5_POISON_BODY_DIV = 100;
export const POISON_BODY_TOX_MIN = 50;

// ── Phase 3：功法与悟性经济 ──
export const ART_LEVEL_MAX = 10;
/** 入道起手功法的起始等级（开局三选一） */
export const STARTER_ART_LEVEL = 2;
export const ART_INSIGHT_BASE = 3;
export const ART_INSIGHT_GROWTH = 1.35;
export const ART_SLOTS_TOTAL = 6;
export const ART_SLOTS_INITIAL = 3;
/** 悟道室（洞府，Phase 6）解锁槽 4 / 槽 5-6；Phase 3 由道台事件补槽 4 */
export const ART_SLOTS_CAVE_L2 = 4;
export const ART_SLOTS_CAVE_L4 = 5;
export const CAVE_ROOM_STUDY = '悟道室';
export const DAO_SEAT_SLOT = 4;

// ── Phase 3：流派共鸣（区后乘子） ──
export const RESONANCE_MONO6 = 1.6;
export const RESONANCE_MONO4 = 1.35;
export const RESONANCE_MONO2 = 1.15;
export const RESONANCE_THREE2 = 1.4;
export const RESONANCE_TWO3 = 1.45;
export const SYNERGY_SCHOOLS = 4;
export const MIXED_SCHOOLS_EACH = 3;

// ── Phase 3：协同 ──
export const SWORD_HEART_LUCK = 80;
export const SWORD_HEART_BASE = 0.25;
export const SWORD_HEART_PER_LUCK = 0.0025;
/** 机缘区间收窄硬上限 50%（G3 红线，任何协同不得突破） */
export const SWORD_HEART_NARROW_MAX = 0.5;
export const TOXICITY_DECAY_MULT = 2;
export const TOXICITY_GAIN_MULT = 0.5;
export const THUNDER_LUCKY_MULT = 1.5;
export const THUNDER_FAIL_LOSS = 0.01;
export const PLUNDER_SIM_PER_YEAR = 0.5;

export const PLAYER_LEVEL_EXP_STEP = 50;
export const SETTLE_EXP_NORMAL = 0.5;
export const SETTLE_EXP_VOLUNTARY = 0.1;

// ── Phase 4：炼丹（控火小游戏） ──
/** 添柴：升温与燃料代价 */
export const ALCHEMY_HEAT_GAIN = 2;
export const ALCHEMY_HEAT_COST = 2;
/** 撤火：降温 */
export const ALCHEMY_COOL_LOSS = 3;
/** 扇风：下一步额外升温，但抬噪声 */
export const ALCHEMY_FAN_GAIN = 7;
export const ALCHEMY_FAN_NOISE = 0.06;
/** 稳火：向目标微调（收拢比例）并降噪声，但耗稳定度 */
export const ALCHEMY_CALM_PULL = 0.3;
export const ALCHEMY_CALM_NOISE = 0.05;
export const ALCHEMY_CALM_STABILITY = 3;
/** 每步被动漂移：temp += (target − temp) × DRIFT + gauss(0, noise) × NOISE_SCALE */
export const ALCHEMY_DRIFT = 0.08;
export const ALCHEMY_NOISE_SCALE = 14;
/** 曲线摆幅（rise/fall 全幅 = 2×SWING；pulse 幅值 = SWING） */
export const ALCHEMY_CURVE_SWING = 5;
/** 初始燃料 = ceil(steps × FUEL_PER_STEP)；初始稳定度 = steps × STABILITY_PER_STEP */
export const ALCHEMY_FUEL_PER_STEP = 1;
export const ALCHEMY_STABILITY_PER_STEP = 1;
/** 精通：每丹方独立 0-5，每炼一炉 +1 */
export const ALCHEMY_MASTERY_MAX = 5;
export const ALCHEMY_MASTERY_BONUS_PER = 0.1;
export const ALCHEMY_MASTERY_BONUS_CAP = 0.4;
/** 自动控火解锁门槛（精通） */
export const ALCHEMY_AUTO_MASTERY = 3;
/** 批量炼制：一次消耗份数 */
export const ALCHEMY_BATCH_COUNT = 5;
/** 流派加成：丹修任意 +0.3；万法归一 +0.2（可叠） */
export const ALCHEMY_SCHOOL_BONUS = 0.3;
export const ALCHEMY_MIXED_BONUS = 0.2;
/** 仙品门槛：qualityScore ≥ 此值且未炸炉才可到 6 档 */
export const ALCHEMY_XIAN_SCORE = 0.9;

/** 品质倍率与名称（下标 = 品质 1-6） */
export const QUALITY_MULTS: readonly number[] = [0, 0.5, 0.75, 1.0, 1.3, 1.7, 2.2];
export const QUALITY_NAMES: readonly string[] = ['', '凡品', '下品', '中品', '上品', '极品', '仙品'];

// ── Phase 4：丹毒与丹药 ──
/** 每颗丹毒 = tier × (7 − quality) × 此系数（再乘丹火不侵 0.5） */
export const PILL_TOX_RATE = 0.6;
/** 药力封顶：投入药材平均药力每 16 点支撑 1 档品质（cap = 1 + round(avg/16)） */
export const PILL_POTENCY_PER_GRADE = 16;
/** 药市：每株药材的悟性价格 = ceil(阶位 × 此系数 / 2)（悟性是 Phase 3 起的主稀缺资源，用它定价不扭曲寿元算术） */
export const HERB_MARKET_INSIGHT_PER_TIER = 1;
/** 药市每年限购株数（防止后期悟性充裕时无限囤药，也防无头策略把悟性全换成药材） */
export const HERB_MARKET_YEARLY_STOCK = 8;
/** 药力持续年数（丹药按境界档发放，8 年保证低供给下 Z5 不断档） */
export const PILL_BUFF_YEARS = 8;
/** 常规丹药冷却年数 */
export const PILL_COOLDOWN_YEARS = 3;
/** 破境丹：本年突破概率倍率 */
export const PILL_BREAK_MULT = 1.25;
/** 护劫丹：渡劫要求倍率（−12%） */
export const PILL_GUARD_MULT = 0.88;
/** 疗毒丹：中品解毒量 */
export const PILL_CURE_TOX = 30;
/** 阴阳互济（Phase 3 共鸣）：丹毒衰减 ×1.5 */
export const TOXICITY_TWO3_DECAY_MULT = 1.5;

// ── Phase 5：宗门 ──
export const SECT_RANK_NAMES: readonly string[] = ['外门弟子', '内门弟子', '真传弟子', '长老', '宗主'];
/** 晋升到该 rank 所需贡献（下标 = rank）。
    门槛经 Phase 5 实测上调：原表 [0,100,300,700,1500] 在"每年接一个任务"的节奏下
    约第 45 年就到宗主，导致四分之三的局吃满 rank 4 俸禄，5.1 直接 3.09×。 */
export const SECT_PROMOTE: readonly number[] = [0, 120, 360, 900, 1800];
/** 每年俸禄：悟性 / 药材株数 / 丹药颗数。
    同样按 5.1 实测下调（原表 [1,2,3,5,8] / [0,2,4,6,10] / [0,0,0,1,2]）——
    俸禄给的是**资源**，但资源会经"战力→战斗胜率→灵根/模拟点→突破表行"折成等级。 */
export const SECT_STIPEND_INSIGHT: readonly number[] = [1, 1, 2, 3, 4];
export const SECT_STIPEND_HERB: readonly number[] = [0, 2, 3, 4, 6];
export const SECT_STIPEND_PILL: readonly number[] = [0, 0, 0, 0, 1];
export const SECT_TENSION_MAX = 100;
/** 张力每年自然缓和 */
export const SECT_TENSION_DECAY = 1;
/** 张力达到此值触发对方宗门的叛宗邀请 */
export const SECT_DEFECT_TENSION = 80;
/** 叛宗后新宗门按旧贡献的这个比例起算 */
export const SECT_DEFECT_KEEP = 0.3;
/** 拒绝叛宗邀请的张力回落 */
export const SECT_REFUSE_TENSION = 30;
/** 同门羁绊：每级贡献获取 +10% */
export const SECT_CONTRIB_BOND_PER = 0.1;
/** 真传弟子（rank ≥ 2）起宗门功法进入任务奖励池 */
export const SECT_ART_RANK = 2;
/** 宗门 perk 的丹毒上限加成（万毒窟） */
export const SECT_TOX_MAX_BONUS = 20;

// ── Phase 5：宗门大比 ──
export const TOURNAMENT_EVERY = 20;
export const TOURNAMENT_POOL_BASE = 40;
export const TOURNAMENT_POOL_PER_RANK = 20;
export const TOURNAMENT_REWARD_FIRST = 200;
export const TOURNAMENT_REWARD_TEN = 80;
export const TOURNAMENT_REWARD_FIFTY = 30;
export const TOURNAMENT_INSIGHT_TEN = 10;

// ── Phase 5：羁绊 ──
export const BOND_LEVEL_MAX = 5;
/** 羁绊等级门槛（下标 = 等级） */
export const BOND_AFFINITY_REQ: readonly number[] = [0, 20, 40, 60, 80, 100];
/**
 * 背叛条件：好感低于此值即计入 bondStrain。
 * **必须低于新结识时的初始好感**（`BOND_AFFINITY_REQ[1] = 20`），否则每段新关系一出生就算"已生嫌隙"
 * （浏览器实测发现的瑕疵）。14 意味着"关系被真的搞坏了"：一次带人逃跑（−10）就足以越线。
 */
export const BOND_STRAIN_AFFINITY = 14;
/** 长期未互动的年数阈值（背叛事件的 minNeglect） */
export const BOND_NEGLECT_ALERT = 20;
/** 助战：每级羁绊 3%，道侣额外 5%，总和硬上限 30%（G5 红线） */
export const BOND_AID_PER_LEVEL = 0.03;
export const BOND_AID_PARTNER_EXTRA = 0.05;
export const BOND_AID_CAP = 0.3;
/** 道侣双修：静修年修为增益率 += L × 此值（实测基线率 0.0005~0.001，见 v0.1.0-06 §三·3.2） */
export const BOND_PARTNER_CULT_PER = 0.0005;
/** 师徒：每年悟性 +L */
export const BOND_TEACHER_INSIGHT_PER = 1;
/** 挚友：Z6 += L × 此值 */
export const BOND_FRIEND_Z6_PER = 0.02;
/** 宿敌论剑：每年触发概率 / 胜方修为增益 / 败方修为损失 / 败方好感损失 */
export const BOND_RIVAL_CHANCE = 0.35;
export const BOND_RIVAL_WIN_CULT = 0.04;
export const BOND_RIVAL_LOSE_CULT = 0.02;
export const BOND_RIVAL_LOSE_AFFINITY = 3;
/** 带人代价：胜 +2 / 败 −5 并伤停 3 年 / 逃跑 −10 */
export const BOND_WIN_AFFINITY = 2;
export const BOND_LOSE_AFFINITY = 5;
export const BOND_FLEE_AFFINITY = 10;
export const BOND_INJURY_YEARS = 3;
/** NPC 名单上限（防事件反复创建导致状态膨胀） */
export const NPC_MAX = 12;
/** 年常邂逅：每年结识新人的概率（羁绊事件池被内容稀释后，光靠事件凑不满 3-5 段） */
export const BOND_MEET_RATE = 0.06;
/** 年常邂逅的人数目标：达到即不再自动结识（留给事件去深化关系） */
export const BOND_MEET_TARGET = 3;
/** 年常邂逅的关系类型权重（道侣/师徒只能由事件确立，不在此列） */
export const BOND_MEET_TYPES: readonly string[] = ['挚友', '同门', '宿敌'];

// ── Phase 5：NPC 生成与成长 ──
export const NPC_ROOT_TIER_MIN = 3;
export const NPC_ROOT_TIER_MAX = 10;
/** 成长比：rootTier 线性映射到 [MIN, MAX] —— NPC 约为玩家的 60%-90% */
export const NPC_GROWTH_MIN = 0.6;
export const NPC_GROWTH_MAX = 0.9;
/** 前世道侣重逢的年龄上限 */
export const PAST_LOVER_MAX_AGE = 30;
export const PAST_LOVER_MIN_LIFE = 2;
/** 前世道侣重逢事件 id（由 createRun 注入 scheduled） */
export const PAST_LOVER_EVENT = 'ev_bond_past_lover';
/** 叛宗邀请事件 id（张力 ≥ 阈值时由 tick 注入 scheduled） */
export const DEFECT_EVENT = 'ev_sect_defect_invite';
/** 叛宗邀请的冷却（年）——拒绝之后不会年年来敲门 */
export const DEFECT_INVITE_COOLDOWN = 15;



// ── Phase 6：洞府六室（数值见 doc/product/08-legacy-cave.md §二） ──
export const CAVE_LEVEL_MAX = 5;
/** 升级成本 = base × CAVE_COST_GROWTH^level，四舍五入到整数 */
export const CAVE_COST_GROWTH = 1.6;
/** 药园：每年产「等级」株药材 */
export const CAVE_HERB_SURVEY: readonly string[] = [
  'herb_common',
  'herb_yunwu',
  'herb_qingxin',
  'herb_hanlu',
  'herb_chiteng',
  'herb_yinqi',
];
/** 丹房：炼丹品质 +等级 × 此值 */
export const CAVE_ALCHEMY_QUALITY_PER = 0.15;
/** 藏经阁：功法升级悟性 −等级 × 此值 */
export const CAVE_SCRIPT_DISCOUNT_PER = 0.05;
/** 悟道室：每年悟性 +等级 × 此值 */
export const CAVE_STUDY_INSIGHT_PER = 0.5;
/** 聚灵阵：Z1 +等级 × 此值（Z1 硬上限 ×3.0，验收 6.2） */
export const CAVE_Z1_ARRAY_PER = 0.04;
/** 静室：Z1 +等级 × 此值 */
export const CAVE_Z1_MEDITATION_PER = 0.05;
/**
 * 静室：额外模拟点消耗 −等级 × 此值。
 * **只作用于魔修协同的额外消耗，不碰基础寿元**（`simPoints` 即寿元）——见 v0.1.0-07 §三·2。
 */
export const CAVE_PLUNDER_RELIEF_PER = 0.005;

// ── Phase 6：传承点（doc/product/08-legacy-cave.md §一） ──
/** 境界分 = floor(历史最高等级 / 此值) */
export const LEGACY_LEVEL_DIV = 5;
/** 飞升分：飞升 / 证道各一次记此分 */
export const LEGACY_ASCEND_PER = 50;
/** 图鉴分 = floor(图鉴收集总数 / 此值) */
export const LEGACY_CODEX_DIV = 20;
/** 宗门分 = Σ(各宗门历史最高职位 × 此值) */
export const LEGACY_SECT_RANK_PER = 15;
/** 成就分 = 成就数 × 此值 */
export const LEGACY_ACHIEVEMENT_PER = 2;
/** 羁绊分 = 道侣羁绊等级 × 此值 + 历史羁绊总数 × 此值 */
export const LEGACY_PARTNER_LEVEL_PER = 10;
export const LEGACY_PAST_PARTNER_PER = 2;
/** 叛宗系数 */
export const LEGACY_DEFECTION_MULT = 1.15;
/** 高光最多保留的局数（存档体积护栏，验收 6.9） */
export const PAST_LIVES_LIMIT = 20;
/** 前世道侣最多保留的人数 */
export const PAST_PARTNERS_LIMIT = 10;
/** 成就给气运抽取的加成合计上限（百分点）——成就不得无限抬高开局气运档位 */
export const ACHIEVEMENT_BONUS_CAP = 12;
