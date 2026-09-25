import { bundle } from '../engine/registry';
import type { NameTables } from '../engine/types/effects';
import { ARTS } from './arts/index';
import { FATES } from './fates';
import { ART_EVENTS } from './events/arts/index';
import { MORTAL_EARLY } from './events/mortal/early';
import { MORTAL_MID } from './events/mortal/mid';
import { MORTAL_LATE } from './events/mortal/late';
import { IMMORTAL_LOWER } from './events/immortal/lower';
import { IMMORTAL_UPPER } from './events/immortal/upper';
import namesJson from './generated/names.json';

export const BUNDLE = bundle({
  events: [
    ...MORTAL_EARLY,
    ...MORTAL_MID,
    ...MORTAL_LATE,
    ...IMMORTAL_LOWER,
    ...IMMORTAL_UPPER,
    ...ART_EVENTS,
  ],
  fates: FATES,
  arts: ARTS,
  names: namesJson as NameTables,
});

export {
  ARTS,
  ART_EVENTS,
  FATES,
  MORTAL_EARLY,
  MORTAL_MID,
  MORTAL_LATE,
  IMMORTAL_LOWER,
  IMMORTAL_UPPER,
};
export { STARTER_ART_IDS } from './arts/index';
