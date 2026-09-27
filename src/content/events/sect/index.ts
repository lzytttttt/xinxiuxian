
import type { EventDef } from '../../../engine/types/effects';

/* 宗门事件池：入宗邀请 8（按境界分段）+ 宗门政治 5 + 追杀链 3 + 叛宗邀请 1 + 大比 2 + 秘辛回响 1。
   贡献一律走 `gainContribution`（同门羁绊加成在引擎侧），张力走 `addTension`。
   入宗事件只给"外门弟子"身份 —— 职位靠贡献爬。 */

const joinEvents: EventDef[] = [
  {
    id: 'ev_sect_invite_taixu',
    title: '剑宗试剑',
    category: 'sect',
    body: '一位负剑的中年人在你面前停下："剑意不错。太虚剑宗正在收人，可愿一试？"',
    levelMin: 1,
    levelMax: 40,
    weight: 6,
    requires: { op: 'not', of: { op: 'sect', id: 'sect_taixu' } },
    choices: [
      {
        id: 'accept',
        label: '拔剑一试',
        outcomes: [
          {
            text: '你演了三式，他就点了头。',
            effects: [
              { op: 'sectJoin', id: 'sect_taixu' },
              { op: 'gainContribution', value: 20 },
              { op: 'gainInsight', value: 6 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: '谢过，我还想再走走',
        outcomes: [{ text: '他也不强求，只说了句"剑意别丢了"。', effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }] }],
      },
    ],
  },
  {
    id: 'ev_sect_invite_qingnang',
    title: '谷中招徒',
    category: 'sect',
    body: '青囊谷的女修看了看你的手："骨节匀称，可惜来晚了三年。要不要试试？"',
    levelMin: 1,
    levelMax: 40,
    weight: 6,
    requires: { op: 'not', of: { op: 'sect', id: 'sect_qingnang' } },
    choices: [
      {
        id: 'accept',
        label: '随她入谷',
        outcomes: [
          {
            text: '你入谷那日，丹房的火整整烧了一夜。',
            effects: [
              { op: 'sectJoin', id: 'sect_qingnang' },
              { op: 'grantHerb', id: 'herb_common', count: 4 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: '摇头',
        outcomes: [{ text: '"可惜。"她转身进了药圃。', effects: [{ op: 'log', text: '你错过了青囊谷的招揽。' }] }],
      },
    ],
  },
  {
    id: 'ev_sect_invite_xuanyue',
    title: '山路挑担',
    category: 'sect',
    body: '你遇见一个背着巨石的少年，他看了你一眼："帮我把这块石头抬上去，就算你入门了。"',
    levelMin: 1,
    levelMax: 40,
    weight: 6,
    requires: { op: 'not', of: { op: 'sect', id: 'sect_xuanyue' } },
    choices: [
      {
        id: 'accept',
        label: '抬',
        outcomes: [
          {
            text: '你把石头扛上了山。少年说："玄岳门收你了。"',
            effects: [
              { op: 'sectJoin', id: 'sect_xuanyue' },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: '不抬',
        outcomes: [{ text: '少年自己扛走了，没再看你一眼。', effects: [{ op: 'log', text: '你没有接下那座山门。' }] }],
      },
    ],
  },
  {
    id: 'ev_sect_invite_wandu',
    title: '窟口招揽',
    category: 'sect',
    body: '一个满脸紫斑的人蹲在洞口："敢不敢尝一口？尝了不死，万毒窟就算你一个。"',
    levelMin: 1,
    levelMax: 40,
    weight: 6,
    requires: { op: 'not', of: { op: 'sect', id: 'sect_wandu' } },
    choices: [
      {
        id: 'accept',
        label: '尝',
        outcomes: [
          {
            text: '那味道像烧红的铁。但你活下来了。',
            effects: [
              { op: 'sectJoin', id: 'sect_wandu' },
              { op: 'addToxicity', value: 10 },
              { op: 'grantHerb', id: 'herb_chiteng', count: 3 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: '不尝',
        outcomes: [{ text: '"聪明人。"他缩回了洞里。', effects: [{ op: 'log', text: '你没有进万毒窟。' }] }],
      },
    ],
  },
  {
    id: 'ev_sect_invite_jiuxiao',
    title: '雷下试胆',
    category: 'sect',
    body: '雷府的执事把一枚引雷符拍在你胸口："走到那根旗子下面站满一刻。活下来就入门。"',
    levelMin: 20,
    levelMax: 60,
    weight: 6,
    requires: { op: 'not', of: { op: 'sect', id: 'sect_jiuxiao' } },
    choices: [
      {
        id: 'accept',
        label: '走过去',
        outcomes: [
          {
            text: '一刻钟里你被劈了三次。执事把你扛出来时说："雷府的。"',
            effects: [
              { op: 'sectJoin', id: 'sect_jiuxiao' },
              { op: 'sub', target: { k: 'simPoints' }, value: 1 },
              { op: 'add', target: { k: 'root' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: '把符还给他',
        outcomes: [{ text: '"随你。"他撕了符。', effects: [{ op: 'log', text: '你与九霄雷府擦肩而过。' }] }],
      },
    ],
  },
  {
    id: 'ev_sect_invite_youming',
    title: '血书招揽',
    category: 'sect',
    body: '一封用血写的信落在你案上："幽冥魔宗不问出身，只问你敢不敢拿。"',
    levelMin: 20,
    levelMax: 100,
    weight: 5,
    requires: { op: 'not', of: { op: 'sect', id: 'sect_youming' } },
    choices: [
      {
        id: 'accept',
        label: '烧了回信，动身',
        outcomes: [
          {
            text: '你到的时候，山门没人接。往里走，才看见一地的剑。',
            effects: [
              { op: 'sectJoin', id: 'sect_youming' },
              { op: 'add', target: { k: 'luck' }, value: 2 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: '把信烧了',
        outcomes: [{ text: '灰落在地上，像一小片夜。', effects: [{ op: 'log', text: '你烧掉了幽冥魔宗的招揽。' }] }],
      },
    ],
  },
  {
    id: 'ev_sect_invite_taiyi',
    title: '符宗论道',
    category: 'sect',
    body: '太乙符宗的两位长老为一笔收势吵得不可开交，转头问你："你说，收还是放？"',
    levelMin: 40,
    levelMax: 120,
    weight: 5,
    requires: { op: 'not', of: { op: 'sect', id: 'sect_taiyi' } },
    choices: [
      {
        id: 'accept',
        label: '"一笔收不了，不如两笔"',
        outcomes: [
          {
            text: '两位长老同时愣住，然后同时笑了。"符宗要你。"',
            effects: [
              { op: 'sectJoin', id: 'sect_taiyi' },
              { op: 'gainInsight', value: 12 },
            ],
          },
        ],
      },
      {
        id: 'pass',
        label: '"晚辈不敢妄议"',
        outcomes: [{ text: '他们继续吵，你退了出来。', effects: [{ op: 'log', text: '你没入太乙符宗。' }] }],
      },
    ],
  },
  {
    id: 'ev_sect_invite_tianyin',
    title: '梵音相邀',
    category: 'sect',
    body: '晨钟未敲，一位僧人已在门外："施主心不静。天音寺有一味药，治这个。"',
    levelMin: 40,
    levelMax: 160,
    weight: 5,
    requires: { op: 'not', of: { op: 'sect', id: 'sect_tianyin' } },
    choices: [
      {
        id: 'accept',
        label: '随他上山',
        outcomes: [
          {
            text: '你在寺里住了七日，什么都没做，却觉得轻了。',
            effects: [
              { op: 'sectJoin', id: 'sect_tianyin' },
              { op: 'gainInsight', value: 10 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: '"我心自有归处"',
        outcomes: [{ text: '"那便好。"他合掌退了。', effects: [{ op: 'log', text: '你婉拒了天音寺。' }] }],
      },
    ],
  },
];

const politicsEvents: EventDef[] = [
  {
    id: 'ev_sect_contribution_praise',
    title: '长老的赏识',
    category: 'sect',
    body: '你在杂役里做得干净，管事的记了你一笔。',
    weight: 8,
    requires: { op: 'inSect' },
    choices: [
      {
        id: 'modest',
        label: '"分内之事"',
        outcomes: [
          {
            text: '管事的笑了笑，回头在册子上多写了一行。',
            effects: [{ op: 'gainContribution', value: 18 }],
          },
        ],
      },
      {
        id: 'ask',
        label: '顺势讨个差事',
        outcomes: [
          {
            text: '他给了你一件苦差，也给了你一个名字。',
            effects: [
              { op: 'gainContribution', value: 30 },
              { op: 'sub', target: { k: 'simPoints' }, value: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_sect_rival_clash',
    title: '两宗对峙',
    category: 'sect',
    body: '灵脉边上，两边的人已经拔了兵器。',
    weight: 5,
    levelMin: 20,
    requires: { op: 'sect', id: 'sect_taixu' },
    choices: [
      {
        id: 'push',
        label: '站到最前面',
        outcomes: [
          {
            text: '你一步不退。对面先收了剑。',
            effects: [
              { op: 'addTension', sect: 'sect_youming', value: 15 },
              { op: 'addTension', sect: 'sect_wandu', value: 15 },
              { op: 'gainContribution', value: 25 },
            ],
          },
        ],
      },
      {
        id: 'hold',
        label: '按住同门的手',
        outcomes: [
          {
            text: '你拦下了这一场。两边都不太高兴，但没死人。',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'gainContribution', value: 8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_sect_pill_gift',
    title: '丹房分丹',
    category: 'sect',
    body: '这一炉出了十二颗，管事的问你想要哪一颗。',
    weight: 6,
    requires: { op: 'rankAtLeast', rank: 1 },
    choices: [
      {
        id: 'take',
        label: '取一颗自己用',
        outcomes: [{ text: '你收进袖里。', effects: [{ op: 'grantPill', id: 'pill_juqi_1', count: 1 }] }],
      },
      {
        id: 'give',
        label: '让给同门',
        outcomes: [
          {
            text: '你把丹让了出去。这件事在门里传了几天。',
            effects: [{ op: 'gainContribution', value: 20 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_sect_secret_echo',
    title: '旧事重提',
    category: 'sect',
    body: '当年那位守阁的老头已经死了。他的话却在今天应验了一句。',
    weight: 4,
    requires: { op: 'flag', id: 'sect_secret_known', min: 1 },
    choices: [
      {
        id: 'write',
        label: '把这件事记下来',
        outcomes: [
          {
            text: '你把听到的写成一卷，塞进阁里最深一层。',
            effects: [{ op: 'gainInsight', value: 20 }],
          },
        ],
      },
      {
        id: 'forget',
        label: '当作没想起',
        outcomes: [{ text: '有些事，忘了比较安全。', effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }] }],
      },
    ],
  },
  {
    id: 'ev_sect_patrol_hard',
    title: '苦差',
    category: 'sect',
    body: '没人愿意去的那条巡道，又轮到你了。',
    weight: 7,
    requires: { op: 'inSect' },
    choices: [
      {
        id: 'go',
        label: '去',
        outcomes: [
          {
            text: '那条路上什么都没有。你在风雪里走完了它。',
            effects: [
              { op: 'gainContribution', value: 22 },
              { op: 'sub', target: { k: 'simPoints' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'buy',
        label: '花些代价换给别人',
        outcomes: [
          {
            text: '你花了些东西，换回半年的清闲。',
            effects: [{ op: 'sub', target: { k: 'insight' }, value: 10 }],
          },
        ],
      },
    ],
  },
];

const defectEvents: EventDef[] = [
  {
    id: 'ev_sect_defect_invite',
    title: '另一封请帖',
    category: 'sect',
    body: '{inviter}的使者深夜到访："你在{sect}的日子，我们看得清楚。换个地方，如何？"',
    weight: 0,
    requires: { op: 'defectReady' },
    choices: [
      {
        id: 'accept',
        label: '接下请帖',
        outcomes: [
          {
            text: '你把旧腰牌放在桌上，没有回头。',
            effects: [
              { op: 'defectDecide', accept: true },
              { op: 'setFlag', id: 'sect_defected' },
              { op: 'schedule', eventId: 'ev_sect_hunt_1', inYears: 1 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: '把请帖退回去',
        outcomes: [
          {
            text: '使者没多问，收起请帖走了。',
            effects: [{ op: 'defectDecide', accept: false }],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_sect_hunt_1',
    title: '追杀令（一）',
    category: 'sect',
    body: '旧宗门的追杀令贴到了你落脚的小镇。',
    weight: 0,
    requires: { op: 'flag', id: 'sect_defected', min: 1 },
    choices: [
      {
        id: 'run',
        label: '连夜离开',
        outcomes: [
          {
            text: '你走得很快，连灯都没熄。',
            effects: [
              { op: 'incFlag', id: 'sect_hunted' },
              { op: 'schedule', eventId: 'ev_sect_hunt_2', inYears: 3 },
              { op: 'sub', target: { k: 'simPoints' }, value: 1 },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: '留下，等他们来',
        outcomes: [
          {
            text: '来了三个人。走的时候只剩两个。',
            effects: [
              { op: 'incFlag', id: 'sect_hunted' },
              { op: 'schedule', eventId: 'ev_sect_hunt_2', inYears: 3 },
              { op: 'gainInsight', value: 10 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_sect_hunt_2',
    title: '追杀令（二）',
    category: 'sect',
    body: '这一次来的是内门弟子，他认识你。',
    weight: 0,
    requires: { op: 'flag', id: 'sect_hunted', min: 1, max: 1 },
    choices: [
      {
        id: 'talk',
        label: '"回去告诉他们，我不欠了"',
        outcomes: [
          {
            text: '他犹豫了很久，收了剑。',
            effects: [
              { op: 'incFlag', id: 'sect_hunted' },
              { op: 'add', target: { k: 'luck' }, value: 2 },
            ],
          },
        ],
      },
      {
        id: 'fight',
        label: '先动手',
        outcomes: [
          {
            text: '你赢得很干脆，也因此再没有回头的余地。',
            effects: [
              { op: 'incFlag', id: 'sect_hunted' },
              { op: 'schedule', eventId: 'ev_sect_hunt_3', inYears: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ev_sect_hunt_3',
    title: '追杀令（三）',
    category: 'sect',
    body: '第三批人来得悄无声息。你醒来时，刀已经架在颈上。',
    weight: 0,
    requires: { op: 'flag', id: 'sect_hunted', min: 2, max: 2 },
    choices: [
      {
        id: 'surrender',
        label: '认了',
        outcomes: [
          {
            text: '你被押回去，挨了三年的禁闭，又被放了出来。',
            effects: [
              { op: 'incFlag', id: 'sect_hunted' },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
            ],
          },
        ],
      },
      {
        id: 'escape',
        label: '拼一把',
        outcomes: [
          {
            text: '你从刀下滚了出去。代价是左臂上的一道深口。',
            effects: [
              { op: 'incFlag', id: 'sect_hunted' },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
              { op: 'add', target: { k: 'root' }, value: -1 },
            ],
          },
        ],
      },
    ],
  },
];

const tournamentEvents: EventDef[] = [
  {
    id: 'ev_sect_tournament_herald',
    title: '大比将启',
    category: 'sect',
    body: '宗门二十年一次的大比就在今年。演武场上的旗子已经挂起来了。',
    weight: 6,
    requires: { op: 'inSect' },
    choices: [
      {
        id: 'prepare',
        label: '闭关备战',
        outcomes: [
          {
            text: '你把这三年的功课从头理了一遍。',
            effects: [{ op: 'gainInsight', value: 12 }],
          },
        ],
      },
      {
        id: 'rest',
        label: '养精蓄锐',
        outcomes: [{ text: '你什么也没做，睡了很多觉。', effects: [{ op: 'add', target: { k: 'simPoints' }, value: 2 }] }],
      },
    ],
  },
  {
    id: 'ev_sect_tournament_after',
    title: '榜下众人',
    category: 'sect',
    body: '大比的榜贴在正门上。有人笑，有人把榜角攥皱了。',
    weight: 4,
    requires: { op: 'inSect' },
    choices: [
      {
        id: 'watch',
        label: '站在人群里看一会儿',
        outcomes: [
          {
            text: '你看了很久。下一场，你想站到榜的最上面。',
            effects: [{ op: 'gainContribution', value: 12 }],
          },
        ],
      },
      {
        id: 'go',
        label: '转身就走',
        outcomes: [{ text: '榜上的名字你一个也不认识。', effects: [{ op: 'log', text: '你离开了榜下。' }] }],
      },
    ],
  },
];

export const SECT_EVENTS: EventDef[] = [
  ...joinEvents,
  ...politicsEvents,
  ...defectEvents,
  ...tournamentEvents,
];
