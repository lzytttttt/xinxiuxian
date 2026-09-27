import { NPC_ROOT_TIER_MAX, NPC_ROOT_TIER_MIN } from '../engine/constants';
import { ORIGINS, PERSONALITIES } from '../engine/bonds';
import { makeRngBag } from '../engine/rng';
import type { Npc } from '../engine/types/effects';
import type { MetaState } from '../engine/types/meta';
import type { DeferredEntry, RunState } from '../engine/types/run';

export const SAVE_KEY = 'xiuxian.save';
export const SETTINGS_KEY = 'xiuxian.settings';
export const CURRENT_VERSION = 5;

export interface SaveEnvelope {
  v: number;
  meta: MetaState;
  run: RunState | null;
  checksum: string;
  savedAt: number;
}

export class ChecksumError extends Error {}
export class MigrationError extends Error {}

export function defaultMeta(): MetaState {
  return {
    version: 1,
    legacyPoints: 0,
    lifetimeLegacy: 0,
    cave: { 药园: 0, 丹房: 0, 藏经阁: 0, 悟道室: 0, 聚灵阵: 0, 静室: 0 },
    unlocks: { arts: [], recipes: [], sects: [] },
    sectLegacy: {},
    pastLives: [],
    pastPartners: [],
    achievements: [],
    codex: { encounters: '', artifacts: '', realms: '' },
    pity: 0,
    autoPolicy: { battlePolicy: 'manual', smartX: 1 },
    settings: { reducedMotion: false, visualIntensity: 'mid', textSpeed: 1, tickMs: 300 },
    totals: { runs: 0, years: 0, ascensions: 0, zhengdao: 0, bestLevel: 0 },
  };
}

