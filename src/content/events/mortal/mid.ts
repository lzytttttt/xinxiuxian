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
        id: 'step_back',
        label: '拱手退到门外',
        hint: { risk: 1, reward: 1 },
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
      },
      {
        id: 'stand',
        label: '立于过道中央',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            text: '你站定不动，两席各自收声，回房后把堂中势力细细理了一遍。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 }
            ]
          }
        ]
      },
      {
        id: 'pick',
        label: '附和一席',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 60,
            text: '你备下薄礼递话过去，站位站得稳，事后分得一份实差。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 3 }
            ]
          },
          {
            weight: 40,
            text: '你押的那一席落了下风，被分去守山，还落了几句闲话。',
            tone: 'red',
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
        id: 'swallow',
        label: '整枚吞下',
        enable: { op: 'toxicityAtMost', value: 70 },
        disabledReason: '需丹毒≤70',
        hint: { risk: 2, reward: 2 },
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
            text: '药力冲得太急，你强压许久才没伤了经脉，只化开小半，灼痕却更深。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'addToxicity', value: 8 }
            ]
          }
        ]
      },
      {
        id: 'half',
        label: '只咽半枚',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            text: '你掰开丹丸分作两次服，燥气平了些，进境虽缓，经脉却安稳。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'addToxicity', value: 6 }
            ]
          }
        ]
      },
      {
        id: 'pass',
        label: '让给同门',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你把丹丸推了回去，同门千恩万谢，回头便送来一袋灵石。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 4 },
              { op: 'add', target: { k: 'luck' }, value: 1 }
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
        id: 'haggle',
        label: '蹲下压价',
        hint: { risk: 1, reward: 1 },
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
      },
      {
        id: 'inspect',
        label: '当面验货',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 2 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你押下两枚灵石当场筛石，挑出一小把成色不错的，摊主脸色发青。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 45,
            text: '摊主见你动了真格，卷起袋子就走，押下的灵石也没讨回来。',
            tone: 'red',
            effects: [{ op: 'gainInsight', value: 2 }]
          }
        ]
      },
      {
        id: 'walk',
        label: '转身走开',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你没多看一眼，走出半条街才回头，心里那点贪念已经散了。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 1 },
              { op: 'add', target: { k: 'luck' }, value: 1 }
            ]
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
        id: 'fight',
        label: '立定桩步应招',
        hint: { risk: 2, reward: 2 },
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
      },
      {
        id: 'yield',
        label: '收招认负',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            text: '你当众收招退开，夜里把那几式狠辣招法拆解了半宿，心口反倒松快。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'gamble',
        label: '赌一招险胜',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 50,
            text: '你孤注一掷使出一记险招，正中破绽，满场再无人笑。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 4 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 50,
            text: '险招落空，你摔下台去，养伤多日，倒把那记招式的破绽想通了。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 3 },
              { op: 'gainInsight', value: 2 }
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
        id: 'warm',
        label: '以真气养去',
        hint: { risk: 1, reward: 1 },
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
      },
      {
        id: 'blood',
        label: '割指喂器',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 65,
            text: '精血渗入纹路，器身嗡鸣不止，灵光与你气息相合得更紧。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 4 },
              { op: 'pct', target: { k: 'artifactPower' }, value: 2 }
            ]
          },
          {
            weight: 35,
            text: '器身纹路一闪即灭，你气血亏了一截，好几日提不起精神。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 1 },
              { op: 'sub', target: { k: 'luck' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'shelve',
        label: '收匣改日再试',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你把法器收回玉匣，静坐参详那几道纹路，反倒摸到几分器理。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 }
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
        id: 'settle',
        label: '净手调息',
        hint: { risk: 1, reward: 1 },
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
      },
      {
        id: 'hasten',
        label: '提前入关',
        hint: { risk: 3, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你趁月色正好提前封门，心气一往无前，关中进境快得出奇。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 1 }
            ]
          },
          {
            weight: 50,
            text: '灵材终究缺了两样，你强撑到出关，白白耗去许多时日。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'sub', target: { k: 'luck' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'invite',
        label: '请同门护法',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你备下灵石请同门守在关外，入关后心无旁骛，气机一路平稳。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
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
        id: 'escort',
        label: '接下这趟差事',
        hint: { risk: 1, reward: 1 },
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
      },
      {
        id: 'scout',
        label: '先独自探路',
        hint: { risk: 3, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你先行半日探清山口，商队循你标的记号绕过险地，领队另加了一份谢礼。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 4 },
              { op: 'gainInsight', value: 2 }
            ]
          },
          {
            weight: 50,
            text: '你在岔道上撞见剪径的，脱身时丢了些随身之物，只当买个教训。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
              { op: 'sub', target: { k: 'luck' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'hire',
        label: '雇散修同行',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你出灵石雇了个面生的散修搭手，两人轮班守夜，一路安稳到了地头。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 5 },
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
        id: 'own',
        label: '上前一步',
        hint: { risk: 2, reward: 2 },
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
      },
      {
        id: 'truth',
        label: '如实相告',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            text: '你把当日情形原样说出，执法堂只记了他一笔，你倒把门中规矩记牢了。',
            tone: 'ev1',
            effects: [{ op: 'gainInsight', value: 2 }]
          }
        ]
      },
      {
        id: 'persuade',
        label: '劝他自首',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 65,
            text: '你私下劝他自首，又替他打点了几句，事后他把你当作真正的朋友。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 4 },
              { op: 'gainInsight', value: 1 }
            ]
          },
          {
            weight: 35,
            text: '他觉得你是在逼他，从此见你就绕路走，人情算是凉了。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 1 }
            ]
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
        id: 'accept',
        label: '收他入门',
        hint: { risk: 1, reward: 1 },
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
      },
      {
        id: 'test',
        label: '先考较三日',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 2 }],
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你留他住了三日，供饭供茶，暗中看他心性，末了才点头收下。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 3 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'decline',
        label: '婉言送走',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你留下一句指点便转身上山，少年在身后遥遥一拜，你心里松快了些。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 1 },
              { op: 'add', target: { k: 'luck' }, value: 1 }
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
        id: 'answer',
        label: '推门应战',
        hint: { risk: 2, reward: 2 },
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
      },
      {
        id: 'parley',
        label: '开门奉茶',
        enable: { op: 'cmp', target: { k: 'luck' }, cmp: '>=', value: 6 },
        disabledReason: '需气运≥6',
        cost: [{ op: 'sub', target: { k: 'luck' }, value: 3 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            text: '你开门奉茶，把当年的误会一桩桩摆开，他顿了三下剑鞘，终究收剑入鞘。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 2 },
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'ignore',
        label: '闭门不理',
        hint: { risk: 2, reward: 1 },
        outcomes: [
          {
            text: '你端坐不动，任剑鞘声在门外响到天黑，事后把那段旧怨复盘了一遍。',
            tone: 'ev2',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'gainInsight', value: 2 }
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
        id: 'study',
        label: '蹲下细辨纹路',
        hint: { risk: 1, reward: 1 },
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
      },
      {
        id: 'dig',
        label: '雇人掘开',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 2 },
        disabledReason: '需模拟点≥2',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 2 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你雇了两名樵夫搬石清土，整块残片起出，转手卖了个好价。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 5 },
              { op: 'gainInsight', value: 1 }
            ]
          },
          {
            weight: 45,
            text: '土石塌下一角，残片埋在底下再难起出，工钱却是白花了。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 2 }
            ]
          }
        ]
      },
      {
        id: 'mark',
        label: '记下方位回门',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你把方位刻在随身的竹片上，回门禀报，管事记了你一分细心。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 1 }
            ]
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
        id: 'guard',
        label: '闭目守心',
        hint: { risk: 1, reward: 1 },
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
      },
      {
        id: 'follow',
        label: '顺着想下去',
        hint: { risk: 2, reward: 1 },
        outcomes: [
          {
            text: '你索性由着它说下去，一夜之间修为涨了一截，只是心头那层灰也厚了些。',
            tone: 'ev3',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'sub', target: { k: 'luck' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'sever',
        label: '强行斩断',
        enable: { op: 'cmp', target: { k: 'insight' }, cmp: '>=', value: 4 },
        disabledReason: '需悟性≥4',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 2 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            text: '你把悟性化作一柄意刀，将那声音连根斩断，灵台清明得像洗过一遍。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 3 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
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
        id: 'let',
        label: '由他们说去',
        hint: { risk: 1, reward: 1 },
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
      },
      {
        id: 'clarify',
        label: '登门自辩',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你备了薄礼登门把话说明白，几家反倒敬你坦荡，交情就此结下。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 4 },
              { op: 'add', target: { k: 'simPoints' }, value: 3 }
            ]
          },
          {
            weight: 50,
            text: '你越辩越乱，添油加醋的版本又多了几套，白费了一番口舌。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 1 }
            ]
          }
        ]
      },
      {
        id: 'hide',
        label: '闭门谢客',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            text: '你闭门谢客，把门前的事一概推了，静修月余反倒心气沉稳。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'sub', target: { k: 'luck' }, value: 1 }
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
        id: 'decline',
        label: '推丹不取',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你推了丹丸，回房按部就班运功，进境虽缓，根基却更稳。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'gainInsight', value: 1 }
            ]
          }
        ]
      },
      {
        id: 'keep',
        label: '收下留用',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            text: '你收下丹丸留作后用，揣在怀里时心里已在盘算何时动用。',
            tone: 'ev2',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 3 }]
          }
        ]
      },
      {
        id: 'demand',
        label: '当场讨说法',
        enable: { op: 'cmp', target: { k: 'luck' }, cmp: '>=', value: 8 },
        disabledReason: '需气运≥8',
        cost: [{ op: 'sub', target: { k: 'luck' }, value: 5 }],
        hint: { risk: 3, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你把成色之差当众点破，主事者下不来台，另补了一份厚礼。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 2 }
            ]
          },
          {
            weight: 45,
            text: '话说重了，师徒之间僵了半月，你自知失礼，闷头补了功课。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'gainInsight', value: 1 }
            ]
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
        id: 'sort',
        label: '逐册归位',
        hint: { risk: 1, reward: 1 },
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
      },
      {
        id: 'copy',
        label: '偷抄一册',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            text: '你趁换班时抄下半册旁门手记，又拿几枚灵石堵了同班的口。',
            tone: 'gold',
            effects: [{ op: 'gainInsight', value: 3 }]
          }
        ]
      },
      {
        id: 'doze',
        label: '靠架小睡',
        hint: { risk: 2, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '你眯了半日无人来查，醒来只觉神清气爽，活也糊弄过去了。',
            tone: 'ev2',
            effects: [{ op: 'add', target: { k: 'simPoints' }, value: 4 }]
          },
          {
            weight: 40,
            text: '管事突然查岗，你被记了一笔，月例也扣去些许。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
              { op: 'sub', target: { k: 'luck' }, value: 2 }
            ]
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
        id: 'stake',
        label: '暗中守着那户',
        hint: { risk: 2, reward: 2 },
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
      },
      {
        id: 'call',
        label: '连夜传讯请援',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你连夜传讯请来附近道友，几人合力围住那修士，镇上一夜安稳。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: 3 }
            ]
          }
        ]
      },
      {
        id: 'track',
        label: '跟出镇外',
        hint: { risk: 3, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你远远缀着那修士出了镇，记下他的落脚处与功法路数，回程时脚步轻快。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 50,
            text: '对方察觉了你的气息，反手一击，你退走时狼狈，好在性命无碍。',
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
        id: 'retort',
        label: '当众说三句话',
        hint: { risk: 2, reward: 2 },
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
      },
      {
        id: 'endure',
        label: '拾牌退开',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            text: '你弯腰拾起玉牌退到一边，当夜把这事从头到尾想了一遍。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'report',
        label: '上报执法堂',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 4 },
        disabledReason: '需模拟点≥4',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 4 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你备下人情把话递进执法堂，那弟子家中说不上话，份额如数追回。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 3 },
              { op: 'add', target: { k: 'luck' }, value: 3 }
            ]
          },
          {
            weight: 45,
            text: '对方家中使了力，事情不了了之，你还落了个爱告状的名声。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 1 }
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
        id: 'back',
        label: '看准了再开口',
        hint: { risk: 2, reward: 2 },
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
      },
      {
        id: 'abstain',
        label: '推病不表态',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            text: '你称病未到，两派都没把你算进去，事后把案卷里的门道默默理了一遍。',
            tone: 'ev1',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 1 }
            ]
          }
        ]
      },
      {
        id: 'fair',
        label: '当众据理力争',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 5 },
        disabledReason: '需模拟点≥5',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 5 }],
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 50,
            text: '你把旧案卷宗翻了个透，当众说得两派都无话可驳，长老当场记你一功。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 5 },
              { op: 'gainInsight', value: 3 }
            ]
          },
          {
            weight: 50,
            text: '你话说得太直，两派都记下了你，此后办事处处有人掣肘。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 3 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
              { op: 'gainInsight', value: 1 }
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
        id: 'full',
        label: '整枚服下',
        enable: { op: 'toxicityAtMost', value: 70 },
        disabledReason: '需丹毒≤70',
        hint: { risk: 3, reward: 3 },
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
            text: '药力冲到半途便散了，关隘依旧横在眼前，经脉里却留下暗火。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'addToxicity', value: 12 }
            ]
          }
        ]
      },
      {
        id: 'half',
        label: '只服半枚',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            text: '你只服半枚，火候平了些，进境慢了，却给自己留了后路。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'addToxicity', value: 6 }
            ]
          }
        ]
      },
      {
        id: 'steady',
        label: '收丹入匣',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你把丹药收进玉匣，按部就班运功，进境虽慢，脚下却踩得踏实。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
              { op: 'gainInsight', value: 1 }
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
        id: 'follow',
        label: '照着图走一趟',
        hint: { risk: 2, reward: 2 },
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
      },
      {
        id: 'hire',
        label: '雇向导同行',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 0, reward: 2 },
        outcomes: [
          {
            text: '你出灵石请了个熟悉山势的向导，绕开两处险地，稳稳取回了洞府里的东西。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 5 },
              { op: 'add', target: { k: 'root' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'sell',
        label: '把图转手',
        hint: { risk: 0, reward: 1 },
        outcomes: [
          {
            text: '你把残图转给了收旧物的铺子，换了灵石，也换了一夜好眠。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 4 },
              { op: 'add', target: { k: 'luck' }, value: 1 }
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
      },
      {
        id: 'soak',
        label: '以真气慢慢浸它',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '你连坐七日只喂一口真气，器灵应得极轻，纹路一寸寸亮起来。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 2 },
              { op: 'gainInsight', value: 1 }
            ]
          },
          {
            weight: 40,
            text: '真气被它抽得七零八落，你收功时眼前发黑，器身只温了一夜。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 1 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'seal',
        label: '结印把器灵封回去',
        enable: { op: 'cmp', target: { k: 'artifactBonus' }, cmp: '>=', value: 105 },
        disabledReason: '需法宝加成≥105（器已被你养开，舍得落印）',
        cost: [{ op: 'sub', target: { k: 'artifactBonus' }, value: 3 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你落印封住它，任它再躁也出不来，器身反倒比原先更稳。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 5 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 45,
            text: '印压得太重，器灵在你掌心碎了一角，成色从此差了一截。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 2 },
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
      },
      {
        id: 'withdraw',
        label: '递名帖退赛',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '你托人递上名帖，说伤病未愈。榜首空悬，你安安稳固坐到了散场。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 4 },
              { op: 'gainInsight', value: 1 }
            ]
          },
          {
            weight: 40,
            text: '避战的名头传得比败绩还快，此后同辈再没人肯认真约你上台。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'add', target: { k: 'simPoints' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'dissect',
        label: '闭门拆他的剑谱',
        enable: { op: 'cmp', target: { k: 'insight' }, cmp: '>=', value: 6 },
        disabledReason: '需悟性≥6（拆谱要拿悟性去顶）',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 2 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你把他三招拆成九段，第七段看了整整一月，看完便改了自家的步法。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 3 },
              { op: 'add', target: { k: 'luck' }, value: 1 }
            ]
          },
          {
            weight: 40,
            text: '你推演到第三夜便停不住，索性烧了笔记，人也熬得形容枯槁。',
            tone: 'red',
            effects: [
              { op: 'gainInsight', value: 1 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 }
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
      },
      {
        id: 'take',
        label: '收他入门，亲自教',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3（三年衣食与拜师礼）',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '少年叩了三个头，从此唤你一声师尊。你教一段，他学一段，夜里常有新的念头。',
            tone: 'gold',
            effects: [
              { op: 'bond', action: 'create', type: '师徒' },
              { op: 'bondAct', action: 'affinity', type: '师徒', value: 12 },
              { op: 'gainInsight', value: 2 }
            ]
          },
          {
            weight: 40,
            text: '他入门第三年急于求进，反噬了根基。你赔上几年心力，还是送他回了家。',
            tone: 'red',
            effects: [
              { op: 'bond', action: 'create', type: '师徒' },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
              { op: 'sub', target: { k: 'luck' }, value: 1 }
            ]
          }
        ]
      },
      {
        id: 'escort',
        label: '只送他一程',
        hint: { risk: 2, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '你送到半路便分道。他临去回头喊了一声，你把这声喊记了很久。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 40,
            text: '他没走出那条山径。消息传回来那日，你正把少年的木牌收进匣里。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 }
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
      },
      {
        id: 'haggle',
        label: '讨价，只买半卷口诀',
        enable: { op: 'toxicityAtMost', value: 40 },
        disabledReason: '需丹毒≤40（身上毒太重，撑不住他的法子）',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 2 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '半卷也是卷。你按残缺处硬推三夜，气机果然快了一截，只是经脉发凉。',
            tone: 'ev3',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'addToxicity', value: 6 }
            ]
          },
          {
            weight: 45,
            text: '残缺处接不上气机，反噬先到。你吐了口黑血，从此见不得这路法门。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 10 },
              { op: 'gainInsight', value: 1 }
            ]
          }
        ]
      },
      {
        id: 'antidote',
        label: '照他的路子反推一味解药',
        enable: { op: 'cmp', target: { k: 'toxicity' }, cmp: '>=', value: 20 },
        disabledReason: '需丹毒≥20（先有毒，才谈得上解）',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你以毒攻毒地推了五日，居然真磨出一味压得住那门功的丸药。',
            tone: 'gold',
            effects: [
              { op: 'grantPill', id: 'pill_liaodu_1', count: 1 },
              { op: 'gainInsight', value: 1 }
            ]
          },
          {
            weight: 45,
            text: '推至第四味便乱了性，你把药材与灵石一齐赔进去，人也病了半季。',
            tone: 'red',
            effects: [
              { op: 'gainInsight', value: 1 },
              { op: 'sub', target: { k: 'luck' }, value: 1 }
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
      },
      {
        id: 'decoy',
        label: '引开他们，让车队先走',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你把刀口往自己这边一引，三辆车先过了峡口。回头时你自己也只擦破点皮。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 4 },
              { op: 'gainInsight', value: 2 }
            ]
          },
          {
            weight: 40,
            text: '你把人引过了山，人却也追着你不放。领队只保住了车，你赔了半年修为。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'sub', target: { k: 'luck' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'bargain',
        label: '喊话：货留下，人放走',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3（先押一笔买命钱）',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '对方掂了掂你抛过去的分量，挥手让开峡口。车队保住了大半货。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 5 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 45,
            text: '对方笑说这点买命钱太薄，顺手连你的买命钱也收了，转身便走。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
              { op: 'sub', target: { k: 'luck' }, value: 1 },
              { op: 'gainInsight', value: 1 }
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
      },
      {
        id: 'sheath',
        label: '把暗劲引进剑鞘',
        enable: { op: 'cmp', target: { k: 'artifactBonus' }, cmp: '>=', value: 102 },
        disabledReason: '需法宝加成≥102（得有件东西替你吃这一记）',
        cost: [{ op: 'sub', target: { k: 'artifactBonus' }, value: 2 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '鞘身嗡了一声便哑下去，长老浑然未觉，还在把你的引气之法夸给众人听。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'simPoints' }, value: 3 },
              { op: 'gainInsight', value: 2 }
            ]
          },
          {
            weight: 45,
            text: '鞘裂了一道细纹。暗劲只卸去一半，你仍被震得退了七步。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
              { op: 'sub', target: { k: 'luck' }, value: 1 }
            ]
          }
        ]
      },
      {
        id: 'report',
        label: '不动声色，回去报掌门',
        enable: { op: 'inSect' },
        disabledReason: '需身在宗门',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你把那句暗话一字不漏地递上去，掌门当场记你一功，赏下三日静室。',
            tone: 'gold',
            effects: [
              { op: 'gainContribution', value: 25 },
              { op: 'gainInsight', value: 1 }
            ]
          },
          {
            weight: 40,
            text: '你既没挡，也没出首。掌门疑你，长老也疑你，从此两道门里都不好做人。',
            tone: 'red',
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
      },
      {
        id: 'terms',
        label: '约他改日，先把话说开',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 4 },
        disabledReason: '需模拟点≥4（备一份体面的见面礼）',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 4 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你把两辈子的账摊在桥栏上算了半日。他听完收了剑，说下辈子再找你。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 3 }
            ]
          },
          {
            weight: 40,
            text: '话说到一半他便拔了剑。这一场没打成，礼倒是白送了。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 2 },
              { op: 'sub', target: { k: 'luck' }, value: 1 }
            ]
          }
        ]
      },
      {
        id: 'wait',
        label: '立于桥头，等他先动',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你先出的手，也先收得住。两招之后他认了，转身走进雨里。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 50,
            text: '你先沉不住气。他一剑挑开你的剑，转身便走，你独自在雨里站了半夜。',
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
      },
      {
        id: 'grind',
        label: '一寸寸磨它，磨到自己认不出',
        enable: { op: 'cmp', target: { k: 'insight' }, cmp: '>=', value: 8 },
        disabledReason: '需悟性≥8（磨镜面要拿悟数去磨）',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 3 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你磨了七天，镜面由模糊转清，最后照出的那张脸你已认不出是恨是放下了。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 3 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 45,
            text: '镜面碎在半途，碎光扎进眼里。你捂着眼走了下山，此后见不得水面。',
            tone: 'red',
            effects: [
              { op: 'gainInsight', value: 1 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'shard',
        label: '敲下一角，炼进随身之物',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你把镜角磨成薄片贴在剑脊上，此后与人交手时，总能早半息看见对方的起手。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 4 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 2 }
            ]
          },
          {
            weight: 50,
            text: '镜角割破了你的掌心，血滴在塔下三层才止住。那点预知，代价是七日高热。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'gainInsight', value: 1 }
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
      },
      {
        id: 'sealed',
        label: '拆那封没署名的',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '落款处空着，写的却是一处真秘境。你去了，出来时袖里多了一枚丹。',
            tone: 'gold',
            effects: [
              { op: 'grantPill', id: 'pill_juqi_2', count: 1 },
              { op: 'add', target: { k: 'simPoints' }, value: 3 }
            ]
          },
          {
            weight: 45,
            text: '那是一处做局的地方。你在阵中待了半日才脱身，出来时衣襟带血。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'addToxicity', value: 8 }
            ]
          }
        ]
      },
      {
        id: 'reply_all',
        label: '一一回帖，只留一份人情',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 3 },
        disabledReason: '需模拟点≥3（回帖要备回礼）',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 3 }],
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '你照着名册一份份回礼，一个也没得罪，也没赴一个约。回门时心是静的。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 40,
            text: '回得太齐，反倒像看不上人家。几位在坊间说你架子大，帖子转眼就少了。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 }
            ]
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
      },
      {
        id: 'drain',
        label: '在泉边架炉，熬尽药性',
        enable: { op: 'toxicityAtMost', value: 60 },
        disabledReason: '需丹毒≤60（身上毒重，架炉先熏倒自己）',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 4 }],
        hint: { risk: 2, reward: 3 },
        outcomes: [
          {
            weight: 50,
            text: '你守着火熬了三日，泉气尽入经脉。那股暖劲随后半夜退净，留下一身燥。',
            tone: 'ev3',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
              { op: 'addToxicity', value: 10 }
            ]
          },
          {
            weight: 50,
            text: '火候压不住泉里的杂气，你熬到第二日便收了摊，泉眼也被熏得浑了。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 5 },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 }
            ]
          }
        ]
      },
      {
        id: 'stele',
        label: '不取水，在泉边立一方石刻',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '你刻下泉眼方位与水脉走向。后来者照着石刻找路，你在山门外也得了些好名声。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 40,
            text: '有人嫌你多事，夜里把石刻砸了。你拾了半块回去，心里空落落的。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 1 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 }
            ]
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
      },
      {
        id: 'hold_post',
        label: '哪边都不沾，只守住自己那摊',
        enable: { op: 'inSect' },
        disabledReason: '需身在宗门',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '封山的第三日，你把手里那摊事理得一点不乱。事后论功，你这一笔排在前头。',
            tone: 'gold',
            effects: [
              { op: 'gainContribution', value: 22 },
              { op: 'gainInsight', value: 1 }
            ]
          },
          {
            weight: 40,
            text: '两边都觉得你该站队。你谁也没帮上，事后分差事时也没人替你说一句话。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 1 },
              { op: 'gainInsight', value: 2 }
            ]
          }
        ]
      },
      {
        id: 'leave_sect',
        label: '交腰牌下山，等分出胜负再说',
        enable: { op: 'inSect' },
        disabledReason: '需身在宗门（散修无腰牌可交）',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你把腰牌搁在空席上就走。半年后分出胜负，两边都当你早看清了。',
            tone: 'ev2',
            effects: [
              { op: 'sectLeave', defect: true },
              { op: 'gainInsight', value: 2 },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 }
            ]
          },
          {
            weight: 45,
            text: '你没走成。两边都当你是对方的耳目，搜山时先拿你开的路。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 5 },
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 2 }
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
      },
      {
        id: 'restore',
        label: '照碑上残方推一张丹方',
        enable: { op: 'cmp', target: { k: 'insight' }, cmp: '>=', value: 12 },
        disabledReason: '需悟性≥12（补全一张丹方要压进去三十年功夫）',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 5 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你把缺的两味药性推了出来，解毒真方就此补全，此后丹毒不再是你一个人的枷锁。',
            tone: 'gold',
            effects: [
              { op: 'learnRecipe', id: 'rec_jiedu' },
              { op: 'gainInsight', value: 2 }
            ]
          },
          {
            weight: 40,
            text: '推出来的两味彼此相冲，炉温一上来就炸。你伤了手，也伤了丹房里的旧规矩。',
            tone: 'red',
            effects: [
              { op: 'gainInsight', value: 1 },
              { op: 'sub', target: { k: 'simPoints' }, value: 3 }
            ]
          }
        ]
      },
      {
        id: 'carry_furnace',
        label: '把残炉整个搬走',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '炉身虽残，火口还在。你以真火养了半年，炉底竟又焐出一炉丹气。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 3 },
              { op: 'pct', target: { k: 'artifactPower' }, value: 3 }
            ]
          },
          {
            weight: 50,
            text: '炉里还压着前人未散的丹气，你搬了半座山回来，从此体内总有一线焦苦。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 3 },
              { op: 'addToxicity', value: 6 }
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
      },
      {
        id: 'divine',
        label: '不碰器，先在池边布下禁制',
        hint: { risk: 1, reward: 1 },
        outcomes: [
          {
            weight: 60,
            text: '你先封了四壁再探手。古器被你镇住，没有再撞池。此后多年它都没再动过。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 3 },
              { op: 'gainInsight', value: 1 }
            ]
          },
          {
            weight: 40,
            text: '禁制布早了，阵脚被池水一浸便散。你绕着它转了半月，终究没敢伸手。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 2 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 }
            ]
          }
        ]
      },
      {
        id: 'repair',
        label: '先补池壁，再起器',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 5 },
        disabledReason: '需模拟点≥5（雇人夯土补壁的工钱）',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 5 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 55,
            text: '你把池壁夯了三层才下去。古器起出时还带着新石的湿气，一路无惊。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 5 },
              { op: 'add', target: { k: 'luck' }, value: 2 }
            ]
          },
          {
            weight: 45,
            text: '夯得越实，压在底下的旧禁制反越反弹。你被掀出池口，器仍在泥里。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'addToxicity', value: 6 }
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
      },
      {
        id: 'warn',
        label: '先喊一嗓子，把人引到镇上去',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你一声喝退了几个过路的修士，那邪修一时也不敢当众动手。他记下了你的脸。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 3 },
              { op: 'add', target: { k: 'simPoints' }, value: 3 }
            ]
          },
          {
            weight: 40,
            text: '没人肯管这桩闲事，反倒有人替你应了一句"多管闲事"。他趁乱脱身，你白忙一场。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 1 }
            ]
          }
        ]
      },
      {
        id: 'counter',
        label: '以毒攻毒，反吸他的血气',
        enable: { op: 'cmp', target: { k: 'toxicity' }, cmp: '>=', value: 45 },
        disabledReason: '需丹毒≥45（身上毒太轻，压不住他的血气）',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 2 }],
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 50,
            text: '你把他散出的血气尽数吞下。那一夜涨得极快，识海里却多了一股不属于你的腥甜。',
            tone: 'ev3',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'addToxicity', value: 14 }
            ]
          },
          {
            weight: 50,
            text: '他的血气比你重，反压过来。你吐了三口黑血，人瘫在原地，他却笑着走了。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 6 },
              { op: 'addToxicity', value: 10 }
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
      },
      {
        id: 'ask_elder',
        label: '去问师门，这是不是他们的手笔',
        enable: { op: 'inSect' },
        disabledReason: '需身在宗门（散修无处可问）',
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '师门查了半月，认出那是他们早年埋下的一粒引子。他们替你压下了，也换了条件。',
            tone: 'gold',
            effects: [
              { op: 'gainContribution', value: 18 },
              { op: 'sub', target: { k: 'simPoints' }, value: 2 }
            ]
          },
          {
            weight: 40,
            text: '长辈听完只说"你自己惹的"。他们给了一张压制的方子，条件是你闭口不言。',
            tone: 'ev2',
            effects: [
              { op: 'grantPill', id: 'pill_liaodu_1', count: 1 },
              { op: 'sub', target: { k: 'insight' }, value: 3 }
            ]
          }
        ]
      },
      {
        id: 'share',
        label: '引它入功法里试',
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 50,
            text: '你把那点温热引入主脉，它与旧法相合，气机自此生生不息。',
            tone: 'ev3',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'grantArt', id: 'art_ni_tian' }
            ]
          },
          {
            weight: 50,
            text: '它与旧法相冲，夜里疼得你几乎咬碎牙。此后每进一层，都要先熬过这一关。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'sub', target: { k: 'simPoints' }, value: 5 },
              { op: 'addToxicity', value: 10 }
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
      },
      {
        id: 'pill_break',
        label: '取一枚破境丹硬撞关隘',
        enable: { op: 'hasPill', id: 'pill_pojing_1', countAtLeast: 1 },
        disabledReason: '需破境丹×1',
        cost: [{ op: 'sub', target: { k: 'pill', id: 'pill_pojing_1' }, value: 1 }],
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 55,
            text: '药力撞开关隘那一瞬，你听见壁后有门轴转动的声音。开是开了，门却不是你的。',
            tone: 'ev4',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'addToxicity', value: 12 }
            ]
          },
          {
            weight: 45,
            text: '药力在半途散尽，反震把你的气机搅成一团。出关时你比入关时更虚。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'sub', target: { k: 'simPoints' }, value: 6 },
              { op: 'addToxicity', value: 8 }
            ]
          }
        ]
      },
      {
        id: 'open_gate',
        label: '照着关隘的样子，在身上另开一道',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你不再冲它，改而在别处凿出同一条路。绕了远路，却走通了。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 2 }
            ]
          },
          {
            weight: 50,
            text: '凿到一半你才明白，壁上那道痕就是为凿它的人留的。你收手时已经伤了根基。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 4 },
              { op: 'sub', target: { k: 'luck' }, value: 2 },
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
      },
      {
        id: 'trace',
        label: '顺着它散去的方向追',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 50,
            text: '你追出三百里，那道清气在半空凝了一瞬。你没抓住它，却把这一瞬记进了骨头里。',
            tone: 'ev4',
            effects: [
              { op: 'gainInsight', value: 3 },
              { op: 'add', target: { k: 'xianqi' }, value: 1 }
            ]
          },
          {
            weight: 50,
            text: '你追到云海尽头便失了足，踏空坠下半日，醒来时身上青一块紫一块。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 6 },
              { op: 'gainInsight', value: 1 }
            ]
          }
        ]
      },
      {
        id: 'bury',
        label: '以土掩之，不去惊动',
        enable: { op: 'cmp', target: { k: 'simPoints' }, cmp: '>=', value: 4 },
        disabledReason: '需模拟点≥4（布一场遮蔽的坛场）',
        cost: [{ op: 'sub', target: { k: 'simPoints' }, value: 4 }],
        hint: { risk: 1, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '你把那一线清气原样埋了。此后它每隔数年自行浮起一寸，你也不再去看。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 5 },
              { op: 'gainInsight', value: 2 }
            ]
          },
          {
            weight: 40,
            text: '坛场布得不够净，那一线清气一夜散尽。你培土的地方只剩一个空坑。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 2 },
              { op: 'gainInsight', value: 1 }
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
      },
      {
        id: 'take_partial',
        label: '赴约，但只取丹不办事',
        enable: { op: 'toxicityAtMost', value: 50 },
        disabledReason: '需丹毒≤50（身上毒太重，炉边坐不住）',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 4 }],
        hint: { risk: 2, reward: 3 },
        outcomes: [
          {
            weight: 50,
            text: '你吞了丹便起身走人。他没有拦，只是笑着看你背影。走出三里，你才发觉手在抖。',
            tone: 'ev4',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'addToxicity', value: 16 }
            ]
          },
          {
            weight: 50,
            text: '他早备好了替身的血。你替那人办了十日的事，醒来时已在另一个山谷。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'addToxicity', value: 20 },
              { op: 'sub', target: { k: 'luck' }, value: 3 }
            ]
          }
        ]
      },
      {
        id: 'expose',
        label: '把信原样送到正道几家去',
        enable: { op: 'cmp', target: { k: 'luck' }, cmp: '>=', value: 12 },
        disabledReason: '需气运≥12（递这样的帖子要有人肯接）',
        cost: [{ op: 'sub', target: { k: 'luck' }, value: 5 }],
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 60,
            text: '几家一合计议，老魔的庄口被围了半月。你名不见经传，却记在了几份人情账上。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 5 },
              { op: 'gainInsight', value: 2 }
            ]
          },
          {
            weight: 40,
            text: '几家互相推诿，反倒把你的住址递了出去。你连夜搬家，半年不敢用真名。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'simPoints' }, value: 5 },
              { op: 'sub', target: { k: 'luck' }, value: 2 }
            ]
          }
        ]
      }
    ]
  }),
] satisfies EventDef[];
