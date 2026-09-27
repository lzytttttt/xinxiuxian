import { defineArt } from '../../engine/registry';
import type { ArtDef } from '../../engine/types/effects';

/* 八门宗门专属功法：**只能**通过宗门途径获得（真传弟子起进任务奖励池、大比夺魁必得），
   散修路线拿不到 —— 所以它们不进 `P_build/P_nobuild` 的构筑群体口径（见 v0.1.0-06 §三·4）。
   量级刻意低于同流派通用功法：宗门是"多一条路"，不是"多一层数值"。 */

export const SECT_ARTS: ArtDef[] = [
  defineArt({
    id: 'art_sect_taixu',
    name: '太虚剑典',
    school: '剑修',
    quality: 4,
    passives: { z4: 0.12, z1: 0.03 },
    text: '太虚之意不在剑，在剑之前那一线未发的势。',
    requires: { op: 'sect', id: 'sect_taixu' },
  }),
  defineArt({
    id: 'art_sect_qingnang',
    name: '青囊丹经',
    school: '丹修',
    quality: 4,
    passives: { z4: 0.12, z3: 0.03 },
    text: '囊中三卷，一卷医人，一卷医己，一卷医天。',
    requires: { op: 'sect', id: 'sect_qingnang' },
  }),
  defineArt({
    id: 'art_sect_xuanyue',
    name: '玄岳不坏身',
    school: '体修',
    quality: 4,
    passives: { z4: 0.12, z1: 0.03 },
    text: '山不动，风自过；身不坏，劫自消。',
    requires: { op: 'sect', id: 'sect_xuanyue' },
  }),
  defineArt({
    id: 'art_sect_wandu',
    name: '万毒真经',
    school: '毒修',
    quality: 4,
    passives: { z4: 0.12, z2: 0.03 },
    text: '世之良药不过百种，而毒有万端 —— 谁言毒不能证道。',
    requires: { op: 'sect', id: 'sect_wandu' },
  }),
  defineArt({
    id: 'art_sect_jiuxiao',
    name: '九霄雷法',
    school: '雷修',
    quality: 4,
    passives: { z4: 0.12, z1: 0.03 },
    text: '天雷九霄，一念断罪。雷府弟子，先学受雷，再学用雷。',
    requires: { op: 'sect', id: 'sect_jiuxiao' },
  }),
  defineArt({
    id: 'art_sect_youming',
    name: '幽冥魔典',
    school: '魔修',
    quality: 4,
    passives: { z4: 0.12, z3: 0.03 },
    text: '天不予我，我便自取。',
    requires: { op: 'sect', id: 'sect_youming' },
  }),
  defineArt({
    id: 'art_sect_taiyi',
    name: '太乙符阵',
    school: '雷修',
    quality: 4,
    passives: { z4: 0.12, z6: 0.03 },
    text: '以符驭法，以阵困仙。符宗不修一法，而万法皆入其阵。',
    requires: { op: 'sect', id: 'sect_taiyi' },
  }),
  defineArt({
    id: 'art_sect_tianyin',
    name: '天音梵唱',
    school: '丹修',
    quality: 4,
    passives: { z4: 0.12, z2: 0.03 },
    text: '梵音洗心，心境不染。心不染，则丹毒亦着不得。',
    requires: { op: 'sect', id: 'sect_tianyin' },
  }),
];
