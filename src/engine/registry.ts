import type { ContentBundle, EventDef, Fate, NameTables, RollTable } from './types/effects';

export function defineEvent(e: EventDef): EventDef {
  return e;
}

export function defineFate(f: Fate): Fate {
  return f;
}

export function defineRollTable(t: RollTable): RollTable {
  return t;
}

export function bundle(parts: {
  events: EventDef[];
  fates: Fate[];
  rollTables?: RollTable[];
  names?: NameTables;
}): ContentBundle {
  return {
    events: parts.events,
    fates: parts.fates,
    rollTables: parts.rollTables ?? [],
    ...(parts.names ? { names: parts.names } : {}),
  };
}
