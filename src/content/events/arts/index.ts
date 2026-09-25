import { defineEvent } from '../../../engine/registry';
import type { EventDef } from '../../../engine/types/effects';

/* Phase 3 功法事件池：24 个「得功法」事件 + 1 个道台现世（解槽 4）。
   设计约束（与 60 个改写事件同规）：2-4 个真实选项、至少一个无条件选项、
   至少一个选项带 enable/cost 门槛；hint 只给 0-3 档位。 */

const learn = (id: string, text: string, insight: number): EventDef['choices'][number] => ({
  id: 'learn',
  label: '静心参悟',
  cost: [{ op: 'sub', target: { k: 'insight' }, value: insight }],
  outcomes: [
    {
      text,
      tone: 'gold',
      effects: [
        { op: 'grantArt', id },
        { op: 'log', text: '你将其中的门径默默记下，自此多了一门手段。', tone: 'ev1' },
      ],
    },
  ],
  hint: { risk: 0, reward: 2 },
});

const jianEvents: EventDef[] = [
  defineEvent({
    id: 'ev_art_sword_tomb',
    title: '剑冢',
    category: 'world',
    body: '荒山之下埋着无数断剑，剑意冲霄，草木皆被削得齐整。你于冢前驻足，只觉胸中剑气翻涌。',
    weight: 45,
    levelMin: 6,
    levelMax: 45,
    cooldownYears: 25,
    choices: [
      learn('art_jian_yi', '你以指为剑，顺着冢中剑意走了一遍，剑意诀就此成型。', 3),
      {
        id: 'plunder',
        label: '掘取剑胚',
        outcomes: [
          {
            text: '你取走一截上古剑胚，虽未得法，却在炼剑中摸到了门道。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'artifactPower' }, value: 40 },
              { op: 'log', text: '剑胚入炉，法宝之力略有增长。', tone: 'ev1' },
            ],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
      {
        id: 'bow',
        label: '躬身而退',
        outcomes: [
          {
            text: '你对着满冢断剑深深一揖，转身离去，心境反倒澄澈了几分。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 3 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_sword_rain',
    title: '剑雨夜',
    category: 'world',
    body: '夜半忽然落雨，雨丝却笔直如剑，钉在檐上铮然作响。有人于雨中练剑，剑势与雨势相合。',
    weight: 35,
    levelMin: 35,
    levelMax: 90,
    cooldownYears: 30,
    choices: [
      learn('art_qing_feng', '你入雨而立，看那剑势看了整整一夜，青锋剑典自此有了雏形。', 9),
      {
        id: 'watch',
        label: '远远旁观',
        outcomes: [
          {
            text: '你没有上前，只是远远看着，倒也悟出些道理。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 6 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_sword_peak',
    title: '绝顶剑碑',
    category: 'world',
    body: '云海之上立着一块无字剑碑，碑面光滑如镜，映出的却是你自己握剑的模样。',
    weight: 30,
    levelMin: 70,
    cooldownYears: 40,
    choices: [
      learn('art_wu_wo_jian', '你与碑中之人对视良久，再睁眼时，剑已不在手中，而在天地之间。', 19),
      learn('art_you_long', '你顺着碑上的云气走势推演，游龙剑气自此盘旋于身侧。', 14),
      {
        id: 'carve',
        label: '以剑刻名',
        outcomes: [
          {
            text: '你在碑上刻下自己的名字，气机与山岳相连，只是心境却乱了。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 5 },
              { op: 'add', target: { k: 'toxicity' }, value: 6 },
            ],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
    ],
  }),
];

const danEvents: EventDef[] = [
  defineEvent({
    id: 'ev_art_pill_ruin',
    title: '废丹房',
    category: 'world',
    body: '废弃的丹房积满药渣，一炉冷火不知熄了多久，墙上却留着密密麻麻的批注。',
    weight: 45,
    levelMin: 6,
    levelMax: 45,
    cooldownYears: 25,
    choices: [
      learn('art_dan_ding', '你抄录批注、复原丹方，丹鼎诀的根底自此立住。', 3),
      {
        id: 'scrape',
        label: '刮取药渣',
        outcomes: [
          {
            text: '药渣尚存余性，你小心收好，日后炼丹或可用上。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'toxicity' }, value: 8 },
              { op: 'gainInsight', value: 4 },
            ],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
      {
        id: 'seal',
        label: '封了炉门',
        outcomes: [
          {
            text: '你将炉门封死，免得药气伤人，心里踏实了些。',
            tone: 'ev1',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 3 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_pill_fire',
    title: '阴阳二火',
    category: 'world',
    body: '地火与冰泉同出一穴，火不沸水、水不灭火，恰是一处天成的丹炉。',
    weight: 35,
    levelMin: 35,
    levelMax: 90,
    cooldownYears: 30,
    choices: [
      learn('art_yin_yang_lu', '你守着一炉水火看了三个月，阴阳炉火术成了。', 9),
      {
        id: 'harvest',
        label: '取火种',
        outcomes: [
          {
            text: '你以玉瓶收了一缕地火，日后炼器或有大用。',
            tone: 'ev1',
            effects: [{ op: 'add', target: { k: 'artifactPower' }, value: 120 }],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_pill_grand',
    title: '丹会',
    category: 'world',
    body: '十年一度的丹会开炉，炉火映红了半座山，四方丹师皆来观火。',
    weight: 30,
    levelMin: 60,
    cooldownYears: 30,
    choices: [
      learn('art_da_dao_dan', '你观主炉火候七日，忽有明悟——以身为炉，以道为火。', 19),
      learn('art_jiu_zhuan', '你与一位老丹师对上三句，九转还丹诀的关窍就此打通。', 13),
      {
        id: 'trade',
        label: '与丹师交易',
        outcomes: [
          {
            text: '你以一味奇药换来若干丹方残页，虽未成术，眼界大开。',
            tone: 'ev1',
            effects: [
              { op: 'sub', target: { k: 'herb', id: 'herb_common' }, value: 1 },
              { op: 'gainInsight', value: 10 },
            ],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
];

const tiEvents: EventDef[] = [
  defineEvent({
    id: 'ev_art_body_bath',
    title: '药浴',
    category: 'world',
    body: '一池黑沉沉的药汤咕嘟冒泡，药气入鼻便觉筋骨发痒。旁人说，熬得过这一池，皮肉便硬一分。',
    weight: 45,
    levelMin: 6,
    levelMax: 45,
    cooldownYears: 25,
    choices: [
      learn('art_tie_gu', '你咬牙沉入药池，三日后再起身，骨节已是铮铮作响。', 3),
      {
        id: 'soak',
        label: '浅尝辄止',
        outcomes: [
          {
            text: '你只在池边泡了半个时辰，筋骨松动，倒也受益。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'toxicity' }, value: 5 },
              { op: 'add', target: { k: 'cultivation' }, value: 200 },
            ],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_body_ox',
    title: '蛮牛冲阵',
    category: 'world',
    body: '荒原上一头独眼蛮牛横冲直撞，牧人悬赏求人制住它。此牛皮糙肉厚，寻常法器难伤。',
    weight: 35,
    levelMin: 35,
    levelMax: 90,
    cooldownYears: 30,
    choices: [
      learn('art_long_xiang', '你与蛮牛角力半日，忽觉力从脊背生，龙象般若功自此入门。', 9),
      {
        id: 'hunt',
        label: '取其皮骨',
        outcomes: [
          {
            text: '你收拾了牛皮与牛骨，卖了个好价钱。',
            tone: 'ev1',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 4 }],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_body_mountain',
    title: '镇山印',
    category: 'world',
    body: '山下有一方巨石，传言是古时大能以肉身镇下的。石上掌印深逾三寸，五指俱全。',
    weight: 30,
    levelMin: 68,
    cooldownYears: 35,
    choices: [
      learn('art_rou_shen', '你以掌对掌贴上那枚掌印，刹那间一身血气尽数归窍。', 19),
      learn('art_xuan_gui', '你照着石上气机调息，玄龟吐纳法渐渐成形。', 14),
      {
        id: 'lift',
        label: '试举此石',
        outcomes: [
          {
            text: '巨石纹丝不动，你却气血翻涌，坐倒调息半晌。',
            tone: 'red',
            effects: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
          },
        ],
        hint: { risk: 2, reward: 0 },
      },
    ],
  }),
];

const duEvents: EventDef[] = [
  defineEvent({
    id: 'ev_art_poison_bog',
    title: '毒沼',
    category: 'world',
    body: '十里毒沼瘴气蒸腾，飞鸟不渡。沼心有株通体发黑的花，开得极艳。',
    weight: 45,
    levelMin: 6,
    levelMax: 45,
    cooldownYears: 25,
    choices: [
      learn('art_bai_du', '你以自身试瘴，七日不食，反倒把毒气炼成了护体的一层膜。', 3),
      learn('art_hua_du', '你采下那朵黑花，试着把它化作修为。', 4),
      {
        id: 'avoid',
        label: '绕道而行',
        outcomes: [
          {
            text: '你绕开毒沼，多了半日路程，也少了一场凶险。',
            tone: 'ev1',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 2 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_poison_gu',
    title: '蛊瓮',
    category: 'world',
    body: '一只封着泥的旧瓮埋在树下，瓮中窸窣有声。掀开泥封，百虫相食的气息扑面而来。',
    weight: 35,
    levelMin: 40,
    levelMax: 95,
    cooldownYears: 30,
    choices: [
      {
        id: 'learn',
        label: '炼蛊入体',
        enable: { op: 'cmp', target: { k: 'toxicity' }, cmp: '>=', value: 60 },
        disabledReason: '丹毒不足 60，压不住瓮中之物',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 13 }],
        outcomes: [
          {
            text: '你以自身丹毒为饵，将瓮中之蛊炼入体内，蛊道真解就此得传。',
            tone: 'gold',
            effects: [
              { op: 'grantArt', id: 'art_gu_dao' },
              { op: 'add', target: { k: 'toxicity' }, value: 10 },
            ],
          },
        ],
        hint: { risk: 2, reward: 3 },
      },
      {
        id: 'burn',
        label: '一把火烧了',
        outcomes: [
          {
            text: '你放火烧瓮，虫鸣声渐息，山野重归清净。',
            tone: 'ev1',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 5 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_poison_dragon',
    title: '毒龙潭',
    category: 'world',
    body: '深潭墨绿如眼，潭底盘着一条早已死去的蛟龙，尸身百年不腐，毒气凝成实质。',
    weight: 30,
    levelMin: 70,
    cooldownYears: 40,
    choices: [
      learn('art_du_long', '你潜入潭底，与那具龙尸对坐七日，毒龙噬天之意自此入心。', 19),
      learn('art_shi_gu', '你取龙尸一缕阴火炼入丹田，蚀骨阴火自此不灭。', 14),
      {
        id: 'leave',
        label: '焚香而退',
        outcomes: [
          {
            text: '你在潭边焚香一炷，转身离去。有些东西，不看也罢。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 8 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
];

const leiEvents: EventDef[] = [
  defineEvent({
    id: 'ev_art_thunder_wood',
    title: '雷击木',
    category: 'world',
    body: '一株老槐被天雷劈作两半，断口焦黑，却仍有新芽自焦皮中钻出。',
    weight: 45,
    levelMin: 6,
    levelMax: 45,
    cooldownYears: 25,
    choices: [
      learn('art_wu_lei', '你以掌贴木，任余雷走遍全身，五雷正法自此立下根脚。', 3),
      {
        id: 'carve',
        label: '取焦木为器',
        outcomes: [
          {
            text: '焦木坚硬如铁，你把它削成一柄短尺，倒也得用。',
            tone: 'ev1',
            effects: [{ op: 'add', target: { k: 'artifactPower' }, value: 40 }],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_thunder_altar',
    title: '引雷坛',
    category: 'world',
    body: '山巅石坛上刻满雷纹，每逢雷雨便自行引雷，坛心石座被劈得光滑如玉。',
    weight: 35,
    levelMin: 40,
    levelMax: 95,
    cooldownYears: 30,
    choices: [
      learn('art_lei_ting', '你坐入坛心，任雷火淬炼，雷霆淬体之术就此贯通。', 11),
      learn('art_zi_xiao', '你顺着雷纹推演天象，紫霄神雷的运转之理了然于胸。', 10),
      {
        id: 'flee',
        label: '退下石坛',
        outcomes: [
          {
            text: '雷声太盛，你退了开去，只在远处看它轰了一夜。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 7 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_thunder_emperor',
    title: '雷帝遗藏',
    category: 'world',
    body: '一副石棺悬在雷云之下，棺上刻着「雷帝」二字。棺未开，雷已落。',
    weight: 30,
    levelMin: 72,
    cooldownYears: 40,
    choices: [
      learn('art_lei_di', '你推开石棺，万千雷光没入眉心，雷帝经自此与你的道基相融。', 21),
      learn('art_jiu_tian', '你没敢开棺，只在雷云下坐了九日，九天神雷真解自成。', 14),
      {
        id: 'seal',
        label: '以石封棺',
        outcomes: [
          {
            text: '你搬石压住棺盖，把这一处凶地留给后来人。',
            tone: 'ev1',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 6 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
];

const moEvents: EventDef[] = [
  defineEvent({
    id: 'ev_art_demon_blood',
    title: '血池',
    category: 'world',
    body: '洞窟深处有一汪暗红血池，腥气冲鼻，却让人莫名觉得温暖。池边刻着「血魔」二字。',
    weight: 45,
    levelMin: 6,
    levelMax: 45,
    cooldownYears: 25,
    choices: [
      learn('art_xue_mo', '你沉入血池，只觉四肢百骸都在沸腾，血魔功从此扎根。', 3),
      {
        id: 'drink',
        label: '饮下一口',
        outcomes: [
          {
            text: '你强忍腥气饮下一口，修为暴涨，识海却隐隐刺痛。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 12 },
              { op: 'add', target: { k: 'toxicity' }, value: 12 },
            ],
          },
        ],
        hint: { risk: 2, reward: 2 },
      },
      {
        id: 'seal',
        label: '填土封池',
        outcomes: [
          {
            text: '你运功填土，把血池封在洞底。这条路，你不想走。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 4 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_demon_soul',
    title: '噬魂幡',
    category: 'world',
    body: '乱葬岗上立着一面残幡，幡面无风自动，隐隐能听见细碎的哭喊。',
    weight: 35,
    levelMin: 38,
    levelMax: 92,
    cooldownYears: 30,
    choices: [
      learn('art_mo_yan', '你以神识入幡，在哭喊声中稳住了本心，魔焰真经就此点亮。', 10),
      learn('art_shi_hun', '你没有抗拒那些哭声，任由它们穿过识海，噬魂大法自此入门。', 11),
      {
        id: 'burn',
        label: '焚幡超度',
        outcomes: [
          {
            text: '你放火焚幡，哭喊声渐弱，天地间像是松了一口气。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 7 },
              { op: 'add', target: { k: 'simPoints' }, value: 2 },
            ],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_demon_altar',
    title: '万魔台',
    category: 'world',
    body: '石台层层叠叠，每层都刻着一位魔头的名号。最上一层空着，刻痕却是新凿的。',
    weight: 30,
    levelMin: 72,
    cooldownYears: 40,
    choices: [
      {
        id: 'ascend',
        label: '登台留名',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 21 }],
        outcomes: [
          {
            text: '你登上最高一层，凿下自己名号的一刻，万魔归元功轰然入体。',
            tone: 'gold',
            effects: [
              { op: 'grantArt', id: 'art_wan_mo' },
              { op: 'add', target: { k: 'toxicity' }, value: 15 },
            ],
          },
        ],
        hint: { risk: 2, reward: 3 },
      },
      learn('art_ni_tian', '你没有留名，只把台上名号逐一读过，逆天改命术反倒成了。', 15),
      {
        id: 'descend',
        label: '转身下台',
        outcomes: [
          {
            text: '你转身下台，把那个空位留给别人。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 8 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
];

const crossEvents: EventDef[] = [
  defineEvent({
    id: 'ev_art_cross_sword_pill',
    title: '剑炉丹火',
    category: 'world',
    body: '一位老修士以剑炉炼丹，剑意与药气同炉而转，看上去荒诞，却隐隐自成章法。',
    weight: 35,
    levelMin: 20,
    cooldownYears: 25,
    choices: [
      learn('art_zhan_tian', '你借剑炉之火推演剑势，斩天拔剑术的第一式成了。', 8),
      learn('art_jiu_zhuan', '你借剑意理清药性，九转还丹诀的关窍豁然开朗。', 8),
      {
        id: 'talk',
        label: '与老修士论道',
        outcomes: [
          {
            text: '你与老人对坐半日，听他说些零碎旧事，心境开阔不少。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 6 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_cross_body_poison',
    title: '以毒炼体',
    category: 'world',
    body: '有修士以毒物淬体，浑身乌青而气息沉稳；有修士以肉身养蛊，谈笑间虫影翻涌。两条路都走得通。',
    weight: 35,
    levelMin: 25,
    cooldownYears: 25,
    choices: [
      learn('art_lian_ti_zhen', '你选了以痛楚为炉的那条路，炼体真解自此上手。', 8),
      {
        id: 'poison',
        label: '试毒淬体',
        enable: { op: 'cmp', target: { k: 'toxicity' }, cmp: '>=', value: 40 },
        disabledReason: '丹毒不足 40，试毒无异于送死',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 9 }],
        outcomes: [
          {
            text: '你以自身丹毒淬炼皮肉，五毒炼体术的架子搭了起来。',
            tone: 'gold',
            effects: [
              { op: 'grantArt', id: 'art_wu_du_lian' },
              { op: 'add', target: { k: 'toxicity' }, value: 8 },
            ],
          },
        ],
        hint: { risk: 2, reward: 2 },
      },
      {
        id: 'observe',
        label: '只作旁观',
        outcomes: [
          {
            text: '你在旁看了一整日，把两种法门的思路都记在心里。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 5 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
  defineEvent({
    id: 'ev_art_cross_thunder_demon',
    title: '雷劈魔窟',
    category: 'world',
    body: '天雷连劈三日，把一处魔窟劈得门户大开。雷气与魔气在洞口纠缠，互不侵入。',
    weight: 35,
    levelMin: 45,
    cooldownYears: 30,
    choices: [
      learn('art_tian_lei', '你站在雷气这一侧，天雷引顺着指尖爬了上来。', 10),
      learn('art_duo_ling', '你走进魔气那一侧，夺灵诀在掌中悄然成形。', 10),
      {
        id: 'retreat',
        label: '退出三十里',
        outcomes: [
          {
            text: '两气纠缠之势太凶，你退出三十里外静观，收获了几分体悟。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 7 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
];

export const ART_EVENTS: EventDef[] = [
  ...jianEvents,
  ...danEvents,
  ...tiEvents,
  ...duEvents,
  ...leiEvents,
  ...moEvents,
  ...crossEvents,
  defineEvent({
    id: 'ev_world_dao_seat',
    title: '道台现世',
    category: 'world',
    body: '荒野之中一夜隆起一座道台，台上道纹流转，像是在等一个人坐上去。传闻道台只现世一次。',
    weight: 40,
    levelMin: 25,
    once: true,
    choices: [
      {
        id: 'seat',
        label: '坐上台去',
        outcomes: [
          {
            text: '你拾级而上，在道台正中坐下，身周道纹次第亮起——识海之中，又多出一处可纳功法的位置。',
            tone: 'gold',
            effects: [
              { op: 'setFlag', id: 'dao_seat', value: 1 },
              { op: 'log', text: '功法槽位 +1（道台之力）。', tone: 'gold' },
            ],
          },
        ],
        hint: { risk: 1, reward: 3 },
      },
      {
        id: 'meditate',
        label: '在台下参悟',
        outcomes: [
          {
            text: '你没有上台，只在台下坐了七日，道纹的纹理尽数印入识海。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 40 }],
          },
        ],
        hint: { risk: 0, reward: 2 },
      },
      {
        id: 'seal',
        label: '以土封台',
        outcomes: [
          {
            text: '你把道台重新埋回土里。有些机缘，还是留给后人罢。',
            tone: 'ev1',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 8 }],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
    ],
  }),
];
