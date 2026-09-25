import { defineEvent } from '../../../engine/registry';
import type { EventDef } from '../../../engine/types/effects';

export const IMMORTAL_UPPER = [
  defineEvent({
    id: 'ev_imm_upper_law_vacant',
    title: '法则空悬',
    category: 'fate',
    tierMin: 3,
    tierMax: 3,
    weight: 30,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 12,
    body: '天地间有一道法则忽然空悬，旧主已陨，无人接掌。法则之下万灵照旧生灭，只是再无人向它问话。',
    choices: [
      {
        id: 'resolve',
        label: '伸手，接住它',
        outcomes: [
          {
            weight: 55,
            tone: 'xian',
            text: '法则落在你掌心，认了你的气息。自此你若开口，天地会听。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 10 },
              { op: 'gainInsight', value: 6 },
            ],
          },
          {
            weight: 30,
            text: '法则自你指缝间流过，只在识海留下一道浅浅的痕。',
            effects: [{ op: 'gainInsight', value: 8 }],
          },
          {
            weight: 15,
            tone: 'red',
            text: '你伸得太急，被法则反震。此后许久，气机都不太顺。',
            effects: [
              { op: 'addToxicity', value: 10 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_wager_heaven',
    title: '与天对赌',
    category: 'fate',
    tierMin: 4,
    tierMax: 4,
    weight: 8,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 15,
    body: '天地把一枚未落定的"因"放在你面前，却不告诉你赌注是什么。',
    choices: [
      {
        id: 'resolve',
        label: '押上',
        outcomes: [
          {
            weight: 45,
            tone: 'gold',
            text: '因果落定，天地认了这次赌。你的道又重了一分。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 15 },
              { op: 'add', target: { k: 'luck' }, value: 15 },
              { op: 'log', text: '与天对赌，你赢了。', tone: 'gold' },
            ],
          },
          {
            weight: 35,
            text: '平局。天地收回它的因，你收回你的果。',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'log', text: '天地与你，两不相欠。', tone: 'ev4' },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '你输了。天地取走的不是命，是你的一部分来历。',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 12 },
              { op: 'addToxicity', value: 15 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_old_companion',
    title: '旧人坐化',
    category: 'bond',
    tierMin: 2,
    tierMax: 2,
    weight: 60,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 12,
    body: '一位旧日同道坐化了。他托人带话给你，只有四个字：不必来看。',
    choices: [
      {
        id: 'resolve',
        label: '斟一盏，遥遥一敬',
        outcomes: [
          {
            weight: 50,
            text: '你把酒洒在他坐过的石上。风过时，像有人应了一声。',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'add', target: { k: 'luck' }, value: 12 },
            ],
          },
          {
            weight: 30,
            text: '你终究去了。他的道场很干净，干净得像无人来过。',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
            ],
          },
          {
            weight: 20,
            text: '你没有去。走到极处的人，本就不必有人相送。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 12 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_last_look_back',
    title: '回望凡尘',
    category: 'world',
    tierMin: 2,
    tierMax: 2,
    weight: 80,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 14,
    body: '途经一方小世界，你停住。山下有人正在渡他此生第一场雷劫，慌乱，笨拙，像很多年前的你。',
    choices: [
      {
        id: 'resolve',
        label: '看了一会儿',
        outcomes: [
          {
            weight: 60,
            text: '你没有出手。雷云散时他还活着。你转身走了，谁也没看见你来过。',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 40,
            text: '你替他拨开一线雷。他不知道是谁，你也不打算让他知道。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'gainInsight', value: 5 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_passing_the_dao',
    title: '道统有继',
    category: 'fate',
    tierMin: 3,
    tierMax: 3,
    weight: 35,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 13,
    body: '一个年轻人在你道场外跪了九日，只求一句指点。他资质平庸，眼神却像烧着的东西。',
    choices: [
      {
        id: 'resolve',
        label: '传他一句',
        outcomes: [
          {
            weight: 60,
            tone: 'gold',
            text: '你只说了三句话，他磕了三个头。多年后你听说，他走得比你当年稳。',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'add', target: { k: 'luck' }, value: 12 },
              { op: 'log', text: '道统有了去处。', tone: 'gold' },
            ],
          },
          {
            weight: 40,
            text: '你把那条路指给他，却隐去最难的一处。能不能过，是他的事。',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_sever_knot',
    title: '了断心魔',
    category: 'tribulation',
    tierMin: 3,
    tierMax: 3,
    weight: 40,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 12,
    body: '证道之前，那点旧心魔又来了。它借着你最不肯认的那一面站在你面前，安静地看着你。',
    choices: [
      {
        id: 'resolve',
        label: '与它对视',
        outcomes: [
          {
            weight: 55,
            text: '你没有斩它，也没有认它。它等了很久，最后自己散了。',
            effects: [
              {
                op: 'if',
                cond: { op: 'cmp', target: { k: 'toxicity' }, cmp: '<=', value: 40 },
                then: [
                  { op: 'gainInsight', value: 8 },
                  { op: 'add', target: { k: 'luck' }, value: 10 },
                ],
                else: [
                  { op: 'gainInsight', value: 5 },
                  { op: 'addToxicity', value: 5 },
                ],
              },
            ],
          },
          {
            weight: 30,
            tone: 'gold',
            text: '你一剑劈碎了它。碎片落进道基，成了几粒洗不掉的砂。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 12 },
              { op: 'addToxicity', value: 12 },
            ],
          },
          {
            weight: 15,
            tone: 'red',
            text: '你终究没看住它。那一夜心口发烫，像有人在你体内点了一盏灯。',
            effects: [
              { op: 'addToxicity', value: 18 },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_hoard_chaos',
    title: '星墟取气',
    category: 'fate',
    tierMin: 4,
    tierMax: 4,
    weight: 13,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 15,
    body: '天地初开时遗下的一缕混沌气，沉在一处将熄的星墟里。取它，就要替那片星墟撑住最后一刻。',
    choices: [
      {
        id: 'resolve',
        label: '进去',
        outcomes: [
          {
            weight: 50,
            tone: 'xian',
            text: '混沌气入体，沉在丹田最深处。你替那片星墟撑到了它自己熄灭。',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'log', text: '得混沌气×1。', tone: 'xian' },
            ],
          },
          {
            weight: 35,
            text: '你取走了气，也带走了星墟最后一缕余烬。它在你的法宝上烧出一枚亮斑，久不熄灭。',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'pct', target: { k: 'artifactPower' }, value: 6 },
              { op: 'addToxicity', value: 10 },
            ],
          },
          {
            weight: 15,
            tone: 'red',
            text: '还是晚了。混沌气随星墟一同湮灭，只在记忆里留下一线余温。',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_world_as_stake',
    title: '以界为薪',
    category: 'fate',
    tierMin: 4,
    tierMax: 4,
    weight: 6,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 15,
    requires: {
      op: 'or',
      of: [
        { op: 'rootTierAtLeast', tier: 8 },
        { op: 'cmp', target: { k: 'chaosQi' }, cmp: '>=', value: 1 },
      ],
    },
    body: '一方小世界正在缓缓熄灭。它的存续被摆上你的道途，作为一枚可用的筹码。',
    choices: [
      {
        id: 'resolve',
        label: '把它押上去',
        outcomes: [
          {
            weight: 45,
            tone: 'gold',
            text: '你借那方世界的气运为薪。你的道亮了一分，那边的天暗了半分。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 15 },
              { op: 'addToxicity', value: 10 },
              { op: 'log', text: '以一界兴衰入局。', tone: 'rare' },
            ],
          },
          {
            weight: 35,
            text: '你终究没有动它，绕开那方世界，多走了很远的路。',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'add', target: { k: 'luck' }, value: 12 },
            ],
          },
          {
            weight: 20,
            text: '你伸手时，那方世界里有人抬起头看了你一眼。你收回了手。',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'add', target: { k: 'root' }, value: 10 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_silent_pinnacle',
    title: '云上一夜',
    category: 'fate',
    tierMin: 1,
    tierMax: 1,
    weight: 110,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 10,
    body: '某夜你坐在云上，忽然什么也不想做。天地在你身外安静运转，像一件穿旧了的衣服。',
    choices: [
      {
        id: 'sit',
        label: '坐着',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你什么都没做。那一夜过去，道行却深了一层。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 12 },
              { op: 'gainInsight', value: 6 },
            ],
          },
        ],
      },
      {
        id: 'gaze',
        label: '看了一夜',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '那一夜里，你第一次看清自己这条路的形状。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
        ],
      },
      {
        id: 'spread',
        label: '布云为席',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        hint: { risk: 2, reward: 3 },
        outcomes: [
          {
            weight: 70,
            text: '云被仙灵气引着铺开，托住你散漫的一夜。天亮时，定境比预想的深。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 14 },
              { op: 'gainInsight', value: 7 },
            ],
          },
          {
            weight: 30,
            text: '云台散了，你从半空落回山石上。剩下的半夜，怎么坐都不对。',
            tone: 'red',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'sub', target: { k: 'luck' }, value: 4 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_ask_heaven',
    title: '天问',
    category: 'fate',
    tierMin: 3,
    tierMax: 3,
    weight: 25,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 12,
    body: '你向天地问了一句话。没有回音，但云层翻涌了一下，像是被问到了。',
    choices: [
      {
        id: 'resolve',
        label: '等回答',
        outcomes: [
          {
            weight: 50,
            tone: 'xian',
            text: '云层裂开一线，落下一点光。你伸手接住，是一句没有声音的答。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 12 },
              { op: 'gainInsight', value: 8 },
            ],
          },
          {
            weight: 35,
            text: '等了三年，没有答。你笑了笑，收回了那句话。',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 15,
            tone: 'red',
            text: '天地没有答，却记住了你。此后你每一次推演，都比从前慢半分。',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 8 },
              { op: 'addToxicity', value: 10 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_cut_old_name',
    title: '门外旧名',
    category: 'fate',
    tierMin: 3,
    tierMax: 3,
    weight: 20,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 13,
    requires: { op: 'realmAtLeast', level: 181 },
    body: '踏入混元之前，有一段来路要留在门外——那是你曾经的名字、身份，与所有旧因果。',
    choices: [
      {
        id: 'resolve',
        label: '留在门外',
        outcomes: [
          {
            weight: 55,
            tone: 'xian',
            text: '你把那段来路放下，没有回头。门在身后合上，轻得像没有重量。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 13 },
              { op: 'gainInsight', value: 7 },
            ],
          },
          {
            weight: 30,
            text: '你又回头把它抱了起来。带着走，路会重些，但你还认得自己。',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'add', target: { k: 'luck' }, value: 12 },
            ],
          },
          {
            weight: 15,
            tone: 'red',
            text: '放下它的那一瞬，另一样东西也一起掉了。你没能分清哪一部分是自己。',
            effects: [
              { op: 'addToxicity', value: 15 },
              { op: 'sub', target: { k: 'luck' }, value: 10 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_law_duel',
    title: '同证一道',
    category: 'fate',
    tierMin: 2,
    tierMax: 2,
    weight: 70,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 12,
    body: '另一个与你同时走到这里的存在，在虚空中与你争同一道法则。你们对视了很久，谁都没有先动。',
    choices: [
      {
        id: 'resolve',
        label: '不退',
        outcomes: [
          {
            weight: 45,
            text: '你先动了。法则裂成两半，一人一半；半道法则沉进你的法器，替它添了一层光。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 12 },
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 8 },
            ],
          },
          {
            weight: 35,
            text: '你先退了。他得了法则，你得了他的道。这笔账你不觉得亏。',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'add', target: { k: 'luck' }, value: 15 },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '谁都没有收住。深空里散开一片余波，你在其中受了暗伤。',
            effects: [
              { op: 'addToxicity', value: 15 },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_old_keepsake',
    title: '凡界旧物',
    category: 'world',
    tierMin: 1,
    tierMax: 1,
    weight: 120,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 10,
    body: '储物袋最深处翻出一件凡界旧物，粗劣，无用，你却摸了很久。',
    choices: [
      {
        id: 'keep',
        label: '收好它',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你把它放回原处，动作轻得像替谁盖好了被子。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
        ],
      },
      {
        id: 'gaze',
        label: '看到天亮',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你看着它，忽然记起那个还没有名字的自己。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'gainInsight', value: 5 },
            ],
          },
        ],
      },
      {
        id: 'burn',
        label: '焚入道基',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        hint: { risk: 2, reward: 3 },
        outcomes: [
          {
            weight: 65,
            text: '你以仙灵气引火，把它烧成一小捧灰。灰落进道基，是温的。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 10 },
              { op: 'add', target: { k: 'luck' }, value: 6 },
            ],
          },
          {
            weight: 35,
            text: '火灭了，灰是冷的。你忽然想不起自己为什么要点这把火。',
            tone: 'red',
            effects: [
              { op: 'gainInsight', value: 7 },
              { op: 'addToxicity', value: 5 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_old_rival_grave',
    title: '故敌之碑',
    category: 'encounter',
    tierMin: 2,
    tierMax: 2,
    weight: 55,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 12,
    body: '你路过一处荒冢，碑上刻着一个旧敌的名字。碑前无花，只有风。',
    choices: [
      {
        id: 'resolve',
        label: '停一停',
        outcomes: [
          {
            weight: 50,
            text: '你在碑前站了一炷香。当年那些恨，如今只是一段旧事。',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 30,
            text: '你替他把碑扶正了。这件事你做得很认真。',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 20,
            text: '你没有停。走到这里的人，不该为一座土堆停下。',
            effects: [{ op: 'pct', target: { k: 'cultivation' }, value: 10 }],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_upper_quiet_year',
    title: '一年无事',
    category: 'world',
    tierMin: 1,
    tierMax: 1,
    weight: 100,
    levelMin: 151,
    levelMax: 200,
    cooldownYears: 10,
    body: '这一年什么也没有发生。云照旧过山，山照旧在。你在山中坐了一年。',
    choices: [
      {
        id: 'sit',
        label: '继续坐着',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '一年像一日。等你睁眼，境界已悄悄往前挪了一线。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 9 },
              { op: 'gainInsight', value: 5 },
            ],
          },
        ],
      },
      {
        id: 'think',
        label: '想一件事',
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你把这一年都用来想一件事。想到最后，那件事已经不在了。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'add', target: { k: 'luck' }, value: 5 },
            ],
          },
        ],
      },
      {
        id: 'stoke',
        label: '以年添炉',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 4 },
        disabledReason: '需模拟点≥4',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 2, reward: 3 },
        outcomes: [
          {
            weight: 70,
            text: '你截下一段闲年添进炉里。火不旺，却稳稳烧了一整年，法宝上多了一层包浆似的亮。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 7 },
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
            ],
          },
          {
            weight: 30,
            text: '年光散得比预想快，炉里只剩一层薄光。你坐着，把这件事想了一遍。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 9 },
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
            ],
          },
        ],
      },
    ],
  }),
] satisfies EventDef[];
