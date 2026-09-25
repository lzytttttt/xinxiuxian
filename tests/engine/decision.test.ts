import { describe, expect, it } from 'vitest';
import { BUNDLE } from '../../src/content/index';
import { createRun, type CharCard } from '../../src/engine/newRun';
import { buildEventDecision } from '../../src/engine/interpret';
import { defineEvent } from '../../src/engine/registry';
import { makeRngBag } from '../../src/engine/rng';
import { applyChoice, rollYear } from '../../src/engine/tick';
import { simulate } from '../../tools/simlib';
import type { ContentBundle, EventDef } from '../../src/engine/types/effects';
import type { Rng, RngBag } from '../../src/engine/types/rng';
import type { RunState } from '../../src/engine/types/run';

const EV_TWO = defineEvent({
  id: 'ev_test_two',
  title: '试炼',
  category: 'world',
  weight: 100,
  body: '两条路摆在面前。',
  choices: [
    {
      id: 'a',
      label: '甲路',
      outcomes: [
        { text: '甲路有得。', effects: [{ op: 'add', target: { k: 'luck' }, value: 5 }] },
      ],
    },
    {
      id: 'b',
      label: '乙路',
      outcomes: [
        { text: '乙路微薄。', effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }] },
      ],
    },
  ],
});

const EV_ONE = defineEvent({
  id: 'ev_test_one',
  title: '独路',
  category: 'world',
  weight: 100,
  body: '只有一条路。',
  choices: [
    {
      id: 'go',
      label: '前行',
      outcomes: [
        { text: '你走了过去。', effects: [{ op: 'add', target: { k: 'luck' }, value: 2 }] },
      ],
    },
  ],
});

const EV_GATED = defineEvent({
  id: 'ev_test_gated',
  title: '赌门',
  category: 'world',
  weight: 100,
  body: '门后有风。',
  choices: [
    {
      id: 'safe',
      label: '正门',
      outcomes: [
        { text: '正门平安。', effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }] },
      ],
    },
    {
      id: 'gamble',
      label: '偏门',
      show: { op: 'chance', p: 0.5 },
      enable: { op: 'chance', p: 0.5 },
      outcomes: [
        { text: '偏门有获。', effects: [{ op: 'add', target: { k: 'luck' }, value: 3 }] },
      ],
    },
  ],
});

const EV_SET = defineEvent({
  id: 'ev_test_set',
  title: '开闸',
  category: 'chain',
  weight: 100,
  body: '闸门开了。',
  chain: { setsFlag: 'flag_test_open' },
  choices: [
    {
      id: 'open',
      label: '开闸',
      outcomes: [
        { text: '水流通了。', effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }] },
      ],
    },
  ],
});

const EV_USE = defineEvent({
  id: 'ev_test_use',
  title: '过闸',
  category: 'chain',
  weight: 100,
  body: '闸门之后另有天地。',
  requires: { op: 'flag', id: 'flag_test_open', min: 1 },
  chain: { consumesFlag: 'flag_test_open' },
  choices: [
    {
      id: 'pass',
      label: '穿过',
      outcomes: [
        { text: '你穿了过去。', effects: [{ op: 'add', target: { k: 'luck' }, value: 4 }] },
      ],
    },
  ],
});

const EV_ENCOUNTER_CAT = defineEvent({
  id: 'ev_test_encounter_cat',
  title: '遭遇',
  category: 'encounter',
  weight: 100,
  body: '一个影子从林子里走出来。',
  choices: [
    {
      id: 'stand',
      label: '站住不动',
      outcomes: [
        { text: '它看了你一眼，走了。', effects: [{ op: 'add', target: { k: 'luck' }, value: 3 }] },
      ],
    },
    {
      id: 'back',
      label: '退回林中',
      outcomes: [
        { text: '你退了回去。', effects: [{ op: 'add', target: { k: 'luck' }, value: 1 }] },
      ],
    },
  ],
});

function bundle(events: EventDef[]): ContentBundle {
  return { events, fates: [], rollTables: [] };
}

