import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { defineEvent } from '../../src/engine/registry';
import { makeRngBag } from '../../src/engine/rng';
import { applyChoice, rollYear } from '../../src/engine/tick';
import { CAVE_LEVEL_MAX } from '../../src/engine/constants';
import type { ContentBundle, EventDef } from '../../src/engine/types/effects';
import type { RunState } from '../../src/engine/types/run';
import {
  CURRENT_VERSION,
  MIGRATIONS,
  checksumOf,
  migrate,
  verifyChecksum,
  type SaveEnvelope,
} from '../../src/store/persistence';
import fixtureV1 from '../fixtures/save-v1.json';
import fixtureV2 from '../fixtures/save-v2.json';
import fixtureV3 from '../fixtures/save-v3.json';
import fixtureV4 from '../fixtures/save-v4.json';
import fixtureV5 from '../fixtures/save-v5.json';
import fixtureV6 from '../fixtures/save-v6.json';

const EV_TWO = defineEvent({
  id: 'ev_migrate_two',
  title: '岔路',
  category: 'world',
  weight: 100,
  body: '两条路摆在面前。',
  choices: [
    {
      id: 'a',
      label: '甲路',
      outcomes: [{ text: '甲路有得。', effects: [{ op: 'add', target: { k: 'luck' }, value: 5 }] }],
    },
    {
      id: 'b',
      label: '乙路',
      outcomes: [{ text: '乙路微薄。', effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }] }],
    },
  ],
});

const bundle: ContentBundle = { events: [EV_TWO] as EventDef[], fates: [], rollTables: [] };

/** 跑迁移链到 `upTo`（含）。测**单步**时用 `MIGRATIONS[v]!(migrateTo(fixture, v))` */
function migrateTo(env: SaveEnvelope, upTo: number): SaveEnvelope {
  let cur = env;
  while (cur.v < upTo) {
    const s = MIGRATIONS[cur.v];
    if (!s) throw new Error(`no migration from v${cur.v}`);
    cur = s(cur) as SaveEnvelope;
  }
  return cur;
}

const FIXTURES: [string, number, SaveEnvelope][] = [
  ['save-v1.json', 1, fixtureV1 as unknown as SaveEnvelope],
  ['save-v2.json', 2, fixtureV2 as unknown as SaveEnvelope],
  ['save-v3.json', 3, fixtureV3 as unknown as SaveEnvelope],
  ['save-v4.json', 4, fixtureV4 as unknown as SaveEnvelope],
  ['save-v5.json', 5, fixtureV5 as unknown as SaveEnvelope],
  ['save-v6.json', 6, fixtureV6 as unknown as SaveEnvelope],
];

