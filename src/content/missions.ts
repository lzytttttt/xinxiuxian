import { defineMission } from '../engine/registry';
import type { MissionDef } from '../engine/types/effects';

/* 30 个宗门任务，5 类（采集 8 / 讨伐 9 / 交涉 6 / 秘境 4 / 秘辛 3）。
   任务由玩家在宗门屏主动接取（界面而非打断），贡献与张力由 `sect.missionAsEvent` 统一附加 ——
   所以下面每个 outcome 只写叙事与额外收益，不写 `gainContribution`。
   阶位带：凡界早 1-60 / 凡界中 20-100 / 凡界晚 50-200 / 仙界 100-200。 */

export const MISSIONS: MissionDef[] = [
  // ── 采集 / 护送 8 ──
  defineMission({
    id: 'mis_herb_pick',
    sect: '*',
    title: '采药',
    body: '山门外三十里有片药坡，近日雾重，怕生了精怪。',
    minRank: 0,
    levelMin: 1,
    levelMax: 60,
    cooldownYears: 8,
    kind: 'gather',
    contribution: 15,
    choices: [
      {
        id: 'careful',
        label: '一株一株地挑',
        outcomes: [
          { text: '你挑了半日，只取了品相最好的几株。', effects: [{ op: 'grantHerb', id: 'herb_common', count: 4 }] },
        ],
      },
      {
        id: 'sweep',
        label: '连根拔了一片',
        outcomes: [
          {
            text: '收获得多，却踩坏了幼苗 —— 青囊谷那边怕是要说话。',
            effects: [
              { op: 'grantHerb', id: 'herb_common', count: 8 },
              { op: 'addTension', sect: 'sect_qingnang', value: 3 },
            ],
          },
        ],
      },
    ],
  }),
  defineMission({
    id: 'mis_escort_convoy',
    sect: '*',
    title: '护送商队',
    body: '一支押着灵材的商队要过乱石岭，宗门抽不出人手。',
    minRank: 0,
    levelMin: 1,
    levelMax: 50,
    cooldownYears: 10,
    kind: 'gather',
    contribution: 20,
    choices: [
      {
        id: 'front',
        label: '走在最前面',
        outcomes: [{ text: '一路无事。头领塞给你一包碎灵石。', effects: [{ op: 'add', target: { k: 'simPoints' }, value: 2 }] }],
      },
      {
        id: 'rear',
        label: '押后，留神尾随者',
        outcomes: [{ text: '果然有人尾随，你远远喝止，对方退了。', effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_firewood',
    sect: '*',
    title: '砍柴烧炭',
    body: '丹房要炭，量还不小。这活没人愿意接，因为烟熏得眼睛疼。',
    minRank: 0,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 8,
    kind: 'gather',
    contribution: 15,
    choices: [
      {
        id: 'alone',
        label: '独自进山',
        outcomes: [{ text: '你砍了三天，手都磨起泡了。', effects: [{ op: 'add', target: { k: 'root' }, value: 1 }] }],
      },
      {
        id: 'hunt',
        label: '顺路打只猎物',
        outcomes: [{ text: '柴砍够了，还猎了头獐子。丹房长老难得点了头。', effects: [{ op: 'add', target: { k: 'simPoints' }, value: 3 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_herb_rare',
    sect: 'sect_qingnang',
    title: '寻一味冷药',
    body: '谷中缺一味「寒潭幽兰」，只长在阴湿的石缝里。',
    minRank: 1,
    levelMin: 20,
    levelMax: 90,
    cooldownYears: 12,
    kind: 'gather',
    contribution: 30,
    choices: [
      {
        id: 'cliff',
        label: '下崖去找',
        outcomes: [{ text: '你在崖壁的裂缝里找到了它。', effects: [{ op: 'grantHerb', id: 'herb_hanlu', count: 3 }] }],
      },
      {
        id: 'market',
        label: '去坊市高价收',
        outcomes: [
          {
            text: '你花了大价钱，但省了功夫。',
            effects: [
              { op: 'grantHerb', id: 'herb_hanlu', count: 2 },
              { op: 'sub', target: { k: 'insight' }, value: 6 },
            ],
          },
        ],
      },
    ],
  }),
  defineMission({
    id: 'mis_stone_carry',
    sect: 'sect_xuanyue',
    title: '背石上山',
    body: '门中新起一座练功台，石料要人扛上去。',
    minRank: 0,
    levelMin: 1,
    levelMax: 60,
    cooldownYears: 8,
    kind: 'gather',
    contribution: 15,
    choices: [
      {
        id: 'bear',
        label: '一趟背两块',
        outcomes: [{ text: '肩背压出了血痕，力气却长了。', effects: [{ op: 'add', target: { k: 'root' }, value: 1 }] }],
      },
      {
        id: 'slow',
        label: '一趟背一块，稳当些',
        outcomes: [{ text: '你走了整整十日，没伤着筋骨。', effects: [{ op: 'add', target: { k: 'simPoints' }, value: 1 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_poison_pick',
    sect: 'sect_wandu',
    title: '采毒',
    body: '窟里要用活毒，死毒不成。采的人得自己先扛得住。',
    minRank: 0,
    levelMin: 1,
    levelMax: 70,
    cooldownYears: 8,
    kind: 'gather',
    contribution: 18,
    choices: [
      {
        id: 'bare',
        label: '徒手取毒',
        outcomes: [
          {
            text: '你手上起了紫斑，但毒囊完好。',
            effects: [
              { op: 'addToxicity', value: 8 },
              { op: 'grantHerb', id: 'herb_chiteng', count: 4 },
            ],
          },
        ],
      },
      {
        id: 'wrap',
        label: '裹着厚厚的皮子',
        outcomes: [{ text: '稳妥，只是毒囊碎了两枚。', effects: [{ op: 'grantHerb', id: 'herb_chiteng', count: 2 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_spirit_convoy',
    sect: '*',
    title: '押送灵石',
    body: '宗门要往邻镇送一批灵石，走的是最太平的那条路 —— 也正因为太平，才对。',
    minRank: 1,
    levelMin: 20,
    levelMax: 100,
    cooldownYears: 12,
    kind: 'gather',
    contribution: 28,
    choices: [
      {
        id: 'day',
        label: '白日行路',
        outcomes: [{ text: '一路顺遂，你按时交了差。', effects: [{ op: 'add', target: { k: 'simPoints' }, value: 2 }] }],
      },
      {
        id: 'night',
        label: '夜里赶路，避开耳目',
        outcomes: [
          {
            text: '你绕开了两拨探查的眼睛。',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineMission({
    id: 'mis_snow_lotus',
    sect: 'sect_tianyin',
    title: '取雪莲',
    body: '山巅的雪莲要开花了，寺中要用来配一味心药。',
    minRank: 1,
    levelMin: 20,
    levelMax: 90,
    cooldownYears: 12,
    kind: 'gather',
    contribution: 30,
    choices: [
      {
        id: 'fast',
        label: '抢在风雪前上山',
        outcomes: [
          {
            text: '你赶在封山前采到了花，代价是冻伤了两根手指。',
            effects: [
              { op: 'grantHerb', id: 'herb_hanlu', count: 4 },
              { op: 'sub', target: { k: 'simPoints' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: '等雪停了再上',
        outcomes: [{ text: '花已谢了半边，你只取回残瓣。', effects: [{ op: 'grantHerb', id: 'herb_hanlu', count: 2 }] }],
      },
    ],
  }),

  // ── 讨伐 / 镇守 9 ──
  defineMission({
    id: 'mis_bandit',
    sect: '*',
    title: '清剿山贼',
    body: '一伙散修聚在道上劫掠，宗门的脸面挂不住。',
    minRank: 0,
    levelMin: 1,
    levelMax: 60,
    cooldownYears: 10,
    kind: 'subdue',
    contribution: 25,
    tensionTo: { sect: 'sect_youming', delta: 5 },
    choices: [
      {
        id: 'strike',
        label: '直捣山寨',
        outcomes: [{ text: '你一个人挑了他们七个，山贼四散。', effects: [{ op: 'gainInsight', value: 4 }] }],
      },
      {
        id: 'offer',
        label: '先劝降',
        outcomes: [{ text: '有几个愿意洗手不干，剩下的还是得动手。', effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_border_patrol',
    sect: '*',
    title: '镇守边界',
    body: '边境的妖物近来躁动，宗门要人去看一眼。',
    minRank: 0,
    levelMin: 10,
    levelMax: 70,
    cooldownYears: 10,
    kind: 'subdue',
    contribution: 28,
    tensionTo: { sect: 'sect_wandu', delta: 5 },
    choices: [
      {
        id: 'kill',
        label: '见了就杀',
        outcomes: [{ text: '你杀了几头，剩下的远远避开了。', effects: [{ op: 'gainInsight', value: 4 }] }],
      },
      {
        id: 'lure',
        label: '设伏诱杀',
        outcomes: [{ text: '你布了三日的阵，一网打尽。', effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_purge_demon',
    sect: 'sect_taixu',
    title: '斩魔',
    body: '西岭出了个以人魂炼剑的魔修，剑宗容不得这种事。',
    minRank: 1,
    levelMin: 30,
    levelMax: 100,
    cooldownYears: 12,
    kind: 'subdue',
    contribution: 40,
    tensionTo: { sect: 'sect_youming', delta: 8 },
    choices: [
      {
        id: 'duel',
        label: '约他正面一战',
        outcomes: [{ text: '三十招之后，他的剑断了。', effects: [{ op: 'gainInsight', value: 8 }] }],
      },
      {
        id: 'ambush',
        label: '趁其闭关破门而入',
        outcomes: [
          {
            text: '你破门时他正走火，胜负来得太轻。',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 1 },
              { op: 'gainInsight', value: 4 },
            ],
          },
        ],
      },
    ],
  }),
  defineMission({
    id: 'mis_guard_pass',
    sect: 'sect_xuanyue',
    title: '守关',
    body: '门中要派人守一处隘口，一守就是三年。',
    minRank: 1,
    levelMin: 20,
    levelMax: 100,
    cooldownYears: 15,
    kind: 'subdue',
    contribution: 35,
    choices: [
      {
        id: 'hold',
        label: '寸步不离',
        outcomes: [
          {
            text: '三年里你只出过三次手，身体却记住了那种耐心。',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 2 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
            ],
          },
        ],
      },
      {
        id: 'train',
        label: '一边守一边练',
        outcomes: [{ text: '你把套路拆散了重练，长进不小。', effects: [{ op: 'gainInsight', value: 6 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_thunder_pool',
    sect: 'sect_jiuxiao',
    title: '引雷入池',
    body: '雷池要换一道雷引，得有人站在阵眼里。',
    minRank: 1,
    levelMin: 30,
    levelMax: 100,
    cooldownYears: 12,
    kind: 'subdue',
    contribution: 38,
    choices: [
      {
        id: 'stand',
        label: '站进阵眼',
        outcomes: [
          {
            text: '雷落下来的时候你几乎以为自己死了。',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 2 },
              { op: 'sub', target: { k: 'simPoints' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'guide',
        label: '以剑引雷，把雷导开',
        outcomes: [{ text: '你在刹那间接住了那道雷。', effects: [{ op: 'gainInsight', value: 6 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_hunt_traitor',
    sect: '*',
    title: '追缉叛徒',
    body: '有人带着宗门的功法外逃，长老把脸面交到你手上。',
    minRank: 2,
    levelMin: 50,
    levelMax: 200,
    cooldownYears: 20,
    kind: 'subdue',
    contribution: 50,
    choices: [
      {
        id: 'catch',
        label: '生擒回来',
        outcomes: [
          {
            text: '你把他押回宗门。他一路上一句话也没说。',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 2 }],
          },
        ],
      },
      {
        id: 'kill',
        label: '就地格杀',
        outcomes: [{ text: '你取回了功法，只是少了个能问话的人。', effects: [{ op: 'gainInsight', value: 10 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_beast_tide',
    sect: '*',
    title: '抵御兽潮',
    body: '十年一度的兽潮又来了，宗门把人都派了出去。',
    minRank: 2,
    levelMin: 50,
    levelMax: 200,
    cooldownYears: 20,
    kind: 'subdue',
    contribution: 55,
    tensionTo: { sect: 'sect_wandu', delta: 8 },
    choices: [
      {
        id: 'front',
        label: '守在阵线最前',
        outcomes: [
          {
            text: '你独自挡下了一波。回营时有人说，看见你身后有雷光。',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 3 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
            ],
          },
        ],
      },
      {
        id: 'sweep',
        label: '领一队人清剿残兽',
        outcomes: [{ text: '你带人扫了三天，兽潮散了。', effects: [{ op: 'gainInsight', value: 12 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_pill_raid',
    sect: 'sect_youming',
    title: '劫丹',
    body: '对方宗门新出一炉上品丹，宗主要你连炉带方一起拿回来。',
    minRank: 1,
    levelMin: 30,
    levelMax: 150,
    cooldownYears: 15,
    kind: 'subdue',
    contribution: 45,
    tensionTo: { sect: 'sect_qingnang', delta: 10 },
    choices: [
      {
        id: 'night',
        label: '夜袭丹房',
        outcomes: [{ text: '你搬空了半座丹房，还顺手抄了几张方子。', effects: [{ op: 'grantHerb', id: 'herb_yunwu', count: 6 }] }],
      },
      {
        id: 'rob',
        label: '半路劫车',
        outcomes: [{ text: '你劫了车，但漏了押车的真传弟子。', effects: [{ op: 'grantHerb', id: 'herb_yunwu', count: 3 }] }],
      },
    ],
  }),
  // ── 交涉 / 调解 6 ──
  defineMission({
    id: 'mis_mediate_sects',
    sect: '*',
    title: '调停两宗',
    body: '两宗为一条灵脉吵了三年，宗门派你去说话。',
    minRank: 1,
    levelMin: 30,
    levelMax: 150,
    cooldownYears: 15,
    kind: 'parley',
    contribution: 35,
    tensionTo: { sect: 'sect_taixu', delta: -8 },
    choices: [
      {
        id: 'fair',
        label: '各让一步',
        outcomes: [{ text: '你画了条线，两边都不满意，但都点了头。', effects: [{ op: 'add', target: { k: 'luck' }, value: 2 }] }],
      },
      {
        id: 'favor',
        label: '暗中偏帮一方',
        outcomes: [{ text: '你替老东家争了好处，对方记下了这笔账。', effects: [{ op: 'gainInsight', value: 8 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_market_pact',
    sect: '*',
    title: '与坊市议价',
    body: '宗门要买一批灵材，坊市报的价高得不像话。',
    minRank: 0,
    levelMin: 1,
    levelMax: 80,
    cooldownYears: 10,
    kind: 'parley',
    contribution: 25,
    choices: [
      {
        id: 'haggle',
        label: '一寸一寸地磨',
        outcomes: [{ text: '磨了七天，压下了三成。', effects: [{ op: 'grantHerb', id: 'herb_qingxin', count: 4 }] }],
      },
      {
        id: 'threat',
        label: '把宗门的牌子亮出来',
        outcomes: [
          {
            text: '价是压下来了，坊市却记恨你。',
            effects: [
              { op: 'grantHerb', id: 'herb_qingxin', count: 6 },
              { op: 'addTension', sect: 'sect_youming', value: 3 },
            ],
          },
        ],
      },
    ],
  }),
  defineMission({
    id: 'mis_sermon',
    sect: 'sect_tianyin',
    title: '登门说法',
    body: '邻镇的乡绅家闹鬼，其实是心魔。寺中要人去说一场法。',
    minRank: 0,
    levelMin: 20,
    levelMax: 120,
    cooldownYears: 12,
    kind: 'parley',
    contribution: 32,
    choices: [
      {
        id: 'sermon',
        label: '讲三日经',
        outcomes: [{ text: '第三日夜里，那口井不再响了。', effects: [{ op: 'gainInsight', value: 10 }] }],
      },
      {
        id: 'exorcise',
        label: '直接动手驱邪',
        outcomes: [{ text: '快是快，乡绅却觉得你没慈悲心。', effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_spy_network',
    sect: 'sect_youming',
    title: '布线',
    body: '要在三处坊市埋下眼线。这活靠嘴，不靠剑。',
    minRank: 1,
    levelMin: 30,
    levelMax: 200,
    cooldownYears: 15,
    kind: 'parley',
    contribution: 40,
    choices: [
      {
        id: 'money',
        label: '用钱买',
        outcomes: [{ text: '钱花出去了，线也埋下去了。', effects: [{ op: 'sub', target: { k: 'insight' }, value: 12 }] }],
      },
      {
        id: 'debt',
        label: '用人情换',
        outcomes: [{ text: '你替人办了三件事，收回了三条线。', effects: [{ op: 'add', target: { k: 'luck' }, value: 3 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_herb_treaty',
    sect: 'sect_qingnang',
    title: '订立药契',
    body: '几个散修药农愿意长期供药，但要谷中先给个保证。',
    minRank: 1,
    levelMin: 20,
    levelMax: 150,
    cooldownYears: 15,
    kind: 'parley',
    contribution: 35,
    tensionTo: { sect: 'sect_wandu', delta: -5 },
    choices: [
      {
        id: 'guarantee',
        label: '以谷中声誉作保',
        outcomes: [{ text: '药农信了。契书按了七枚手印。', effects: [{ op: 'grantHerb', id: 'herb_yunwu', count: 5 }] }],
      },
      {
        id: 'advance',
        label: '先付一笔定钱',
        outcomes: [
          {
            text: '定钱付了，供药的年限也长了。',
            effects: [
              { op: 'grantHerb', id: 'herb_yunwu', count: 8 },
              { op: 'sub', target: { k: 'insight' }, value: 8 },
            ],
          },
        ],
      },
    ],
  }),
  defineMission({
    id: 'mis_demonic_pact',
    sect: 'sect_wandu',
    title: '与妖修谈生意',
    body: '窟里要一味只有妖族才有的毒材，得和他们打交道。',
    minRank: 1,
    levelMin: 30,
    levelMax: 200,
    cooldownYears: 15,
    kind: 'parley',
    contribution: 38,
    choices: [
      {
        id: 'deal',
        label: '照规矩交易',
        outcomes: [{ text: '对方很守约。这让你有点意外。', effects: [{ op: 'grantHerb', id: 'herb_chiteng', count: 6 }] }],
      },
      {
        id: 'cheat',
        label: '在毒里做点手脚',
        outcomes: [
          {
            text: '你白得了毒材，但那妖修从此不与万毒窟往来。',
            effects: [
              { op: 'grantHerb', id: 'herb_chiteng', count: 10 },
              { op: 'add', target: { k: 'luck' }, value: -2 },
            ],
          },
        ],
      },
    ],
  }),

  // ── 秘境探索 4 ──
  defineMission({
    id: 'mis_ruin_probe',
    sect: '*',
    title: '探古废墟',
    body: '有人说荒山里塌出一座旧洞府。门开着，人没回来过。',
    minRank: 1,
    levelMin: 20,
    levelMax: 100,
    cooldownYears: 20,
    kind: 'relic',
    contribution: 45,
    choices: [
      {
        id: 'deep',
        label: '一路走到最深处',
        outcomes: [
          {
            text: '你在最里面找到半卷功法，还有一具坐化的遗骸。',
            effects: [{ op: 'gainInsight', value: 18 }],
          },
        ],
      },
      {
        id: 'edge',
        label: '只在外围搜一遍',
        outcomes: [{ text: '你捡了些零碎，转身就走。', effects: [{ op: 'add', target: { k: 'simPoints' }, value: 2 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_secret_realm',
    sect: '*',
    title: '入小秘境',
    body: '秘境三十年一开，宗门分到三个名额。',
    minRank: 2,
    levelMin: 50,
    levelMax: 200,
    cooldownYears: 20,
    kind: 'relic',
    contribution: 50,
    choices: [
      {
        id: 'greedy',
        label: '抢在关门前多取一件',
        outcomes: [
          {
            text: '你多取了一件东西，也差点没出来。',
            effects: [
              { op: 'add', target: { k: 'artifactPower' }, value: 0 },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
            ],
          },
        ],
      },
      {
        id: 'safe',
        label: '见好就收',
        outcomes: [{ text: '你按时出来了，带着稳当的那一份。', effects: [{ op: 'gainInsight', value: 12 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_sword_tomb',
    sect: 'sect_taixu',
    title: '入剑冢',
    body: '剑冢里插着三千把断剑，宗主要你去取回其中一把。',
    minRank: 1,
    levelMin: 40,
    levelMax: 200,
    cooldownYears: 20,
    kind: 'relic',
    contribution: 48,
    choices: [
      {
        id: 'pull',
        label: '拔那把刻着名字的',
        outcomes: [{ text: '剑断了，但剑意留在了你手里。', effects: [{ op: 'gainInsight', value: 14 }] }],
      },
      {
        id: 'listen',
        label: '在冢中静坐一夜',
        outcomes: [{ text: '你听见了很多剑的叹息。', effects: [{ op: 'gainInsight', value: 20 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_ancient_array',
    sect: 'sect_taiyi',
    title: '解古阵',
    body: '前人留下的一座残阵，三百年没人解出来。',
    minRank: 2,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 20,
    kind: 'relic',
    contribution: 55,
    choices: [
      {
        id: 'brute',
        label: '以力破阵',
        outcomes: [{ text: '阵破了，阵法本身也毁了。', effects: [{ op: 'gainInsight', value: 8 }] }],
      },
      {
        id: 'study',
        label: '坐下来慢慢推',
        outcomes: [
          {
            text: '你推了两年，终于看懂了那一笔收势。',
            effects: [
              { op: 'gainInsight', value: 30 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
            ],
          },
        ],
      },
    ],
  }),

  // ── 宗门秘辛 3 ──
  defineMission({
    id: 'mis_archive_dust',
    sect: '*',
    title: '整理藏经阁',
    body: '阁里积了百年的灰，长老要你去抄一份书目。',
    minRank: 0,
    levelMin: 1,
    levelMax: 200,
    cooldownYears: 20,
    kind: 'secret',
    contribution: 30,
    choices: [
      {
        id: 'copy',
        label: '老老实实抄',
        outcomes: [{ text: '抄到第七日，你在夹页里抄出一段批注。', effects: [{ op: 'gainInsight', value: 15 }] }],
      },
      {
        id: 'ask',
        label: '去问守阁的老头',
        outcomes: [
          {
            text: '老头讲了三天旧事，你听得心里发凉。',
            effects: [
              { op: 'setFlag', id: 'sect_secret_known' },
              { op: 'gainInsight', value: 6 },
            ],
          },
        ],
      },
    ],
  }),
  defineMission({
    id: 'mis_founder_tomb',
    sect: 'sect_xuanyue',
    title: '祭祖师',
    body: '祖师坟前要人守一夜。这活没人抢，因为守过的人都说听见了呼吸声。',
    minRank: 1,
    levelMin: 30,
    levelMax: 200,
    cooldownYears: 20,
    kind: 'secret',
    contribution: 35,
    choices: [
      {
        id: 'stay',
        label: '一夜不睡',
        outcomes: [
          {
            text: '天快亮时，那种呼吸声停了。你确信那不是错觉。',
            effects: [{ op: 'setFlag', id: 'sect_secret_known' }],
          },
        ],
      },
      {
        id: 'sleep',
        label: '打个盹',
        outcomes: [{ text: '你睡得很沉，醒来什么也没有。', effects: [{ op: 'add', target: { k: 'simPoints' }, value: 1 }] }],
      },
    ],
  }),
  defineMission({
    id: 'mis_forbidden_scroll',
    sect: 'sect_jiuxiao',
    title: '抄禁忌雷法',
    body: '府中最深一层锁着一卷雷法，没人说得清是谁锁的。',
    minRank: 2,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 20,
    kind: 'secret',
    contribution: 45,
    choices: [
      {
        id: 'read',
        label: '照抄，不看内容',
        outcomes: [
          {
            text: '你抄完就把眼睛闭上。雷法自己钻进了经脉。',
            effects: [{ op: 'gainInsight', value: 22 }],
          },
        ],
      },
      {
        id: 'look',
        label: '看一眼那卷东西到底是什么',
        outcomes: [
          {
            text: '你看了。然后你明白了为什么它会被锁起来。',
            effects: [
              { op: 'setFlag', id: 'sect_secret_known' },
              { op: 'addToxicity', value: 15 },
              { op: 'gainInsight', value: 30 },
            ],
          },
        ],
      },
    ],
  }),
];