function makeState(
  seed: string,
  luck = 9000,
  battlePolicy: RunState['battlePolicy'] = 'manual',
): { s: RunState; rng: RngBag } {
  const rng = makeRngBag(seed);
  const card: CharCard = { tier: 5, value: 50, luck, simPoints: 100, fates: [], guard: false };
  const s = createRun(seed, 1, card, rng, {
    runId: seed,
    createdAt: 0,
    battlePolicy,
  });
  return { s, rng };
}

/** 包一层计数：统计 rng 的 next() 调用次数（chance/weighted 内部也走 next） */
function counting(rng: Rng): { rng: Rng; count: () => number } {
  let n = 0;
  const next = (): number => {
    n += 1;
    return rng.next();
  };
  const wrapped: Rng = {
    next,
    int: (a, b) => (b < a ? a : a + Math.floor(next() * (b - a + 1))),
    chance: (p) => next() < p,
    pick: (xs) => {
      const x = xs[Math.floor(next() * xs.length)];
      if (x === undefined) throw new Error('rng.pick: empty array');
      return x;
    },
    weighted: (xs) => {
      let total = 0;
      for (const [, w] of xs) total += w;
      let roll = next() * total;
      for (const [v, w] of xs) {
        roll -= w;
        if (roll <= 0) return v;
      }
      const last = xs[xs.length - 1];
      if (last === undefined) throw new Error('rng.weighted: empty array');
      return last[0];
    },
  };
  return { rng: wrapped, count: () => n };
}

