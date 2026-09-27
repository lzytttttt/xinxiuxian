import type {
  ArtDef,
  ContentBundle,
  EventDef,
  Fate,
  Herb,
  MissionDef,
  NameTables,
  PillDef,
  Recipe,
  RollTable,
  SectDef,
} from './types/effects';

export function defineEvent(e: EventDef): EventDef {
  return e;
}

export function defineFate(f: Fate): Fate {
  return f;
}

export function defineArt(a: ArtDef): ArtDef {
  return a;
}

export function defineHerb(h: Herb): Herb {
  return h;
}

export function definePill(p: PillDef): PillDef {
  return p;
}

export function defineRecipe(r: Recipe): Recipe {
  return r;
}

export function defineRollTable(t: RollTable): RollTable {
  return t;
}

export function defineSect(s: SectDef): SectDef {
  return s;
}

export function defineMission(m: MissionDef): MissionDef {
  return m;
}

export function bundle(parts: {
  events: EventDef[];
  fates: Fate[];
  rollTables?: RollTable[];
  arts?: ArtDef[];
  herbs?: Herb[];
  pills?: PillDef[];
  recipes?: Recipe[];
  sects?: SectDef[];
  missions?: MissionDef[];
  names?: NameTables;
}): ContentBundle {
  return {
    events: parts.events,
    fates: parts.fates,
    rollTables: parts.rollTables ?? [],
    ...(parts.arts ? { arts: parts.arts } : {}),
    ...(parts.herbs ? { herbs: parts.herbs } : {}),
    ...(parts.pills ? { pills: parts.pills } : {}),
    ...(parts.recipes ? { recipes: parts.recipes } : {}),
    ...(parts.sects ? { sects: parts.sects } : {}),
    ...(parts.missions ? { missions: parts.missions } : {}),
    ...(parts.names ? { names: parts.names } : {}),
  };
}
