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
        id: 'endure',
        label: '按旧法咽下',
        outcomes: [
          {
            weight: 50,
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
            weight: 20,
            text: '你硬撑到云阶天亮，仙气凝在喉间不肯散，呼吸里全是腥气。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -4 },
              { op: 'addToxicity', value: 10 },
            ],
          },
        ],
        hint: { risk: 2, reward: 2 },
      },
      {
        id: 'ease',
        label: '屏息，缓缓吐尽',
        outcomes: [
          {
            text: '你把那口仙气原样吐尽，肺腑空落落的，空处却摸到旧日周天的一点边。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
            ],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
      {
        id: 'borrow',
        label: '借气运镇喉',
        enable: { op: 'cmp', target: { k: 'luck' }, cmp: '>=', value: 6 },
        disabledReason: '需气运≥6',
        cost: [{ op: 'sub', target: { k: 'luck' }, value: 6 }],
        outcomes: [
          {
            text: '你押上一段气运，向云栈换了一枚镇喉的旧玉。仙气顺了，账却记在了别处。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'gainInsight', value: 5 },
            ],
          },
        ],
        hint: { risk: 1, reward: 2 },
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
        id: 'submit',
        label: '听凭玉筹定价',
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
        hint: { risk: 2, reward: 2 },
      },
      {
        id: 'pay_qi',
        label: '以仙灵气抵账',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        outcomes: [
          {
            text: '你把一缕仙灵气按在玉筹上。掌柜点头，帘子后一夜无声，醒来时神完气足。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
        ],
        hint: { risk: 0, reward: 2 },
      },
      {
        id: 'outside',
        label: '只在檐下坐一夜',
        outcomes: [
          {
            text: '檐下风冷，你把一夜坐成了一段静功。气运未损，识海里多出半句旧偈。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 7 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
            ],
          },
        ],
        hint: { risk: 0, reward: 1 },
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
        id: 'sit',
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
        hint: { risk: 1, reward: 2 },
      },
      {
        id: 'speak',
        label: '起身论道',
        outcomes: [
          {
            weight: 45,
            text: '你把话讲到一半，末座那几位抬了眼。主事者抬手一让，蒲团挪回了原位。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 6 },
            ],
          },
          {
            weight: 30,
            text: '你说到要紧处被打断。有人笑了一声，你坐下时耳根发热。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'addToxicity', value: 6 },
            ],
          },
          {
            weight: 25,
            text: '你讲错了半句，满台寂然。那半句你自己记了很久。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
        ],
        hint: { risk: 3, reward: 3 },
      },
      {
        id: 'seek_seat',
        label: '以仙灵气求座',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        outcomes: [
          {
            text: '你把一缕仙灵气递与执事。蒲团挪正半寸，你从头听到尾，所得比谁都多。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
            ],
          },
        ],
        hint: { risk: 0, reward: 3 },
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
        id: 'sit_night',
        label: '隔井对坐一夜',
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
        hint: { risk: 2, reward: 2 },
      },
      {
        id: 'gift',
        label: '先奉一缕仙灵气',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        outcomes: [
          {
            text: '你把仙灵气搁在井沿，算是拜师礼。他看了你很久，把一段养根的旧法念给你听。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 12 },
              { op: 'gainInsight', value: 5 },
            ],
          },
        ],
        hint: { risk: 0, reward: 2 },
      },
      {
        id: 'imitate',
        label: '远处照做一夜',
        outcomes: [
          {
            text: '你在十步外照他的样子对井吐纳。他没有回头，也没有赶你。天亮时你的气息匀了一分。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'gainInsight', value: 4 },
            ],
          },
        ],
        hint: { risk: 0, reward: 1 },
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
        id: 'sign',
        label: '按下指印，试耕一年',
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
        hint: { risk: 2, reward: 2 },
      },
      {
        id: 'read_first',
        label: '先把小字读完',
        outcomes: [
          {
            text: '你请管事把那行墨色新字念了三遍，改成一年一签。收成薄了，夜里却睡得踏实。',
            tone: 'ev1',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 7 },
              { op: 'gainInsight', value: 5 },
              { op: 'pct', target: { k: 'cultivation' }, value: 2 },
            ],
          },
        ],
        hint: { risk: 0, reward: 1 },
      },
      {
        id: 'buy_out',
        label: '折气运买断',
        enable: { op: 'cmp', target: { k: 'luck' }, cmp: '>=', value: 8 },
        disabledReason: '需气运≥8',
        cost: [{ op: 'sub', target: { k: 'luck' }, value: 8 }],
        outcomes: [
          {
            text: '你把攒下的气运折成价码，田契当场烧了。从此这一垄仙田只认你一个人的名字。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'root' }, value: 14 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
        ],
        hint: { risk: 1, reward: 3 },
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
        id: 'reply',
        label: '提笔回信',
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
        hint: { risk: 2, reward: 2 },
      },
      {
        id: 'repay',
        label: '还这笔旧债',
        enable: { op: 'cmp', target: { k: 'luck' }, cmp: '>=', value: 8 },
        disabledReason: '需气运≥8',
        cost: [{ op: 'sub', target: { k: 'luck' }, value: 8 }],
        outcomes: [
          {
            text: '你把这段年岁里最顺的一段气运折成旧年的数目，托云下的商队送去。信没有回音，梦里却干净了。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
        ],
        hint: { risk: 0, reward: 2 },
      },
      {
        id: 'deny',
        label: '不认这笔债',
        outcomes: [
          {
            text: '你把信凑到灯上。火里那行字亮了一下就没了。此后静坐时心口硬了一分，也钝了一分。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'addToxicity', value: 10 },
            ],
          },
        ],
        hint: { risk: 1, reward: 2 },
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
        id: 'shard',
        label: '舍半钱骨屑',
        outcomes: [
          {
            text: '你只舍了半钱骨屑，换回一柄温热的旧刀，握上去掌心发麻。',
            tone: 'ev2',
            effects: [
              { op: 'sub', target: { k: 'root' }, value: 5 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 7 },
            ],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
      {
        id: 'whole_bone',
        label: '舍一节仙骨',
        outcomes: [
          {
            text: '你舍了整整一节仙骨，换得一柄无铭的旧剑。剑身认了你的手，微微发烫。',
            tone: 'gold',
            effects: [
              { op: 'sub', target: { k: 'root' }, value: 10 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 10 },
              { op: 'pct', target: { k: 'artifactPower' }, value: 4 },
            ],
          },
        ],
        hint: { risk: 2, reward: 2 },
      },
      {
        id: 'pay_chaos',
        label: '以混沌气抵骨',
        enable: { op: 'cmp', target: { k: 'chaosQi' }, cmp: '>=', value: 1 },
        disabledReason: '需混沌气≥1',
        cost: [{ op: 'sub', target: { k: 'chaosQi' }, value: 1 }],
        outcomes: [
          {
            text: '你把一缕混沌气搁在镜前。摊主看了很久，把镜扣下，推来一柄无铭的旧剑——骨头他不要了。',
            tone: 'xian',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 12 },
              { op: 'pct', target: { k: 'artifactPower' }, value: 5 },
              { op: 'gainInsight', value: 4 },
            ],
          },
        ],
        hint: { risk: 0, reward: 3 },
      },
      {
        id: 'refuse',
        label: '推镜，不换',
        outcomes: [
          {
            text: '你把铜镜推回去，朝摊主一揖。走出仙市时，背脊那节骨头安安静静。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 4 },
            ],
          },
        ],
        hint: { risk: 0, reward: 1 },
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
      {
        id: 'buy_silence',
        label: '出一缕混沌气买它闭嘴',
        enable: { op: 'cmp', target: { k: 'chaosQi' }, cmp: '>=', value: 1 },
        disabledReason: '需混沌气×1',
        cost: [{ op: 'sub', target: { k: 'chaosQi' }, value: 1 }],
        outcomes: [
          {
            weight: 55,
            text: '混沌气一出手，耳后那点声音就停了。你落回蒲团，识海干净得反常，像被人替你打扫过。',
            tone: 'gold',
            effects: [
              { op: 'clamp', target: { k: 'toxicity' }, hi: 30 },
              { op: 'gainInsight', value: 4 },
            ],
          },
          {
            weight: 45,
            text: '它收下了，却只安静三天。第四夜它换个位置继续报账，还多添了一条你没听过的。',
            tone: 'ev2',
            effects: [
              { op: 'clamp', target: { k: 'toxicity' }, hi: 45 },
              { op: 'addToxicity', value: 8 },
            ],
          },
        ],
        hint: { risk: 1, reward: 2 },
      },
      {
        id: 'throw_lotus',
        label: '把账本一页页烧掉',
        outcomes: [
          {
            weight: 45,
            text: '你翻着旧账，看一页，认一页，烧一页。烧到第七页时手停了一下，第八页还是烧了。',
            tone: 'ev2',
            effects: [
              { op: 'clamp', target: { k: 'toxicity' }, hi: 35 },
              { op: 'gainInsight', value: 6 },
            ],
          },
          {
            weight: 30,
            text: '火烧得很快，快得像有人替你按着。灰里浮出几个你没听过的名字，你一个也不认。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 6 },
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
            ],
          },
          {
            weight: 25,
            text: '烧到最后一页时，它不再报账，改口问你：这笔是你自己吞的，还是别人替你吞的。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 14 },
              { op: 'sub', target: { k: 'luck' }, value: 4 },
            ],
          },
        ],
        hint: { risk: 1, reward: 2 },
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
      {
        id: 'ask_price',
        label: '先问他这秤称的是什么',
        outcomes: [
          {
            weight: 50,
            text: '他答得很干脆：称你肯为它放下多少。说完把秤杆往你这边推了推，等你自己动手。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
            ],
          },
          {
            weight: 30,
            text: '他反问你肯为它放下多少。你答不出。他笑了一声，把残图收回去半寸，又停住了。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 7 },
              { op: 'sub', target: { k: 'luck' }, value: 3 },
            ],
          },
          {
            weight: 20,
            text: '他不再答，只把那杆秤擦了一遍。擦到你面前时，秤盘里映出你自己的脸。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 8 },
              { op: 'pct', target: { k: 'cultivation' }, value: -3 },
            ],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
      {
        id: 'chaos_on_scale',
        label: '把混沌气放上去抵',
        enable: { op: 'cmp', target: { k: 'chaosQi' }, cmp: '>=', value: 1 },
        disabledReason: '需混沌气×1',
        cost: [{ op: 'sub', target: { k: 'chaosQi' }, value: 1 }],
        outcomes: [
          {
            weight: 50,
            text: '秤杆没动，直接沉到底。摊主盯着那缕气看了很久，把整卷残图推过来，什么也没说。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
            ],
          },
          {
            weight: 30,
            text: '图是给了。他伸手在图角上抹了一下，那一角就此空白——抹掉的是什么，只有他知道。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'addToxicity', value: 10 },
            ],
          },
          {
            weight: 20,
            text: '秤杆先平了一瞬，随即自己压了下去。摊主把气推回给你：这不是价钱，是秤的食。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 14 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
        ],
        hint: { risk: 2, reward: 3 },
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
      {
        id: 'detour',
        label: '绕行，多花三年',
        outcomes: [
          {
            weight: 50,
            text: '你沿着池岸走了三年。绕出来的道比直路宽，路上遇见的人也比往年多。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 3 },
              { op: 'add', target: { k: 'yearsStayed' }, value: 3 },
              { op: 'gainInsight', value: 3 },
            ],
          },
          {
            weight: 30,
            text: '绕行的第三年，你在岸上等了一场雷散。那点白光没等到，倒是把旧伤等愈了。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'add', target: { k: 'yearsStayed' }, value: 3 },
            ],
          },
          {
            weight: 20,
            text: '多走的三年在云里没有账，仙界却记得清楚。你回来时，池面已平得像块铁。',
            tone: 'red',
            effects: [
              { op: 'add', target: { k: 'yearsStayed' }, value: 3 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
      {
        id: 'drain',
        label: '沉入池心，把沉雷引走',
        enable: { op: 'cmp', target: { k: 'toxicity' }, cmp: '<=', value: 45 },
        disabledReason: '需丹毒≤45',
        hint: { risk: 3, reward: 3 },
        outcomes: [
          {
            weight: 40,
            text: '你在池心坐了一炷香，把积在骨头里的雷气一点点引到水面。起身时，池底干净了，你的骨也干净了。',
            tone: 'gold',
            effects: [
              { op: 'clamp', target: { k: 'toxicity' }, hi: 25 },
              { op: 'pct', target: { k: 'cultivation' }, value: 10 },
            ],
          },
          {
            weight: 35,
            text: '沉雷认了你做容器。你替它背着走了很多年，直到某一夜它自己散了。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
              { op: 'addToxicity', value: 10 },
            ],
          },
          {
            weight: 25,
            text: '雷顺经脉走了一圈，没找到出口。你在水里坐到不记得自己是谁，才被人捞起来。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -8 },
              { op: 'addToxicity', value: 18 },
              { op: 'sub', target: { k: 'luck' }, value: 4 },
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
      {
        id: 'kneel',
        label: '在那道人影对面坐下',
        outcomes: [
          {
            weight: 45,
            text: '你坐下，对面也坐下。谁都没有先说话。坐到碑面渗出凉意，你起身时那句半话自己接上了。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 7 },
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
            ],
          },
          {
            weight: 30,
            text: '坐得太久，天光从背面转过来。对面始终没动，你也没动，只有影子换了个方向。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 9 },
              { op: 'addToxicity', value: 8 },
            ],
          },
          {
            weight: 25,
            text: '你起身时忘了自己为什么来。走出三步才想起，而那道人影已经坐成了碑的一部分。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
        ],
        hint: { risk: 2, reward: 2 },
      },
      {
        id: 'rub_blank',
        label: '伸手，把碑面磨出字来',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        outcomes: [
          {
            weight: 45,
            text: '你以仙灵气护住指尖，一寸一寸磨过去。碑面不吃力，却也不肯还你。磨到第三日，空白仍是空白。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'addToxicity', value: 10 },
            ],
          },
          {
            weight: 35,
            text: '第三日夜里，碑面第一次有了触感。是一道横，横得很深，深到你觉得它在往你骨头里刻。',
            tone: 'rare',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 10 },
              { op: 'addToxicity', value: 14 },
            ],
          },
          {
            weight: 20,
            text: '你磨出的那道横一直延到你身上，再没停过。禁台的云此后见你便散。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -6 },
              { op: 'addToxicity', value: 16 },
            ],
          },
        ],
        hint: { risk: 3, reward: 3 },
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
      {
        id: 'return_blank',
        label: '原帖退回，不落一字',
        outcomes: [
          {
            weight: 50,
            text: '你把帖子按原样送回。云外没有回音，也没有再来第二封。名录上从此没有你的名字。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 4 },
            ],
          },
          {
            weight: 30,
            text: '帖子退回去那年，云外往你这里多派了两次人。都没进门，站在云外就走了。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'sub', target: { k: 'luck' }, value: 4 },
            ],
          },
          {
            weight: 20,
            text: '帖上金纹自行烧断。烧断之前，你听见云外有人笑了一声，笑完便再没有下文。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 8 },
              { op: 'addToxicity', value: 6 },
            ],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
      {
        id: 'raise_terms',
        label: '回帖，只提一个条件',
        enable: { op: 'cmp', target: { k: 'insight' }, cmp: '>=', value: 4 },
        disabledReason: '需悟性≥4',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 4 }],
        outcomes: [
          {
            weight: 45,
            text: '你只提了一条：恩怨不共担。他们答应了，也只答应这一条。碑上那个刻痕因此浅了半分。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 12 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
          {
            weight: 30,
            text: '他们要你先证明提得动这一条。你在云外走了三趟，第三趟才有人肯接你的话。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'luck' }, value: 6 },
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
            ],
          },
          {
            weight: 25,
            text: '你提的那一条被原样记在名录背面。此后凡有人翻名录，都会先看见你写的那一句。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'sub', target: { k: 'luck' }, value: 7 },
            ],
          },
        ],
        hint: { risk: 2, reward: 2 },
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
      {
        id: 'pour_out',
        label: '替主人把空盏斟满',
        outcomes: [
          {
            weight: 50,
            text: '你替他把空盏斟上，斟到齐沿，一滴不溢。他看了很久，那盏始终没端起来。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 5 },
            ],
          },
          {
            weight: 30,
            text: '你斟得太满，水面晃出盏沿。他没有怪罪，只说了一句：满了就端不动。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 7 },
              { op: 'addToxicity', value: 6 },
            ],
          },
          {
            weight: 20,
            text: '斟到第三盏时，水自己满了三盏。主人终于笑了一下，那笑里没有请客的意思。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
        ],
        hint: { risk: 1, reward: 2 },
      },
      {
        id: 'swap_cups',
        label: '把三盏的位置换一遍',
        outcomes: [
          {
            weight: 40,
            text: '你不动茶，只把盏挪了。挪完主人才开口，教你一句他教过很多人的口诀，教完就不再看茶。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
          {
            weight: 35,
            text: '盏挪过去，水位自己换了。主人全程没看，只在散席时说了句：你敢换。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
              { op: 'addToxicity', value: 8 },
            ],
          },
          {
            weight: 25,
            text: '你换错了次序。主人家一直没说话，散席时却把你的名字从门客册上划去了一条。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 7 },
              { op: 'addToxicity', value: 8 },
            ],
          },
        ],
        hint: { risk: 2, reward: 2 },
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
      {
        id: 'take_ash',
        label: '收下那半炉冷灰',
        enable: { op: 'cmp', target: { k: 'toxicity' }, cmp: '<=', value: 55 },
        disabledReason: '需丹毒≤55',
        hint: { risk: 2, reward: 2 },
        outcomes: [
          {
            weight: 45,
            text: '冷灰入手是凉的，放了七日自己热起来。渡劫那日它替你挡下了头一道，雷声都小了一重。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 8 },
              { op: 'gainInsight', value: 3 },
            ],
          },
          {
            weight: 35,
            text: '灰里还剩前人没炼完的那一炉。你把它续上，炉温对了，成色却再回不去。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 4 },
              { op: 'addToxicity', value: 6 },
            ],
          },
          {
            weight: 20,
            text: '冷灰进了你的法宝，从此每次出手都带着一点旧主人的习惯。出剑时你总会慢半拍。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: -4 },
              { op: 'addToxicity', value: 12 },
            ],
          },
        ],
      },
      {
        id: 'buy_sword',
        label: '压价买下那柄断剑',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        outcomes: [
          {
            weight: 45,
            text: '摊主接了仙灵气，把断剑连鞘丢给你。剑早断了，剑里那股气没有。',
            tone: 'gold',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 8 },
              { op: 'add', target: { k: 'artifactBonus' }, value: 5 },
            ],
          },
          {
            weight: 30,
            text: '他收了钱，剑却只肯给到鞘口。你握住的那一瞬知道：这是一柄要你自己养活的剑。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 5 },
              { op: 'addToxicity', value: 8 },
            ],
          },
          {
            weight: 25,
            text: '断剑认过的主人太多。你握上去的一刻，腕上多了一道旧伤，像别人留下的。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'artifactPower' }, value: 4 },
              { op: 'addToxicity', value: 14 },
              { op: 'sub', target: { k: 'luck' }, value: 4 },
            ],
          },
        ],
        hint: { risk: 2, reward: 3 },
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
      {
        id: 'wait_turn',
        label: '退到十步外，等他们先取',
        outcomes: [
          {
            weight: 45,
            text: '你退开。那两人取了半日，最后把缝口留给你，也只留了半日的长度。剩下的他们带走了。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
            ],
          },
          {
            weight: 30,
            text: '你等了很久。等到缝自己合上，两人才走。他们临走朝你点了点头，算是认过你这个人不抢。',
            tone: 'ev1',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 5 },
            ],
          },
          {
            weight: 25,
            text: '你退得太久。两人取完之后回头看你，那眼神里已经把你算成了第三个来抢的。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 7 },
              { op: 'pct', target: { k: 'cultivation' }, value: -4 },
            ],
          },
        ],
        hint: { risk: 1, reward: 2 },
      },
      {
        id: 'seal_vein',
        label: '先封住缝口，不取',
        enable: { op: 'cmp', target: { k: 'insight' }, cmp: '>=', value: 3 },
        disabledReason: '需悟性≥3',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 3 }],
        outcomes: [
          {
            weight: 45,
            text: '你以三道印把缝口封死。那两人看了看，没动手。此后云海底再没有渗过气，也没有再合过缝。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 7 },
              { op: 'add', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 30,
            text: '封住了，气却开始在你封的印上积。积了几年，印自己裂开，出来的东西比原来多。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'addToxicity', value: 10 },
            ],
          },
          {
            weight: 25,
            text: '印封得太狠，缝底下的东西翻了个身。那两人随即消失，连同这一片云海。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 16 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
        ],
        hint: { risk: 2, reward: 2 },
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
      {
        id: 'price_first',
        label: '先问清楚这趟差事',
        outcomes: [
          {
            weight: 45,
            text: '你问了三句，他答了两句。答完他把匣子往回收了半寸，又推回来：剩下那一句你走完就知道。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'add', target: { k: 'luck' }, value: 5 },
            ],
          },
          {
            weight: 30,
            text: '他答完就闭上了眼。你在云下走了一趟，宅是空的，屋子干净得像一直有人住。回来时匣子已空。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
          {
            weight: 25,
            text: '他不肯答。你也就没接。走的时候他没留你，只在身后说了一句：来的人多，接的少。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 5 },
              { op: 'addToxicity', value: 6 },
            ],
          },
        ],
        hint: { risk: 1, reward: 2 },
      },
      {
        id: 'take_all',
        label: '接下差事，并要匣中全部',
        enable: { op: 'cmp', target: { k: 'chaosQi' }, cmp: '>=', value: 1 },
        disabledReason: '需混沌气×1',
        cost: [{ op: 'sub', target: { k: 'chaosQi' }, value: 1 }],
        outcomes: [
          {
            weight: 40,
            text: '你把差事应下，又开口要了全部。他看了你很久，给了。给完之后他看你的眼神，和刚才不一样了。',
            tone: 'rare',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 9 },
            ],
          },
          {
            weight: 35,
            text: '他给了你全部，也把那句话一并塞了进来。识海从此多一个人的分量，你分不清是自己的还是他的。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'gainInsight', value: 6 },
              { op: 'addToxicity', value: 10 },
            ],
          },
          {
            weight: 25,
            text: '他不给。他只把匣子合上，站起来比你想的高。此后你每夜都要梦见那间旧宅。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 18 },
              { op: 'sub', target: { k: 'luck' }, value: 7 },
            ],
          },
        ],
        hint: { risk: 3, reward: 3 },
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
      {
        id: 'take_herb',
        label: '先问他这气的来路',
        outcomes: [
          {
            weight: 45,
            text: '他说是他自己攒的，攒了很多年。你没全信，也没全疑。交易还是做了，气入体时你没再犹豫。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'gainInsight', value: 4 },
            ],
          },
          {
            weight: 30,
            text: '他说是从别人身上换来的，换了很多个。他把价码念完，你才动手。念完之后价格反而低了。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'addToxicity', value: 10 },
            ],
          },
          {
            weight: 25,
            text: '他不肯说。你起身要走，他反倒按住你的手：这一行，问来路的人都没活过第二年。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
      {
        id: 'chaos_for_chaos',
        label: '拿混沌气换他的混沌气',
        enable: { op: 'cmp', target: { k: 'chaosQi' }, cmp: '>=', value: 1 },
        disabledReason: '需混沌气×1',
        cost: [{ op: 'sub', target: { k: 'chaosQi' }, value: 1 }],
        outcomes: [
          {
            weight: 45,
            text: '两缕气在他掌心合成一股。他把浓的那股给了你，自己留下淡的，没说一句。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'pct', target: { k: 'cultivation' }, value: 8 },
            ],
          },
          {
            weight: 30,
            text: '他收了，却在验气时多看了你一眼：你的那一缕比他的旧。他没有再说话，把气换了。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'chaosQi' }, value: 1 },
              { op: 'gainInsight', value: 5 },
              { op: 'addToxicity', value: 8 },
            ],
          },
          {
            weight: 25,
            text: '他不肯换同源的东西。他说：拿这个来的人，多半是来讨债的。你握着空袖站了很久。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 14 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
        ],
        hint: { risk: 2, reward: 3 },
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
      {
        id: 'chaos_for_name',
        label: '以混沌气抵那个名字',
        enable: { op: 'cmp', target: { k: 'chaosQi' }, cmp: '>=', value: 1 },
        disabledReason: '需混沌气×1',
        cost: [{ op: 'sub', target: { k: 'chaosQi' }, value: 1 }],
        outcomes: [
          {
            weight: 45,
            text: '它收下了气，没再提名字。胸中那口淤积真的松了，松得干净，只是往后你再没有能挡心魔的东西。',
            tone: 'gold',
            effects: [
              { op: 'clamp', target: { k: 'toxicity' }, hi: 25 },
              { op: 'pct', target: { k: 'cultivation' }, value: 6 },
            ],
          },
          {
            weight: 35,
            text: '气收了，名字也收了，只是它记在了自己那边。往后每次心魔起，你都欠它一笔。',
            tone: 'ev2',
            effects: [
              { op: 'clamp', target: { k: 'toxicity' }, hi: 35 },
              { op: 'addToxicity', value: 8 },
            ],
          },
          {
            weight: 20,
            text: '它不收气，只收名字。话音落下时你已经说不出自己叫什么了。此后很多年，你都在找那个字。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 18 },
              { op: 'pct', target: { k: 'cultivation' }, value: -6 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
        ],
        hint: { risk: 2, reward: 3 },
      },
      {
        id: 'two_names',
        label: '记下它的名字，反报一个给它',
        enable: { op: 'cmp', target: { k: 'insight' }, cmp: '>=', value: 5 },
        disabledReason: '需悟性≥5',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 5 }],
        outcomes: [
          {
            weight: 40,
            text: '你报了一个名字，是你自己早年丢掉的那个。它愣住了。这一局谁也没赢，但桌上多了一样东西。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 8 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
          {
            weight: 35,
            text: '它不肯收，也不肯散。买卖成了僵局，僵到天亮。两边都少了点什么，两边都不肯说是哪一样。',
            tone: 'ev2',
            effects: [
              { op: 'clamp', target: { k: 'toxicity' }, hi: 40 },
              { op: 'addToxicity', value: 6 },
            ],
          },
          {
            weight: 25,
            text: '你报出的那个名字它认得。原来它报给你的那个，从来就不是随便挑的。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 20 },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
            ],
          },
        ],
        hint: { risk: 3, reward: 3 },
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
      {
        id: 'fill_his_arm',
        label: '先把他那只空臂浇满',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        outcomes: [
          {
            weight: 45,
            text: '你替他浇了一整瓢。那条空臂到夜里重新有了知觉，他坐在池边看了很久，什么也没说。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 7 },
              { op: 'add', target: { k: 'luck' }, value: 9 },
            ],
          },
          {
            weight: 30,
            text: '雷水灌进去，半夜自己流了出来。他看着那只臂笑了一下，那笑里没有谢你。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'addToxicity', value: 8 },
            ],
          },
          {
            weight: 25,
            text: '他没有躲。雷水顺着他那条空臂灌进你这一边，两个人一起被掀翻在池里。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -6 },
              { op: 'addToxicity', value: 16 },
            ],
          },
        ],
        hint: { risk: 2, reward: 2 },
      },
      {
        id: 'return_ladle',
        label: '把空瓢留下，人走',
        outcomes: [
          {
            weight: 50,
            text: '你没有接。他也没再递。走出十里回头看，池边多了一只新摆的空瓢，摆得很正。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'gainInsight', value: 4 },
            ],
          },
          {
            weight: 30,
            text: '你走后雷池静了。静了很多年，你偶尔会想起那只递过来的手，一直停在半空。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'clamp', target: { k: 'toxicity' }, hi: 40 },
            ],
          },
          {
            weight: 20,
            text: '你走得太干脆。他没拦，只是把瓢扔进池里。这一瓢砸下去，池面三日不平。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 10 },
              { op: 'sub', target: { k: 'luck' }, value: 5 },
            ],
          },
        ],
        hint: { risk: 0, reward: 1 },
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
      {
        id: 'give_name',
        label: '把当年那件东西给他',
        enable: { op: 'cmp', target: { k: 'insight' }, cmp: '>=', value: 3 },
        disabledReason: '需悟性≥3',
        cost: [{ op: 'sub', target: { k: 'insight' }, value: 3 }],
        outcomes: [
          {
            weight: 45,
            text: '你把当年那件东西解下来递过去。他没有接，只是看了很久，然后收下了。转身时他说：这样就清了。',
            tone: 'gold',
            effects: [
              { op: 'gainInsight', value: 7 },
              { op: 'add', target: { k: 'luck' }, value: 10 },
            ],
          },
          {
            weight: 30,
            text: '他接了，收进袖里，却没有走。他说这东西不能替死人说话，你还得自己说一遍。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 5 },
              { op: 'addToxicity', value: 8 },
            ],
          },
          {
            weight: 25,
            text: '他接过去，看也没看就丢了。他说这不是他要的，他要的是你亲口承认。你没有承认。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 14 },
              { op: 'sub', target: { k: 'luck' }, value: 7 },
            ],
          },
        ],
        hint: { risk: 2, reward: 2 },
      },
      {
        id: 'turn_away',
        label: '侧身让路，不看他',
        outcomes: [
          {
            weight: 45,
            text: '你让开半步，继续往前走。身后没有声音，追了很长一段也没有。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'sub', target: { k: 'luck' }, value: 4 },
            ],
          },
          {
            weight: 30,
            text: '你让了半步，他让了半步。两个人就这样错开，各走各的。错开之后你才发现手在抖。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'addToxicity', value: 8 },
            ],
          },
          {
            weight: 25,
            text: '他跟了上来，一路跟到云桥。桥上起风，你听见他在身后说：你迟早要回来。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 12 },
              { op: 'sub', target: { k: 'luck' }, value: 6 },
            ],
          },
        ],
        hint: { risk: 1, reward: 1 },
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
      {
        id: 'return_it',
        label: '把自己那缕混沌气还给它',
        enable: { op: 'cmp', target: { k: 'chaosQi' }, cmp: '>=', value: 1 },
        disabledReason: '需混沌气×1',
        cost: [{ op: 'sub', target: { k: 'chaosQi' }, value: 1 }],
        outcomes: [
          {
            weight: 45,
            text: '你把那缕气托出去，它没有立刻散。两缕气在云海里绕了半圈，合在一起，又各自走了。',
            tone: 'xian',
            effects: [
              { op: 'gainInsight', value: 9 },
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
            ],
          },
          {
            weight: 30,
            text: '它收下了，也把你一并记下。此后云海再让路，让得比从前更早，也更窄。',
            tone: 'ev2',
            effects: [
              { op: 'gainInsight', value: 6 },
              { op: 'addToxicity', value: 10 },
            ],
          },
          {
            weight: 25,
            text: '它不肯收。你手里的气散了，它也散了。云海合拢时你才明白，这一趟它不是来送的，是来比的。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -6 },
              { op: 'sub', target: { k: 'luck' }, value: 7 },
            ],
          },
        ],
        hint: { risk: 2, reward: 2 },
      },
      {
        id: 'sit_it_out',
        label: '就地打坐，看它自己走',
        outcomes: [
          {
            weight: 40,
            text: '你坐下，它也停着。坐到云海第三次改向，它先散了，散之前在你膝上落了一点重量。',
            tone: 'xian',
            effects: [
              { op: 'gainInsight', value: 7 },
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
            ],
          },
          {
            weight: 35,
            text: '你们就这么对着坐了很久。它不认你，你也不认它。可这一坐把坐散的那些滞涩全坐开了。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 7 },
              { op: 'clamp', target: { k: 'toxicity' }, hi: 35 },
            ],
          },
          {
            weight: 25,
            text: '它等到了你没等住。你睁眼时云海已复了原样，膝上什么也没有，只有一点凉。',
            tone: 'red',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: -4 },
              { op: 'addToxicity', value: 10 },
            ],
          },
        ],
        hint: { risk: 1, reward: 2 },
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
      {
        id: 'send_own',
        label: '回帖，说明自己另有要务',
        outcomes: [
          {
            weight: 50,
            text: '你写了张回帖，只说有事。帖子没有再回来，那份备下的东西也没了下文。',
            tone: 'ev1',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 5 },
              { op: 'gainInsight', value: 4 },
            ],
          },
          {
            weight: 30,
            text: '主家另派人追着送了三次礼，都被你挡了。第四次来的人说：主家只是想认个脸。',
            tone: 'ev2',
            effects: [
              { op: 'pct', target: { k: 'cultivation' }, value: 4 },
              { op: 'sub', target: { k: 'luck' }, value: 4 },
            ],
          },
          {
            weight: 20,
            text: '回帖送出当晚，宴席照开。云上有人问是谁推了帖子，主家答：不必记，那人不敢来。',
            tone: 'red',
            effects: [
              { op: 'sub', target: { k: 'luck' }, value: 9 },
              { op: 'addToxicity', value: 8 },
            ],
          },
        ],
        hint: { risk: 1, reward: 1 },
      },
      {
        id: 'bring_own',
        label: '赴宴，带一缕仙灵气作回礼',
        enable: { op: 'cmp', target: { k: 'xianqi' }, cmp: '>=', value: 1 },
        disabledReason: '需仙灵气×1',
        cost: [{ op: 'sub', target: { k: 'xianqi' }, value: 1 }],
        outcomes: [
          {
            weight: 45,
            text: '你把仙灵气搁在案上就再没动筷。散席时主家亲自送到阶下，什么也没说，只把袖里那件东西塞给了你。',
            tone: 'gold',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 10 },
              { op: 'gainInsight', value: 5 },
            ],
          },
          {
            weight: 30,
            text: '礼收下了，席也照坐。主家的人替你挡了三轮问话，散席时只说：这份人情先记着。',
            tone: 'ev2',
            effects: [
              { op: 'add', target: { k: 'artifactBonus' }, value: 5 },
              { op: 'add', target: { k: 'luck' }, value: 8 },
            ],
          },
          {
            weight: 25,
            text: '仙灵气一上案，席上就安静了。主家脸色变了，宴没散，账却当场记在了你名下，一分不少。',
            tone: 'red',
            effects: [
              { op: 'addToxicity', value: 16 },
              { op: 'sub', target: { k: 'luck' }, value: 8 },
            ],
          },
        ],
        hint: { risk: 2, reward: 3 },
      },
    ],
  }),
] satisfies EventDef[];