export function checksumOf(meta: MetaState, run: RunState | null): string {
  const text = `${JSON.stringify(meta)}|${JSON.stringify(run)}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function makeEnvelope(meta: MetaState, run: RunState | null): SaveEnvelope {
  return {
    v: CURRENT_VERSION,
    meta,
    run,
    checksum: checksumOf(meta, run),
    savedAt: Date.now(),
  };
}

export function verifyChecksum(env: SaveEnvelope): void {
  if (checksumOf(env.meta, env.run) !== env.checksum) {
    throw new ChecksumError('checksum mismatch');
  }
}

export const MIGRATIONS: Record<number, (env: unknown) => unknown> = {
  // v1 → v2：Phase 2 把 deferredQueue 由 string[] 改为 DeferredEntry[]，并新增 decisionLog。
  1: (env) => {
    const old = env as SaveEnvelope;
    if (!old.run) return { ...old, v: 2 };
    const run = old.run as RunState & { deferredQueue?: unknown[]; decisionLog?: unknown[] };
    const migrated: RunState = {
      ...run,
      // year: 0 让旧条目在下一次 rollYear 被重试一次（仲裁重试条件是 entry.year < s.year）
      deferredQueue: (run.deferredQueue ?? []).map((entry) =>
        typeof entry === 'string' ? ({ eventId: entry, year: 0 } satisfies DeferredEntry) : (entry as DeferredEntry),
      ),
      decisionLog: (run.decisionLog ?? []) as RunState['decisionLog'],
    };
    return { ...old, v: 2, run: migrated, checksum: checksumOf(old.meta, migrated) };
  },
  // v2 → v3：Phase 3 新增 powerTrail（战力最近变化）；arts/slots/insight 字段 Phase 1 起即存在
  2: (env) => {
    const old = env as SaveEnvelope;
    if (!old.run) return { ...old, v: 3 };
    const run = old.run as RunState & { powerTrail?: RunState['powerTrail'] };
    const migrated: RunState = { ...run, powerTrail: run.powerTrail ?? null };
    return { ...old, v: 3, run: migrated, checksum: checksumOf(old.meta, migrated) };
  },
  // v3 → v4：Phase 4 新增丹药状态；herbs/recipes/pills/toxicity 字段 Phase 1 起即存在
  3: (env) => {
    const old = env as SaveEnvelope;
    if (!old.run) return { ...old, v: 4 };
    const run = old.run as RunState & {
      pillBuffs?: RunState['pillBuffs'];
      pillBreakMult?: number;
      pillGuardMult?: number;
      pillCooldown?: RunState['pillCooldown'];
    };
    const migrated: RunState = {
      ...run,
      pillBuffs: run.pillBuffs ?? [],
      pillBreakMult: run.pillBreakMult ?? 1,
      pillGuardMult: run.pillGuardMult ?? 1,
      pillCooldown: run.pillCooldown ?? {},
    };
    return { ...old, v: 4, run: migrated, checksum: checksumOf(old.meta, migrated) };
  },
  // v4 → v5：Phase 5 宗门与羁绊。
  //  - sect 增 lastTournament / inviteFrom
  //  - bonds.list 由窄 Bond{type,level,...} 扩为完整 Npc{rootTier,personality,origin,bondType,bondLevel,alive,neglect,injuredUntil,...}
  //  - RunState 增 pastPartner（跨局注入，旧档一律为 null）
  4: (env) => {
    const old = env as SaveEnvelope;
    if (!old.run) return { ...old, v: 5 };
    const run = old.run as RunState & {
      sect: RunState['sect'] & {
        lastTournament?: number;
        inviteFrom?: string | null;
        tournamentPlaces?: number[];
      };
      bonds: { list: Record<string, unknown>[]; nextId?: number };
      pastPartner?: RunState['pastPartner'];
    };
    const rng = makeRngBag(`${run.seed ?? 'migrate'}:v5`);
    const list: Npc[] = ((run.bonds?.list ?? []) as unknown as Record<string, unknown>[]).map((raw, i) => {
      const legacy = raw as Record<string, unknown>;
      const str = (k: string): string | undefined =>
        typeof legacy[k] === 'string' ? (legacy[k] as string) : undefined;
      const num = (k: string): number | undefined =>
        typeof legacy[k] === 'number' ? (legacy[k] as number) : undefined;
      const type = str('bondType') ?? str('type');
      // 窄 Bond（Phase 1 形态）没有独立的 NPC 境界：那时 `level` 指的是**羁绊等级**。
      // 因此优先读 bondLevel；缺失时才把 level 当羁绊等级，并给 NPC 一个随玩家境界推出来的境界。
      const narrow = num('bondLevel') === undefined && num('level') !== undefined;
      const npcLevel = narrow ? Math.max(1, Math.round(run.realm.level * 0.7)) : (num('level') ?? 1);
      return {
        id: str('id') ?? `npc_m${i}`,
        name: str('name') ?? `旧识${i}`,
        gender: str('gender') === '女' ? '女' : '男',
        rootTier: num('rootTier') ?? rng.bond.int(NPC_ROOT_TIER_MIN, NPC_ROOT_TIER_MAX),
        personality: (str('personality') ?? rng.bond.pick(PERSONALITIES)) as Npc['personality'],
        origin: (str('origin') ?? rng.bond.pick(ORIGINS)) as Npc['origin'],
        level: npcLevel,
        affinity: num('affinity') ?? 0,
        bondType: (type as Npc['bondType'] | undefined) ?? null,
        bondLevel: Math.max(0, Math.min(5, num('bondLevel') ?? num('level') ?? 0)),
        alive: legacy['alive'] !== false,
        metYear: num('metYear') ?? num('createdYear') ?? 0,
        neglect: num('neglect') ?? 0,
        injuredUntil: num('injuredUntil') ?? 0,
        seed: str('seed') ?? `migrated:${i}`,
      };
    });
    const migrated: RunState = {
      ...run,
      sect: {
        ...run.sect,
        lastTournament: run.sect.lastTournament ?? -1,
        inviteFrom: run.sect.inviteFrom ?? null,
        tournamentPlaces: run.sect.tournamentPlaces ?? [],
      },
      bonds: { list, nextId: run.bonds?.nextId ?? list.length + 1 },
      pastPartner: run.pastPartner ?? null,
    };
    return { ...old, v: 5, run: migrated, checksum: checksumOf(old.meta, migrated) };
  },
};

export function migrate(env: unknown): SaveEnvelope {
  let cur = env as SaveEnvelope;
  while (cur.v < CURRENT_VERSION) {
    const step = MIGRATIONS[cur.v];
    if (!step) throw new MigrationError(`no migration from v${cur.v}`);
    cur = step(cur) as SaveEnvelope;
  }
  return cur;
}

function archive(raw: string): void {
  try {
    const parsed = JSON.parse(raw) as { v?: unknown };
    const v = typeof parsed.v === 'number' ? parsed.v : 'unknown';
    localStorage.setItem(`${SAVE_KEY}.bak.${v}`, raw);
  } catch {
    localStorage.setItem(`${SAVE_KEY}.bak.unknown`, raw);
  }
}

export function loadEnvelope(): SaveEnvelope | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const env = JSON.parse(raw) as SaveEnvelope;
    verifyChecksum(env);
    return migrate(env);
  } catch {
    archive(raw);
    localStorage.removeItem(SAVE_KEY);
    return null;
  }
}

export function saveEnvelope(env: SaveEnvelope): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(env));
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export interface SaverOptions {
  debounceMs?: number;
}

export function createSaver(
  get: () => { meta: MetaState; run: RunState | null },
  opts: SaverOptions = {},
): { request: () => void; flush: () => void; writes: () => number } {
  const debounceMs = opts.debounceMs ?? 200;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let count = 0;
  const write = (): void => {
    const { meta, run } = get();
    saveEnvelope(makeEnvelope(meta, run));
    count += 1;
  };
  const flush = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    write();
  };
  const request = (): void => {
    if (timer !== null) return;
    timer = setTimeout(() => {
      timer = null;
      write();
    }, debounceMs);
  };
  return { request, flush, writes: () => count };
}

export function shouldPersistYear(year: number): boolean {
  return year % 5 === 0;
}