describe('存档迁移链（验收 6.4）', () => {
  it('CURRENT_VERSION 为 7，且 MIGRATIONS 覆盖 v1..v6 每一步', () => {
    expect(CURRENT_VERSION).toBe(7);
    // 缺任何一步，`migrate` 会在半路抛 MigrationError（下方另有断言）
    for (let v = 1; v < CURRENT_VERSION; v++) {
      expect(() => migrate({ v, meta: fixtureV1.meta, run: null })).not.toThrow();
    }
  });

  it('每个版本都有 fixture，且 fixture 的版本号自洽', () => {
    for (const [name, version, env] of FIXTURES) {
      expect(env.v, `${name} 的 v 字段`).toBe(version);
      expect(env.run, `${name} 带真实局内状态`).not.toBeNull();
    }
  });

  it('fixture 是**真实迁移产物**：v3/v4/v5 逐级跑 MIGRATIONS 得到同样的校验和', () => {
    let cursor = fixtureV1 as unknown as SaveEnvelope;
    for (const [, version, env] of FIXTURES) {
      while (cursor.v < version) {
        const step = MIGRATIONS[cursor.v];
        if (!step) throw new Error(`no migration from v${cursor.v}`);
        cursor = step(cursor) as SaveEnvelope;
      }
      expect(cursor.v).toBe(version);
      expect(cursor.checksum, `v${version} 校验和`).toBe(env.checksum);
    }
  });

  it('每个 fixture 自身校验和自洽（迁移前先校验通过）', () => {
    for (const [name, , env] of FIXTURES) {
      expect(() => verifyChecksum(env), name).not.toThrow();
    }
  });

  it('v1 档形态正确：无 decisionLog、deferredQueue 为 string[]', () => {
    const v1 = fixtureV1 as unknown as SaveEnvelope;
    expect('decisionLog' in (v1.run as object)).toBe(false);
    expect((v1.run?.deferredQueue as unknown[]).every((x) => typeof x === 'string')).toBe(true);
    expect(v1.run?.eventLog.length).toBeGreaterThan(0);
  });

  it('v1 → v6：deferredQueue 转对象、powerTrail / 丹药 / 宗门 / 羁绊 / 洞府全部补默认', () => {
    const v6 = migrateTo(fixtureV1 as unknown as SaveEnvelope, 6);
    expect(v6.v).toBe(6);
    const run = v6.run as RunState;
    expect(run.decisionLog).toEqual([]);
    expect(run.deferredQueue).toEqual([]);
    expect(run.powerTrail).toBeNull();
    expect(run.pillBuffs).toEqual([]);
    expect(run.pillBreakMult).toBe(1);
    expect(run.pillGuardMult).toBe(1);
    expect(run.pillCooldown).toEqual({});
    expect(run.sect.lastTournament).toBe(-1);
    expect(run.sect.inviteFrom).toBeNull();
    expect(run.pastPartner).toBeNull();
    expect(run.bonds.list).toEqual([]);
    expect(run.legacyCave).toEqual({ 药园: 0, 丹房: 0, 藏经阁: 0, 悟道室: 0, 聚灵阵: 0, 静室: 0 });
    expect(run.eventLog).toEqual(fixtureV1.run?.eventLog);
    expect(run.cultivation).toBe(fixtureV1.run?.cultivation);
    expect(checksumOf(v6.meta, run)).toBe(v6.checksum);
  });

  it('v5 → v6：codex 由三张位串补到六张，其余字段不动', () => {
    const v5 = fixtureV5 as unknown as SaveEnvelope;
    const v6 = migrateTo(v5, 6);
    expect(v6.v).toBe(6);
    expect(Object.keys(v6.meta.codex).sort()).toEqual(
      ['arts', 'artifacts', 'encounters', 'herbs', 'pills', 'realms'].sort(),
    );
    expect(v6.meta.codex.pills).toBe('');
    expect(v6.meta.codex.arts).toBe('');
    expect(v6.meta.codex.herbs).toBe('');
    expect(v6.meta.codex.encounters).toBe(v5.meta.codex.encounters);
    expect(v6.meta.legacyPoints).toBe(v5.meta.legacyPoints);
    expect(v6.meta.sectLegacy).toEqual(v5.meta.sectLegacy);
    expect(v6.run?.cultivation).toBe(v5.run?.cultivation);
    expect(() => verifyChecksum(v6)).not.toThrow();
  });

  it('v5 → v6：洞府等级夹到 [0, CAVE_LEVEL_MAX]（旧档可能被手改）', () => {
    const legacy = {
      ...(fixtureV5 as unknown as SaveEnvelope),
      v: 5,
      meta: {
        ...fixtureV5.meta,
        cave: { 药园: 99, 丹房: -3, 藏经阁: 2.9, 悟道室: 5, 聚灵阵: 0, 静室: 5 },
      },
    } as unknown as SaveEnvelope;
    legacy.checksum = checksumOf(legacy.meta, legacy.run);
    const v6 = migrateTo(legacy, 6);
    expect(v6.meta.cave).toEqual({
      药园: CAVE_LEVEL_MAX,
      丹房: 0,
      藏经阁: 2,
      悟道室: 5,
      聚灵阵: 0,
      静室: 5,
    });
  });

  it('v5 → v6：缺失 cave 的旧档补全零洞府', () => {
    const legacy = { ...(fixtureV5 as unknown as SaveEnvelope), v: 5 } as unknown as SaveEnvelope;
    delete (legacy.meta as unknown as Record<string, unknown>).cave;
    legacy.checksum = checksumOf(legacy.meta, legacy.run);
    const v6 = migrateTo(legacy, 6);
    expect(Object.values(v6.meta.cave).every((v) => v === 0)).toBe(true);
    expect(Object.values((v6.run as RunState).legacyCave).every((v) => v === 0)).toBe(true);
  });

  it('v2 → v6：补 powerTrail、丹药、宗门与羁绊、洞府', () => {
    const v6 = migrateTo(fixtureV2 as unknown as SaveEnvelope, 6);
    const run = v6.run as RunState;
    expect(run.powerTrail).toBeNull();
    expect(run.pillBuffs).toEqual([]);
    expect(run.pillCooldown).toEqual({});
    expect(run.decisionLog).toEqual(fixtureV2.run?.decisionLog);
    expect(run.deferredQueue).toEqual(fixtureV2.run?.deferredQueue);
    expect(run.arts).toEqual(fixtureV2.run?.arts);
    expect(() => verifyChecksum(v6)).not.toThrow();
  });

  it('窄 Bond（Phase 1 形态）补齐为完整 Npc：type→bondType、createdYear→metYear', () => {
    const legacy = {
      ...fixtureV1,
      v: 4,
      run: {
        ...(fixtureV1.run as object),
        sect: { id: 'sect_taixu', rank: 2, contribution: 400, joinedYear: 12, defections: 0, tension: {} },
        bonds: {
          nextId: 3,
          list: [
            { id: 'npc_1', name: '柳疏影', type: '道侣', level: 4, affinity: 88, createdYear: 33, seed: 's:1' },
          ],
        },
      },
    } as unknown as SaveEnvelope;
    legacy.checksum = checksumOf(legacy.meta, legacy.run);
    const v6 = migrateTo(legacy, 6);
    const npc = v6.run?.bonds.list[0];
    expect(npc?.bondType).toBe('道侣');
    expect(npc?.bondLevel).toBe(4);
    expect(npc?.affinity).toBe(88);
    expect(npc?.metYear).toBe(33);
    expect(npc?.alive).toBe(true);
    expect(npc?.name).toBe('柳疏影');
    expect(npc?.rootTier).toBeGreaterThanOrEqual(1);
    expect(npc?.personality).toBeTruthy();
    expect(v6.run?.sect.lastTournament).toBe(-1);
  });

  it('旧档 string[] 形态的 deferredQueue 转成 {eventId, year:0}', () => {
    const legacy = {
      ...fixtureV1,
      run: { ...(fixtureV1.run as object), deferredQueue: ['ev_early_dawn_dew'] },
    } as unknown as SaveEnvelope;
    expect(migrate(legacy).run?.deferredQueue).toEqual([{ eventId: 'ev_early_dawn_dew', year: 0 }]);
  });

  it('迁移后的旧档可继续游戏：rollYear → applyChoice 不抛且写入 decisionLog', () => {
    const run = migrate(fixtureV1 as unknown as SaveEnvelope).run as RunState;
    const rng = makeRngBag(run.seed);
    let pending = null;
    for (let i = 0; i < 200 && !pending; i++) {
      const t = rollYear(run, rng, bundle);
      if (t.pending) pending = t.pending;
      else if (t.ended) break;
    }
    expect(pending).not.toBeNull();
    applyChoice(run, pending!, 'a', rng, bundle);
    expect(run.decisionLog).toHaveLength(1);
    expect(run.decisionLog[0]?.eventId).toBe('ev_migrate_two');
    expect(run.decisionLog[0]?.choiceId).toBe('a');
  });

  it('缺失中间迁移步骤时抛错，不猜测', () => {
    expect(() => migrate({ v: 0, meta: fixtureV1.meta, run: null })).toThrow(/no migration from v0/);
  });

  it('当前版本再迁移是恒等（不会重复改写）', () => {
    const v7 = migrate(fixtureV1 as unknown as SaveEnvelope);
    const again = migrate(v7);
    expect(again.v).toBe(7);
    expect(again.checksum).toBe(v7.checksum);
  });

  it('v6 → v7：doctrines 补空数组，settings 从存档里剥掉（改存独立键）', () => {
    const legacy = {
      ...(fixtureV6 as unknown as SaveEnvelope),
      v: 6,
      meta: {
        ...fixtureV6.meta,
        settings: { reducedMotion: true, visualIntensity: 'low', textSpeed: 1, tickMs: 300 },
      },
    } as unknown as SaveEnvelope;
    delete (legacy.meta as unknown as Record<string, unknown>).doctrines;
    legacy.checksum = checksumOf(legacy.meta, legacy.run);

    const v7 = migrate(legacy);
    expect(v7.v).toBe(7);
    expect(v7.meta.doctrines).toEqual([]);
    expect('settings' in v7.meta).toBe(false);
    expect(v7.run?.cultivation).toBe(legacy.run?.cultivation);
    expect(() => verifyChecksum(v7)).not.toThrow();
  });

  it('v6 → v7：doctrines 里的非字符串项被丢弃，不带脏数据进存档', () => {
    const legacy = {
      ...(fixtureV6 as unknown as SaveEnvelope),
      v: 6,
      meta: { ...fixtureV6.meta, doctrines: ['doc_art_jian_q5', 42, null, { a: 1 }] },
    } as unknown as SaveEnvelope;
    legacy.checksum = checksumOf(legacy.meta, legacy.run);
    expect(migrate(legacy).meta.doctrines).toEqual(['doc_art_jian_q5']);
  });

  it('v1 → v7：整条链一次跑通，校验和自洽', () => {
    const v7 = migrate(fixtureV1 as unknown as SaveEnvelope);
    expect(v7.v).toBe(7);
    expect(v7.meta.doctrines).toEqual([]);
    expect(() => verifyChecksum(v7)).not.toThrow();
    const run = v7.run as RunState;
    expect(run.legacyCave).toBeDefined();
    expect(Object.keys(run.legacyCave)).toHaveLength(6);
  });

  it('RunState 增洞府后，旧档迁移来的局仍能读 cave（引擎不读 MetaState，6.3）', () => {
    const text = readFileSync('src/engine/cave.ts', 'utf8');
    expect(text.includes('types/meta')).toBe(false);
    const run = migrate(fixtureV1 as unknown as SaveEnvelope).run as RunState;
    expect(run.legacyCave).toBeDefined();
    expect(Object.keys(run.legacyCave)).toHaveLength(6);
  });
});