describe('决策闸门（Phase 2 验收 2.1）', () => {
  it('≥2 选项事件产出 pending 并停住，选择后才结算', () => {
    const { s, rng } = makeState('gate-001');
    const c = bundle([EV_TWO]);
    const before = s.luck;
    const tick = rollYear(s, rng, c);

    expect(tick.pending).not.toBeNull();
    expect(tick.pending?.eventId).toBe('ev_test_two');
    expect(tick.pending?.kind).toBe('world');
    expect(tick.pending?.choices.map((x) => x.id)).toEqual(['a', 'b']);
    expect(s.awaiting).toBe(tick.pending);
    expect(s.stats.decisions).toBe(0);
    expect(s.luck).toBe(before);
    expect(s.eventLog).toEqual(['ev_test_two']);

    const applied = applyChoice(s, tick.pending!, 'a', rng, c);
    expect(applied.pending).toBeNull();
    expect(s.awaiting).toBeNull();
    expect(s.stats.decisions).toBe(1);
    expect(s.luck).toBe(before + 5);
    expect(s.decisionLog).toEqual([
      { year: 1, kind: 'world', eventId: 'ev_test_two', choiceId: 'a' },
    ]);
  });

  it('单选项事件即时结算，不产出 pending', () => {
    const { s, rng } = makeState('gate-002');
    const c = bundle([EV_ONE]);
    const before = s.luck;
    const tick = rollYear(s, rng, c);
    expect(tick.pending).toBeNull();
    expect(s.luck).toBe(before + 2);
    expect(s.stats.decisions).toBe(0);
    expect(s.eventLog).toEqual(['ev_test_one']);
  });

  it('预览不骗人：chance 闸门在一次决策内只消费一次（构建 2 次抽取，结算 0 次）', () => {
    const { s, rng } = makeState('gate-003');
    const c = bundle([EV_GATED]);
    const wrapped = counting(rng.event);
    rng.event = wrapped.rng;

    const d = buildEventDecision(s, EV_GATED, c, rng.event, '练气一重');
    expect(wrapped.count()).toBe(2);
    expect(d.choices[0]?.show).toBe(true);

    const gamble = d.choices.find((x) => x.id === 'gamble');
    const applied = applyChoice(s, d, gamble?.show ? 'gamble' : 'safe', rng, c);
    expect(wrapped.count()).toBe(2);
    expect(applied.pending).toBeNull();
  });

  it('仲裁：机缘优先于世界事件，事件进 deferredQueue 并在次年重试', () => {
    const c = bundle([EV_TWO]);
    let found: { s: RunState; rng: RngBag; tick: ReturnType<typeof rollYear> } | null = null;
    for (let i = 0; i < 200 && !found; i++) {
      const { s, rng } = makeState(`gate-arb-${i}`);
      const tick = rollYear(s, rng, c);
      if (tick.pending?.kind === 'encounter') found = { s, rng, tick };
    }
    expect(found).not.toBeNull();
    const { s, rng, tick } = found!;
    expect(tick.pending?.kind).toBe('encounter');
    expect(s.deferredQueue.map((d) => d.eventId)).toContain('ev_test_two');
    expect(s.eventLog).not.toContain('ev_test_two');

    let worldPending = null;
    for (let i = 0; i < 50 && !worldPending; i++) {
      const next = rollYear(s, rng, c);
      if (next.pending?.kind === 'world') worldPending = next.pending;
      else if (next.pending) applyChoice(s, next.pending, 'fight', rng, c);
    }
    expect(worldPending?.eventId).toBe('ev_test_two');
    expect(s.deferredQueue.map((d) => d.eventId)).not.toContain('ev_test_two');
  });

  it('顺延只给一次：deferred 事件次年再撞上更高优先级决策即被丢弃，不再顺延', () => {
    const c = bundle([EV_TWO]);
    let found: RunState | null = null;
    for (let i = 0; i < 300 && !found; i++) {
      const { s, rng } = makeState(`gate-drop-${i}`);
      const t1 = rollYear(s, rng, c);
      if (t1.pending?.kind !== 'encounter') continue;
      if (!s.deferredQueue.some((d) => d.eventId === 'ev_test_two')) continue;
      applyChoice(s, t1.pending, 'fight', rng, c);
      const t2 = rollYear(s, rng, c);
      if (t2.pending?.kind !== 'encounter') continue;
      found = s;
    }
    expect(found).not.toBeNull();
    const s = found!;
    expect(s.deferredQueue.map((d) => d.eventId)).not.toContain('ev_test_two');
    expect(s.eventLog).not.toContain('ev_test_two');
    expect(s.maxCount['ev_test_two']).toBeUndefined();
  });

  it('flag 生命周期：setsFlag 写入 → requires 门控 → consumesFlag 清除', () => {
    const c = bundle([EV_SET, EV_USE]);
    const { s, rng } = makeState('gate-flag', 9000, 'yes');
    expect(rollYear(s, rng, c).pending).toBeNull();
    expect(s.eventLog).toEqual(['ev_test_set']);
    expect(s.flags['flag_test_open']).toBe(1);

    const tick = rollYear(s, rng, c);
    expect(tick.pending).toBeNull();
    expect(s.eventLog).toEqual(['ev_test_set', 'ev_test_use']);
    expect(s.flags['flag_test_open']).toBe(0);
  });

  it('encounter/tribulation 类别的事件走事件路径，不误入系统分支（无重复日志、无静默空过）', () => {
    const { s, rng } = makeState('gate-cat');
    const c = bundle([EV_ENCOUNTER_CAT]);
    const before = s.luck;
    const tick = rollYear(s, rng, c);
    expect(tick.pending?.kind).toBe('encounter');
    expect(tick.pending?.source).toBe('event');

    const bodyLines = () =>
      s.log.filter((l) => l.text.startsWith('遭遇 ·')).length;
    expect(bodyLines()).toBe(1);

    const applied = applyChoice(s, tick.pending!, 'stand', rng, c);
    expect(applied.pending).toBeNull();
    expect(s.luck).toBe(before + 3);
    expect(s.stats.events).toBe(1);
    expect(s.maxCount['ev_test_encounter_cat']).toBe(1);
    expect(bodyLines()).toBe(1);
  });

  it('整局运行无重复事件正文行', () => {
    for (let i = 0; i < 20; i++) {
      const out = simulate(BUNDLE, { seed: `dup-guard-${i}`, maxYears: 200 });
      for (let j = 1; j < out.log.length; j++) {
        const prev = out.log[j - 1];
        const cur = out.log[j];
        if (prev && cur && prev.text === cur.text && cur.text.includes(' · ')) {
          throw new Error(`重复行：${cur.text}`);
        }
      }
    }
    expect(true).toBe(true);
  });
});
