import { defineEvent } from '../../../engine/registry';
import type { EventDef } from '../../../engine/types/effects';

// 仙界 · 101-150 级事件池。基调：陌生、清冷、处处是要价。
// 权重：tier1 80-200 / tier2 40-120 / tier3 15-60 / tier4 3-20。
export const IMMORTAL_LOWER = [
  defineEvent({
    id: 'ev_imm_lower_first_breath',
    title: '仙息呛喉',
    category: 'world',
    body: '仙界的第一口灵气浓得发苦，灌进肺腑时像吞了一把细针。你蹲在云阶上咳了半晌，指缝间渗出来的血色是淡的。',
    tierMin: 1,
    tierMax: 1,
    levelMin: 101,
    levelMax: 150,
    weight: 170,
    cooldownYears: 10,
    choices: [
      {
        id: 'resolve',
        label: '按旧法调息，把这一口咽下去',
        outcomes: [
          {
            weight: 55,
            text: '经脉被冲得生疼，可那口仙气到底在丹田里落了脚。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'gainInsight', value: 4 },
            ],
          },
          {
            weight: 30,
            text: '仙气与旧日浊气在胸中绞成一团，你吐出一口淤血，反倒通了。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'addToxicity', value: 8 },
            ],
          },
          {
            weight: 15,
            text: '你硬撑到云阶天亮，仙气凝在喉间不肯散，呼吸里全是腥气。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -4 },
              { op: 'addToxicity', value: 10 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_cloud_inn',
    title: '云栈寒宿',
    category: 'world',
    body: '云海之上有一间栈房，帘子旧得发白。掌柜不问来历，只把一块刻着价码的玉筹推到你面前——住一夜，收的是你身上的东西。',
    tierMin: 1,
    tierMax: 1,
    levelMin: 101,
    levelMax: 150,
    weight: 150,
    cooldownYears: 12,
    choices: [
      {
        id: 'resolve',
        label: '盘膝坐下，听凭玉筹定价',
        outcomes: [
          {
            weight: 50,
            text: '玉筹吸走一缕浮在体表的仙光，你睡了个入仙界以来最安稳的觉。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'add', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 35,
            text: '掌柜瞧出你眉间有旧伤，多收了三年气运，却添了一句吐纳的口诀。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
          {
            weight: 15,
            text: '夜半有人翻你的行囊，你惊醒时只捉到一片凉透的衣角。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 4 },
              { op: 'pct', target: { k: 'cultivation' }, value: -3 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_frost_bench',
    title: '寒台分席',
    category: 'encounter',
    body: '数位仙人在寒台论道，席位按辈分排开。末座空着一方蒲团，主事的仙人不看你，只把那蒲团往边上又挪了半寸。',
    tierMin: 1,
    tierMax: 1,
    levelMin: 101,
    levelMax: 150,
    weight: 130,
    cooldownYears: 11,
    choices: [
      {
        id: 'resolve',
        label: '不争座次，就地落座',
        outcomes: [
          {
            weight: 55,
            text: '你从头听到尾，席散时才发现自己已把那段周天推演了三遍。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 5 },
            ],
          },
          {
            weight: 30,
            text: '有人出言讥你凡骨未褪，你把那口气咽了下去，倒也听清一句要紧话。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'addToxicity', value: 6 },
            ],
          },
          {
            weight: 15,
            text: '争执中你乱了道心，那两个字像钉子一样留在识海里。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 10 },
              { op: 'sub', target: { k: 'luck' }, value: 4 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_cloud_hermit',
    title: '云海邻修',
    category: 'world',
    body: '云海尽头住着一位独修的仙人，从不与人往来，只在月出时对着一口枯井吐纳。今夜他破例朝你点了点头。',
    tierMin: 1,
    tierMax: 1,
    levelMin: 101,
    levelMax: 150,
    weight: 120,
    cooldownYears: 9,
    choices: [
      {
        id: 'resolve',
        label: '隔着枯井对坐一夜',
        outcomes: [
          {
            weight: 45,
            text: '两人一句未说，天光时你却把一段滞涩的周天悄悄理通了。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
              { op: 'gainInsight', value: 5 },
            ],
          },
          {
            weight: 35,
            text: '他分你半块冷硬的糕，说是三百年尘缘剩下的。你咽下时，灵根竟暖了半分。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 9 },
            ],
          },
          {
            weight: 20,
            text: '你多问了一句他的名姓。他闭目不语，次日那口枯井已不知去向。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 4 },
              { op: 'addToxicity', value: 6 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_field_lease',
    title: '仙田佃契',
    category: 'world',
    body: '一位仙府管事拦下你，说名下有一垄无主的仙田，签下佃契便可耕作，收成对分。契书末尾有一行小字，墨色比别处新。',
    tierMin: 1,
    tierMax: 1,
    levelMin: 101,
    levelMax: 150,
    weight: 110,
    cooldownYears: 13,
    choices: [
      {
        id: 'resolve',
        label: '按下指印，先耕一年看看',
        outcomes: [
          {
            weight: 50,
            text: '仙谷一年两熟，田里的灵气把你的经脉养得松软。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'add', target: { k: 'root' }, value: 8 },
            ],
          },
          {
            weight: 32,
            text: '你看懂了那行小字是三百年的长契，索性一次付清，换得一块现成的灵壤。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 12 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
          {
            weight: 18,
            text: '契书里的旧主找上门来，说要连人带田一并收回。管事早已不见踪影。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 6 },
              { op: 'pct', target: { k: 'cultivation' }, value: -5 },
              { op: 'addToxicity', value: 8 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_old_letter',
    title: '旧笺追来',
    category: 'fate',
    body: '一封没有落款的信落在洞府门口，纸是凡间的竹纸，字迹却是你少年时临过的那一版。信上只问了一句：当年那笔债，你可还记得。',
    tierMin: 1,
    tierMax: 1,
    levelMin: 101,
    levelMax: 150,
    weight: 100,
    cooldownYears: 15,
    choices: [
      {
        id: 'resolve',
        label: '提笔，给这封信一个回音',
        outcomes: [
          {
            weight: 50,
            text: '你只回了三个字。笔尖离纸的一瞬，心口某处忽然松了。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
          {
            weight: 30,
            text: '你把信折好，连同当年欠下的那份一并寄了回去。此后夜里再没梦见旧宅。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 20,
            text: '信纸在掌中化作灰，灰里浮起一张熟脸。你花了好几夜才把心绪按平。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 8 },
              { op: 'sub', target: { k: 'luck' }, value: 3 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_jade_bone_market',
    title: '仙骨易市',
    category: 'encounter',
    body: '仙市深处有个不收仙玉的摊位，摊主只看骨头。他把一面铜镜推给你，镜里映出你脊背上一节隐隐发亮的东西。',
    tierMin: 2,
    tierMax: 2,
    levelMin: 101,
    levelMax: 150,
    weight: 110,
    cooldownYears: 12,
    choices: [
      {
        id: 'resolve',
        label: '在镜前坐下，听他开价',
        outcomes: [
          {
            weight: 45,
            text: '你只舍了半钱骨屑，换回一柄温热的旧刀，握上去掌心发麻。',
            tone: 'ev2',
            effects: [
              { op: 'sub', target: { k: 'root' }, value: 5 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 7 },
            ],
          },
          {
            weight: 35,
            text: '你舍了整整一节仙骨，换得一柄无铭的旧剑。剑身认了你的手，微微发烫。',
            tone: 'gold',
            effects: [
              { op: 'sub', target: { k: 'root' }, value: 10 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 10 },
              { op: 'pct', target: { k: 'artifactPower' }, value: 4 },
            ],
          },
          {
            weight: 20,
            text: '摊主收了骨，却把铜镜扣在桌上。你们隔着一张摊桌对望半晌，他终究没交货。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'root' }, value: 6 },
              { op: 'sub', target: { k: 'luck' }, value: 4 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_demon_whisper',
    title: '心魔低语',
    category: 'fate',
    body: '夜里有人在耳后说话，声音与你自己的别无二致。它不提杀伐，只逐年报出你吞过的每一炉丹的价钱。',
    tierMin: 2,
    tierMax: 2,
    levelMin: 101,
    levelMax: 150,
    weight: 100,
    cooldownYears: 10,
    requires: { op: 'cmp', target: { k: 'toxicity' }, cmp: '>=', value: 25 },
    choices: [
      {
        id: 'resolve',
        label: '盘坐不动，听它把话说完',
        outcomes: [
          {
            weight: 40,
            text: '你把它报的丹名一条条听完。天亮时识海反倒静了，静得能听见自己的周天。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
          {
            weight: 35,
            text: '你顺着它的话往下想。胸口那团旧瘀竟化开了，修为涨得快，舌根却泛着苦。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 11 },
              { op: 'addToxicity', value: 16 },
            ],
          },
          {
            weight: 25,
            text: '你强行镇住话头，反被它咬了一口，那一夜比三年都长。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 8 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_market_scale',
    title: '仙市秤心',
    category: 'world',
    body: '仙市有一杆不收仙玉的秤，称的是心念。摊主指着摊上一卷残图说：你若拿得出压秤的东西，它便是你的。',
    tierMin: 2,
    tierMax: 2,
    levelMin: 101,
    levelMax: 150,
    weight: 95,
    cooldownYears: 14,
    choices: [
      {
        id: 'resolve',
        label: '把能拿出的都搁上秤盘',
        outcomes: [
          {
            weight: 50,
            text: '秤杆晃了三晃才算平。残图入了你的袖，图上纹路看着像一条回头路。',
            tone: 'ev1',
            effects: [
              {
                op: 'if',
                cond: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
                then: [
                  { op: 'sub', target: { k: 'xianqi' }, value: 1 },
                  { op: 'gainInsight', value: 7 },
                  { op: 'pct', target: { k: 'cultivation' }, value: 6 },
                ],
                else: [
                  { op: 'gainInsight', value: 4 },
                  { op: 'addToxicity', value: 5 },
                ],
              },
            ],
          },
          {
            weight: 30,
            text: '你嫌价高转身就走。摊主不拦，只在背后念了一句你的旧名，那一句跟了你三里云路。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'addToxicity', value: 6 },
            ],
          },
          {
            weight: 20,
            text: '你拿别物充数，被摊主一眼看破。他没动怒，只是再没朝你抬过眼皮。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 5 },
              { op: 'pct', target: { k: 'cultivation' }, value: -4 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_thunder_pool',
    title: '雷池借路',
    category: 'encounter',
    body: '一条近路横穿雷池，池底沉雷未散，水面浮着几点不肯熄的白光。绕行要多花三年，踏水而过只需一炷香。',
    tierMin: 2,
    tierMax: 2,
    levelMin: 101,
    levelMax: 150,
    weight: 90,
    cooldownYears: 11,
    choices: [
      {
        id: 'resolve',
        label: '提气踏入池面',
        outcomes: [
          {
            weight: 40,
            text: '落雷只削去你半幅衣袖，人已站在对岸，脚底的余麻过了三息才退。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'addToxicity', value: 6 },
            ],
          },
          {
            weight: 35,
            text: '一道沉雷自池心劈起，你五脏如被清水洗过，代价是整条左臂麻了半月。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 12 },
              { op: 'addToxicity', value: 14 },
            ],
          },
          {
            weight: 25,
            text: '雷池认生人，把你生生逼回岸边。衣袍焦透，你先前的调息也白费了。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -5 },
              { op: 'addToxicity', value: 8 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_forbidden_stele',
    title: '禁台残碑',
    category: 'encounter',
    body: '禁台中央立着一块断碑，碑面无一字，走近三步以内骨头会发酸。碑侧枯坐着一道人影，久得像碑的一部分。',
    tierMin: 2,
    tierMax: 2,
    levelMin: 101,
    levelMax: 150,
    weight: 85,
    cooldownYears: 13,
    requires: { op: 'rootTierAtLeast', tier: 7 },
    choices: [
      {
        id: 'resolve',
        label: '在碑前站定，读那片空白',
        outcomes: [
          {
            weight: 40,
            text: '一炷香过，你从空白的碑面上读出了半句话，另半句还在你自己身上。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'addToxicity', value: 6 },
            ],
          },
          {
            weight: 35,
            text: '你伸手触碑，碑面凉得刺骨。恍惚间你看见一个不认识的背影立在云里。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 9 },
              { op: 'addToxicity', value: 12 },
            ],
          },
          {
            weight: 25,
            text: '那道人影睁了一下眼。你退出禁台时，脚下的云已经被冷汗洇湿。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 6 },
              { op: 'pct', target: { k: 'cultivation' }, value: -5 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_sect_invite',
    title: '仙府寄帖',
    category: 'world',
    body: '一封烫着金纹的帖子落在案上，落款是云外那座仙府。帖中说愿纳你为客卿，名录之后，恩怨同担。',
    tierMin: 2,
    tierMax: 2,
    levelMin: 101,
    levelMax: 150,
    weight: 80,
    cooldownYears: 15,
    choices: [
      {
        id: 'resolve',
        label: '在帖上落笔',
        outcomes: [
          {
            weight: 45,
            text: '你只落了名，不领职。仙府门前的长碑上从此多了一个小小的刻痕。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 9 },
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
            ],
          },
          {
            weight: 35,
            text: '落笔时你多加了一横，把客卿写成了过客。那边竟认下了这个写法。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 20,
            text: '帖尾那行小字你落笔后才看清——旧日恩怨也一并划到了你名下。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 10 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_guest_rite',
    title: '客礼之试',
    category: 'encounter',
    body: '一位仙人请你过府叙话。案上三盏茶水位次第不同：一盏齐沿、一盏半满、一盏空空如也。主人家只笑，不解释。',
    tierMin: 2,
    tierMax: 2,
    levelMin: 101,
    levelMax: 150,
    weight: 70,
    cooldownYears: 10,
    choices: [
      {
        id: 'resolve',
        label: '端一盏，先饮为敬',
        outcomes: [
          {
            weight: 40,
            text: '你端了半满的那盏。主人颔首，席上谈的皆是实学，临走还指了你一段周天。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
            ],
          },
          {
            weight: 35,
            text: '你端了空盏，一饮而尽。主人愣了一瞬，笑意深了三分，亲自送你出府。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 25,
            text: '你端了齐沿那盏，喝到最后一口才尝出底下垫着别的东西，喉间一直发涩。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 8 },
              { op: 'sub', target: { k: 'luck' }, value: 4 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_trib_gear',
    title: '劫前备器',
    category: 'tribulation',
    body: '云上有人摆出一排旧物：断剑、残符、半炉冷灰，说是从前渡仙劫的人留下的，或许能替你挡一挡。',
    tierMin: 2,
    tierMax: 2,
    levelMin: 101,
    levelMax: 150,
    weight: 60,
    cooldownYears: 12,
    choices: [
      {
        id: 'resolve',
        label: '蹲下身，一件件看过去',
        outcomes: [
          {
            weight: 45,
            text: '你挑了最不起眼的一片残符，贴身收好。它很旧，旧得让人安心。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 35,
            text: '你花三日把旧物逐一擦拭，末了什么也没拿，只看会了那柄断剑当年的握法。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 5 },
              { op: 'gainInsight', value: 5 },
            ],
          },
          {
            weight: 20,
            text: '你挑得太久，抬头时云上已收了摊，只留一句：劫来时不等人。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -4 },
              { op: 'sub', target: { k: 'luck' }, value: 4 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_chaos_vein',
    title: '混沌细脉',
    category: 'encounter',
    body: '云海底裂开一道细缝，渗出的气不属五行，触手即成丝。缝口守着两个人，谁都没有先动。',
    tierMin: 3,
    tierMax: 3,
    levelMin: 101,
    levelMax: 150,
    weight: 55,
    cooldownYears: 15,
    choices: [
      {
        id: 'resolve',
        label: '走近缝口，伸手取气',
        outcomes: [
          {
            weight: 40,
            text: '你与那两人各取一缕，谁也没多拿。气入体时，周天像被重新铺过一遍。',
            tone: 'rare',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
            ],
          },
          {
            weight: 35,
            text: '你先动了手，缝里的气被你卷走大半。另外两人没拦，只把你的脸记了下来。',
            tone: 'rare',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 11 },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 25,
            text: '缝隙在你伸手前合上。守着的人只当你来抢，追了你大半月。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -6 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_chaos_tribute',
    title: '献纳混沌',
    category: 'world',
    body: '一位老仙人把空玉匣推到你面前。他说自己年岁到了，这缕混沌气留着无用，只求你替他走一趟云下的旧宅。',
    tierMin: 3,
    tierMax: 3,
    levelMin: 101,
    levelMax: 150,
    weight: 50,
    cooldownYears: 15,
    choices: [
      {
        id: 'resolve',
        label: '看着那只空匣，开口',
        outcomes: [
          {
            weight: 45,
            text: '你应下了这趟差事。玉匣当场开封，一缕混沌气落进识海，轻得没有声响。',
            tone: 'rare',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'gainInsight', value: 5 },
            ],
          },
          {
            weight: 35,
            text: '你婉拒了差事，替他把旧宅的事写成口信托人带下云去。他分了你半缕，说欠着的那半算在他账上。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 20,
            text: '你动了夺匣的念头。念头刚起，老仙人便闭上眼，玉匣从此再没打开过。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 6 },
              { op: 'addToxicity', value: 10 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_bone_for_breath',
    title: '割骨换息',
    category: 'encounter',
    body: '缝口边坐着个卖气的人，价码刻在膝头：一节仙骨，换他一缕收了很多年的混沌气。他不还价，也不强求。',
    tierMin: 3,
    tierMax: 3,
    levelMin: 101,
    levelMax: 150,
    weight: 45,
    cooldownYears: 15,
    requires: { op: 'rootTierAtLeast', tier: 8 },
    choices: [
      {
        id: 'resolve',
        label: '撩起衣襟，露出肋骨',
        outcomes: [
          {
            weight: 45,
            text: '你割下一节骨，把气收了。伤口合得比预想慢，气却比预想纯。',
            tone: 'rare',
            effects: [
              { op: 'sub', target: { k: 'root' }, value: 8 },
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
            ],
          },
          {
            weight: 35,
            text: '你只肯舍一点骨屑。他给了半缕，另半句是句忠告：割得越浅，走得越远。',
            tone: 'gold',
            effects: [
              { op: 'sub', target: { k: 'root' }, value: 4 },
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'gainInsight', value: 5 },
            ],
          },
          {
            weight: 20,
            text: '你下刀深了些，气却被他卷了回去。他临走替你敷上药，说这行最不缺后悔的人。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'root' }, value: 10 },
              { op: 'sub', target: { k: 'luck' }, value: 4 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_demon_bargain',
    title: '心魔议价',
    category: 'fate',
    body: '心魔这次不再低语，而是坐下来与你讲买卖：它替你挪走胸中积毒，代价是你得记住它报出的一个名字。',
    tierMin: 3,
    tierMax: 3,
    levelMin: 101,
    levelMax: 150,
    weight: 40,
    cooldownYears: 14,
    requires: {
      op: 'or',
      of: [
        { op: 'cmp', target: { k: 'toxicity' }, cmp: '>=', value: 30 },
        { op: 'rootTierAtLeast', tier: 8 },
      ],
    },
    choices: [
      {
        id: 'resolve',
        label: '与它隔案对坐',
        outcomes: [
          {
            weight: 45,
            text: '你记下了那个名字。胸中积毒松了一截，修为顺势长了一段，只是夜里偶尔会念出声。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 10 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
          {
            weight: 35,
            text: '你不肯记那个名字，与它僵持到天亮。识海像被犁过一遍，犁沟里却翻出一点旧悟。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'addToxicity', value: 12 },
            ],
          },
          {
            weight: 20,
            text: '你反问它的名字。它笑了，此后每夜都来报一次，一次比一次清楚。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 18 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_thunder_forge',
    title: '雷池炼骨',
    category: 'encounter',
    body: '雷池边有人在炼骨，把雷水一瓢一瓢浇在自己身上。他见你驻足，把瓢递过来，又指了指自己空着的左臂。',
    tierMin: 3,
    tierMax: 3,
    levelMin: 101,
    levelMax: 150,
    weight: 35,
    cooldownYears: 13,
    choices: [
      {
        id: 'resolve',
        label: '接过瓢，浇在自己骨上',
        outcomes: [
          {
            weight: 40,
            text: '骨头里像有细针在走，走完一遍，整个人反倒轻了。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 12 },
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'addToxicity', value: 6 },
            ],
          },
          {
            weight: 35,
            text: '你只肯把雷水浇在旧伤上。伤结了痂，一个卡了你很久的问题也顺带想通了。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'root' }, value: 8 },
            ],
          },
          {
            weight: 25,
            text: '雷水在你骨上炸开，你昏了半日。醒来时人已走了，只留下一只空瓢。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -5 },
              { op: 'addToxicity', value: 12 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_old_enemy_heir',
    title: '故敌之裔',
    category: 'fate',
    body: '云路上有人拦你。他还很年轻，眉眼像极了一个你亲手送走的旧敌。他说他已经等了很久。',
    tierMin: 3,
    tierMax: 3,
    levelMin: 101,
    levelMax: 150,
    weight: 30,
    cooldownYears: 13,
    choices: [
      {
        id: 'resolve',
        label: '停在云路上，与他面对面',
        outcomes: [
          {
            weight: 40,
            text: '你把当年的事原原本本讲了一遍，一句没添。他听完，转身走了。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 9 },
            ],
          },
          {
            weight: 35,
            text: '你任他出手。三招落空后他收了势，你顺手替他把散了的气引回经脉。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 10 },
              { op: 'add', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 25,
            text: '你没忍住，一掌推了出去。他倒在云上时，你听见自己心里有什么断了一声。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 15 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_chaos_gift',
    title: '混沌馈赠',
    category: 'fate',
    body: '云海自己让开了一条路，尽头悬着一缕混沌气，不攀附任何人。它在你面前停了停，像在认一件旧物。',
    tierMin: 4,
    tierMax: 4,
    levelMin: 101,
    levelMax: 150,
    weight: 15,
    cooldownYears: 15,
    requires: {
      op: 'and',
      of: [
        { op: 'realmAtLeast', level: 120 },
        { op: 'chance', p: 0.4 },
      ],
    },
    choices: [
      {
        id: 'resolve',
        label: '站在它面前，不动',
        outcomes: [
          {
            weight: 50,
            text: '那缕气自己落进你的识海，周天轰鸣了一整夜，云海退了三十里。',
            tone: 'xian',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 12 },
            ],
          },
          {
            weight: 30,
            text: '你没伸手，只朝它行了个礼。它在你的眉心停了一瞬才散，留下一点说不清的凉。',
            tone: 'xian',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'gainInsight', value: 8 },
            ],
          },
          {
            weight: 20,
            text: '你伸手去捉，它散了。云海在你面前重新合拢，像什么都没发生过。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -5 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
        ],
      },
    ],
  }),
  defineEvent({
    id: 'ev_imm_lower_immortal_banquet',
    title: '仙宴落帖',
    category: 'encounter',
    body: '一张素帖送来，只说某日云上有宴，席上有人替你备下了渡劫要用的东西。帖上没有主家的名姓。',
    tierMin: 4,
    tierMax: 4,
    levelMin: 101,
    levelMax: 150,
    weight: 10,
    cooldownYears: 15,
    choices: [
      {
        id: 'resolve',
        label: '按帖上时候，只身赴宴',
        outcomes: [
          {
            weight: 40,
            text: '你从头坐到尾，席上一句话也没多问。散席时袖中多了件不认得的小物。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 8 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 35,
            text: '席间有人让你先举盏。你举了，说这杯敬席上年纪最长的那位，满座皆笑。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 12 },
              { op: 'gainInsight', value: 6 },
            ],
          },
          {
            weight: 25,
            text: '酒过三巡你才看清帖底那行小字。宴是好宴，账却记在了你名下。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
            ],
          },
        ],
      },
    ],
  }),
] satisfies EventDef[];
