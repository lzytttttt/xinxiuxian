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
        id: 'resolve',
        label: '弯腰去扫',
        outcomes: [
          {
            weight: 45,
            text: '你一阶一阶扫到日头偏西，气息竟在不知不觉间匀了下去。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
          {
            weight: 35,
            text: '你扫到一半便躲进林子打盹，被执事逮住，罚你明日再扫一遍。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 20,
            text: '你在石缝里扫出一枚被遗落的旧铜牌，牌上刻着半个认不出的字。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
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
        id: 'resolve',
        label: '再试一次',
        outcomes: [
          {
            weight: 50,
            text: '那一口气第一次沉到底，四肢百骸像被温水浸过，说不出的舒坦。',
            tone: 'gold',
            effects: [{ op: 'pct', target: { k: 'cultivation' }, value: 2 }],
          },
          {
            weight: 30,
            text: '你憋得满脸通红，什么也没觉出来，倒把那几句口诀记牢了。',
            effects: [{ op: 'gainInsight', value: 1 }],
          },
          {
            weight: 20,
            text: '你入定太深，醒来时天已亮透，浑身酸麻，丹田里却像有一粒微尘在转。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
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
        id: 'resolve',
        label: '自己拿主意',
        outcomes: [
          {
            weight: 40,
            text: '你一条条与他论价，多换了几串铜钱，那少年看你的眼神也变了。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 2 }],
          },
          {
            weight: 35,
            text: '你懒得争，背着货走了十里山路去邻镇，反倒卖了个好价。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 3 }],
          },
          {
            weight: 25,
            text: '贩子恼了，说你们不识抬举，一季的货都搁在手里烂掉了。',
            tone: 'red',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: -1 }],
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
        id: 'resolve',
        label: '如何处置',
        outcomes: [
          {
            weight: 45,
            text: '你把它抱出来裹好。回程时远处有狼影静静望了你一眼，转身没入林中。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 2 }],
          },
          {
            weight: 35,
            text: '你站了很久，还是走了。此后脚步比来时重了些。',
            effects: [{ op: 'gainInsight', value: 1 }],
          },
          {
            weight: 20,
            text: '你刚探手进去，就被它咬了一口，指骨疼了半个月。',
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
        id: 'resolve',
        label: '听他说完',
        outcomes: [
          {
            weight: 50,
            text: '他说早年见过有人踏叶上山，一去不回。你听着，心里有什么悄悄动了。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 2 }],
          },
          {
            weight: 30,
            text: '你听得入神，雨停了才想起担子，赶路时反倒越走越轻。',
            effects: [{ op: 'pct', target: { k: 'cultivation' }, value: 2 }],
          },
          {
            weight: 20,
            text: '老汉翻来覆去只有那几句村谈，你听完只当故事，倒也没白耗这一场雨。',
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
        id: 'resolve',
        label: '举斧',
        outcomes: [
          {
            weight: 50,
            text: '斧落如雨，你渐渐摸到"力从地起"的门道，臂膀比昨天结实了。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
          {
            weight: 30,
            text: '你劈得慢，却一刀是一刀，管事的难得点了点头，多给了你一个馒头。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
          {
            weight: 20,
            text: '你心急斧偏，木屑崩进眼里，揉了半天才睁开。',
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
        id: 'resolve',
        label: '咬牙上阶',
        outcomes: [
          {
            weight: 50,
            text: '第三趟时你忽然找到平衡，水不再洒，肩上那根扁担像长在了身上。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
          {
            weight: 30,
            text: '你歇了七次才到顶，桶里只剩小半。执事没骂你，只让你明日再来。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 20,
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
        id: 'resolve',
        label: '跟着赌一把',
        outcomes: [
          {
            weight: 40,
            text: '你的石子在水面跳了七下，孩子们哄然叫好，铜板归你。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 35,
            text: '你扔得歪，石子在岸边就沉了底。输掉的铜板换来半日的笑闹，不亏。',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: -1 }],
          },
          {
            weight: 25,
            text: '你掷得极认真，忽然琢磨起出手的角度力道，竟像悟到点什么。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 2 }],
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
        id: 'resolve',
        label: '拿定主意',
        outcomes: [
          {
            weight: 40,
            text: '你追了两条街把布囊还回去，失主千恩万谢，你心里熨帖了很久。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 35,
            text: '你把布囊揣进怀里，买了顿饱饭。夜里翻来覆去，总觉得有人在门外。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 3 },
              { op: 'sub', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 25,
            text: '你在原地等到天黑，物主始终没来。你把布囊挂上了街角的老树。',
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
        id: 'resolve',
        label: '停下来看',
        outcomes: [
          {
            weight: 45,
            text: '你坐在这丛草边看了半日，忽觉得周围的气机都在往叶脉里走。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 35,
            text: '你把香气记在心里，回头照着那股味道去辨别的草木草药，眼力长进不少。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 2 }],
          },
          {
            weight: 20,
            text: '你忍不住掐了一片叶，汁水沾上皮肉，又痒又麻，捋了半宿才消。',
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
        id: 'resolve',
        label: '怎么办',
        outcomes: [
          {
            weight: 40,
            text: '你把它放回草丛。兔子跑出一段又回头看你，你笑了笑，转身下山。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
            ],
          },
          {
            weight: 35,
            text: '你生火烤了它。肉香滚进肚子里，这一夜睡得极沉。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 3 }],
          },
          {
            weight: 25,
            text: '解套时你被后腿蹬在胸口，喘了半晌，才把兔子放走。',
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
        id: 'resolve',
        label: '上山送信',
        outcomes: [
          {
            weight: 50,
            text: '你在天黑前赶回，师兄多看了你两眼，顺手点破了半句吐纳口诀。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 30,
            text: '路上你抄了近道，腿脚赶得发软，倒把那些山径记了个七八成。',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 1 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 20,
            text: '你贪看山色误了时辰，回来挨了一顿训，站在阶前想了很久。',
            tone: 'red',
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
        id: 'resolve',
        label: '抬起头',
        outcomes: [
          {
            weight: 40,
            text: '你没退，抄起柴刀背拍翻了领头的，其余人一哄而散。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
          {
            weight: 35,
            text: '你把柴扔下，空手站定。他们推了你几把，见你不喊不躲，反倒没了兴致。',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: -1 },
            ],
          },
          {
            weight: 25,
            text: '你被按在泥里揍了一顿。趴在地上时，你第一次明白什么叫"力气"。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
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
        id: 'resolve',
        label: '俯身',
        outcomes: [
          {
            weight: 45,
            text: '你以掌接露，凑到唇边，一股凉意从喉间直落到丹田。',
            tone: 'gold',
            effects: [{ op: 'pct', target: { k: 'cultivation' }, value: 2 }],
          },
          {
            weight: 30,
            text: '你看露水聚散整整一个时辰，忽然觉得人心大约也是这样。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 2 }],
          },
          {
            weight: 25,
            text: '趴得太久，露水湿透衣襟，你打了个响亮的喷嚏，倒把自己逗笑了。',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: -1 }],
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
        id: 'resolve',
        label: '挤到前排',
        outcomes: [
          {
            weight: 45,
            text: '你听得屏住呼吸。散场后站在原地好久，心里第一次长出"我也想去"的念头。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 1 },
            ],
          },
          {
            weight: 30,
            text: '你追着老者问了一路，他笑而不答，只把手里那根竹杖敲了敲你的肩。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 25,
            text: '你听着听着竟睡着了，梦里全是云，醒来时茶棚已空，桌上留着一枚茶钱。',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 1 }],
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
        id: 'resolve',
        label: '答他',
        outcomes: [
          {
            weight: 45,
            text: '你说想上山学本事。守门人让你在阶下站到日落，才挥手放你去偏院打杂。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
          {
            weight: 35,
            text: '你答得笨拙，守门人却笑了：笨人有笨路。他指给你一条砍柴的小径。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 20,
            text: '你答不上来，被赶下山。回望山门时，你把那两扇门的样子刻进了心里。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
              { op: 'gainInsight', value: 2 },
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
        id: 'resolve',
        label: '依言调息',
        outcomes: [
          {
            weight: 50,
            text: '一呼一吸各有其位，你第一次觉得这个身子是自己能听见的。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 30,
            text: '你学得慢，执事也不催，只把同一句话说了七遍。第八遍时你懂了。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 20,
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
        id: 'resolve',
        label: '下水',
        outcomes: [
          {
            weight: 45,
            text: '你蹚进急流把他架了上来，自己被水里的石头划了几道口子。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: -2 },
            ],
          },
          {
            weight: 30,
            text: '你先把同伴喊来，两人一根竹竿把孩子捞起。事后村里都说你有主意。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 1 },
            ],
          },
          {
            weight: 25,
            text: '水势太猛，你刚下到腰深就被冲倒，孩子是货郎下水救的，你喝了一肚子浑水。',
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
    ],
  }),
] satisfies EventDef[];
