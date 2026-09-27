import type { EventDef } from '../../../engine/types/effects';
import { BOND_EVENTS_GIFT } from './gift';
import { BOND_EVENTS_MEET } from './meet';

export const BOND_EVENTS: EventDef[] = [...BOND_EVENTS_MEET, ...BOND_EVENTS_GIFT];
