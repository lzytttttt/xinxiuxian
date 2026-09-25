import { describe, expect, it } from 'vitest';
import { defineEvent } from '../../src/engine/registry';
import { makeRngBag } from '../../src/engine/rng';
import { applyChoice, rollYear } from '../../src/engine/tick';
import type { ContentBundle, EventDef } from '../../src/engine/types/effects';
import type { RunState } from '../../src/engine/types/run';
import { checksumOf, migrate, verifyChecksum, type SaveEnvelope } from '../../src/store/persistence';
import fixture from '../fixtures/save-v1.json';

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

const v1 = fixture as unknown as SaveEnvelope;

describe('存档迁移 v1 → v2（Phase 2）', () => {
  it('fixture 是真实的 v1 档：无 decisionLog、deferredQueue 为 string[]', () => {
    expect(v1.v).toBe(1);
    expect(v1.run).not.toBeNull();
    expect('decisionLog' in (v1.run as object)).toBe(false);
    expect(Array.isArray(v1.run?.deferredQueue)).toBe(true);
    expect((v1.run?.deferredQueue as unknown[]).every((x) => typeof x === 'string')).toBe(true);
    expect(v1.run?.eventLog.length).toBeGreaterThan(0);
  });

  it('fixture 校验和自洽（迁移前先校验通过）', () => {
    expect(() => verifyChecksum(v1)).not.toThrow();
  });

  it('迁移产出合法 v2：decisionLog 补空数组、deferredQueue 转 DeferredEntry、校验和重算', () => {
    const v2 = migrate(v1);
    expect(v2.v).toBe(2);
    const run = v2.run as RunState;
    expect(run.decisionLog).toEqual([]);
    expect(run.deferredQueue).toEqual([]);
    expect(checksumOf(v2.meta, run)).toBe(v2.checksum);
    expect(() => verifyChecksum(v2)).not.toThrow();
    expect(run.eventLog).toEqual(v1.run?.eventLog);
    expect(run.cultivation).toBe(v1.run?.cultivation);
  });

  it('旧档 string[] 形态的 deferredQueue 转成 {eventId, year:0}', () => {
    const legacy = {
      ...v1,
      run: { ...(v1.run as object), deferredQueue: ['ev_early_dawn_dew'] },
    } as unknown as SaveEnvelope;
    const v2 = migrate(legacy);
    expect(v2.run?.deferredQueue).toEqual([{ eventId: 'ev_early_dawn_dew', year: 0 }]);
  });

  it('迁移后的旧档可继续游戏：rollYear → applyChoice 不抛且写入 decisionLog', () => {
    const run = migrate(v1).run as RunState;
    const rng = makeRngBag(run.seed);
    let pending = null;
    for (let i = 0; i < 200 && !pending; i++) {
      const t = rollYear(run, rng, bundle);
      if (t.pending) pending = t.pending;
      else if (t.ended) break;
    }
    expect(pending).not.toBeNull();
    applyChoice(run, pending!, 'a', rng, bundle);
    expect(run.decisionLog.length).toBe(1);
    expect(run.decisionLog[0]?.eventId).toBe('ev_migrate_two');
    expect(run.decisionLog[0]?.choiceId).toBe('a');
  });

  it('缺失中间迁移步骤时抛错，不猜测', () => {
    expect(() => migrate({ v: 0, meta: v1.meta, run: null })).toThrow(/no migration from v0/);
  });
});
