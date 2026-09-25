import type { ArtDef, ContentBundle, EventDef, Fate, NameTables, RollTable } from './types/effects';

export function defineEvent(e: EventDef): EventDef {
  return e;
}

export function defineFate(f: Fate): Fate {
  return f;
}

export function defineArt(a: ArtDef): ArtDef {
  return a;
}

export function defineRollTable(t: RollTable): RollTable {
  return t;
}

export function bundle(parts: {
  events: EventDef[];
  fates: Fate[];
  rollTables?: RollTable[];
  arts?: ArtDef[];
  names?: NameTables;
}): ContentBundle {
  return {
    events: parts.events,
    fates: parts.fates,
    rollTables: parts.rollTables ?? [],
    ...(parts.arts ? { arts: parts.arts } : {}),
    ...(parts.names ? { names: parts.names } : {}),
  };
}
