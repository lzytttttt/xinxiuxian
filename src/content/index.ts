import { bundle } from '../engine/registry';
import { ARTS } from './arts/index';
import { FATES } from './fates';
import { HERBS } from './herbs';
import { PILLS } from './pills';
import { RECIPES } from './recipes';
import { generateNames } from './names/compose';
import { ALCHEMY_EVENTS } from './events/alchemy/index';
import { ART_EVENTS } from './events/arts/index';
import { BOND_EVENTS } from './events/bond/index';
import { SECT_EVENTS } from './events/sect/index';
import { MISSIONS } from './missions';
import { SECTS } from './sects';
import { MORTAL_EARLY } from './events/mortal/early';
import { MORTAL_MID } from './events/mortal/mid';
import { MORTAL_LATE } from './events/mortal/late';
import { IMMORTAL_LOWER } from './events/immortal/lower';
import { IMMORTAL_UPPER } from './events/immortal/upper';

/* 名称表**运行时生成**而不是打包 `generated/names.json`：产物 240 KB raw / 34 KB gzip，
   而词池 `names/pools.ts` 只有 13.7 KB raw / 2.9 KB gzip，生成耗时约 27 ms。
   `generated/names.json` 保留为冻结基线，由 `tools/gen-names.ts --check` 比对（见 v0.1.0-06 §三）。 */
export const BUNDLE = bundle({
  events: [
    ...MORTAL_EARLY,
    ...MORTAL_MID,
    ...MORTAL_LATE,
    ...IMMORTAL_LOWER,
    ...IMMORTAL_UPPER,
    ...ART_EVENTS,
    ...ALCHEMY_EVENTS,
    ...SECT_EVENTS,
    ...BOND_EVENTS,
  ],
  fates: FATES,
  arts: ARTS,
  herbs: HERBS,
  pills: PILLS,
  recipes: RECIPES,
  sects: SECTS,
  missions: MISSIONS,
  names: generateNames(),
});

export {
  ARTS,
  ART_EVENTS,
  ALCHEMY_EVENTS,
  BOND_EVENTS,
  SECT_EVENTS,
  FATES,
  HERBS,
  PILLS,
  RECIPES,
  SECTS,
  MISSIONS,
  MORTAL_EARLY,
  MORTAL_MID,
  MORTAL_LATE,
  IMMORTAL_LOWER,
  IMMORTAL_UPPER,
};
export { STARTER_ART_IDS } from './arts/index';
