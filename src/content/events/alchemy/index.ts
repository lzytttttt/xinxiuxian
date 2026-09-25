import { defineEvent } from '../../../engine/registry';
import type { EventDef } from '../../../engine/types/effects';

/* Phase 4 药材来源：约 12 个采药/丹缘事件（药园属 Phase 6 洞府，宗门专属药材属 Phase 5）。
   药材按境界档发放：levelMin/levelMax 分档，高境界不再发低阶药（见 doc/product/05-alchemy.md §一）。 */

const grantHerb = (id: string, count: number) => ({ op: 'grantHerb' as const, id, count });

export const ALCHEMY_EVENTS: EventDef[] = [
  defineEvent({
    id: 'ev_alc_herb_patch',
    title: '灵圃残株',
    category: 'alchemy',
    body: '山径旁一片荒废的灵圃，篱笆倒了大半，几株药草却在石缝里活得很好。',
    levelMin: 1,
    levelMax: 24,
    weight: 120,
    cooldownYears: 8,
    choices: [
      {
        id: 'gather',
        label: '连根采下',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你小心掘出三株药草，根须完整，正合入炉。',
            tone: 'ev1',
            effects: [grantHerb('herb_yunwu', 2), grantHerb('herb_chiteng', 2), grantHerb('herb_common', 2)],
          },
        ],
      },
      {
        id: 'tend',
        label: '为它培土',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你修好篱笆、引来泉水，日后路过总能再取一份。',
            tone: 'ev1',
            effects: [grantHerb('herb_yinqi', 3), { op: 'gainInsight', value: 1 }],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_alc_market',
    title: '药市摊前',
    category: 'alchemy',
    body: '坊市角落的药摊摆着七八个竹筐，药香混着土腥气。摊主正打瞌睡，价牌写得潦草。',
    levelMin: 5,
    levelMax: 40,
    weight: 110,
    cooldownYears: 7,
    choices: [
      {
        id: 'buy',
        label: '买下三味',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 4 }],
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你挑了三味成色最好的，摊主眼皮都没抬。',
            tone: 'ev1',
            effects: [grantHerb('herb_tiexian', 2), grantHerb('herb_bailing', 2), grantHerb('herb_dugen', 2)],
          },
        ],
      },
      {
        id: 'chat',
        label: '与摊主攀谈',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你替摊主看了两炉火色，他送你一份药渣，还讲了段辨药的门道。',
            tone: 'ev1',
            effects: [grantHerb('herb_yanxin', 2), { op: 'gainInsight', value: 2 }],
          },
        ],
      },
      {
        id: 'leave',
        label: '径直走过',
        hint: { risk: 0, reward: 0 },
        outcomes: [
          {
            text: '你记下药摊位置，留待日后再来。',
            tone: 'ev1',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_alc_old_room',
    title: '丹房遗承',
    category: 'alchemy',
    body: '半塌的石屋里还立着一座丹炉，炉膛冷透，壁上却留着一排排工整的火候批注。',
    levelMin: 20,
    levelMax: 70,
    weight: 80,
    once: true,
    choices: [
      {
        id: 'copy',
        label: '抄录批注',
        hint: { risk: 0, reward: 3 },
        outcomes: [
          {
            text: '你照着批注演练了三日火候，又收走炉边残余的药材。',
            tone: 'gold',
            effects: [
              { op: 'setFlag', id: 'dan_hall', value: 1 },
              { op: 'learnRecipe', id: 'rec_pojing' },
              grantHerb('herb_zixia', 2),
              grantHerb('herb_leigen', 2),
              { op: 'gainInsight', value: 4 },
            ],
          },
        ],
      },
      {
        id: 'smelt',
        label: '拆炉取料',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            text: '炉壁中的耐火精砂被你敲了下来，拿去换了些药材。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'artifactPower' }, value: 60 },
              grantHerb('herb_zixia', 2),
              { op: 'add', target: { k: 'toxicity' }, value: 4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_alc_garden',
    title: '辟圃种药',
    category: 'alchemy',
    body: '你在背风向阳处围出一小片药圃，泥土松软，只是种子还得自己去找。',
    levelMin: 15,
    levelMax: 90,
    weight: 90,
    cooldownYears: 12,
    choices: [
      {
        id: 'plant',
        label: '撒下药种',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '数月后药苗齐整，你收了第一茬。',
            tone: 'ev1',
            effects: [grantHerb('herb_baihua', 2), grantHerb('herb_muxi', 2), grantHerb('herb_jinying', 1)],
          },
        ],
      },
      {
        id: 'wild',
        label: '只取野生的',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你不愿费心打理，顺手采了几株野药便走。',
            tone: 'ev1',
            effects: [grantHerb('herb_muxi', 2), grantHerb('herb_tiexian', 1)],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_alc_marsh',
    title: '毒沼采药',
    category: 'alchemy',
    body: '沼面上浮着一层青紫的雾，雾里却生着药性极烈的几味毒草——寻常丹师不敢近前。',
    levelMin: 30,
    levelMax: 95,
    weight: 85,
    cooldownYears: 10,
    choices: [
      {
        id: 'wade',
        label: '屏息涉水',
        enable: { op: 'toxicityAtMost', value: 60 },
        disabledReason: '需丹毒≤60',
        hint: { risk: 2, reward: 3 },
        outcomes: [
          {
            text: '你以灵力护住口鼻，采得毒草，回程时指尖已泛出青黑。',
            tone: 'red',
            effects: [
              grantHerb('herb_duyan', 2),
              grantHerb('herb_wugu', 2),
              grantHerb('herb_zhuoxin', 2),
              { op: 'addToxicity', value: 6 },
            ],
          },
        ],
      },
      {
        id: 'hook',
        label: '以长竿钩取',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            text: '你折了根长竿远远钩扯，只取到近岸的几株。',
            tone: 'ev1',
            effects: [grantHerb('herb_duyan', 1), grantHerb('herb_zhuoxin', 1)],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_alc_cold_pool',
    title: '寒潭深处',
    category: 'alchemy',
    body: '潭水冷得刺骨，水底隐约有几簇白玉般的药根，随暗流轻轻摆动。',
    levelMin: 40,
    levelMax: 100,
    weight: 80,
    cooldownYears: 11,
    choices: [
      {
        id: 'dive',
        label: '潜入潭底',
        hint: { risk: 2, reward: 3 },
        outcomes: [
          {
            text: '寒气侵入经脉，你却抱得满怀寒性药根浮出水面。',
            tone: 'ev2',
            effects: [
              grantHerb('herb_xuelian', 2),
              grantHerb('herb_xuanbing', 2),
              grantHerb('herb_hanjing', 2),
              { op: 'add', target: { k: 'toxicity' }, value: 4 },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: '候至冬月',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '冬月水落，你只取潭边浮根，稳妥无险。',
            tone: 'ev1',
            effects: [grantHerb('herb_hanjing', 2), grantHerb('herb_hanlu', 2)],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_alc_thunder_wood',
    title: '雷击古木',
    category: 'alchemy',
    body: '一株被天雷劈过的千年古木焦黑挺立，断口处却渗出清亮的汁液，隐隐带着电芒。',
    levelMin: 45,
    levelMax: 110,
    weight: 70,
    cooldownYears: 13,
    choices: [
      {
        id: 'cut',
        label: '剖取木心',
        hint: { risk: 1, reward: 3 },
        outcomes: [
          {
            text: '木心落地时炸起一串细雷，你按住手掌，取下了雷性药芯。',
            tone: 'ev2',
            effects: [grantHerb('herb_leigen', 2), grantHerb('herb_leiyin', 2), grantHerb('herb_leiji', 2)],
          },
        ],
      },
      {
        id: 'mark',
        label: '记下位置',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你把古木位置记在札记里，来日方长。',
            tone: 'ev1',
            effects: [grantHerb('herb_leizhu', 2), { op: 'gainInsight', value: 2 }],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_alc_master_talk',
    title: '丹师论火',
    category: 'alchemy',
    body: '茶馆里一位老丹师正与人争论「文火武火」，说到兴处，把盏中茶水都蘸着画起了火候曲线。',
    levelMin: 25,
    levelMax: 120,
    weight: 95,
    cooldownYears: 9,
    choices: [
      {
        id: 'debate',
        label: '上前请教',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你问得太急，被老丹师笑骂了一句，却也真学到了控火的关窍。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 3 }, grantHerb('herb_shenmu', 2)],
          },
        ],
      },
      {
        id: 'listen',
        label: '旁听不语',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你坐在角落听了一下午，把两派的火候说法都记了下来。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 2 }, grantHerb('herb_baihua', 1)],
          },
        ],
      },
      {
        id: 'leave',
        label: '置之一笑',
        hint: { risk: 0, reward: 0 },
        outcomes: [
          {
            text: '你觉得纸上谈火无益，起身走了。',
            tone: 'ev1',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_alc_dan_thief',
    title: '窃丹夜行',
    category: 'alchemy',
    body: '丹坊后墙的窗缝里飘出药香，窗内一炉新丹刚刚开炉，看样子守夜的道人已醉倒在案边。',
    levelMin: 35,
    levelMax: 130,
    weight: 60,
    cooldownYears: 15,
    choices: [
      {
        id: 'steal',
        label: '翻窗取丹',
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 60,
            text: '你摸出三枚温热的丹药，无声退走。',
            tone: 'gold',
            effects: [grantHerb('herb_fengxue', 2), { op: 'grantPill', id: 'pill_juqi_2', count: 1 }, { op: 'grantPill', id: 'pill_pojing_1', count: 1 }],
          },
          {
            weight: 40,
            text: '陶罐碰倒的声响惊动了守夜人，你只能夺门而出。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 4 },
              grantHerb('herb_fengxue', 1),
              { op: 'add', target: { k: 'toxicity' }, value: 5 },
            ],
          },
        ],
      },
      {
        id: 'trade_fair',
        label: '叩门求购',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 5 }],
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '道人揉着眼睛收下灵石，匀了你一枚成色平平的丹。',
            tone: 'ev1',
            effects: [{ op: 'grantPill', id: 'pill_juqi_1', count: 1 }, grantHerb('herb_jiuyou', 2)],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_alc_herb_for_recipe',
    title: '以药易方',
    category: 'alchemy',
    body: '一位游方丹师看上了你囊中的药草，说他手上有些丹方残页，愿意以药相换。',
    levelMin: 30,
    levelMax: 150,
    weight: 75,
    cooldownYears: 14,
    choices: [
      {
        id: 'swap',
        label: '以药草换残页',
        cost: [{ op: 'sub', target: { k: 'herb', id: 'herb_baihua' }, value: 2 }],
        hint: { risk: 0, reward: 3 },
        outcomes: [
          {
            text: '你把药草递过去，换回一叠边角磨损的丹方残页。',
            tone: 'gold',
            effects: [{ op: 'learnRecipe', id: 'rec_xuelian' }, { op: 'gainInsight', value: 3 }],
          },
        ],
      },
      {
        id: 'refuse',
        label: '婉言谢绝',
        hint: { risk: 0, reward: 0 },
        outcomes: [
          {
            text: '你舍不得那些药草，摇头作别。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 1 }],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_alc_immortal_garden',
    title: '仙圃遗种',
    category: 'alchemy',
    body: '云海之上竟有半亩仙圃，垄沟整齐得不像天成，田边还插着一块无字的玉牌。',
    levelMin: 101,
    levelMax: 200,
    weight: 90,
    cooldownYears: 20,
    choices: [
      {
        id: 'harvest',
        label: '取仙种',
        hint: { risk: 1, reward: 3 },
        outcomes: [
          {
            text: '你依着垄沟取了三味仙药，玉牌在你掌心微微一热，随即碎裂。',
            tone: 'rainbow',
            effects: [
              grantHerb('herb_daoyun', 2),
              grantHerb('herb_hundun', 2),
              grantHerb('herb_jiuyin', 2),
              { op: 'add', target: { k: 'toxicity' }, value: 6 },
            ],
          },
        ],
      },
      {
        id: 'respect',
        label: '只取一株',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你只摘了最边上的一株，向无字玉牌行了一礼。',
            tone: 'xian',
            effects: [grantHerb('herb_xuanhuang', 2), grantHerb('herb_daoyun', 1), { op: 'gainInsight', value: 5 }],
          },
        ],
      },
    ],
  }),

  // ── 循环供给（药市/采药常年可遇，保证丹修与毒修 build 不断料） ──
  defineEvent({
    id: 'ev_alc_pick_low',
    title: '山野采药',
    category: 'alchemy',
    body: '山野间的药草一茬接一茬，识得药性的人走一趟便不会空手而归。',
    levelMin: 1,
    levelMax: 40,
    weight: 150,
    cooldownYears: 2,
    choices: [
      {
        id: 'deep',
        label: '往深里走',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            text: '你钻了两道山坳，背篓见了底才出来，倒也收获不少。',
            tone: 'ev1',
            effects: [
              grantHerb('herb_tiexian', 3),
              grantHerb('herb_bailing', 3),
              grantHerb('herb_yanxin', 2),
              { op: 'addToxicity', value: 2 },
            ],
          },
        ],
      },
      {
        id: 'edge',
        label: '只采近处',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你沿着田埂慢慢走，顺手采了常见的几味。',
            tone: 'ev1',
            effects: [grantHerb('herb_yunwu', 3), grantHerb('herb_yinqi', 3), grantHerb('herb_common', 3)],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_alc_market_mid',
    title: '药行盘货',
    category: 'alchemy',
    body: '药行年末盘货，陈年药匣论堆作价，掌柜只求腾地方。',
    levelMin: 30,
    levelMax: 95,
    weight: 140,
    cooldownYears: 3,
    choices: [
      {
        id: 'bundle',
        label: '整堆收下',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 6 }],
        hint: { risk: 0, reward: 3 },
        outcomes: [
          {
            text: '你付了灵石，把两筐陈药整堆搬回住处。',
            tone: 'ev1',
            effects: [
              grantHerb('herb_baihua', 3),
              grantHerb('herb_zixia', 3),
              grantHerb('herb_hanshui', 3),
              grantHerb('herb_jinying', 2),
            ],
          },
        ],
      },
      {
        id: 'pick',
        label: '只拣三味',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你翻检半晌，拣出三味成色最好的。',
            tone: 'ev1',
            effects: [grantHerb('herb_baihua', 2), grantHerb('herb_hanshui', 2)],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_alc_pick_high',
    title: '绝地寻药',
    category: 'alchemy',
    body: '真正的上乘药材只长在绝地：寒潭之底、雷击之木、毒沼之心。',
    levelMin: 80,
    levelMax: 200,
    weight: 140,
    cooldownYears: 4,
    choices: [
      {
        id: 'risk',
        label: '三处都走一遭',
        enable: { op: 'toxicityAtMost', value: 70 },
        disabledReason: '需丹毒≤70',
        hint: { risk: 2, reward: 3 },
        outcomes: [
          {
            text: '寒毒雷气一齐侵入经脉，你却把三味绝品药材尽数收了。',
            tone: 'ev2',
            effects: [
              grantHerb('herb_xuanbing', 3),
              grantHerb('herb_leiji', 3),
              grantHerb('herb_dugu', 3),
              { op: 'addToxicity', value: 8 },
            ],
          },
        ],
      },
      {
        id: 'one',
        label: '只取一处',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你挑了最有把握的一处，稳妥取药而归。',
            tone: 'ev1',
            effects: [grantHerb('herb_hanpo', 3), grantHerb('herb_zhenyin', 2)],
          },
        ],
      },
    ],
  }),
];
