import { defineEvent } from '../../../engine/registry';
import type { EventDef } from '../../../engine/types/effects';

export const MORTAL_MID = [
  defineEvent({
    id: 'ev_mid_sect_faction_tear',
    title: '丹堂分席',
    category: 'sect',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 150,
    cooldownYears: 8,
    body: '丹堂首座与执法长老各据一席，堂中弟子被传按座次站定，你恰在过道中央。',
    choices: [
      {
        id: 'resolve',
        label: '拱手退到门外',
        outcomes: [
          {
            weight: 60,
            text: '你退到廊下，两边都不好发作，事后各有一份薄礼送到你手中。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 4 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 40,
            text: '你被记作不表态之人，两边都对你淡了几分，你倒把这门中人情看透了些。',
            tone: 'ev2',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
              { op: 'gainInsight', value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_pill_qi_surge',
    title: '速成丹',
    category: 'alchemy',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 140,
    cooldownYears: 10,
    body: '同门递来一枚赤色丹丸，说吞下便可省去三月苦功，只是丹香里透着一股燥气。',
    choices: [
      {
        id: 'resolve',
        label: '捻丸在手细看',
        outcomes: [
          {
            weight: 55,
            text: '你吞丹入腹，修为如添薪之火，经脉深处却留下一线灼痕。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'addToxicity', value: 12 }
            ]
          },
          {
            weight: 45,
            text: '你将丹丸压在舌下终是没咽，另寻静室苦修三月，底气反而更足。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 1 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_market_haggle',
    title: '坊市讨价',
    category: 'world',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 160,
    cooldownYears: 8,
    body: '坊市角落里有人兜售一袋碎灵石，开价虚高，眼神却飘忽不定。',
    choices: [
      {
        id: 'resolve',
        label: '蹲下身来验货',
        outcomes: [
          {
            weight: 60,
            text: '你压下半数价钱，对方咬牙成交，你抱着袋子快步离开。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 5 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 40,
            text: '你识出石中掺了凡料，放下便走，倒把辨材的门道记了个牢。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 2 }]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_peer_mock',
    title: '同辈讥声',
    category: 'encounter',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 130,
    cooldownYears: 9,
    body: '演武场上，同辈借切磋之名招式狠辣，围观者哄笑成片。',
    choices: [
      {
        id: 'resolve',
        label: '立定桩步应招',
        outcomes: [
          {
            weight: 55,
            text: '你硬接三招不退，反手将他掀翻在地，讥声顿止。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'root' }, value: 3 }]
          },
          {
            weight: 45,
            text: '你收招认负，把那份憋闷咽进肚里，夜里打坐时心口仍堵。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_artifact_warm_vein',
    title: '温养法器',
    category: 'world',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 120,
    cooldownYears: 10,
    body: '夜里打坐，法器在膝上微微发烫，似有未醒的纹路在游走。',
    choices: [
      {
        id: 'resolve',
        label: '以真气缓缓养去',
        outcomes: [
          {
            weight: 70,
            text: '你以真气温养至天明，器身灵光凝实一分。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 2 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 2 }
            ]
          },
          {
            weight: 30,
            text: '你气息稍急，器上纹路暗了暗，好在及时收手未曾伤器。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 1 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_retreat_prep',
    title: '闭关前夜',
    category: 'world',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 110,
    cooldownYears: 12,
    body: '你决意闭一次死关，把灵材与符纸一一清点，窗外月色正好。',
    choices: [
      {
        id: 'resolve',
        label: '净手调息，静待时辰',
        outcomes: [
          {
            weight: 65,
            text: '你静心三日调匀气息，入关时神完气足。',
            tone: 'ev1',
            effects: [{ op: 'pct', target: { k: 'cultivation' }, value: 3 }]
          },
          {
            weight: 35,
            text: '你心浮气躁，反复清点仍觉有缺，只好把关期往后推了推。',
            tone: 'ev2',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
              { op: 'gainInsight', value: 1 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_caravan_road',
    title: '随队赶路',
    category: 'encounter',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 100,
    cooldownYears: 9,
    body: '一支商队缺个识路的护卫，领队许你两成货利，同行者却个个面生。',
    choices: [
      {
        id: 'resolve',
        label: '接下这趟差事',
        outcomes: [
          {
            weight: 60,
            text: '一路无惊，你分得足额报酬，还认下了几条商道。',
            tone: 'gold',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 5 }]
          },
          {
            weight: 40,
            text: '半途遇劫，你护住半数货物，自己添了几处伤，领队仍谢了你。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 2 },
              { op: 'add', target: { k: 'root' }, value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_take_blame',
    title: '替人担责',
    category: 'bond',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 95,
    cooldownYears: 10,
    body: '同门失手坏了禁地阵法，执法堂问话时，他低着头不敢出声。',
    choices: [
      {
        id: 'resolve',
        label: '上前一步',
        outcomes: [
          {
            weight: 60,
            text: '你揽下罪责，挨了罚，那人此后处处向着你。',
            tone: 'ev2',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'add', target: { k: 'luck' }, value: 3 }
            ]
          },
          {
            weight: 40,
            text: '你如实相告，免了责罚，那人却从此不再与你多言。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 2 }]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_accept_disciple',
    title: '门前长跪',
    category: 'sect',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 105,
    cooldownYears: 12,
    body: '山下少年跪了三日，膝前摆着一块磨得发亮的木牌，说是他全部家当。',
    choices: [
      {
        id: 'resolve',
        label: '出门细看这少年',
        outcomes: [
          {
            weight: 60,
            text: '你收他入门，少年磕头时眼睛亮得吓人，你心里也添了一分牵挂。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: 2 }
            ]
          },
          {
            weight: 40,
            text: '你只收下木牌，让他先去杂役处历练，他一声不吭地去了。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 3 },
              { op: 'gainInsight', value: 1 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_grudge_at_door',
    title: '旧怨叩门',
    category: 'encounter',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 90,
    cooldownYears: 9,
    body: '多年前结下的对头寻到你的居所，站在门外不出恶声，只把剑鞘顿了三下。',
    choices: [
      {
        id: 'resolve',
        label: '推门出去看看',
        outcomes: [
          {
            weight: 55,
            text: '你出门应战，对方修为见长，招式却仍被你摸透，几招便见了分晓。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 3 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 45,
            text: '你避而不出，对方留话而去，一段旧事又在门中传开。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 5 },
              { op: 'gainInsight', value: 1 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_ruin_shard',
    title: '废墟残片',
    category: 'world',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 115,
    cooldownYears: 9,
    body: '荒山断壁间散着焦黑的瓦砾，一块残片埋在土里，边缘还带着阵纹。',
    choices: [
      {
        id: 'resolve',
        label: '蹲下细辨纹路',
        outcomes: [
          {
            weight: 60,
            text: '你顺着纹路推演了半日，思路忽然贯通，比得一件器物还值。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 2 }]
          },
          {
            weight: 40,
            text: '你掘得急了些，残片应手而碎，只换回几块能用的材料。',
            tone: 'ev2',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 3 }]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_heart_whisper',
    title: '心魔低语',
    category: 'fate',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 85,
    cooldownYears: 12,
    body: '静室无声，你却听见一个极像自己的声音，在耳边问你为何还要忍。',
    choices: [
      {
        id: 'resolve',
        label: '闭目守心',
        outcomes: [
          {
            weight: 55,
            text: '你守住灵台，任那声音散去，再睁眼时心境清了一层。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 2 }]
          },
          {
            weight: 45,
            text: '你随那声音想了下去，修为竟自行涨了一截，只是心头蒙了灰。',
            tone: 'ev3',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'sub', target: { k: 'luck' }, value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_name_spread',
    title: '名号初显',
    category: 'world',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 100,
    cooldownYears: 10,
    body: '坊间开始有人提起你的名号，说者添油加醋，听者将信将疑。',
    choices: [
      {
        id: 'resolve',
        label: '由他们说去',
        outcomes: [
          {
            weight: 65,
            text: '几名散修慕名来投，你挑了两个看着顺眼的留下。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 4 },
              { op: 'add', target: { k: 'luck' }, value: 3 }
            ]
          },
          {
            weight: 35,
            text: '名号招来好事者登门讨教，你应付了半月，只觉得腻。',
            tone: 'ev2',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
              { op: 'gainInsight', value: 1 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_pill_decline',
    title: '末枚丹药',
    category: 'alchemy',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 125,
    cooldownYears: 11,
    body: '师徒分丹时轮到你，丹炉里只剩最末一枚，成色比旁人的差了一线。',
    choices: [
      {
        id: 'resolve',
        label: '伸手之前先停了停',
        outcomes: [
          {
            weight: 60,
            text: '你推了丹丸，回房按部就班运功，进境虽缓，根基却更稳。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 1 }
            ]
          },
          {
            weight: 40,
            text: '你收下丹丸留作后用，揣在怀里时心里已在盘算何时动用。',
            tone: 'ev2',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 3 }]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_sect_chore',
    title: '堂中杂役',
    category: 'sect',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 170,
    cooldownYears: 8,
    body: '轮到你在藏经阁值役，把散乱的玉简一册册归位，枯燥得让人打瞌睡。',
    choices: [
      {
        id: 'resolve',
        label: '逐册归位',
        outcomes: [
          {
            weight: 65,
            text: '你顺手翻了几册旁门记载，虽杂乱，却隐约摸到了贯通之处。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 2 }]
          },
          {
            weight: 35,
            text: '你腰酸背疼捱到交班，领了月例，也算没白熬这一日。',
            tone: 'ev2',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 5 }]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_righteous_watch',
    title: '邪修过境',
    category: 'world',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 95,
    cooldownYears: 9,
    body: '一名气息阴冷的修士借宿镇中，夜里有人家灯火骤灭，镇上无人敢出。',
    choices: [
      {
        id: 'resolve',
        label: '暗中守着那一户',
        outcomes: [
          {
            weight: 55,
            text: '你出手截下那人，交手间摸出他功法的门道，也承了镇上人情。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: 3 }
            ]
          },
          {
            weight: 45,
            text: '你按住不动，天亮后再去看，只在墙根发现一滩黑水。',
            tone: 'ev2',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_junior_spite',
    title: '同门相欺',
    category: 'sect',
    tierMin: 1,
    tierMax: 1,
    levelMin: 25,
    levelMax: 85,
    weight: 105,
    cooldownYears: 9,
    body: '新入门的弟子仗着家中势力，把你的份额扣下一半，还当面摔了你的玉牌。',
    choices: [
      {
        id: 'resolve',
        label: '弯腰拾起玉牌',
        outcomes: [
          {
            weight: 60,
            text: '你当众说了三句话，那弟子涨红了脸，份额原样送回。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 40,
            text: '你忍了这口气，只在夜里把招式多练了两个时辰。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
              { op: 'gainInsight', value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_faction_vote',
    title: '举手表决',
    category: 'sect',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 90,
    cooldownYears: 10,
    requires: { op: 'realmAtLeast', level: 35 },
    body: '门中两派对一桩旧案争执不下，长老要众人当场表态，笔录就摊在案上。',
    choices: [
      {
        id: 'resolve',
        label: '看准了再开口',
        outcomes: [
          {
            weight: 60,
            text: '你选了势大的一方，事后分得一份实差，手头也宽裕起来。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 3 }
            ]
          },
          {
            weight: 40,
            text: '你押错了边，被分去守山，白耗了许多时日，倒把人心看了个明白。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_pill_rush_bet',
    title: '丹助冲关',
    category: 'alchemy',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 85,
    cooldownYears: 12,
    body: '关隘就在眼前，一枚烈性丹药在你掌心发烫，服下或可省去数年苦功。',
    choices: [
      {
        id: 'resolve',
        label: '闭目权衡',
        outcomes: [
          {
            weight: 50,
            text: '药力冲开阻滞，你一日千里，经脉里却像埋了一把火。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'addToxicity', value: 18 }
            ]
          },
          {
            weight: 50,
            text: '你只服半枚，火候平了些，进境慢了，却给自己留了后路。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'addToxicity', value: 6 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_secret_map',
    title: '残图在手',
    category: 'world',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 70,
    cooldownYears: 12,
    body: '你用一件旧物换来半张残图，图上山川与今日地貌已对不上几处。',
    choices: [
      {
        id: 'resolve',
        label: '照着图走一趟',
        outcomes: [
          {
            weight: 60,
            text: '你按图索骥，寻到一处半塌的洞府，取出了些前人遗留。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 6 },
              { op: 'add', target: { k: 'root' }, value: 2 }
            ]
          },
          {
            weight: 40,
            text: '你在山中转了三日，脚底磨破，只带回一身见识。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_artifact_deep_soak',
    title: '器灵初醒',
    category: 'world',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 65,
    cooldownYears: 13,
    body: '法器在你怀中沉眠多日，今夜忽有微光顺着纹路爬行，像有什么要醒。',
    choices: [
      {
        id: 'resolve',
        label: '以精血相引',
        outcomes: [
          {
            weight: 55,
            text: '器身嗡鸣一声，与你心意接通了半分，握在手里已如旧识。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 3 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 3 }
            ]
          },
          {
            weight: 45,
            text: '你气血一虚，法器重归沉寂，只留下几道更亮的纹。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 2 },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_grand_meet',
    title: '会武受挫',
    category: 'encounter',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 60,
    cooldownYears: 10,
    body: '三山会武，你的对手比你年长一轮，上台前还在与人说笑。',
    choices: [
      {
        id: 'resolve',
        label: '按剑上台',
        outcomes: [
          {
            weight: 50,
            text: '你以巧破力，撑过百招后险胜，台下有人开始记你的名字。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 5 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 50,
            text: '你在第三十招上被击落台下，伤势不轻，却也看清了自己的短处。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'sub', target: { k: 'luck' }, value: 3 },
              { op: 'gainInsight', value: 3 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_recruit_prodigy',
    title: '璞玉少年',
    category: 'sect',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 55,
    cooldownYears: 14,
    body: '你在山径上撞见一个少年，能徒手引动林间雾气，见你便拜。',
    choices: [
      {
        id: 'resolve',
        label: '考较他几句',
        outcomes: [
          {
            weight: 60,
            text: '你亲自教了他第一段口诀，他的领悟之快让你也心生触动。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: 2 }
            ]
          },
          {
            weight: 40,
            text: '你将他荐给长辈，孩子记下了你的引荐之情，长辈也高看你一眼。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 4 },
              { op: 'add', target: { k: 'simPoints' }, value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_demon_offer',
    title: '邪道兜售',
    category: 'fate',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 50,
    cooldownYears: 13,
    body: '一名面带笑意的散修拦住你，说他手里有门捷径，代价只在你自己身上。',
    choices: [
      {
        id: 'resolve',
        label: '听他讲完',
        outcomes: [
          {
            weight: 50,
            text: '你试了他的法门，修为涨得飞快，夜里却在镜中看见陌生的自己。',
            tone: 'ev3',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'addToxicity', value: 15 }
            ]
          },
          {
            weight: 50,
            text: '你婉拒了他，回头把这段见闻记下，反倒想通了一层道理。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_caravan_ambush',
    title: '峡口遇袭',
    category: 'encounter',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 60,
    cooldownYears: 10,
    body: '你随的商队在峡口被截，对方人数不多，却个个是老手。',
    choices: [
      {
        id: 'resolve',
        label: '拔刀挡在货箱前',
        outcomes: [
          {
            weight: 55,
            text: '你护着货箱杀出峡口，领队把酬金翻了一倍，还替你扬了名。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 7 },
              { op: 'add', target: { k: 'root' }, value: 2 }
            ]
          },
          {
            weight: 45,
            text: '货散人伤，你只拿到半数酬金，还被记了一笔不是。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 2 },
              { op: 'sub', target: { k: 'luck' }, value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_shield_elder',
    title: '替长老挡灾',
    category: 'sect',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 45,
    cooldownYears: 13,
    body: '长辈与人论道，对方言辞渐厉，一道暗劲顺着话音逼向长老旧伤处。',
    choices: [
      {
        id: 'resolve',
        label: '横身向前一步',
        outcomes: [
          {
            weight: 55,
            text: '你硬接那记暗劲，长老事后记了你一功，门中看你的眼神也变了。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 5 },
              { op: 'add', target: { k: 'simPoints' }, value: 4 }
            ]
          },
          {
            weight: 45,
            text: '暗劲入体，你调养了许久，好在长老的指点比药更管用。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 5 },
              { op: 'add', target: { k: 'root' }, value: 2 },
              { op: 'gainInsight', value: 1 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_old_foe_duel',
    title: '旧仇了断',
    category: 'encounter',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 50,
    cooldownYears: 12,
    requires: { op: 'lifeAtLeast', n: 2 },
    body: '你与那对头的恩怨可追到上辈子，今日他约你于断桥，说要把旧账一次算清。',
    choices: [
      {
        id: 'resolve',
        label: '赴约上桥',
        outcomes: [
          {
            weight: 55,
            text: '你以稳取胜，两家旧账算清，你的修为也在这场生死间涨了一截。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'add', target: { k: 'root' }, value: 4 }
            ]
          },
          {
            weight: 45,
            text: '你虽未败，却也伤得不轻，养伤的日子白白流走。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 6 },
              { op: 'gainInsight', value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_heart_mirror',
    title: '照心古镜',
    category: 'fate',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 55,
    cooldownYears: 13,
    body: '古镜藏在废塔顶层，镜面照不出你的脸，只照出你心底最不愿认的那一面。',
    choices: [
      {
        id: 'resolve',
        label: '站定看它',
        outcomes: [
          {
            weight: 55,
            text: '你看清了镜中那面，也看清了自己，出门时脚步轻了许多。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 3 }]
          },
          {
            weight: 45,
            text: '你怒而砸镜，镜碎时反噬心神，此后好些日子都不自在。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 5 },
              { op: 'gainInsight', value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_fame_invite',
    title: '名帖纷至',
    category: 'world',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 65,
    cooldownYears: 11,
    requires: { op: 'cmp', target: { k: 'luck' }, cmp: '>=', value: 10 },
    body: '名号传开后，各方名帖压了案头一角，有请赴宴的，也有邀共探秘境的。',
    choices: [
      {
        id: 'resolve',
        label: '一封封拆看',
        outcomes: [
          {
            weight: 60,
            text: '你挑了一封顺眼的赴约，席上结识了几位日后用得着的人。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 40,
            text: '你谁的约都不赴，闭门读了半月旧书，心境倒是开阔。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 3 }]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_grotto_spring',
    title: '地脉暖泉',
    category: 'world',
    tierMin: 2,
    tierMax: 2,
    levelMin: 25,
    levelMax: 85,
    weight: 70,
    cooldownYears: 12,
    body: '秘境深处有一眼暖泉，水汽里裹着淡淡药香，泡之似可洗去暗伤。',
    choices: [
      {
        id: 'resolve',
        label: '解衣入泉',
        outcomes: [
          {
            weight: 60,
            text: '你泡了三日，旧伤尽去，气机也顺了几分。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 5 },
              { op: 'add', target: { k: 'simPoints' }, value: 3 }
            ]
          },
          {
            weight: 40,
            text: '泉水烫得古怪，你泡到半途便上岸，只觉精神尚可。',
            tone: 'ev2',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 4 }]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_sect_schism',
    title: '山门骤静',
    category: 'sect',
    tierMin: 3,
    tierMax: 3,
    levelMin: 25,
    levelMax: 85,
    weight: 45,
    cooldownYears: 14,
    requires: { op: 'realmAtLeast', level: 40 },
    body: '执法堂一夜之间封了三处通道，两位长老各率一批弟子下了山，山门静得反常。',
    choices: [
      {
        id: 'resolve',
        label: '留在原处不动',
        outcomes: [
          {
            weight: 55,
            text: '你留了下来，事后接掌空出的差事，名分与实惠都占着了。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 6 },
              { op: 'add', target: { k: 'simPoints' }, value: 6 }
            ]
          },
          {
            weight: 45,
            text: '你随旧识出走，一路上颠沛，却把各路人马看了个透。',
            tone: 'ev2',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'add', target: { k: 'luck' }, value: 3 },
              { op: 'gainInsight', value: 3 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_alchemist_legacy',
    title: '丹师遗承',
    category: 'alchemy',
    tierMin: 3,
    tierMax: 3,
    levelMin: 25,
    levelMax: 85,
    weight: 35,
    cooldownYears: 14,
    requires: { op: 'realmAtLeast', level: 42 },
    body: '一位坐化多年的丹师洞府被你撞开，石台上一只残炉仍在缓缓吐着青烟。',
    choices: [
      {
        id: 'resolve',
        label: '探手入炉',
        outcomes: [
          {
            weight: 50,
            text: '你吞下炉底那枚温热的遗丹，修为陡进，经脉却隐隐作痛。',
            tone: 'ev4',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
              { op: 'addToxicity', value: 15 }
            ]
          },
          {
            weight: 50,
            text: '你封炉不取，把碑上的残方一并抄录，所得另是一路。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: 4 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_relic_pool',
    title: '池底古器',
    category: 'world',
    tierMin: 3,
    tierMax: 3,
    levelMin: 25,
    levelMax: 85,
    weight: 30,
    cooldownYears: 14,
    body: '枯池底露出半截古器，器身缠着沉泥，拨开时池壁震了一下。',
    choices: [
      {
        id: 'resolve',
        label: '下池起器',
        outcomes: [
          {
            weight: 55,
            text: '你起出古器，以真气洗净，法器与你的气息渐渐相合。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 4 },
              { op: 'pct', target: { k: 'artifactPower' }, value: 2 }
            ]
          },
          {
            weight: 45,
            text: '池壁塌了半边，你只抢出碎片，另捡了几样零碎换钱。',
            tone: 'ev3',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: 5 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_evil_clash',
    title: '腥风相逢',
    category: 'encounter',
    tierMin: 3,
    tierMax: 3,
    levelMin: 25,
    levelMax: 85,
    weight: 25,
    cooldownYears: 13,
    body: '你与一名以血养功的邪修狭路相逢，对方身上缠着刺鼻的腥甜气。',
    choices: [
      {
        id: 'resolve',
        label: '截住他的去路',
        outcomes: [
          {
            weight: 50,
            text: '你拼着受创将他留下，事后声名大振，也从他的遗物中得了东西。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 4 }
            ]
          },
          {
            weight: 50,
            text: '你被那血气侵体，退走时狼狈，调养中反悟出几分功理。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 6 },
              { op: 'addToxicity', value: 8 },
              { op: 'gainInsight', value: 2 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_heart_seed',
    title: '心头一点热',
    category: 'fate',
    tierMin: 3,
    tierMax: 3,
    levelMin: 25,
    levelMax: 85,
    weight: 25,
    cooldownYears: 14,
    body: '你察觉丹田旁多了一点温热，既不属于修为，也不属于旧伤，夜里它会轻轻跳。',
    choices: [
      {
        id: 'resolve',
        label: '内视那一处',
        outcomes: [
          {
            weight: 50,
            text: '你以静功慢慢将它磨平，费却不少时日，心境却更硬了。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 3 },
              { op: 'sub', target: { k: 'simPoints' }, value: 4 }
            ]
          },
          {
            weight: 50,
            text: '你放任那点温热自行生长，修为因此走快，只是每一步都踩在薄冰上。',
            tone: 'ev3',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'sub', target: { k: 'luck' }, value: 3 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_seclusion_gate',
    title: '关隘难开',
    category: 'world',
    tierMin: 3,
    tierMax: 3,
    levelMin: 25,
    levelMax: 85,
    weight: 20,
    cooldownYears: 15,
    requires: {
      op: 'and',
      of: [
        { op: 'realmAtLeast', level: 40 },
        { op: 'toxicityAtMost', value: 50 }
      ]
    },
    body: '你已闭关二十一日，气机行至关隘处再也推不动，出关或强冲只在一念。',
    choices: [
      {
        id: 'resolve',
        label: '盘膝再坐一夜',
        outcomes: [
          {
            weight: 55,
            text: '你咬牙再冲一次，关隘豁然而开，识海也随之清亮了许多。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
              { op: 'gainInsight', value: 2 }
            ]
          },
          {
            weight: 45,
            text: '你终究退了出来，白白耗去一段时日，却也知道强求不来。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 5 },
              { op: 'gainInsight', value: 1 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_immortal_remnant',
    title: '云海残念',
    category: 'fate',
    tierMin: 4,
    tierMax: 4,
    levelMin: 25,
    levelMax: 85,
    weight: 12,
    cooldownYears: 15,
    requires: { op: 'realmAtLeast', level: 50 },
    body: '云海之上有一道早已散去的影子，只剩一线清气悬在原地，似在等人。',
    choices: [
      {
        id: 'resolve',
        label: '走近那一线清气',
        outcomes: [
          {
            weight: 55,
            text: '清气没入你眉心，你只觉天地近了一寸，呼吸都轻了。',
            tone: 'xian',
            effects: [
              { op: 'add', target: { k: 'xianqi' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 8 }
            ]
          },
          {
            weight: 45,
            text: '清气与你气息不合，绕身而散，但你记住了它掠过的轨迹。',
            tone: 'ev4',
            effects: [
              { op: 'gainInsight', value: 3 },
              { op: 'add', target: { k: 'luck' }, value: 4 }
            ]
          }
        ]
      }
    ]
  }),
  defineEvent({
    id: 'ev_mid_demon_lord_offer',
    title: '魔头相邀',
    category: 'fate',
    tierMin: 4,
    tierMax: 4,
    levelMin: 25,
    levelMax: 85,
    weight: 8,
    cooldownYears: 15,
    requires: { op: 'realmAtLeast', level: 55 },
    body: '一位以血食修行的老魔托人递话，说愿与你共分一炉丹，只求你替他办一件事。',
    choices: [
      {
        id: 'resolve',
        label: '把那封信拆开',
        outcomes: [
          {
            weight: 50,
            text: '你赴约吞丹，修为暴涨，回程时却觉得风里都带着血腥味。',
            tone: 'ev4',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'addToxicity', value: 20 }
            ]
          },
          {
            weight: 50,
            text: '你撕了信笺，命人备下厚礼回绝，此后对方再未上门。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 8 },
              { op: 'add', target: { k: 'luck' }, value: 5 }
            ]
          }
        ]
      }
    ]
  }),
] satisfies EventDef[];
