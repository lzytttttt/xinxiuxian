import type { MetaState } from '../engine/types/meta';
import type { DeferredEntry, RunState } from '../engine/types/run';

export const SAVE_KEY = 'xiuxian.save';
export const SETTINGS_KEY = 'xiuxian.settings';
export const CURRENT_VERSION = 3;

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
