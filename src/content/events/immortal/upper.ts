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
      {
        id: 'let_it_fall',
        label: '让它落空',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '法则落进一个你认不得的人身上。他抬头看了你一眼，点了点头，像早就知道你会让开。你转身走了。',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'pct', target: { k: 'cultivation' }, value: 10 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
          {
            weight: 30,
            text: '它谁也没落，悬在半空，成了所有人心口的一点痒。你从此知道它在那儿，也仅止于此。',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'sub', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '你站得太近，法则擦着你的肩过去，烫掉了一层什么。此后你每次推演，总差半步落不到实处。',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
              { op: 'gainInsight', value: 4 },
            ],
          },
        ],
      },
      {
        id: 'bury_it',
        label: '替旧主送它一程',
        enable: { op: 'cmp', target: { k: 'chaosQi' }, cmp: '>=', value: 1 },
        disabledReason: '需混沌气×1',
        cost: [{ op: 'sub', target: { k: 'chaosQi' }, value: 1 }],
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 45,
            tone: 'gold',
            text: '你以混沌气追上它的来处，看见旧主陨落前最后一眼——原来他也在等一个接掌的人。然后你把它埋了。天下少了一条律，多了一段说不清的余地。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 15 },
              { op: 'gainInsight', value: 10 },
              { op: 'addToxicity', value: 8 },
              { op: 'log', text: '空悬的法则入土。', tone: 'xian' },
            ],
          },
          {
            weight: 35,
            text: '你埋得太深，连自己也找不回那条路了。此后你再问天，天只当没听见。',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'sub', target: { k: 'luck' }, value: 12 },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '旧主的因果顺着混沌气反缠上来。你埋掉的不是一条律，是自己的来路。醒来时，你不记得自己从哪里起步。',
            effects: [
              { op: 'addToxicity', value: 18 },
              { op: 'sub', target: { k: 'luck' }, value: 10 },
              { op: 'gainInsight', value: 6 },
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
      {
        id: 'ask_the_stake',
        label: '先问它，赌注是什么',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 45,
            text: '你问出口。天地没答，只把摊开的那枚"因"往你这边推了半寸。你看清了赌注——是你自己。',
            effects: [
              { op: 'gainInsight', value: 9 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
          {
            weight: 35,
            text: '它不答。沉默拖了很多年，你那句问话慢慢变成你常说的那句话，说的人也不再是你。',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '它答了。答的是你不想听的那一句。听完你就把"因"放了回去，没有再赌。',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 10 },
              { op: 'addToxicity', value: 8 },
            ],
          },
        ],
      },
      {
        id: 'wager_back',
        label: '把赌注原样押回去',
        enable: { op: 'cmp', target: { k: 'chaosQi' }, cmp: '>=', value: 1 },
        disabledReason: '需混沌气×1',
        cost: [{ op: 'sub', target: { k: 'chaosQi' }, value: 1 }],
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 35,
            tone: 'gold',
            text: '赌注太大，天地先认了输。那枚"因"落回你手里，成了一段谁也解释不清的运。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 18 },
              { op: 'add', target: { k: 'luck' }, value: 18 },
              { op: 'log', text: '与天对赌，你把赌注押了回去。', tone: 'gold' },
            ],
          },
          {
            weight: 35,
            text: '平局。因果打了个转回到原处，你的手上多了一圈烫痕，圈里写的还是同一句话。',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'addToxicity', value: 12 },
            ],
          },
          {
            weight: 30,
            tone: 'red',
            text: '它收了。混沌气烧尽，你的来历被削去一截——往后有人认得你的道，却没人认得你的人。',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 15 },
              { op: 'addToxicity', value: 10 },
              { op: 'gainInsight', value: 5 },
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
      {
        id: 'go_anyway',
        label: '还是去了',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 45,
            text: '你赶到了。灵前没有人，炉里的香还温着。你坐了一夜，把没说完的那半句说了。',
            effects: [
              { op: 'gainInsight', value: 9 },
              { op: 'pct', target: { k: 'cultivation' }, value: 9 },
              { op: 'add', target: { k: 'luck' }, value: 6 },
            ],
          },
          {
            weight: 30,
            text: '你赶到时，他刚走。道场干净得不像有人住过。你替他掩了门，回去的路比来时短了很多。',
            effects: [
              { op: 'gainInsight', value: 11 },
              { op: 'addToxicity', value: 8 },
            ],
          },
          {
            weight: 25,
            tone: 'red',
            text: '你去了，也确实送了他。回来后才想明白：极处的人不送人，是因为认得的那一个，也总在来的路上。',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 10 },
              { op: 'pct', target: { k: 'cultivation' }, value: -4 },
              { op: 'gainInsight', value: 6 },
            ],
          },
        ],
      },
      {
        id: 'pass_it_on',
        label: '把他没传完的那句，带给还活着的人',
        enable: { op: 'bondReady', type: '挚友', minAffinity: 60, countAtLeast: 1 },
        disabledReason: '需一位交情至深、尚在的挚友',
        hint: { risk: 1, reward: 3 },
        outcomes: [
          {
            weight: 55,
            tone: 'gold',
            text: '你把他最后那句原样转述，一个字没改。听的人沉默很久，说：我记下了。他也记下了。',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 15 },
              { op: 'log', text: '一句话越过了你，落到了下一个人身上。', tone: 'gold' },
            ],
          },
          {
            weight: 45,
            text: '话传出去，却走样了。他从前最不肯说的那半句，被人替他说成了另一个意思。',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '挚友', value: -6 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
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
      {
        id: 'go_down',
        label: '下去，替他挡完这一场',
        hint: { risk: 3, reward: 2 },
        outcomes: [
          {
            weight: 40,
            text: '你落在雷云底下，替他把九重都走了一遍。他活下来了，从此逢人便说那年天上有个人。你不认。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 12 },
              { op: 'addToxicity', value: 10 },
              { op: 'add', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 35,
            text: '你挡了八重。第九重认出了你，绕开他直奔你来。你带走了一段雷，也带走了一段因果。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'addToxicity', value: 16 },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 25,
            tone: 'red',
            text: '你落得太重，凡尘容不下仙。山下那场雷劫，连同山下的人，一起被你的余波抹平了。',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 15 },
              { op: 'addToxicity', value: 12 },
              { op: 'pct', target: { k: 'cultivation' }, value: -3 },
            ],
          },
        ],
      },
      {
        id: 'leave_a_wisp',
        label: '留一缕仙灵气在他身上，不现身',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 45,
            tone: 'gold',
            text: '他捡到了。没有人告诉他那是什么，他只当是运气。多年后你听见有个名字在凡间传得很响。',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 15 },
              { op: 'gainInsight', value: 6 },
            ],
          },
          {
            weight: 30,
            text: '他捡到了，也用上了。可一个凡人的身子接不住那缕气，反被推着连破三关，走得太快，摔得很响。',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 25,
            tone: 'red',
            text: '那缕气落在别人手里。乱了一整个村子的运数，连着山下三场旱。你没有回头去看。',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 12 },
              { op: 'addToxicity', value: 8 },
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
      {
        id: 'give_pill',
        label: '把一枚开天破境丹按进他手里',
        enable: { op: 'hasPill', id: 'pill_pojing_2', countAtLeast: 1 },
        disabledReason: '需开天破境丹×1',
        cost: [{ op: 'sub', target: { k: 'pill', id: 'pill_pojing_2' }, value: 1 }],
        hint: { risk: 2, reward: 3 },
        outcomes: [
          {
            weight: 50,
            tone: 'gold',
            text: '他接了，什么也没问。十年后你听说，他把那枚丹一直攥到该用的时候。你教出了一个不贪快的人。',
            effects: [
              { op: 'gainInsight', value: 9 },
              { op: 'add', target: { k: 'luck' }, value: 14 },
              { op: 'log', text: '道统有了去处。', tone: 'gold' },
            ],
          },
          {
            weight: 30,
            text: '他当场就吞了。关隘裂开，人也裂了半边——那种丹本该留给走不动的人，不是走得太急的人。',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
              { op: 'gainInsight', value: 6 },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '药力顺着你们之间那条未断的师徒线反噬回来。你在自己的道基上，看见了他的疼。',
            effects: [
              { op: 'addToxicity', value: 18 },
              { op: 'pct', target: { k: 'cultivation' }, value: -4 },
            ],
          },
        ],
      },
      {
        id: 'take_him',
        label: '收下他，从今往后你的道多一个人',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你让他起来。他起身时腿还在抖，之后再没抖过。他挂着一个名分走了，你身上从此多出一处要照看的地方。',
            effects: [
              { op: 'bond', action: 'create', type: '师徒' },
              { op: 'gainInsight', value: 8 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 30,
            text: '你收了他。他资质平庸，修到某一步就卡住了，此后许多年，你的话总在替他回答他答不出的问题。',
            effects: [
              { op: 'bond', action: 'create', type: '师徒' },
              { op: 'sub', target: { k: 'insight' }, value: 3 },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '他起身时抬头看你，那一眼你认得——和很多年前某个跪在山门前的人一模一样。你收下了，也知道这意味着什么。',
            effects: [
              { op: 'bond', action: 'create', type: '师徒' },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
              { op: 'addToxicity', value: 8 },
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
      {
        id: 'feed_it',
        label: '把混沌气引过来，让它没有形状可站',
        enable: { op: 'cmp', target: { k: 'chaosQi' }, cmp: '>=', value: 1 },
        disabledReason: '需混沌气×1',
        cost: [{ op: 'sub', target: { k: 'chaosQi' }, value: 1 }],
        hint: { risk: 1, reward: 3 },
        outcomes: [
          {
            weight: 55,
            tone: 'gold',
            text: '混沌气一过，它就不是什么了，连恨都挂不住。你第一次觉得道基干净得像个空屋子——空是空了点。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 14 },
              { op: 'set', target: { k: 'toxicity' }, value: 0 },
              { op: 'log', text: '心魔为混沌气所化，不复成形。', tone: 'xian' },
            ],
          },
          {
            weight: 45,
            text: '它化得比你预想的干净，连你也跟着空了一段。往后少了那个提醒你的东西，你偶尔会走神。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 9 },
              { op: 'gainInsight', value: 7 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
        ],
      },
      {
        id: 'say_it_aloud',
        label: '把它的样子说给一个人听',
        enable: { op: 'bondReady', type: '挚友', minAffinity: 55, countAtLeast: 1 },
        disabledReason: '需一位交情至深、尚在的挚友',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你说了很久。说到后来，它变成了一段笑话，不再是一个能站住的东西。听的人一直没打断你。',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 18 },
              { op: 'gainInsight', value: 8 },
            ],
          },
          {
            weight: 30,
            text: '你说着说着哭了。眼泪不体面，可它确实散了。有些东西只有被说出口才肯走。',
            effects: [
              { op: 'bondAct', action: 'affinity', type: '挚友', value: 12 },
              { op: 'addToxicity', value: 8 },
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '你把它说给了不该说的人。那人替你记着，也替你念着。此后每次静坐，它都有人替它开门。',
            effects: [
              { op: 'addToxicity', value: 16 },
              { op: 'sub', target: { k: 'luck' }, value: 10 },
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
      {
        id: 'grab_and_go',
        label: '抢一把就走，不替它撑',
        hint: { risk: 3, reward: 2 },
        outcomes: [
          {
            weight: 45,
            tone: 'gold',
            text: '你攥住那缕混沌气就跑。身后星墟熄得很干脆，像一个人终于把话说完。你没回头。',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'sub', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 30,
            text: '你抢到了手，星墟的余烬也追着烧进来。它在你法宝上留了一道亮斑，抹不掉，也没人能认得那是什么。',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'pct', target: { k: 'artifactPower' }, value: 6 },
              { op: 'addToxicity', value: 14 },
            ],
          },
          {
            weight: 25,
            tone: 'red',
            text: '你晚了一步。那片星墟临熄前把你也认成了它的一部分，此后每逢推演，都有人在你耳边催。',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 12 },
              { op: 'addToxicity', value: 12 },
              { op: 'gainInsight', value: 6 },
            ],
          },
        ],
      },
      {
        id: 'hold_it_up',
        label: '先替它续一刻，再取',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        hint: { risk: 1, reward: 3 },
        outcomes: [
          {
            weight: 50,
            tone: 'gold',
            text: '仙灵气撑住的那一息，星墟自己站稳了。它把气递给你，又把一小片旧天光塞进你怀里，当作谢礼。',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'add', target: { k: 'luck' }, value: 15 },
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
            ],
          },
          {
            weight: 50,
            text: '你撑住了它，它却没能撑住自己。你带着气走了，那一刻的余光落在你身上，久久不散。',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'gainInsight', value: 8 },
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
      {
        id: 'inscribe_name',
        label: '不押，也不救——把它的名字刻在道基上',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你在道基上刻下那方世界的名字。此后凡有人问起，你答得出它在哪、叫什么、最后一夜是什么样子。',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'add', target: { k: 'luck' }, value: 12 },
            ],
          },
          {
            weight: 30,
            text: '名字刻进去了，那份牵挂也刻进去了。此后每逢突破，那道刻痕都要还一次债——你还，照付。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -6 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
              { op: 'gainInsight', value: 8 },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '刻到一半，笔意断了。你道基上多了一道谁也解不开的死结，而那方世界，你终究没记住。',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'sub', target: { k: 'luck' }, value: 10 },
            ],
          },
        ],
      },
      {
        id: 'save_it',
        label: '拿一缕仙灵气去续它，不押',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 45,
            tone: 'gold',
            text: '仙灵气落下去，那边的天亮了一角。它撑住了，撑得不好看，但撑住了。你什么也没得到。',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 18 },
              { op: 'gainInsight', value: 8 },
            ],
          },
          {
            weight: 30,
            text: '它接住了气，也记住了你。往后你在那方世界里走夜路，总有一盏灯是白亮的。',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
            ],
          },
          {
            weight: 25,
            tone: 'red',
            text: '续不上了。仙灵气和那方世界一起散掉，你站在原地，连它最后一声都没听见。',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 12 },
              { op: 'pct', target: { k: 'cultivation' }, value: -4 },
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
      {
        id: 'ask_again',
        label: '不等了，换个问法再问一句',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 45,
            text: '你换了个说法，把那一句拆成最笨的两句再问。第二次，云层动了。这次它给了个不算答案的答案。',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'pct', target: { k: 'cultivation' }, value: 10 },
            ],
          },
          {
            weight: 30,
            text: '它还是不答。倒是你越问越清楚自己究竟想要什么——问到最后，问题已经不是那个问题了。',
            effects: [
              { op: 'gainInsight', value: 12 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
          {
            weight: 25,
            tone: 'red',
            text: '问得太多，天地开始顺着你的口反过来问你。一来一往之间，你把自己交出去了一半。',
            effects: [
              { op: 'addToxicity', value: 16 },
              { op: 'sub', target: { k: 'luck' }, value: 10 },
            ],
          },
        ],
      },
      {
        id: 'ask_for_them',
        label: '替凡尘问一句',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 2 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 50,
            tone: 'gold',
            text: '你替他们等了很久。等的那几年里，云自己散过一次。散的时候没有声音，像终于松了口气。',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 16 },
              { op: 'gainInsight', value: 8 },
            ],
          },
          {
            weight: 30,
            text: '没有人答。倒是那几年里你想通了一件与天地无关的小事，比什么答都管用。',
            effects: [
              { op: 'gainInsight', value: 11 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '你替他们等，等的是自己。等完才发现，那几年你什么都没做，也什么都没剩下。',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 8 },
              { op: 'addToxicity', value: 8 },
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
      {
        id: 'burn_it',
        label: '付之一炬，让它回不去',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 50,
            tone: 'gold',
            text: '仙灵气引的火，烧的是一段再没人能查的来路。灰是温的。你在灰里站到天亮，没有回头。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 15 },
              { op: 'gainInsight', value: 8 },
              { op: 'addToxicity', value: 6 },
            ],
          },
          {
            weight: 30,
            text: '火烧了三天，熄了。烧掉的那段你确实不再挂念，只是从那天起，你也说不出自己是从哪儿来的了。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 10 },
              { op: 'sub', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '火烧得太旺，顺着来路烧进了别的东西。有人在你看不见的地方，替这段因果痛了很久。',
            effects: [
              { op: 'addToxicity', value: 18 },
              { op: 'sub', target: { k: 'luck' }, value: 14 },
              { op: 'gainInsight', value: 6 },
            ],
          },
        ],
      },
      {
        id: 'rename',
        label: '带着它走，但换个名字',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你给自己另取了一个道号，写进碑里刻进观里。天下认了新名，旧名就只是个旧名。你带着它走，也不再靠它。',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 15 },
              { op: 'gainInsight', value: 9 },
            ],
          },
          {
            weight: 30,
            text: '新名立住了，旧名却不肯散。此后凡有人叫你，两个名字都要应一声——你应得越多，自己越薄。',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'gainInsight', value: 10 },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '改名那日，旧名顺着因果追上来，认出了你。你花了很大力气才把它劝回去，代价是从此再不能修旧法。',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 10 },
              { op: 'addToxicity', value: 10 },
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
      {
        id: 'ask_name',
        label: '先问他叫什么',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 45,
            tone: 'gold',
            text: '他答了。答完两个人都笑了，对峙散成一场各自赶路的同行。此后天下多一个人知道你的名字。',
            effects: [
              { op: 'bond', action: 'create', type: '宿敌' },
              { op: 'bondAct', action: 'affinity', type: '宿敌', value: 12 },
              { op: 'gainInsight', value: 7 },
            ],
          },
          {
            weight: 30,
            text: '他不答。你也不必他答。两个人在沉默里各走了一半的路，那道法则最后谁也没沾着。',
            effects: [
              { op: 'gainInsight', value: 10 },
              { op: 'add', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 25,
            tone: 'red',
            text: '他答了，你也答了。两个名字撞在一起，深空里炸开一片余波——法则还在，人先伤了。',
            effects: [
              { op: 'bond', action: 'create', type: '宿敌' },
              { op: 'addToxicity', value: 14 },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
            ],
          },
        ],
      },
      {
        id: 'take_dao',
        label: '取他的道，不取他的命',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        hint: { risk: 2, reward: 3 },
        outcomes: [
          {
            weight: 45,
            tone: 'gold',
            text: '仙灵气把两人之间那条线定住。你取走了他的道，留他一条命走。他走时道基是空的，但还站得住。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 15 },
              { op: 'gainInsight', value: 9 },
              { op: 'add', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 30,
            text: '你取了一半。另一半他拿回去了，两个人从此各缺一块，谁也补不齐谁。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'gainInsight', value: 10 },
              { op: 'addToxicity', value: 8 },
            ],
          },
          {
            weight: 25,
            tone: 'red',
            text: '线定得太死，他的道顺着一并涌进你体内。塞得下，也烧得着。往后你每次用道，都会想起那晚。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 12 },
              { op: 'addToxicity', value: 18 },
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
      {
        id: 'erase_name',
        label: '把碑上的名字刮掉',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你刮了一夜，刮到最后连自己那一段也认不出了。碑成了无字碑。天下再没有人知道你们之间有过什么。',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 12 },
              { op: 'gainInsight', value: 8 },
            ],
          },
          {
            weight: 30,
            text: '名字刮掉了，恨刮不掉。它只是不再有地方落笔，转而落到你身上，一笔一笔自己写。',
            effects: [
              { op: 'addToxicity', value: 14 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
          {
            weight: 20,
            tone: 'red',
            text: '你刮得太用力，碑裂了，底下的旧土翻出来。里面不是尸骨，是一封没送出去的信。',
            effects: [
              { op: 'addToxicity', value: 10 },
              { op: 'gainInsight', value: 10 },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
            ],
          },
        ],
      },
      {
        id: 'tend_ground',
        label: '以混沌气养出这方寸之地',
        enable: { op: 'cmp', target: { k: 'chaosQi' }, cmp: '>=', value: 1 },
        disabledReason: '需混沌气×1',
        cost: [{ op: 'sub', target: { k: 'chaosQi' }, value: 1 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 55,
            tone: 'gold',
            text: '混沌气在坟头化出一点野草。草活了。往后赶路的人经过这里，有个地方能坐一坐——哪怕只坐一炷香。',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 15 },
              { op: 'gainInsight', value: 9 },
              { op: 'log', text: '荒冢成了歇脚处。', tone: 'xian' },
            ],
          },
          {
            weight: 45,
            text: '草长出来了，长的不是草。是一片很低很低的声音。你听了很久，没听清是什么，也不想再听。',
            effects: [
              { op: 'gainInsight', value: 11 },
              { op: 'addToxicity', value: 8 },
            ],
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
