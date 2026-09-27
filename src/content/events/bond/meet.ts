
import type { EventDef } from '../../../engine/types/effects';

/* 羁绊事件池：初遇 8 / 双修问道 6 / 赠礼 5 / 共渡难关 6 / 背叛 4 / 生死离别 5 / 前世道侣 1 = 35。
   关系的**建立**一律走 `bond { action:'create' }`（引擎按 bond 流确定性生成 NPC），
   后续互动走 `bondAct`（按类型动态定位好感最高/最低的那个）——
   所以内容侧永远不需要知道 NPC 的 id。 */

const meetEvents: EventDef[] = [
  {
    id: 'ev_bond_meet_market',
    title: '坊市争执',
    category: 'bond',
    body: '坊市口，一男一女为半株药草吵得脸红。摊主缩在摊子后面不敢作声。',
    weight: 7,
    levelMin: 1,
    levelMax: 60,
    choices: [
      {
        id: 'mediate',
        label: '上去打圆场',
        outcomes: [
          {
            text: '你替他们分了个明白，两人都不服气，却都记了你一份情。',
            effects: [
              { op: 'bond', action: 'create', type: '挚友' },
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 6 },
            ],
          },
        ],
      },
      {
        id: 'buy',
        label: '把药草买下来，一人一半',
        outcomes: [
          {
            text: '你多花了几块灵石，换来一句"这个人可以处"。',
            effects: [
              { op: 'sub', target: { k: 'insight' }, value: 5 },
              { op: 'bond', action: 'create', type: '挚友' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_meet_ruin',
    title: '秘境同困',
    category: 'bond',
    body: '塌方的甬道把你们俩堵在了一起。灯快灭了，水只剩下半囊。',
    weight: 6,
    levelMin: 20,
    levelMax: 120,
    choices: [
      {
        id: 'share',
        label: '把水让给他',
        outcomes: [
          {
            text: '你渴了两天。他一句话没说，但把最后半块饼掰给了你。',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 1 },
              { op: 'bond', action: 'create', type: '挚友' },
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 12 },
            ],
          },
        ],
      },
      {
        id: 'dig',
        label: '少说话，先挖',
        outcomes: [
          {
            text: '你们挖了三天，各自出去时都瘦了一圈。',
            effects: [
              { op: 'bond', action: 'create', type: '挚友' },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_meet_sect',
    title: '同门之谊',
    category: 'bond',
    body: '新入门的弟子被老弟子支使着搬了一天的东西，蹲在墙角不吭声。',
    weight: 7,
    requires: { op: 'inSect' },
    choices: [
      {
        id: 'help',
        label: '替他把剩下的搬完',
        outcomes: [
          {
            text: '他抬头看你，眼睛有点红。',
            effects: [
              { op: 'bond', action: 'create', type: '同门' },
              { op: 'gainContribution', value: 8 },
            ],
          },
        ],
      },
      {
        id: 'teach',
        label: '教他怎么躲开这种活',
        outcomes: [
          {
            text: '第二天他就学会了。你觉得自己多了个跟班。',
            effects: [
              { op: 'bond', action: 'create', type: '同门' },
              { op: 'bondAct', action: 'affinity', type: '同门', value: 10 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_meet_beast',
    title: '妖兽袭村',
    category: 'bond',
    body: '一头受伤的妖兽冲进了村子。村民躲进祠堂，只有一个猎户挡在门口。',
    weight: 7,
    levelMin: 1,
    levelMax: 100,
    choices: [
      {
        id: 'kill',
        label: '先杀了再说',
        outcomes: [
          {
            text: '你一击断了它的颈。猎户看着你，眼神很复杂。',
            effects: [
              { op: 'bond', action: 'create', type: '挚友' },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'save',
        label: '先救人',
        outcomes: [
          {
            text: '你把猎户拖进门里，妖兽撞塌了半面墙。',
            effects: [
              { op: 'bond', action: 'create', type: '挚友' },
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 14 },
              { op: 'sub', target: { k: 'simPoints' }, value: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_meet_master',
    title: '树下论剑',
    category: 'bond',
    body: '一位境界远在你之上的修士看了你半天，忽然说："你这套路子，走错了。"',
    weight: 5,
    levelMin: 20,
    levelMax: 150,
    choices: [
      {
        id: 'learn',
        label: '请教',
        outcomes: [
          {
            text: '他教了你一个月，走了。走之前没留名字。',
            effects: [
              { op: 'bond', action: 'create', type: '师徒' },
              { op: 'gainInsight', value: 15 },
            ],
          },
        ],
      },
      {
        id: 'argue',
        label: '不服，与他辩',
        outcomes: [
          {
            text: '你辩输了，但他说："肯顶嘴的才有救。"',
            effects: [
              { op: 'bond', action: 'create', type: '师徒' },
              { op: 'bondAct', action: 'affinity', type: '师徒', value: 8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_meet_rival',
    title: '一场败仗',
    category: 'bond',
    body: '你输了。对方收剑而立："记住我的名字。下次别让我失望。"',
    weight: 6,
    levelMin: 10,
    levelMax: 200,
    requires: { op: 'not', of: { op: 'bondType', type: '宿敌', countAtLeast: 1 } },
    choices: [
      {
        id: 'remember',
        label: '把名字刻在剑柄上',
        outcomes: [
          {
            text: '那三个字此后每天都被你摸到。',
            effects: [
              { op: 'bond', action: 'create', type: '宿敌' },
              { op: 'add', target: { k: 'luck' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'forget',
        label: '不服，但不记',
        outcomes: [
          {
            text: '你连他姓什么都没问。',
            effects: [
              { op: 'bond', action: 'create', type: '宿敌' },
              { op: 'bondAct', action: 'affinity', type: '宿敌', pick: 'top', value: -5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_meet_immortal',
    title: '仙途重逢',
    category: 'bond',
    body: '飞升之后，你在云海之上看见一个熟悉的背影。他也看见了你。',
    weight: 5,
    levelMin: 100,
    levelMax: 200,
    choices: [
      {
        id: 'call',
        label: '叫住他',
        outcomes: [
          {
            text: '"你也上来了。"他说，"那就能再打一架了。"',
            effects: [{ op: 'bond', action: 'create', type: '挚友' }],
          },
        ],
      },
      {
        id: 'pass',
        label: '从旁边走过去',
        outcomes: [
          {
            text: '你们谁都没先开口。云海把两个人影分开。',
            effects: [{ op: 'log', text: '你与仙途故人擦肩而过。' }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_meet_child',
    title: '弃儿',
    category: 'bond',
    body: '雨里蹲着个孩子，怀里抱着一把比他还高的断剑。',
    weight: 5,
    levelMin: 1,
    levelMax: 80,
    choices: [
      {
        id: 'take',
        label: '带他走',
        outcomes: [
          {
            text: '他一路都没说话，但跟得很紧。',
            effects: [
              { op: 'bond', action: 'create', type: '师徒' },
              { op: 'sub', target: { k: 'simPoints' }, value: 1 },
              { op: 'bondAct', action: 'affinity', type: '师徒', value: 15 },
            ],
          },
        ],
      },
      {
        id: 'leave',
        label: '给他留下的东西，自己走',
        outcomes: [
          {
            text: '你走远了回头看，他还蹲在那里，抱着那把剑。',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }],
          },
        ],
      },
    ],
  },
];

const cultivateEvents: EventDef[] = [
  {
    id: 'ev_bond_partner_union',
    title: '结为道侣',
    category: 'bond',
    body: '你们在同一处山崖上坐了三天。第三天日落时，她把手伸了过来。',
    weight: 8,
    levelMin: 20,
    requires: {
      op: 'and',
      of: [
        { op: 'bondReady', type: '挚友', minAffinity: 80, countAtLeast: 1 },
        { op: 'not', of: { op: 'bondType', type: '道侣', countAtLeast: 1 } },
      ],
    },
    choices: [
      {
        id: 'accept',
        label: '握住那只手',
        outcomes: [
          {
            text: '"此后双修，同证大道。"',
            effects: [
              { op: 'bondAct', action: 'promote', type: '挚友', to: '道侣' },
              { op: 'bondAct', action: 'levelUp', type: '道侣' },
              { op: 'gainInsight', value: 20 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: '把手收回来',
        outcomes: [
          {
            text: '你没说话。她把手收回去，也没说话。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '挚友', pick: 'low', value: -10 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_partner_cultivate',
    title: '双修',
    category: 'bond',
    body: '灵气在两个人体内流转了一夜，天亮了谁都没起身。',
    weight: 10,
    requires: { op: 'bondReady', type: '道侣', minAffinity: 60, countAtLeast: 1 },
    choices: [
      {
        id: 'together',
        label: '继续',
        outcomes: [
          {
            text: '修为在两具身体之间来回冲刷，比独自苦修快得多。',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '道侣', value: 4 },
              { op: 'gainInsight', value: 10 },
            ],
          },
        ],
      },
      {
        id: 'alone',
        label: '各自清修',
        outcomes: [
          {
            text: '有些路，终究要一个人走一段。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '道侣', value: -6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_master_transmit',
    title: '传功',
    category: 'bond',
    body: '师父把一枚玉简按在你眉心："这一门你学不会，我也不会再教第二遍。"',
    weight: 8,
    requires: { op: 'bondReady', type: '师徒', minAffinity: 40, countAtLeast: 1 },
    choices: [
      {
        id: 'accept',
        label: '接',
        outcomes: [
          {
            text: '玉简里的东西在你识海里烧了整整一夜。',
            effects: [
              { op: 'gainInsight', value: 25 },
              { op: 'bondAct', action: 'affinity', type: '师徒', value: 6 },
            ],
          },
        ],
      },
      {
        id: 'defer',
        label: '"弟子根基未稳"',
        outcomes: [
          {
            text: '他收回玉简，什么也没说。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '师徒', value: -4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_friend_talk',
    title: '挚友论道',
    category: 'bond',
    body: '一坛酒，两把椅子，从日落聊到日出。',
    weight: 9,
    requires: { op: 'bondReady', type: '挚友', minAffinity: 40, countAtLeast: 1 },
    choices: [
      {
        id: 'argue',
        label: '跟他争到底',
        outcomes: [
          {
            text: '争到最后两个人都笑了。有些话，只有吵得起来的人才听得懂。',
            effects: [
              { op: 'gainInsight', value: 14 },
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 5 },
            ],
          },
        ],
      },
      {
        id: 'listen',
        label: '听他讲',
        outcomes: [
          {
            text: '他讲了半夜自己的旧事。你一句都没插。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '挚友', value: 10 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_rival_duel',
    title: '论剑之约',
    category: 'bond',
    body: '约定的日子到了。他在崖上等了三天，你在崖下站了三天。',
    weight: 8,
    requires: { op: 'bondReady', type: '宿敌', minAffinity: 0, countAtLeast: 1 },
    choices: [
      {
        id: 'fight',
        label: '拔剑',
        outcomes: [
          {
            text: '这一场打得很久，久到两个人都忘了输赢。',
            effects: [
              { op: 'gainInsight', value: 16 },
              { op: 'bondAct', action: 'affinity', type: '宿敌', value: 8 },
            ],
          },
        ],
      },
      {
        id: 'leave',
        label: '转身下山',
        outcomes: [
          {
            text: '他在崖上看着你走。他知道你在躲什么。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '宿敌', value: -8 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_bond_same_sect_study',
    title: '同门论法',
    category: 'bond',
    body: '夜里的经堂只剩一盏灯，他还在抄书。',
    weight: 8,
    requires: {
      op: 'and',
      of: [{ op: 'inSect' }, { op: 'bondReady', type: '同门', minAffinity: 40, countAtLeast: 1 }],
    },
    choices: [
      {
        id: 'sit',
        label: '坐下一起抄',
        outcomes: [
          {
            text: '你们抄到天亮，中间只说了三句话。',
            effects: [
              { op: 'gainInsight', value: 12 },
              { op: 'bondAct', action: 'affinity', type: '同门', value: 5 },
            ],
          },
        ],
      },
      {
        id: 'advise',
        label: '"抄书没用，去练"',
        outcomes: [
          {
            text: '他抬头看了你一眼，把笔放下了。',
            effects: [{ op: 'bondAct', action: 'affinity', type: '同门', value: 3 }],
          },
        ],
      },
    ],
  },
];

const pastLoverEvent: EventDef = {
  id: 'ev_bond_past_lover',
  title: '似曾相识',
  category: 'bond',
  body: '你在渡口看见一个人。你不认识他/她，可你站在那儿，一句话也说不出。对方也一样。',
  weight: 0,
  requires: {
    op: 'and',
    of: [
      { op: 'not', of: { op: 'bondType', type: '道侣', countAtLeast: 1 } },
      { op: 'cmp', target: { k: 'realmLevel' }, cmp: '<', value: 40 },
    ],
  },
  choices: [
    {
      id: 'recognize',
      label: '"……是你吗"',
      outcomes: [
        {
          text: '你记得他/她不记得的事。可这一句话之后，两个人都想起来了。',
          effects: [
            {
              op: 'bond',
              action: 'create',
              type: '道侣',
              name: '{pastPartner}',
              npcSeed: 'past-lover',
            },
            { op: 'bondAct', action: 'affinity', type: '道侣', value: 80 },
            { op: 'gainInsight', value: 25 },
          ],
        },
      ],
    },
    {
      id: 'pass',
      label: '低头走过',
      outcomes: [
        {
          text: '你走过他/她身边。走了十几步，才敢回头 —— 渡口已经空了。',
          effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }],
        },
      ],
    },
  ],
};

export const BOND_EVENTS_MEET: EventDef[] = [...meetEvents, ...cultivateEvents, pastLoverEvent];
