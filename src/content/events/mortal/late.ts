import { defineEvent } from '../../../engine/registry';
import type { EventDef } from '../../../engine/types/effects';

/**
 * 凡界后期池（60-200 级）：渡劫准备、大乘气象、旧人凋零、最后一次远行。
 * 基调苍茫收束——这是凡界的最后一段路。
 */
export const MORTAL_LATE = [
  defineEvent({
    id: 'ev_late_seclude',
    title: '山中无岁月',
    category: 'world',
    weight: 180,
    tierMin: 1,
    tierMax: 1,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 8,
    tags: ['静修'],
    body: '你封了洞府的石门，只留一线天光。山外的消息隔着石壁渗进来，渐渐听不清了。',
    choices: [
      {
        id: 'resolve',
        label: '把这一关坐穿',
        outcomes: [
          {
            weight: 50,
            text: '你不知坐了多久，睁眼时石上已积了一层薄灰，而丹田里那片海静得能照见自己。',
            tone: 'year',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 30,
            text: '修行如旧日流水，不长不短，你按时出关，身上带着一身沉静。',
            tone: 'year',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'add', target: { k: 'simPoints' }, value: 3 },
            ],
          },
          {
            weight: 20,
            text: '坐到第三年，你忽然想起许多人许多事，道心浮了一下，只好提前推门出关。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_fame_letters',
    title: '名帖如山',
    category: 'world',
    weight: 150,
    tierMin: 1,
    tierMax: 1,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 10,
    tags: ['威名'],
    body: '山门外的名帖堆到了台阶上，有请你去镇一方的，有请你出面说和的，也有只求见你一面的。',
    choices: [
      {
        id: 'resolve',
        label: '一一拆看',
        outcomes: [
          {
            weight: 45,
            text: '你择了几家应答，未出山门，事便平了——世间已习惯给你这个面子。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 5 },
              { op: 'add', target: { k: 'simPoints' }, value: 4 },
            ],
          },
          {
            weight: 35,
            text: '你把帖子都收了，往来应酬半年，人情账厚了一叠，修行却落下了些。',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 3 },
            ],
          },
          {
            weight: 20,
            text: '拆到一半，你把剩下的都投进了炉火。虚名烧起来，味道并不好闻，却让你想通了一件事。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 4 },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_old_friend_pass',
    title: '故人讣闻',
    category: 'bond',
    weight: 140,
    tierMin: 1,
    tierMax: 1,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 12,
    tags: ['旧友', '心境'],
    body: '一只旧纸鹤落在窗上，展开只有一行字：某年某月，某人去了。你认得那字迹，歪歪扭扭，写的人当年总说字丑不妨事。',
    choices: [
      {
        id: 'resolve',
        label: '把酒送去',
        outcomes: [
          {
            weight: 45,
            text: '你托人送了一坛酒到他坟前。同辈的人一个接一个地走，你忽然懂了自己站的是什么位置。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 4 }],
          },
          {
            weight: 30,
            text: '你独自去了旧地，在坟前坐到天亮。回来那日，你的气象反而更沉了一层。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'add', target: { k: 'simPoints' }, value: 3 },
            ],
          },
          {
            weight: 25,
            text: '你数了数还记得的名字，发现已经数不满一只手。天地忽然空阔得让人害怕，也让人清醒。',
            effects: [{ op: 'gainInsight', value: 5 }],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_mortal_town',
    title: '山下小城',
    category: 'world',
    weight: 130,
    tierMin: 1,
    tierMax: 1,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 10,
    tags: ['远行'],
    body: '你路过一座小城，城门还是旧名字，街上的铺子却换过三代人了。有孩童指着你的衣袂，说书先生正在讲你的故事。',
    choices: [
      {
        id: 'resolve',
        label: '在城里住一晚',
        outcomes: [
          {
            weight: 40,
            text: '你替一户人家治了顽疾，又留下几句调养的话。走出城门时，你听见身后有人在念你的好。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 6 }],
          },
          {
            weight: 35,
            text: '你在茶楼听说书人把你的旧事讲错了三处，却听得入神——原来世人记得的你，是另一个样子。',
            effects: [{ op: 'gainInsight', value: 4 }],
          },
          {
            weight: 25,
            text: '你想起自己也曾是这街上一个不知天高地厚的小子，念头一起，气血竟自行转了一周天。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_teach',
    title: '弟子问道',
    category: 'bond',
    weight: 110,
    tierMin: 1,
    tierMax: 1,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 9,
    tags: ['传承'],
    body: '最小的弟子捧着一柄木剑站在阶下，问出的却是你当年也问过、至今没有答案的那句话。',
    choices: [
      {
        id: 'resolve',
        label: '答他',
        outcomes: [
          {
            weight: 45,
            text: '你把走了几十年的路拆开讲给他听，讲着讲着，自己看见了从前没看见的岔口。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 4 }],
          },
          {
            weight: 30,
            text: '你说不清，便替他演了一遍。木剑收势时，山风停了半息，你自己也怔住。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 25,
            text: '你答不上来，只能坦白。弟子失望地走了，你却在那句话里卡了三天，出关时气象一新。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_artifact_warm',
    title: '温养旧器',
    category: 'world',
    weight: 100,
    tierMin: 1,
    tierMax: 1,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 9,
    tags: ['法宝'],
    body: '陪了你许多年的那件旧器，近来嗡鸣渐弱。你把它取出来，放在膝上以气机慢慢喂它。',
    choices: [
      {
        id: 'resolve',
        label: '以此气养它',
        outcomes: [
          {
            weight: 50,
            text: '养到第七夜，旧器忽然自行浮起，绕你一周，鸣声清亮如初铸。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'artifactBonus' }, value: 6 }],
          },
          {
            weight: 30,
            text: '它没能全好，却也稳住了，与你之间多了一线说不清的默契。',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 3 },
              { op: 'pct', target: { k: 'artifactPower' }, value: 3 },
            ],
          },
          {
            weight: 20,
            text: '气机喂过了头，器身迸出一道细纹。你把它收回鞘里，第一次觉得它也老了。',
            tone: 'red',
            effects: [
              { op: 'mul', target: { k: 'artifactPower' }, value: 0.95 },
              { op: 'sub', target: { k: 'luck' }, value: 2 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_junior_challenge',
    title: '后辈叩门',
    category: 'encounter',
    weight: 90,
    tierMin: 1,
    tierMax: 1,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 9,
    tags: ['威名'],
    body: '一个不足百岁的年轻人立在山门前，剑意张扬，说要试试传说里的你究竟有几分真。',
    choices: [
      {
        id: 'resolve',
        label: '让他试',
        outcomes: [
          {
            weight: 50,
            text: '你没有出手，只站着让他出了三剑。第四剑他自己收了，俯身一礼便下山去了。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 5 }],
          },
          {
            weight: 30,
            text: '你抬手拨偏他的剑锋，顺势点了两句。他愣在那里，你已转身回山。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'add', target: { k: 'luck' }, value: 3 },
            ],
          },
          {
            weight: 20,
            text: '他的剑比你想的快，衣袖被划开一道。你却因此想起了年轻时缺的那一课。',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
              { op: 'gainInsight', value: 3 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_old_house',
    title: '重返旧宅',
    category: 'world',
    weight: 80,
    tierMin: 1,
    tierMax: 1,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 12,
    tags: ['旧友'],
    body: '你回到出生的小院。屋顶塌了半边，院中那棵老树还活着，只是再不能遮住整个院子。',
    choices: [
      {
        id: 'resolve',
        label: '动手收拾',
        outcomes: [
          {
            weight: 40,
            text: '你把院子修好，托一户厚道人家看着。此后行路经过，总有一盏灯是为你留的。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'luck' }, value: 7 }],
          },
          {
            weight: 35,
            text: '你在墙上题了一行字，写完丢掉笔，觉得这一生的前半截终于有了个落款。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 25,
            text: '你拆了旧梁，把一柄早不用的剑埋在地基下。做完这事，你身上某一处忽然轻了。',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 4 },
              { op: 'add', target: { k: 'luck' }, value: 3 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_last_disciple',
    title: '最后一名弟子',
    category: 'bond',
    weight: 110,
    tierMin: 2,
    tierMax: 2,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 12,
    tags: ['传承'],
    once: true,
    body: '一个衣衫单薄的少年跪在山门外三天。你看着他，像看见很多年前的自己，也知道自己不会再有下一个徒弟了。',
    choices: [
      {
        id: 'resolve',
        label: '开门收徒',
        outcomes: [
          {
            weight: 45,
            text: '你把能教的都教了。少年学得慢，学得稳，走的时候背着你给的行囊，一步没回头。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'add', target: { k: 'simPoints' }, value: 5 },
            ],
          },
          {
            weight: 35,
            text: '你收下了他，也把自己最后一段路分了一半给他。弟子的路亮起来，你的路却短了一些。',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'sub', target: { k: 'luck' }, value: 3 },
            ],
          },
          {
            weight: 20,
            text: '你终究没有开门。三日后少年走了，你在门后站了很久，忽然明白断念也是一种成全。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'gainInsight', value: 3 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_rival_meet',
    title: '宿敌重逢',
    category: 'encounter',
    weight: 100,
    tierMin: 2,
    tierMax: 2,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 10,
    tags: ['宿敌'],
    body: '在一条不该有人的荒道上，你遇见了那位与你纠缠了半生的对手。他鬓角也白了，站在那里，像一块等你很久的石头。',
    choices: [
      {
        id: 'resolve',
        label: '走上前去',
        outcomes: [
          {
            weight: 45,
            text: '你邀他坐下喝了半坛酒，谁也没提旧账。分别时你们对了一礼，都松了手。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 4 },
              { op: 'add', target: { k: 'simPoints' }, value: 4 },
            ],
          },
          {
            weight: 30,
            text: '话不投机，你们隔空对了一记。荒道两边山石尽碎，而后各自退开，谁也没再追。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
            ],
          },
          {
            weight: 25,
            text: '你看了他很久，最终转身走了。身后的目光灼灼，你却没有回头——有些账，不结也是一种结法。',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 6 },
              { op: 'gainInsight', value: 2 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_dacheng_omen',
    title: '大乘气象',
    category: 'world',
    weight: 90,
    tierMin: 2,
    tierMax: 2,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 12,
    tags: ['大乘'],
    body: '你静坐时，山巅自起一层薄雾，草木朝你的方向倾倒。门人不敢靠近，只觉得师祖身上有一种不属于此世的静。',
    choices: [
      {
        id: 'resolve',
        label: '任它自行流转',
        outcomes: [
          {
            weight: 50,
            text: '气象一日盛过一日，方圆百里的灵气都往山中聚，你的道基被养得厚实。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'add', target: { k: 'luck' }, value: 4 },
            ],
          },
          {
            weight: 30,
            text: '气象外显太盛，招来不少窥探的目光。你不得不分心应付，修行慢了半步。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
            ],
          },
          {
            weight: 20,
            text: '你主动把气象压回体内。山巅复归平常，而你对"收"这个字的体会，深了一层。',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_starfall',
    title: '星陨如雨',
    category: 'world',
    weight: 80,
    tierMin: 2,
    tierMax: 2,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 14,
    tags: ['异象'],
    body: '夜里星落如雨，其中一颗坠向西边荒原，落地时天边亮了整整一息，随后是一声闷响。',
    choices: [
      {
        id: 'resolve',
        label: '循光而去',
        outcomes: [
          {
            weight: 45,
            text: '你在焦土中央找到一块仍烫手的星石，触手之际，那件旧器在怀里轻轻应了一声。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 4 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 4 },
            ],
          },
          {
            weight: 30,
            text: '你没有取走任何东西，只在坑边坐到天亮。星落之处大地翻卷，像翻开的书页。',
            tone: 'ev2',
            effects: [{ op: 'gainInsight', value: 5 }],
          },
          {
            weight: 25,
            text: '星火溅上你的手背，灼出一道细长的痕。那点余烬里却裹着一缕极纯的气机。',
            effects: [
              { op: 'addToxicity', value: 10 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_karma',
    title: '了结旧债',
    category: 'fate',
    weight: 90,
    tierMin: 2,
    tierMax: 2,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 12,
    tags: ['因果', '渡劫准备'],
    body: '一个早已荒废的家族找上门来，说当年你从他们祖上取走了一样东西。你记得那件事，也记得自己当时并不觉得有错。',
    choices: [
      {
        id: 'resolve',
        label: '把账清了',
        outcomes: [
          {
            weight: 45,
            text: '你加倍赔还，又替他们料理了一桩难事。离去时，缠在你气机上的那根细刺不见了。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 5 },
            ],
          },
          {
            weight: 30,
            text: '你以一段修为抵了这笔债。气海空了一角，可抬手时，天地对你似乎松了些。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -4 },
              { op: 'add', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 25,
            text: '你没有理会。夜里那道旧影又立在窗外，你看了一夜，明白有些东西是要跟着你过劫的。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 4 },
              { op: 'gainInsight', value: 3 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_mind_break',
    title: '心境澄明',
    category: 'fate',
    weight: 70,
    tierMin: 2,
    tierMax: 2,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 15,
    tags: ['心境'],
    body: '你在一个极平常的清晨睁眼，忽然发觉心里那些拧了几十年的结，不知何时已经散了。',
    choices: [
      {
        id: 'resolve',
        label: '顺着这口气走下去',
        outcomes: [
          {
            weight: 50,
            text: '你沿着山道一直走，走到日头偏西。这一日你什么都没做，却好像把一生重走了一遍。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
          {
            weight: 30,
            text: '那层窗户纸只破了一半，另一半还糊着。但你已经能看见纸后面的光了。',
            effects: [
              { op: 'gainInsight', value: 4 },
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
            ],
          },
          {
            weight: 20,
            text: '心念一松，蛰伏的东西就钻了空子。你及时回神，却也出了一身冷汗。',
            tone: 'red',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'addToxicity', value: 10 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_tribulation_drill',
    title: '引雷炼体',
    category: 'tribulation',
    weight: 85,
    tierMin: 2,
    tierMax: 2,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 10,
    tags: ['渡劫准备'],
    body: '雷雨将至，云里翻着紫白的光。你解开外袍走到山巅，想在那位"老朋友"落下来之前，先称一称它的分量。',
    choices: [
      {
        id: 'resolve',
        label: '迎上去',
        outcomes: [
          {
            weight: 45,
            text: '雷火穿过周身，你咬住牙根生受了。落地时衣衫焦黑，气海却被淬得发亮。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'addToxicity', value: 8 },
            ],
          },
          {
            weight: 30,
            text: '一道余雷打断了你的行气，你跌下三丈，肋骨疼了半月。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
            ],
          },
          {
            weight: 25,
            text: '雷光里你看见了劫云的形状，也看见了将来那一日它真正落下时的样子。',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'addToxicity', value: 6 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_beasts',
    title: '百兽来朝',
    category: 'world',
    weight: 60,
    tierMin: 2,
    tierMax: 2,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 9,
    tags: ['异象'],
    body: '入夜后山中出现许多兽影，鹿与狼挤在一处，谁也不咬谁，只是朝着你洞府的方向伏着。',
    choices: [
      {
        id: 'resolve',
        label: '不去惊动',
        outcomes: [
          {
            weight: 45,
            text: '你并未驱赶。天亮时兽群自行散去，山中留下一条被踏平的小径，像是某种无声的谢礼。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 6 },
              { op: 'gainInsight', value: 3 },
            ],
          },
          {
            weight: 30,
            text: '你以气机回应它们。兽群齐声低鸣，那声音里有一种你从未在人间听到的和顺。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 25,
            text: '兽群中混着一头不祥的异种，它撞破了你的药圃。你追出去时，它已咬伤了守山的弟子。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'gainInsight', value: 3 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_keepsake',
    title: '故人遗物',
    category: 'bond',
    weight: 75,
    tierMin: 2,
    tierMax: 2,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 12,
    tags: ['旧友'],
    body: '故人之后送来一只木匣，说长辈临终前交代，此物只有你能处置。匣中是一枚磨得发亮的旧剑穗。',
    choices: [
      {
        id: 'resolve',
        label: '收下它',
        outcomes: [
          {
            weight: 45,
            text: '你把剑穗系在自己的剑上。此后出剑时，总觉得身后站着一个人，替你看着死角和后背。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 5 },
              { op: 'gainInsight', value: 2 },
            ],
          },
          {
            weight: 30,
            text: '你当着他的后辈把剑穗焚了，灰撒进江里。有些牵挂烧成灰，反而轻得能带在身边。',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 7 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
            ],
          },
          {
            weight: 25,
            text: '你把它交还故人之后，只嘱咐好好活着。做完这件事，你觉得自己身上有一处被填上了。',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_peerless_peer',
    title: '同辈皆尽',
    category: 'bond',
    weight: 65,
    tierMin: 2,
    tierMax: 2,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 13,
    tags: ['旧友', '心境'],
    body: '你数遍天下，发现自己已是同一辈中活着的最年长的一个。山还是那座山，天下却换过一遍人了。',
    choices: [
      {
        id: 'resolve',
        label: '给自己温一壶酒',
        outcomes: [
          {
            weight: 45,
            text: '你对着空山独饮，把他们一个个念过。酒尽时，压在胸口几十年的那块东西化开了。',
            tone: 'ev2',
            effects: [{ op: 'gainInsight', value: 5 }],
          },
          {
            weight: 30,
            text: '你把他们的名字刻在洞府石壁上，一笔一划刻到日落。此后静修时，心里格外安静。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 3 },
            ],
          },
          {
            weight: 25,
            text: '你在山顶坐了一夜，冷得厉害。原来没有了同辈人，天地会显得这么空旷。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
              { op: 'gainInsight', value: 4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_found_sect',
    title: '开宗立派',
    category: 'sect',
    weight: 55,
    tierMin: 3,
    tierMax: 3,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 15,
    tags: ['开宗', '传承'],
    once: true,
    requires: { op: 'realmAtLeast', level: 80 },
    body: '门人越来越多，有人替你拟了章程，有人刻好了山门的匾。只等你一句话，这一脉便算立住了。',
    choices: [
      {
        id: 'resolve',
        label: '上匾，开门',
        outcomes: [
          {
            weight: 45,
            text: '匾额挂上那日山雾尽散。从此天下多了一处有人守着的山门，也多了许多与你有关的人。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 10 },
              { op: 'add', target: { k: 'simPoints' }, value: 8 },
            ],
          },
          {
            weight: 30,
            text: '你亲笔写下宗旨，只八个字。写完你才发觉，这八个字是你用一生换来的。',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
            ],
          },
          {
            weight: 25,
            text: '你把匾取了下来，只留下一句话给门人："路各人自己走。"山门未成，你的道却立住了。',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_gather_xianqi',
    title: '仙灵入怀',
    category: 'fate',
    weight: 50,
    tierMin: 3,
    tierMax: 3,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 15,
    tags: ['渡劫准备', '仙缘'],
    body: '子时吐纳，你忽然在凡界稀薄的灵气里，摸到了一缕极淡的、不属于这里的东西。它像一线冷泉，游过你的指缝。',
    choices: [
      {
        id: 'resolve',
        label: '以气海引它入体',
        outcomes: [
          {
            weight: 45,
            text: '那一缕气在识海里落定，安静得几乎不存在。你却知道，往后若有难关，它是能替你挡一次的。',
            tone: 'xian',
            effects: [
              { op: 'add', target: { k: 'xianqi' }, value: 1 },
              { op: 'gainInsight', value: 2 },
              { op: 'log', text: '识海深处凝住一缕仙灵气。', tone: 'xian' },
            ],
          },
          {
            weight: 30,
            text: '你强留了它一夜，天亮时它勉强留在丹田，你的经脉却被磨得发涩。',
            tone: 'xian',
            effects: [
              { op: 'add', target: { k: 'xianqi' }, value: 1 },
              { op: 'addToxicity', value: 10 },
            ],
          },
          {
            weight: 25,
            text: '那缕气在你掌心一转，又散了。余下的寒意钻进骨缝，半月才退。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_ancient_ruin',
    title: '上古遗迹',
    category: 'world',
    weight: 45,
    tierMin: 3,
    tierMax: 3,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 14,
    tags: ['遗迹'],
    body: '地裂之后，一处被埋在土下不知多少万年的石殿露了出来。殿门上的纹路比你所知的任何一种文字都老。',
    choices: [
      {
        id: 'resolve',
        label: '一个人走进去',
        outcomes: [
          {
            weight: 45,
            text: '殿中空无一物，只有墙上残缺的半幅图。你照着它运了一周天，气血走的路线与往常全不相同。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 5 },
              { op: 'gainInsight', value: 3 },
            ],
          },
          {
            weight: 30,
            text: '你只取走一块刻着字的碎石。回山路上反复看那几笔，越看越觉得自己从前的路走窄了。',
            tone: 'rare',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 3 },
            ],
          },
          {
            weight: 25,
            text: '你走出三步，殿顶便落了下来。你带着一身土爬出来，图还没看清。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 5 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_suppress_demon',
    title: '压心魔',
    category: 'fate',
    weight: 35,
    tierMin: 3,
    tierMax: 3,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 12,
    tags: ['渡劫准备', '心境'],
    requires: { op: 'cmp', target: { k: 'toxicity' }, cmp: '>=', value: 20 },
    body: '静极之时，那道声音又从识海底下浮上来，用的是你自己的嗓子，说着你一直不肯承认的话。',
    choices: [
      {
        id: 'resolve',
        label: '与它对面坐着',
        outcomes: [
          {
            weight: 50,
            text: '你不辩不斥，只看着它。它说了一夜，天亮时自己哑了，识海底下那点火也被你摁平。',
            tone: 'gold',
            effects: [
              { op: 'clamp', target: { k: 'toxicity' }, hi: 60 },
              { op: 'gainInsight', value: 3 },
              { op: 'log', text: '心魔伏下，丹毒之势被压住。', tone: 'gold' },
            ],
          },
          {
            weight: 30,
            text: '你与它谈了一夜，各让一步。它退回了深处，而你对它究竟想要什么，第一次有了底。',
            tone: 'ev3',
            effects: [
              { op: 'gainInsight', value: 5 },
              {
                op: 'if',
                cond: { op: 'toxicityAtMost', value: 50 },
                then: [{ op: 'clamp', target: { k: 'toxicity' }, hi: 50 }],
                else: [{ op: 'addToxicity', value: 8 }],
              },
            ],
          },
          {
            weight: 20,
            text: '你终究被它说动了半分。醒来时满口腥甜，静修的功夫去了大半。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 18 },
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_last_journey',
    title: '最后一次远行',
    category: 'world',
    weight: 30,
    tierMin: 3,
    tierMax: 3,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 15,
    tags: ['远行'],
    body: '你封了洞府，背上只带一囊干粮。你想在雷落下之前，把这片天地再看一遍——走慢些，看清楚些。',
    choices: [
      {
        id: 'resolve',
        label: '往最远的地方去',
        outcomes: [
          {
            weight: 45,
            text: '你走到了雪线之上，那里只有风和石。你站在极静处，听见自己血流的声音像大江。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 8 },
              { op: 'gainInsight', value: 4 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
          {
            weight: 30,
            text: '你走遍旧地，最后绕回山中。推开洞府石门时，你觉得这一次远行其实是往回走。',
            effects: [{ op: 'gainInsight', value: 6 }],
          },
          {
            weight: 25,
            text: '走到半途你病倒了，在一户猎人家躺了整整一冬。回来时你少了一件行李，多了一层明白。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'gainInsight', value: 5 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_blood_moon',
    title: '血月当空',
    category: 'world',
    weight: 25,
    tierMin: 3,
    tierMax: 3,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 13,
    tags: ['异象', '渡劫准备'],
    body: '那一夜月亮是暗红的，地脉在脚下嗡嗡作响，方圆百里的走兽全都噤了声。有人说是凶兆，有人说是机缘。',
    choices: [
      {
        id: 'resolve',
        label: '立于月下',
        outcomes: [
          {
            weight: 45,
            text: '你借着那股邪火冲击旧关。血月西沉时，你身上某处早该打开的关隘，开了。',
            tone: 'ev3',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 9 },
              { op: 'addToxicity', value: 10 },
            ],
          },
          {
            weight: 30,
            text: '你没有管自己的机缘，先下山守住了城里的人。回来时血月已散，人们只记得那夜有个不知名的身影。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 8 },
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
            ],
          },
          {
            weight: 25,
            text: '邪火搅乱了你的气机，一夜之间你竟老了许多。镜中的人让你看了很久。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'root' }, value: 4 },
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_stele',
    title: '立碑留书',
    category: 'world',
    weight: 20,
    tierMin: 3,
    tierMax: 3,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 15,
    tags: ['传承'],
    requires: { op: 'lifeAtLeast', n: 2 },
    body: '你忽然想给后来的人留点什么。这一世走来，弯路比直路多，可那些弯路才是你真正会的东西。',
    choices: [
      {
        id: 'resolve',
        label: '刻在崖上',
        outcomes: [
          {
            weight: 45,
            text: '你把一生的心得一句句刻上崖壁，刻了整整一年。刻完那日，你觉得这一世终于有了交代。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 5 },
            ],
          },
          {
            weight: 30,
            text: '千言万语最后只留下三个字。风吹过崖壁，字迹在光里亮了一下，你便转身走了。',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
              { op: 'gainInsight', value: 3 },
            ],
          },
          {
            weight: 25,
            text: '写到一半你停了，后半句终究没有落笔。有些话只能自己受用，碑留半截，也算一句提醒。',
            effects: [
              { op: 'gainInsight', value: 4 },
              { op: 'add', target: { k: 'simPoints' }, value: 5 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_rival_final',
    title: '宿敌终局',
    category: 'encounter',
    weight: 12,
    tierMin: 4,
    tierMax: 4,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 15,
    tags: ['宿敌'],
    once: true,
    body: '他找上了你，没有带人，也没有多余的客套。这一次谁都知道，不必再有下一次了。',
    choices: [
      {
        id: 'resolve',
        label: '接下这一场',
        outcomes: [
          {
            weight: 45,
            text: '你胜了半招，却在最后一刻收住。他坐在地上大笑，笑到咳嗽，然后把手伸给了你。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 6 },
            ],
          },
          {
            weight: 30,
            text: '你们打到天昏地暗，最后各断一臂一臂的气脉。他倒下去时，你替他合上了眼。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
              { op: 'addToxicity', value: 15 },
            ],
          },
          {
            weight: 25,
            text: '你输了一招，他却先一步力竭。他躺着看你，说了句"你比我活得久"，便不再出声。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'root' }, value: 4 },
              { op: 'gainInsight', value: 6 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_dao_mark',
    title: '门后道痕',
    category: 'world',
    weight: 10,
    tierMin: 4,
    tierMax: 4,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 15,
    tags: ['遗迹', '仙缘'],
    once: true,
    body: '遗迹最深处的石门没有锁，也没有推手。门缝里透出的不是光，是一种你认得却说不出的东西——像很久以前有人在此处站过。',
    choices: [
      {
        id: 'resolve',
        label: '推门',
        outcomes: [
          {
            weight: 45,
            text: '门后是一面空壁，壁上有一道人形的浅痕。你在痕前坐了三日，起身时脚步轻得像要离地。',
            tone: 'xian',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'pct', target: { k: 'cultivation' }, value: 9 },
            ],
          },
          {
            weight: 30,
            text: '门后石台上搁着半截断器，入手冰凉。它认了你，你却也沾了它身上不知多少年的旧气。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 5 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 8 },
              { op: 'addToxicity', value: 12 },
            ],
          },
          {
            weight: 25,
            text: '门后什么都没有，空得让人发笑。你退出来时，却觉得肩上忽然轻了一件背了很久的东西。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 10 },
              { op: 'gainInsight', value: 4 },
            ],
          },
        ],
      },
    ],
  }),

  defineEvent({
    id: 'ev_late_ascend_omen',
    title: '云开一线',
    category: 'fate',
    weight: 15,
    tierMin: 4,
    tierMax: 4,
    levelMin: 60,
    levelMax: 200,
    cooldownYears: 15,
    tags: ['大乘', '渡劫准备'],
    once: true,
    body: '午后你抬头，看见云层破开一线，光柱直直落在你身上。那一瞬间，你听见很远的地方有雷在等你。',
    choices: [
      {
        id: 'resolve',
        label: '迎着那道光站定',
        outcomes: [
          {
            weight: 45,
            text: '光落在身上不烫，反倒像有人替你把体内多年的郁结一寸寸抚平。你站到日落，什么都没想。',
            tone: 'xian',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 10 },
              { op: 'gainInsight', value: 5 },
            ],
          },
          {
            weight: 30,
            text: '你在光里看清了自己将要走的那条路的形状。它不长，但很窄，窄得只容得下你一个人。',
            tone: 'ev4',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 9 },
              { op: 'add', target: { k: 'luck' }, value: 4 },
            ],
          },
          {
            weight: 25,
            text: '云合上了，光也就没了。你站在原地，只觉浑身疲惫，像是提前把那道雷受了一遍。',
            tone: 'ev4',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 5 },
              { op: 'gainInsight', value: 6 },
            ],
          },
        ],
      },
    ],
  }),
] satisfies EventDef[];
