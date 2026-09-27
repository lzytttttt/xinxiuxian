
import type { EventDef } from '../../../engine/types/effects';

/* 赠礼 5 / 共渡难关 6 / 背叛 4 / 生死离别 5 = 20。
   背叛 4 条**全部**带 `bondStrain` 前置 —— 这是「非随机背刺」的可测试化（验收 5.7）：
   高好感 + 无长期冷落时，这四条一条都进不来。 */

const giftEvents: EventDef[] = [
  {
    id: 'ev_bond_gift_herb',
    title: '赠礼·药材',
    category: 'bond',
    body: '你手里多了一包药材 —— 是他/她上次提过想要的那一味。',
    weight: 8,
    requires: { op: 'bondReady', type: '挚友', minAffinity: 20, countAtLeast: 1 },
    choices: [
      {
        id: 'give',
        label: '送出去',
        outcomes: [
          {
            text: '"你怎么知道我要这个。"',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 10 },
              { op: 'sub', target: { k: 'insight' }, value: 4 },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: '自己留着',
        outcomes: [
          {
            text: '你把药材收进袖里。这一收，就再没拿出来。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '挚友', value: -5 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_gift_pill',
    title: '赠礼·丹药',
    category: 'bond',
    body: '他/她盯着你炉里那颗丹看了很久，没好意思开口。',
    weight: 7,
    requires: { op: 'bondReady', type: '挚友', minAffinity: 30, countAtLeast: 1 },
    choices: [
      {
        id: 'give',
        label: '"拿去吧"',
        outcomes: [
          {
            text: '接过去的时候手有点抖。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '挚友', value: 14 }],
          },
        ],
      },
      {
        id: 'ask',
        label: '"你拿什么换"',
        outcomes: [
          {
            text: '他/她愣了一下，然后笑了："也是。"',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '挚友', value: -8 },
              { op: 'add', target: { k: 'insight' }, value: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_gift_artifact',
    title: '赠礼·法宝',
    category: 'bond',
    body: '一件旧法宝躺在你手里。它不值钱，但你记得是谁给你的。',
    weight: 6,
    requires: { op: 'bondReady', type: '挚友', minAffinity: 40, countAtLeast: 1 },
    choices: [
      {
        id: 'pass',
        label: '转送给更需要的那个',
        outcomes: [
          {
            text: '旧东西换了个主人，这份情却换了两份。',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 8 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: '留着',
        outcomes: [{ text: '你把它挂在腰间，一直挂着。', effects: [{ op: 'bondAct', action: 'affinity', type: '挚友', value: 3 }] }],
      },
    ],
  },
  {
    id: 'ev_bond_gift_master',
    title: '孝敬师父',
    category: 'bond',
    body: '师父的蒲团已经磨破了边。',
    weight: 7,
    requires: { op: 'bondReady', type: '师徒', minAffinity: 20, countAtLeast: 1 },
    choices: [
      {
        id: 'buy',
        label: '买一张新的',
        outcomes: [
          {
            text: '他看了一眼："旧的还能用。"但第二天就换了。',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '师徒', value: 12 },
              { op: 'sub', target: { k: 'insight' }, value: 6 },
            ],
          },
        ],
      },
      {
        id: 'mend',
        label: '自己补一补',
        outcomes: [
          {
            text: '针脚歪歪扭扭。他每次坐下都要看一眼。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '师徒', value: 15 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_gift_partner',
    title: '道侣之礼',
    category: 'bond',
    body: '他/她送你一枚玉坠，玉上有很细的一道裂。',
    weight: 7,
    requires: { op: 'bondReady', type: '道侣', minAffinity: 40, countAtLeast: 1 },
    choices: [
      {
        id: 'wear',
        label: '戴上，不解下来',
        outcomes: [
          {
            text: '"裂了的地方最暖。"',
            effects: [{ op: 'bondAct', action: 'affinity', type: '道侣', value: 10 }],
          },
        ],
      },
      {
        id: 'ask',
        label: '"这裂是怎么来的"',
        outcomes: [
          {
            text: '他/她讲了半个故事就停了。"以后再说吧。"',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '道侣', value: 6 },
              { op: 'gainInsight', value: 8 },
            ],
          },
        ],
      },
    ],
  },
];

const trialEvents: EventDef[] = [
  {
    id: 'ev_bond_trial_daoluo',
    title: '并行渡劫',
    category: 'bond',
    body: '劫云压下来的时候，他/她还站在你身边，没有退。',
    weight: 6,
    levelMin: 40,
    requires: { op: 'bondReady', type: '挚友', minAffinity: 60, countAtLeast: 1 },
    choices: [
      {
        id: 'shield',
        label: '把他/她挡在身后',
        outcomes: [
          {
            text: '你替两个人挨了那道雷。',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 18 },
              { op: 'bondAct', action: 'levelUp', type: '挚友' },
            ],
          },
        ],
      },
      {
        id: 'together',
        label: '并肩接雷',
        outcomes: [
          {
            text: '雷分成了两半。两个人都活着。',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 1 },
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 12 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_trial_rescue',
    title: '秘境救援',
    category: 'bond',
    body: '传讯符碎了。他/她在三十里外的洞里，只剩半炷香。',
    weight: 6,
    requires: { op: 'bondReady', type: '挚友', minAffinity: 50, countAtLeast: 1 },
    choices: [
      {
        id: 'rush',
        label: '不计代价赶过去',
        outcomes: [
          {
            text: '你赶到的时候他/她还有气。你背着他/她走了一夜。',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 20 },
            ],
          },
        ],
      },
      {
        id: 'slow',
        label: '先摸清地形',
        outcomes: [
          {
            text: '你进去的时候，洞里已经没有呼吸声了。',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '挚友', value: -12 },
              { op: 'log', text: '你晚了一步。' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_trial_avenge',
    title: '仇家追杀',
    category: 'bond',
    body: '一伙人堵在门口，为首的说："把那个人交出来，你可以走。"',
    weight: 6,
    levelMin: 20,
    requires: { op: 'bondReady', type: '挚友', minAffinity: 40, countAtLeast: 1 },
    choices: [
      {
        id: 'hold',
        label: '挡在门前',
        outcomes: [
          {
            text: '你没让开。天亮的时候，门口只剩你一个人站着。',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 16 },
            ],
          },
        ],
      },
      {
        id: 'negotiate',
        label: '"你们要的是他，不是我"',
        outcomes: [
          {
            text: '你让开了。他没怪你，但你们再没说过话。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '挚友', value: -20 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_trial_partner_break',
    title: '双修瓶颈',
    category: 'bond',
    body: '两个人的修为再也推不动对方了。这一夜谁都没开口。',
    weight: 6,
    levelMin: 60,
    requires: { op: 'bondReady', type: '道侣', minAffinity: 60, countAtLeast: 1 },
    choices: [
      {
        id: 'endure',
        label: '耗下去，总会过',
        outcomes: [
          {
            text: '你们耗了十年。过不去的那道坎，最后是自己松的。',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '道侣', value: 8 },
              { op: 'gainInsight', value: 20 },
            ],
          },
        ],
      },
      {
        id: 'split',
        label: '分开走一段',
        outcomes: [
          {
            text: '"各自走走，再回来。"可谁都知道，不一定会回来。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '道侣', value: -15 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_trial_sect_war',
    title: '宗门战阵',
    category: 'bond',
    body: '宗门列阵，他被排在另一队。隔着两百步，你们看见了彼此。',
    weight: 5,
    levelMin: 30,
    requires: {
      op: 'and',
      of: [{ op: 'inSect' }, { op: 'bondType', type: '同门', countAtLeast: 1 }],
    },
    choices: [
      {
        id: 'protect',
        label: '阵中替他挡着',
        outcomes: [
          {
            text: '你在乱军里替他挡了一刀。回营时他跪下来给你上药。',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '同门', value: 16 },
              { op: 'sub', target: { k: 'simPoints' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'ignore',
        label: '各按各的令走',
        outcomes: [
          {
            text: '你们谁都没看谁。仗打完了，谁也没提那天的事。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '同门', value: -8 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_trial_rival_help',
    title: '宿敌援手',
    category: 'bond',
    body: '你被围住了。跳进场中的，是那个和你打了三场的人。',
    weight: 5,
    levelMin: 30,
    requires: { op: 'bondReady', type: '宿敌', minAffinity: 20, countAtLeast: 1 },
    choices: [
      {
        id: 'accept',
        label: '与他背靠背',
        outcomes: [
          {
            text: '两个人打散了三十个。收剑时他说："这次算平。"',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '宿敌', value: 18 },
              { op: 'bondAct', action: 'levelUp', type: '宿敌' },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: '"不用你救"',
        outcomes: [
          {
            text: '你硬撑了下来，也硬撑掉了这段交情。',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
              { op: 'bondAct', action: 'affinity', type: '宿敌', value: -10 },
            ],
          },
        ],
      },
    ],
  },
];

const betrayEvents: EventDef[] = [
  {
    id: 'ev_bond_betray_whisper',
    title: '挑拨',
    category: 'bond',
    body: '有人在你们之间说了很多话。说的人是谁你不清楚，信了多少你也不清楚。',
    weight: 5,
    requires: { op: 'bondStrain', type: '挚友', minNeglect: 20, countAtLeast: 1 },
    choices: [
      {
        id: 'ask',
        label: '当面对质',
        outcomes: [
          {
            text: '话说到一半，两个人都不说了。有些裂已经在那儿了。',
            effects: [{ op: 'bondAct', action: 'break', type: '挚友', pick: 'low' }],
          },
        ],
      },
      {
        id: 'ignore',
        label: '当没听见',
        outcomes: [
          {
            text: '你什么都没问。可从那以后，你开始留意他/她的背影。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '挚友', pick: 'low', value: -12 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_betray_profit',
    title: '利益',
    category: 'bond',
    body: '一件东西只有一个主人。你们都知道那东西在谁手里更合适。',
    weight: 5,
    levelMin: 20,
    requires: { op: 'bondStrain', type: '同门', minNeglect: 20, countAtLeast: 1 },
    choices: [
      {
        id: 'take',
        label: '拿走',
        outcomes: [
          {
            text: '你拿走了。他站在原地看着你，没拦。',
            effects: [
              { op: 'bondAct', action: 'break', type: '同门', pick: 'low' },
              { op: 'gainInsight', value: 15 },
            ],
          },
        ],
      },
      {
        id: 'yield',
        label: '让给他',
        outcomes: [
          {
            text: '你让了。这份人情他大约是记不住的。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '同门', pick: 'low', value: 6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_betray_opposite',
    title: '宗门对立',
    category: 'bond',
    body: '对阵两边，一边是他的宗门，一边是你的。',
    weight: 5,
    levelMin: 30,
    requires: {
      op: 'and',
      of: [
        { op: 'inSect' },
        { op: 'bondStrain', type: '挚友', minNeglect: 15, countAtLeast: 1 },
      ],
    },
    choices: [
      {
        id: 'stand',
        label: '各为其主',
        outcomes: [
          {
            text: '你和他/她在阵前对了一招。这一招之后，就什么都没有了。',
            effects: [{ op: 'bondAct', action: 'break', type: '挚友', pick: 'low' }],
          },
        ],
      },
      {
        id: 'withdraw',
        label: '退出这场阵',
        outcomes: [
          {
            text: '你把兵器留在营里，走了。两边都不再认你。',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '挚友', pick: 'low', value: 10 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_betray_partner',
    title: '道侣离心',
    category: 'bond',
    body: '他/她已经三年没有回过这座山。',
    weight: 4,
    levelMin: 40,
    requires: { op: 'bondStrain', type: '道侣', minNeglect: 30, countAtLeast: 1 },
    choices: [
      {
        id: 'wait',
        label: '继续等',
        outcomes: [
          {
            text: '你又等了十年。山上的花开了十次，一次比一次安静。',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '道侣', pick: 'low', value: -10 },
              { op: 'gainInsight', value: 25 },
            ],
          },
        ],
      },
      {
        id: 'end',
        label: '把玉坠埋了',
        outcomes: [
          {
            text: '你挖了个坑，把玉坠放进去。土盖上以后，天正好亮了。',
            effects: [{ op: 'bondAct', action: 'break', type: '道侣', pick: 'low' }],
          },
        ],
      },
    ],
  },
];

const farewellEvents: EventDef[] = [
  {
    id: 'ev_bond_farewell_lifespan',
    title: '寿元将尽',
    category: 'bond',
    body: '他/她的寿元快到头了。他自己算得比谁都清楚。',
    weight: 5,
    levelMin: 30,
    requires: { op: 'bondType', type: '挚友', countAtLeast: 1 },
    choices: [
      {
        id: 'stay',
        label: '陪着',
        outcomes: [
          {
            text: '你陪他坐到最后一天。他说的最后一句话是"别送了"。',
            effects: [
              { op: 'bondAct', action: 'kill', type: '挚友' },
              { op: 'gainInsight', value: 30 },
            ],
          },
        ],
      },
      {
        id: 'leave',
        label: '出门去找续命的药',
        outcomes: [
          {
            text: '你回来的时候，院子里已经没人了。',
            effects: [
              { op: 'bondAct', action: 'kill', type: '挚友' },
              { op: 'add', target: { k: 'luck' }, value: -1 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_farewell_tribulation',
    title: '渡劫失败',
    category: 'bond',
    body: '劫云散了。散得比该散的早。',
    weight: 5,
    levelMin: 40,
    requires: { op: 'bondType', type: '挚友', countAtLeast: 1 },
    choices: [
      {
        id: 'collect',
        label: '去收殓',
        outcomes: [
          {
            text: '灰里只剩半枚玉牌，背面刻着你的名字。',
            effects: [
              { op: 'bondAct', action: 'kill', type: '挚友' },
              { op: 'gainInsight', value: 35 },
            ],
          },
        ],
      },
      {
        id: 'burn',
        label: '在劫云下面烧一炷香',
        outcomes: [
          {
            text: '香烧完，风把它吹散了。你转身下山。',
            effects: [
              { op: 'bondAct', action: 'kill', type: '挚友' },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_farewell_shield',
    title: '挡劫',
    category: 'bond',
    body: '那道雷本是冲你来的。他/她比你快了一步。',
    weight: 4,
    levelMin: 50,
    requires: { op: 'bondReady', type: '道侣', minAffinity: 60, countAtLeast: 1 },
    choices: [
      {
        id: 'catch',
        label: '接住他/她',
        outcomes: [
          {
            text: '接住的时候已经凉了。你抱着坐了三天。',
            effects: [
              { op: 'bondAct', action: 'kill', type: '道侣' },
              { op: 'gainInsight', value: 40 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
            ],
          },
        ],
      },
      {
        id: 'rage',
        label: '仰头骂天',
        outcomes: [
          {
            text: '你骂了很久。天没有回答，但你的道心从那天起不一样了。',
            effects: [
              { op: 'bondAct', action: 'kill', type: '道侣' },
              { op: 'add', target: { k: 'root' }, value: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_farewell_master',
    title: '师父坐化',
    category: 'bond',
    body: '师父在蒲团上坐了七天，第七天早上，呼吸停了。',
    weight: 5,
    levelMin: 40,
    requires: { op: 'bondType', type: '师徒', countAtLeast: 1 },
    choices: [
      {
        id: 'inherit',
        label: '接过他的玉简',
        outcomes: [
          {
            text: '玉简还是温的。',
            effects: [
              { op: 'bondAct', action: 'kill', type: '师徒' },
              { op: 'gainInsight', value: 45 },
            ],
          },
        ],
      },
      {
        id: 'bury',
        label: '先把他葬了',
        outcomes: [
          {
            text: '你在后山挖了个坑，把那枚玉简一起放了进去。',
            effects: [
              { op: 'bondAct', action: 'kill', type: '师徒' },
              { op: 'add', target: { k: 'luck' }, value: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_farewell_rival',
    title: '最后一战',
    category: 'bond',
    body: '他老了。他自己也知道。但他还是来了。',
    weight: 4,
    levelMin: 60,
    requires: { op: 'bondType', type: '宿敌', countAtLeast: 1 },
    choices: [
      {
        id: 'full',
        label: '使出全力',
        outcomes: [
          {
            text: '他没有留手，你也没有。这是他想要的。',
            effects: [
              { op: 'bondAct', action: 'kill', type: '宿敌' },
              { op: 'add', target: { k: 'root' }, value: 2 },
              { op: 'gainInsight', value: 25 },
            ],
          },
        ],
      },
      {
        id: 'spare',
        label: '收剑',
        outcomes: [
          {
            text: '你收剑走了。他在背后喊了一句什么，风太大，你没听清。',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '宿敌', value: -20 },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
        ],
      },
    ],
  },
];

export const BOND_EVENTS_GIFT: EventDef[] = [
  ...giftEvents,
  ...trialEvents,
  ...betrayEvents,
  ...farewellEvents,
];
