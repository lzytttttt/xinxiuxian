import { defineEvent } from '../../../engine/registry';
import type { EventDef } from '../../../engine/types/effects';

/**
 * 凡人早期事件池（等级 1-30 主用，levelMax 40 收边）。
 * 主题：拜入山门、凡人生活、山野险地、初次吐纳、早期小机缘、
 *       被欺辱与反击、救人、师门琐事、灵草猎兽、少年心性、仙之传说。
 * 全部为「单选项 + 2-3 加权结局」结构；低等级陷阱只做小概率轻伤。
 */
export const MORTAL_EARLY = [
  defineEvent({
    id: 'ev_early_step_sweep',
    title: '扫阶',
    category: 'sect',
    weight: 120,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 9,
    body: '天还没亮，执事便把扫帚塞进你怀里：山门三千级石阶，扫不完就没有早饭。',
    choices: [
      {
        id: 'sweep',
        label: '弯腰去扫',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '你一阶一阶扫到日头偏西，气息竟在不知不觉间匀了下去。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
          {
            weight: 40,
            text: '你扫到一半便躲进林子打盹，被执事逮住，罚你明日再扫一遍。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'seek',
        label: '专挑石缝细看',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 45,
            text: '你在石缝里扫出一枚被遗落的旧铜牌，牌上刻着半个认不出的字。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
            ],
          },
          {
            weight: 55,
            text: '你一路翻找，铜牌没见着，帚下的石阶倒被你扫得格外干净。',
            effects: [{ op: 'pct', target: { k: 'cultivation' }, value: 1 }],
          },
        ],
      },
      {
        id: 'grind',
        label: '扫完再扫一遍',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 2 }],
        outcomes: [
          {
            text: '你把三千级又过了一遍，第二遍扫到一半，忽然明白执事为何总说"帚下有路"。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_first_breath',
    title: '初息',
    category: 'world',
    weight: 150,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 10,
    body: '夜深人静，你照着那卷残破图样盘膝坐下，试着把一口气缓缓沉进腹中。',
    choices: [
      {
        id: 'breathe',
        label: '依样吐纳',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '那一口气第一次沉到底，四肢百骸像被温水浸过，说不出的舒坦。',
            tone: 'gold',
            effects: [{ op: 'pct', target: { k: 'cultivation' }, value: 2 }],
          },
          {
            weight: 40,
            text: '你憋得满脸通红，什么也没觉出来，倒把那几句口诀记牢了。',
            effects: [{ op: 'gainInsight', value: 1 }],
          },
        ],
      },
      {
        id: 'hold',
        label: '强压一口气',
        hint: { risk: 2, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 55,
            text: '你入定太深，醒来时天已亮透，浑身酸麻，丹田里却像有一粒微尘在转。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 45,
            text: '气息堵在胸口，你扶着墙咳了半宿，天亮时才勉强顺过来。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
        ],
      },
      {
        id: 'copy',
        label: '先抄口诀',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你不急着入定，把残卷上的字一笔一画抄了一遍，越抄越觉得那几行字里有东西。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 2 }],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_market_price',
    title: '山货',
    category: 'world',
    weight: 110,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 11,
    body: '镇上收山货的贩子把价钱压得极低，同村的少年拽着你的袖子，问卖给不卖。',
    choices: [
      {
        id: 'haggle',
        label: '一条条论价',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 65,
            text: '你一条条与他论价，多换了几串铜钱，那少年看你的眼神也变了。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 3 }],
          },
          {
            weight: 35,
            text: '贩子恼了，说你们不识抬举，一季的货都搁在手里烂掉了。',
            tone: 'red',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: -1 }],
          },
        ],
      },
      {
        id: 'haul',
        label: '背去邻镇卖',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 60,
            text: '你懒得争，背着货走了十里山路去邻镇，反倒卖了个好价，还看清了行情。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 3 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 40,
            text: '邻镇行情也平，你磨到日头西斜才出手，只比原价强些。',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: '不卖挑回家',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你把货原样挑回村，分给邻里一些。听他们闲谈，倒把贩子的路数听明白了。',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_wolf_cub',
    title: '陷坑',
    category: 'encounter',
    weight: 100,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 10,
    body: '山道旁的陷坑里掉着一只幼狼，前腿见了血，仰头朝你呜呜地叫。',
    choices: [
      {
        id: 'save',
        label: '抱出来裹好',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你把它抱出来裹好。回程时远处有狼影静静望了你一眼，转身没入林中。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 2 }],
          },
          {
            weight: 45,
            text: '你刚探手进去，就被它咬了一口，指骨疼了半个月，总算把它拎了上来。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'leave',
        label: '站一会儿就走',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你站了很久，还是走了。此后脚步比来时重了些，像在心里给什么东西上了秤。',
            effects: [{ op: 'gainInsight', value: 2 }],
          },
        ],
      },
      {
        id: 'bait',
        label: '守到夜里',
        hint: { risk: 2, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 50,
            text: '入夜后林子里有了动静。母狼叼走了幼崽，临走前在雪地上留下深深一瞥。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 50,
            text: '你在坑边守到后半夜，等来的是母狼的低吼。你退开时摔了一跤，它也叼着幼崽走了。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_rain_eaves',
    title: '檐下',
    category: 'world',
    weight: 90,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 9,
    body: '骤雨把你困在破庙檐下，同避雨的挑担老汉把伞往你这边偏了偏，说起了山上的事。',
    choices: [
      {
        id: 'listen',
        label: '听他说完',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '他说早年见过有人踏叶上山，一去不回。你听着，心里有什么悄悄动了。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 2 }],
          },
          {
            weight: 40,
            text: '老汉翻来覆去只有那几句村谈，你听完只当故事，倒也没白耗这一场雨。',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'ask',
        label: '替他挑一程',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 55,
            text: '你接过他的担子，一路把他送到村口。他临别时指了条上山的隐路给你。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 45,
            text: '雨里担子压肩，你送到半路就歇了。老汉谢过你，把那几句村谈又说了一遍。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'go',
        label: '冒雨先走',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你索性踏进雨里。雨声盖住脚步，你走着走着，呼吸竟和雨点合上了拍子。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 50,
            text: '山道泥泞，你连摔两跤，货也散了，回到村里就发起热来。',
            tone: 'red',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: -2 }],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_wood_chop',
    title: '劈柴',
    category: 'sect',
    weight: 130,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 8,
    body: '灶房的柴垛比你人还高，管事的说：劈完这些，晚饭管饱。',
    choices: [
      {
        id: 'chop',
        label: '一斧一斧劈',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '斧落如雨，你渐渐摸到"力从地起"的门道，臂膀比昨天结实了。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
          {
            weight: 40,
            text: '你劈得慢，却一刀是一刀，管事的难得点了点头，多给了你一个馒头。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'haste',
        label: '抢着赶工',
        hint: { risk: 2, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 50,
            text: '你越劈越快，斧风带起木香，一垛柴不到晌午就见了底。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
          {
            weight: 50,
            text: '你心急斧偏，木屑崩进眼里，揉了半天才睁开。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'watch',
        label: '先看人劈',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你蹲在一旁看老杂役下斧，看他如何卸力、如何换气，看得入了神。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 2 }],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_water_carry',
    title: '担水',
    category: 'sect',
    weight: 125,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 8,
    body: '从溪边到山门有八百级台阶，你肩上的木桶晃得厉害，水一路洒一路少。',
    choices: [
      {
        id: 'climb',
        label: '咬牙上阶',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '第三趟时你忽然找到平衡，水不再洒，肩上那根扁担像长在了身上。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
          {
            weight: 40,
            text: '你歇了七次才到顶，桶里只剩小半。执事没骂你，只让你明日再来。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'half',
        label: '只担半桶',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你改了法子，只担半桶，多跑几趟，一路滴水未洒，肩头也渐渐稳了。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'race',
        label: '与人比快',
        hint: { risk: 2, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 50,
            text: '你咬着牙抢在同门前头登顶，放下桶时双腿打颤，心里却痛快得很。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
          {
            weight: 50,
            text: '半途脚下一滑，你连人带桶滚下石阶，膝盖青了一大片。',
            tone: 'red',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: -2 }],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_stone_skip',
    title: '掷石',
    category: 'world',
    weight: 95,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 9,
    body: '溪边几个半大孩子用扁石打水漂，赌注是各人兜里那点零碎铜板。',
    choices: [
      {
        id: 'bet',
        label: '跟着赌一把',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 45,
            text: '你的石子在水面跳了七下，孩子们哄然叫好，铜板归你。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 55,
            text: '你扔得歪，石子在岸边就沉了底。输掉的铜板换来半日的笑闹，不亏。',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: -1 }],
          },
        ],
      },
      {
        id: 'watch',
        label: '蹲着看别人掷',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你掷得极认真，忽然琢磨起出手的角度力道，竟像悟到点什么。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 2 }],
          },
        ],
      },
      {
        id: 'stake',
        label: '押上全部铜板',
        hint: { risk: 3, reward: 3 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 50,
            text: '石子贴着水面一路跳下去，孩子们一个个掏兜，你赢得盆满钵满。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 3 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 50,
            text: '你手一抖，石子砸在岸石上弹了回来，兜里的铜板一枚不剩。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_lost_purse',
    title: '遗钱',
    category: 'world',
    weight: 85,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 12,
    body: '集市散后，你在草堆里摸到一只鼓鼓的布囊，四下一时无人。',
    choices: [
      {
        id: 'return',
        label: '追上去还了',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            weight: 65,
            text: '你追了两条街把布囊还回去，失主千恩万谢，你心里熨帖了很久。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 35,
            text: '你没追上失主，把布囊交给了街口的铺子，掌柜记下了你的名字。',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: '揣进怀里',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            text: '你把布囊揣进怀里，买了顿饱饭。夜里翻来覆去，总觉得有人在门外。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 3 },
              { op: 'sub', target: { k: 'luck' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: '原地等到天黑',
        hint: { risk: 1, reward: 1 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 60,
            text: '你在原地等到天黑，物主始终没来。你把布囊挂上了街角的老树，心里反而静了。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 40,
            text: '等到天黑也没人来，你误了活计，饿着肚子把布囊挂上了树。',
            effects: [
              { op: 'gainInsight', value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_grass_scent',
    title: '草香',
    category: 'world',
    weight: 100,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 10,
    body: '背阴坡上有一丛草，叶背泛着极淡的银灰，风一过便散出清冷香气。',
    choices: [
      {
        id: 'sit',
        label: '坐下看半日',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你坐在这丛草边看了半日，忽觉得周围的气机都在往叶脉里走。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 40,
            text: '你把香气记在心里，回头照着那股味道去辨别草木，眼力长进不少。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 2 }],
          },
        ],
      },
      {
        id: 'pick',
        label: '掐一片叶试',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 45,
            text: '你把叶汁抹在腕上，先凉后热，竟顺着经脉走了一段，让你记了个清楚。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
            ],
          },
          {
            weight: 55,
            text: '你忍不住掐了一片叶，汁水沾上皮肉，又痒又麻，捋了半宿才消。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'note',
        label: '记下气味翻书',
        hint: { risk: 0, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            text: '你换回半本旧药草册，对着气味一页页翻，翻到第三夜时，忽然把它认了出来。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 3 },
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_rabbit_snare',
    title: '兔套',
    category: 'world',
    weight: 105,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 9,
    body: '你在山腰布的草套里，套住了一只肥兔。它挣得草叶簌簌落。',
    choices: [
      {
        id: 'free',
        label: '解套放走',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            weight: 70,
            text: '你把它放回草丛。兔子跑出一段又回头看你，你笑了笑，转身下山。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
          {
            weight: 30,
            text: '解套时你被后腿蹬在胸口，喘了半晌，才把兔子放走。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'roast',
        label: '生火烤了',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你生火烤了它。肉香滚进肚子里，这一夜睡得极沉。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 3 }],
          },
        ],
      },
      {
        id: 'keep',
        label: '留它一夜',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 60,
            text: '你撕了半块干粮给它。天亮时它没走，就卧在你门槛边，赶也赶不动。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
          {
            weight: 40,
            text: '半夜它咬断草绳跑了，啃翻了你半筐口粮，只留下几根兔毛。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_errand_run',
    title: '跑腿',
    category: 'sect',
    weight: 115,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 8,
    body: '一位年长的师兄把一封油纸信拍在你手上，让你送到后山守林人处，天黑前回来。',
    choices: [
      {
        id: 'run',
        label: '上山送信',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你在天黑前赶回，师兄多看了你两眼，顺手点破了半句吐纳口诀。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 40,
            text: '你在天黑前赶回，只是腿脚赶得发软，路上倒把那些山径记了个七八成。',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'race',
        label: '抄近道抢时辰',
        hint: { risk: 2, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 55,
            text: '你翻过一道石梁，比预计早了半个时辰。守林人留你喝了碗热汤。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 45,
            text: '近道走岔了，你摸黑才摸回山门，挨了一顿训，站在阶前想了很久。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'ask',
        label: '先问明路径',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你不急着走，先向洒扫的同门问清了岔路与水源，一路走得稳稳当当。',
            effects: [{ op: 'gainInsight', value: 2 }],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_road_block',
    title: '拦路',
    category: 'encounter',
    weight: 100,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 10,
    body: '回村的窄道上，三个比你高半头的少年横着扁担，嚷着让你把柴放下再走。',
    choices: [
      {
        id: 'fight',
        label: '抄刀背拍过去',
        hint: { risk: 3, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你没退，抄起柴刀背拍翻了领头的，其余人一哄而散。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
          {
            weight: 50,
            text: '你被按在泥里揍了一顿。趴在地上时，你第一次明白什么叫"力气"。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'stand',
        label: '扔柴空手站定',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            text: '你把柴扔下，空手站定。他们推了你几把，见你不喊不躲，反倒没了兴致。',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
        ],
      },
      {
        id: 'pay',
        label: '留柴买路',
        hint: { risk: 0, reward: 1 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 2 }],
        outcomes: [
          {
            text: '你把柴捆推给他们，空手走回村。省下的力气，当晚全用在吐纳上。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_dawn_dew',
    title: '晨露',
    category: 'world',
    weight: 95,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 10,
    body: '五更天，草叶上挂着的露水映着将出的日头，一粒粒像碎玉。',
    choices: [
      {
        id: 'sip',
        label: '以掌接露饮下',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你以掌接露，凑到唇边，一股凉意从喉间直落到丹田。',
            tone: 'gold',
            effects: [{ op: 'pct', target: { k: 'cultivation' }, value: 2 }],
          },
          {
            weight: 40,
            text: '露水太少，你只润了润喉，倒把每一滴落在掌心的分量记了下来。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'gaze',
        label: '看露水聚散',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你看露水聚散整整一个时辰，忽然觉得人心大约也是这样。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 2 }],
          },
        ],
      },
      {
        id: 'fill',
        label: '接满一葫芦',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 55,
            text: '你趴到日头出来才接满葫芦，一口气饮尽，凉意顺着四肢一寸寸爬开。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 45,
            text: '趴得太久，露水湿透衣襟，你打了个响亮的喷嚏，倒把自己逗笑了。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_storyteller',
    title: '说书人',
    category: 'world',
    weight: 130,
    tierMin: 1,
    tierMax: 1,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 9,
    body: '卖艺的老者在茶棚里一拍醒木，讲起有人饮风餐霞、一朝立于云上的旧事。',
    choices: [
      {
        id: 'front',
        label: '挤到前排',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你听得屏住呼吸。散场后站在原地好久，心里第一次长出"我也想去"的念头。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
            ],
          },
          {
            weight: 40,
            text: '你听得入神，连醒木响了几回都没听见，回过神时心口还在发热。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'follow',
        label: '追着老者问',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 55,
            text: '你追着老者问了一路，他笑而不答，只把手里那根竹杖敲了敲你的肩。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 45,
            text: '你请他喝了碗热茶，他才慢悠悠说了半句，余下的让你自己去想。',
            effects: [{ op: 'gainInsight', value: 2 }],
          },
        ],
      },
      {
        id: 'doze',
        label: '听着听着睡去',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你听着听着竟睡着了，梦里全是云，醒来时茶棚已空，桌上留着一枚茶钱。',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_gate_knock',
    title: '叩门',
    category: 'encounter',
    weight: 70,
    tierMin: 2,
    tierMax: 2,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 12,
    body: '你循着山道走了三日，终于站在那座青石山门前。守门人扫你一眼，问：来做什么？',
    choices: [
      {
        id: 'answer',
        label: '答他一句',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你说想上山学本事。守门人让你在阶下站到日落，才挥手放你去偏院打杂。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 40,
            text: '你答得笨拙，守门人却笑了：笨人有笨路。他指给你一条砍柴的小径。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'kneel',
        label: '撩衣跪下',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 2 }],
        outcomes: [
          {
            weight: 60,
            text: '你一个字也没答，撩衣跪在阶下。日头偏西时，守门人把偏院的钥匙丢给了你。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 40,
            text: '你跪到双腿失去知觉，守门人始终没有回头，只让人递来一碗凉水。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'turn',
        label: '转身下山',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你答不上来，转身下山。回望山门时，你把那两扇门的样子刻进了心里。',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_first_lesson',
    title: '受教',
    category: 'sect',
    weight: 65,
    tierMin: 2,
    tierMax: 2,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 11,
    body: '掌管杂役的执事难得发了善心，让你在廊下盘坐，依着他的口令调息。',
    choices: [
      {
        id: 'obey',
        label: '依言调息',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '一呼一吸各有其位，你第一次觉得这个身子是自己能听见的。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 40,
            text: '你学得慢，执事也不催，只把同一句话说了七遍。第八遍时你懂了。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'probe',
        label: '多问一句',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            weight: 55,
            text: '你把那句口令掰开问了三层，执事起初不耐，答到后来自己也愣住了。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 3 }],
          },
          {
            weight: 45,
            text: '执事只丢下一句"照做便是"，你讨了个没趣，倒把那口气的走法记住了。',
            effects: [
              { op: 'gainInsight', value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'rush',
        label: '抢先冲关',
        hint: { risk: 3, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 55,
            text: '你抢在众人前头把气息压进丹田，胸口一暖，竟先摸到了那道门槛。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 45,
            text: '你急于求成，强压气息，胸口闷疼了半月，才知吐纳急不得。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -1 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_shallows',
    title: '浅滩',
    category: 'encounter',
    weight: 60,
    tierMin: 2,
    tierMax: 2,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 12,
    body: '溪水一夜暴涨，下游浅滩里有个孩子在扑腾，岸上几个同伴只会哭着喊人。',
    choices: [
      {
        id: 'dive',
        label: '直接下水',
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 50,
            text: '你蹚进急流把他架了上来，自己被水里的石头划了几道口子。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
            ],
          },
          {
            weight: 50,
            text: '水势太猛，你刚下到腰深就被冲倒，孩子是货郎下水救的，你喝了一肚子浑水。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -3 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'pole',
        label: '喊人寻竹竿',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 65,
            text: '你先把同伴喊来，两人一根竹竿把孩子捞起。事后村里都说你有主意。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 35,
            text: '竹竿递到时孩子已被冲远，众人合力追了半里才把他拽上岸，你累得直不起腰。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'call',
        label: '飞奔喊大人',
        hint: { risk: 1, reward: 1 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 65,
            text: '你撒腿往村里跑，一路喊得嗓子劈了。大人们赶到时，孩子正扒着一丛柳根。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 1 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 35,
            text: '你跑得太急，在田埂上摔了一跤，等大人赶到时水边已围满了人。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_cliff_flower',
    title: '崖花',
    category: 'world',
    weight: 55,
    tierMin: 2,
    tierMax: 2,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 11,
    body: '崖壁半腰那株开得正好的白花，离你脚下只有两丈——但那两丈是溜光的石面。',
    choices: [
      {
        id: 'resolve',
        label: '攀过去',
        outcomes: [
          {
            weight: 45,
            text: '你指尖扣着石缝挪过去，把花连根带土取下，香气顺着袖口往上走。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 30,
            text: '你摘下花就滑了手，好在半途抓住藤蔓，花却碎在崖下。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
          {
            weight: 25,
            text: '石面湿滑，你摔在下面的碎石堆上，半天爬不起来，花还在崖上开着。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -1 },
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
            ],
          },
        ],
      },
      {
        id: 'seek_rope',
        label: '先去谷底寻绳',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 55,
            text: '你从谷底摸来一截旧麻绳，绕着树根打了死结，贴着绳子一寸寸挪到花前，连土带根摘下。',
            tone: 'gold',
            effects: [
              { op: 'grantHerb', id: 'herb_qingxin', count: 2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 45,
            text: '绳子磨在岩棱上断了一截。你把绳收回来，顺着崖壁把每一道石缝的位置记进了心里。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
        ],
      },
      {
        id: 'take_root',
        label: '舍了花，去掏崖根',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你蹲在崖脚，把指头探进石缝，一寸寸掏出那段盘在石里的根须，指尖麻了半日。',
            tone: 'gold',
            effects: [
              { op: 'grantHerb', id: 'herb_yinqi', count: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 50,
            text: '掏到一半，石缝里涌出一股冷气，手背麻了半晌。根没掏全，你却记住了那股寒意的来路。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_boar_hunt',
    title: '猎彘',
    category: 'world',
    weight: 60,
    tierMin: 2,
    tierMax: 2,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 12,
    body: '苞米地被拱得一片狼藉，猎户说那头野彘就在林子里，问你敢不敢搭把手。',
    choices: [
      {
        id: 'resolve',
        label: '提棍跟上',
        outcomes: [
          {
            weight: 45,
            text: '你从侧面一棍敲中它的耳根，猎户补上最后一刀。分肉时多给了你一条后腿。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: 2 },
            ],
          },
          {
            weight: 30,
            text: '你只在林子里放声呐喊，把彘赶进了猎户布好的网里，也算出了力。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 25,
            text: '彘掉头撞来，你滚进沟里躲开，肋下青肿，猎户却说你命大。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
            ],
          },
        ],
      },
      {
        id: 'drive_fire',
        label: '举火把把它逼上石壁',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '火把横在兽径上，那畜生被光逼得后退半步，猎户的枪随即扎进它颈下。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 45,
            text: '火苗燎着了你的眉毛，彘趁乱撞塌半堵土埂。你退到林边上，看猎户自己收了场。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'hold_net',
        label: '守在网边不出手',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 60,
            text: '彘撞进网里，被网绳勒得翻了两个跟头。猎户按规矩分你两斤肉，你把肉腌了留到开春。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 40,
            text: '你在网边蹲到月上梢。那畜生嗅出腥味，从网眼里踩了过去，你只带回一裤腿的露水。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_fist_lesson',
    title: '拳脚',
    category: 'encounter',
    weight: 55,
    tierMin: 2,
    tierMax: 2,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 12,
    body: '年长的杂役看你新来，故意把你的饭食拨到地上，说：想吃饱，自己来拿。',
    choices: [
      {
        id: 'resolve',
        label: '上前',
        outcomes: [
          {
            weight: 45,
            text: '你扑上去死死抱住他的腰，把他掀翻在灶灰里。从此无人再抢你的碗。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
          {
            weight: 35,
            text: '你打不过，咬着牙爬起来三次。他打累了，把碗踢给你，走了。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 2 },
              {
                op: 'if',
                cond: { op: 'cmp', target: { k: 'luck' }, cmp: '>=', value: 20 },
                then: [{ op: 'pct', target: { k: 'cultivation' }, value: 2 }],
              },
            ],
          },
          {
            weight: 20,
            text: '你没动手，转身去溪边洗了脸，把那口气咽成了一口很长的呼吸。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'take_bowl',
        label: '弯腰把碗端起来',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你弯腰把碗端起来，一口一口吃完。他愣了愣，此后见你便绕着灶台走。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 45,
            text: '你吃得太急，噎了一下午。灶房里从此没人来抢你的碗，也再没人肯同你一桌。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'catch_wrist',
        label: '不扑上去，只扣他手腕',
        hint: { risk: 2, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 50,
            text: '你侧身让开那一巴掌，反手扣住他手腕往下一带。他半个身子失了重心，碗落到你手里。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 50,
            text: '你扣住了他，也被他一肘撞在胸口。两人各退三步，谁也没讨着好，碗还在地上。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_well_echo',
    title: '井底声',
    category: 'world',
    weight: 50,
    tierMin: 2,
    tierMax: 2,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 13,
    requires: { op: 'rootTierAtLeast', tier: 3 },
    body: '废井里传来极轻的嗡鸣，像有水在很深的地方转。井绳还挂在辘轳上，只是朽了。',
    choices: [
      {
        id: 'resolve',
        label: '缒绳而下',
        outcomes: [
          {
            weight: 45,
            text: '井底寒气逼人，你摸到一片湿滑的苔石，凉气顺着掌心游走全身经脉。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'addToxicity', value: 3 },
            ],
          },
          {
            weight: 30,
            text: '你下到一半，绳断了半股，慌忙爬上来，只在井口坐到天亮。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
          {
            weight: 25,
            text: '你在井壁夹缝里抠出一枚冷玉，出水后它却在手心里化成了沙。',
            tone: 'rare',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
        ],
      },
      {
        id: 'listen_well',
        label: '伏在井口听',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '你伏在井口听了整夜。那嗡鸣有起有伏，像有什么在极深的地方正一呼一吸地调息。',
            tone: 'rare',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
            ],
          },
          {
            weight: 40,
            text: '夜风灌进井口，呜声叠了三层。你听了一宿，起身时手脚冻得发麻，什么也没听出来。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'drain_well',
        label: '想法子把井水抽干',
        hint: { risk: 2, reward: 3 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 2 }],
        outcomes: [
          {
            weight: 45,
            text: '你叫上两个挑水的孩子干了六日。水抽干，井底露出来：石台上嵌着一枚半埋的青玉。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
          {
            weight: 30,
            text: '绳桶断了七八只。井底露出来的是一堆烂铁，你白干了六日，只记清了哪一寸见底。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 25,
            text: '抽到第四日，井壁塌了一角，浑水漫回坑里。管井的罚你挑了半月粪肥，井里仍是那个声音。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -3 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_herb_plot',
    title: '药圃',
    category: 'sect',
    weight: 60,
    tierMin: 2,
    tierMax: 2,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 11,
    body: '药圃里几畦幼苗蔫了头，管事的长老蹲在畦边皱眉，问你看出什么没有。',
    choices: [
      {
        id: 'resolve',
        label: '细看',
        outcomes: [
          {
            weight: 45,
            text: '你指出畦沟积水伤了根。长老依言开沟，幼苗三日后竟齐刷刷直起了腰。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 35,
            text: '你说不出道理，只默默把每株苗旁的石子捡净。长老没说话，却在第二日传你一段口诀。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
          {
            weight: 20,
            text: '你自作主张浇了一遍水，反倒把两畦苗泡烂，被罚挑了十日粪肥。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -3 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'take_blame',
        label: '认下是自己浇坏的',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你说这几畦是你前日多浇了水。长老看了你半晌，只罚你把亏空补上，不必再挑十日粪肥。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 45,
            text: '长老不信，把值日簿翻出来对了名。你被罚去守丹房，三个月不许出院门，苗还是蔫的。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'dig_root',
        label: '撬开一株看根',
        hint: { risk: 2, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 50,
            text: '你拿竹签撬开一株，根上爬着极细的白虫。你喊出声，长老当即把整畦换成了新苗。',
            tone: 'gold',
            effects: [
              { op: 'grantHerb', id: 'herb_yinqi', count: 3 },
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
          {
            weight: 50,
            text: '根早已烂透，一撬就断。你手上全是黑泥，长老看了半晌，叫你去把全圃旧土翻一遍。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_old_iron',
    title: '旧铁',
    category: 'world',
    weight: 45,
    tierMin: 2,
    tierMax: 2,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 12,
    body: '废料堆底压着一截乌沉沉的旧铁，约莫一尺来长，敲上去声音发闷。',
    choices: [
      {
        id: 'resolve',
        label: '搬开看看',
        outcomes: [
          {
            weight: 45,
            text: '你把它带回屋里日夜摩挲，掌心竟渐渐觉出一点极细微的回应。',
            tone: 'rare',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 35,
            text: '你只当是块废铁，顺手换了两个铜板，那铁匠却盯着它看了很久。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 20,
            text: '你搬开料堆时铁块砸在脚背上，肿了七八日，那截铁也不知被谁捡走了。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'smelt_sell',
        label: '抬到铁匠铺熔了',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '炉火烧了两个时辰，铁匠按废铁给了你四枚铜板。他说这料发闷，熔起来比寻常的铁吃力。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 3 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 40,
            text: '铁匠敲了半晌忽然停手，把铁推回给你：换半斗米吧，莫再问。他转身便关了铺门。',
            tone: 'rare',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'weigh_scale',
        label: '借杆秤称一称',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 50,
            text: '你借了杆秤。那铁比同样粗细的铁重出小半斤，秤房的老头说，这样的料他从前来过一块。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 50,
            text: '秤砣压断了绳，秤杆也折了。你赔了半日工夫，只把那截铁的锈色记在了心里。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_valley_shout',
    title: '谷应',
    category: 'world',
    weight: 40,
    tierMin: 2,
    tierMax: 2,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 12,
    body: '你站在谷口喊了一声，回声一层叠着一层滚回来，好像有人在替你说话。',
    choices: [
      {
        id: 'resolve',
        label: '再喊一声',
        outcomes: [
          {
            weight: 45,
            text: '你追着回声跑，喊到嗓子发哑，忽然听出哪一层才是自己的声音。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
            ],
          },
          {
            weight: 30,
            text: '你喊得胸口发胀，一屁股坐在地上大笑，笑声又被山谷原样送了回来。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
            ],
          },
          {
            weight: 25,
            text: '喊得太用力，你眼前一黑，扶着岩壁缓了好一会儿才站直。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'throw_stone',
        label: '朝回声里扔石子',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '石子掷进回声里，回音跟着一串乱响，像是还有别的声音在里头跟着你掷。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
            ],
          },
          {
            weight: 45,
            text: '石子反弹回来砸在你脚背上，肿了三天。你蹲在谷口，把那几声回音数完了才起身。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'climb_echo',
        label: '顺着回声去找崖口',
        hint: { risk: 2, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 2 }],
        outcomes: [
          {
            weight: 45,
            text: '你攀着石棱爬到半腰，回声忽然从另一面涌回来。凉风里带着一点草药的苦味。',
            tone: 'rare',
            effects: [
              { op: 'grantHerb', id: 'herb_hanlu', count: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 55,
            text: '半山无路，你下到天黑，衣裳被荆棘挂得稀烂。回声倒是听清了一路。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_stone_milk',
    title: '石乳',
    category: 'world',
    weight: 30,
    tierMin: 3,
    tierMax: 3,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 14,
    requires: { op: 'realmAtLeast', level: 10 },
    body: '洞顶钟乳上挂着一滴将落未落的乳白，接在掌心时竟不化，只往皮肉里渗。',
    choices: [
      {
        id: 'resolve',
        label: '静心承接',
        outcomes: [
          {
            weight: 50,
            text: '乳白入体，你只觉四肢百骸被重新冲过一遍，指尖都轻了几分。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 30,
            text: '你贪多接了三滴，腹中翻江倒海，吐了两回才压住那股燥气。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: -3 },
            ],
          },
          {
            weight: 20,
            text: '钟乳忽然断裂，碎石擦着你的额角落下。你捧着那一滴，再不敢多留。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'pct', target: { k: 'cultivation' }, value: -1 },
            ],
          },
        ],
      },
      {
        id: 'seal_jug',
        label: '寻个瓷罐封存',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 2 }],
        outcomes: [
          {
            weight: 50,
            text: '你在洞口寻了个粗瓷罐，垫着湿布把那一滴裹好，一路上贴身带着，掌心凉了两日才散。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 50,
            text: '瓷罐在石阶上磕裂，乳白淌了满手，凉得你半边身子都麻了。三日不敢沾荤食。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'feed_fire',
        label: '滴进火里炼气',
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 45,
            text: '乳白落进火里，火焰猛地窜高三寸。你借着那股热把气机推过一道关，浑身汗透。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'addToxicity', value: 8 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 55,
            text: '火里蹿起一股白烟，熏得你咳了半日，胸口像压了块烧红的炭。那股燥气三年未散。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_night_hum',
    title: '夜鸣',
    category: 'fate',
    weight: 25,
    tierMin: 3,
    tierMax: 3,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 13,
    body: '后半夜，不知谁家的旧兵器在墙根轻轻响了一声，像有人在极远处叹气。',
    choices: [
      {
        id: 'resolve',
        label: '守到天亮',
        outcomes: [
          {
            weight: 45,
            text: '你整夜没睡，那声音在将明未明时又响了一次。你记住了它起伏的节拍。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 30,
            text: '你摸黑把墙根翻了个遍，只找到一枚断了的枪头，握在手里竟很顺手。',
            tone: 'rare',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
          {
            weight: 25,
            text: '一夜未眠，第二日你倒在台阶上睡了一整天，被执事拎着耳朵骂醒。',
            tone: 'red',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: -2 }],
          },
        ],
      },
      {
        id: 'follow_sound',
        label: '循声摸到那户人家',
        hint: { risk: 2, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 45,
            text: '你循着那声轻响摸到巷尾。门缝里透出一线微光，一柄断了的旧枪正被人用布慢慢擦着。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 55,
            text: '巷子七拐八绕，你摸到天亮也没找着那户人家。回程时腿抽了筋，靠墙睡到晌午。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'copy_rhythm',
        label: '照它的节拍调息',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你把呼吸放到和那声轻响一样长，一夜过去，胸中那口浊气竟自己散开了。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 40,
            text: '那节拍太快，你憋着跟了三回，胸口发闷。记下来的只有"快"这一个字。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_elder_lecture',
    title: '廊下讲',
    category: 'sect',
    weight: 28,
    tierMin: 3,
    tierMax: 3,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 12,
    body: '长老在廊下讲起"仙"字，说这字从来不是高处的东西，而是走得远的人回头看见的光。',
    choices: [
      {
        id: 'resolve',
        label: '听完再走',
        outcomes: [
          {
            weight: 50,
            text: '你听懂了三分，剩下七分化作胸中一股暖流，久久不散。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 30,
            text: '你追问了一句，长老笑而不答，只把手里那盏茶递给你。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 20,
            text: '你听到一半便被杂役喊走，回头时廊下已空，只剩半盏凉茶。',
            tone: 'ev3',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
        ],
      },
      {
        id: 'serve_tea',
        label: '留下替长老续水扫地',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 55,
            text: '你续到第三壶，长老忽然开口："仙"不是高处的东西。你听得背心发凉，手里的水却没洒。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 45,
            text: '你扫到深夜，长老始终没再开口。你抱着扫帚在阶上睡了一宿，冻得直打哆嗦。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'ask_path',
        label: '追着问：走得远的是谁',
        hint: { risk: 2, reward: 3 },
        outcomes: [
          {
            weight: 50,
            text: '长老看了你很久，只说：你自己。他起身走了，廊下的石案上多了一张纸，上头一个"行"字。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 50,
            text: '长老脸色沉下来，命你在阶下站到天亮，说修行人先管住嘴。你罚站三日不许进廊。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_beast_cub',
    title: '兽崽',
    category: 'encounter',
    weight: 22,
    tierMin: 3,
    tierMax: 3,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 15,
    body: '被雷火燎过的林地里，一只毛色焦黑的兽崽趴在母兽尸身旁，睁眼看你。',
    choices: [
      {
        id: 'resolve',
        label: '走近',
        outcomes: [
          {
            weight: 45,
            text: '它跟了你三里路，从此宿在你屋檐下。你喂它，它也替你看门。',
            tone: 'rare',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 3 },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
          {
            weight: 30,
            text: '你把它抱回暖处，撕了半块干粮。它吃得很慢，眼神一直没有离开你。',
            tone: 'ev3',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 2 },
            ],
          },
          {
            weight: 25,
            text: '你伸手时它猛地咬了你的手腕。血珠滴在焦土上，它转身跑进了林子。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -3 },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'take_hide',
        label: '取了它的皮',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 45,
            text: '你把火生起来，剥下那张焦黑的皮，硝了三日，换得两枚灵石和半袋米。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 3 },
              { op: 'sub', target: { k: 'luck' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 55,
            text: '皮没硝透，焦毛的气味招来了林子里的东西。你丢下皮跑出来，从此不肯再走那条路。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'sub', target: { k: 'luck' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'bury_mother',
        label: '先把母兽埋了',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 60,
            text: '你挖了个坑把母兽埋了。兽崽在坑边守了半日，天黑前才跟着你走，一路不肯落远。',
            tone: 'rare',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 40,
            text: '土太硬，你挖到天黑也没填上坑。兽崽不肯走，母兽的尸首却把山里的东西引了来。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_dream_path',
    title: '梦中路',
    category: 'fate',
    weight: 20,
    tierMin: 3,
    tierMax: 3,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 15,
    body: '梦里你站在一条极长的石径上，两旁无人，只有脚步落下去的回音。',
    choices: [
      {
        id: 'resolve',
        label: '往前走',
        outcomes: [
          {
            weight: 50,
            text: '你一直走到梦醒，石径的尽头仍看不见，但你的步子已经稳了。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 30,
            text: '半途你回头看了一眼，来路空空，惊出一身冷汗，却也醒得格外清明。',
            tone: 'ev3',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
          {
            weight: 20,
            text: '你走得太急，梦里跌了一跤，醒来时浑身酸痛，像真摔过一样。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
            ],
          },
        ],
      },
      {
        id: 'count_steps',
        label: '一步一步数着走',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你数到第三千步时梦忽然轻了。醒来还记得那个数，脚底也还留着踩实了的触感。',
            tone: 'rare',
            effects: [
              { op: 'gainInsight', value: 3 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
            ],
          },
          {
            weight: 45,
            text: '你数着数着乱了步子，石径在脚下变得极长。醒来时天已大亮，这一夜记不清半分。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'sit_down',
        label: '就地坐下不走了',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 50,
            text: '你在石径正中坐下。梦里没有风，没有饿，也没有老，只有石头的凉气从掌心渗上来。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 50,
            text: '你坐下没多久，脚下这条路就一寸寸热起来。你是被烫醒的，掌心一片红。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_moon_guest',
    title: '月下客',
    category: 'fate',
    weight: 8,
    tierMin: 4,
    tierMax: 4,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 15,
    requires: { op: 'lifeAtLeast', n: 2 },
    body: '月光白得像水，有位素衣人坐在你屋前的石头上，说你身上的气息他认得。',
    choices: [
      {
        id: 'resolve',
        label: '上前行礼',
        outcomes: [
          {
            weight: 50,
            text: '他抬手在你眉心虚点一下，说：慢慢走，别怕远。你回过神时石上只剩月光。',
            tone: 'xian',
            effects: [
              { op: 'add', target: { k: 'xianqi' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'log', text: '你眉心似有一点凉意停了很久。', tone: 'xian' },
            ],
          },
          {
            weight: 30,
            text: '你只来得及问一句"何为仙"，他答了两个字，你听清了却记不住。',
            tone: 'rare',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
            ],
          },
          {
            weight: 20,
            text: '你追出去几步，脚下踩空跌在石阶上。回头时石头还是石头，夜凉如常。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'ask_name',
        label: '问他：仙从何来',
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 45,
            text: '他笑了，说仙不过是一个不必再问的人。话音落下，你眉心那点凉意又停了很久。',
            tone: 'xian',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 55,
            text: '他收住笑，只看了你一眼。那一眼像山压下来，你膝头一软跪在原地，再抬头已是天明。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'offer_soup',
        label: '转身去端一碗热汤',
        hint: { risk: 1, reward: 2 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 1 }],
        outcomes: [
          {
            weight: 50,
            text: '你回屋舀了一碗热汤端出来。他接过时看了你很久，临走前在门槛上留了一句话。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 50,
            text: '汤端出来时石上已经空了，碗底结着一层薄霜。你把汤泼在阶下，霜化了，人没了。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_early_one_word',
    title: '一字',
    category: 'fate',
    weight: 6,
    tierMin: 4,
    tierMax: 4,
    levelMin: 1,
    levelMax: 40,
    cooldownYears: 15,
    body: '雪夜借宿的老者在泥地上写了一个"仙"字，写罢便用脚抹了，只说：记住了就别再问。',
    choices: [
      {
        id: 'resolve',
        label: '盯着那处看',
        outcomes: [
          {
            weight: 50,
            text: '你在被抹平的雪地上坐到天亮，忽然觉得那一个字里藏着一条极窄的路。',
            tone: 'xian',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 30,
            text: '你照着那个字的笔画走了几步，脚步竟莫名合上了呼吸的节拍。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
          {
            weight: 20,
            text: '你苦思整夜，头胀欲裂，天亮时只留下满身寒意和一句没头没尾的念头。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'rewrite',
        label: '用树枝再写一遍',
        hint: { risk: 2, reward: 3 },
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 2 }],
        outcomes: [
          {
            weight: 45,
            text: '你照着记忆写了七遍。写到第七遍落笔时，手腕自己动了一下，雪上的字比老者的还稳。',
            tone: 'xian',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'gainInsight', value: 3 },
            ],
          },
          {
            weight: 30,
            text: '你写出的只是自己记得的样子。天亮时雪化了，你盯着那片水看了很久，看不出是什么。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 25,
            text: '写到第五遍，指尖忽然发烫，字迹越写越重，掌心那层皮燎得起了泡。醒来时雪上什么也没有。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
      {
        id: 'burn_it',
        label: '添把火，把它烧掉',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '火苗一起，那个字化成一缕极淡的烟。你把灰扫进雪里，当夜睡得极沉，一个梦也没做。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 40,
            text: '火没点着。你呵着气把那个字擦掉，擦到指尖发麻。这一夜什么也没想明白，睡得也不安稳。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
        ],
      },
    ],
  }),
] satisfies EventDef[];
