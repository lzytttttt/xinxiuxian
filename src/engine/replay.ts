import { createRun, drawCard, type CharCard } from './newRun';
import { makeRngBag } from './rng';
import { applyChoice, rollYear } from './tick';
import type { ContentBundle, Decision } from './types/effects';
import type { LogLine } from './types/log';
import type { RngBag } from './types/rng';
import type { DecisionRecord, RunState } from './types/run';

export interface RunOptions {
  seed: string;
  maxYears?: number;
  /** 固定卡片，或用本局 RNG bag 现抽（后者与 Phase 1 的抽取序列一致） */
  card?: CharCard | ((rng: RngBag) => CharCard);
  battlePolicy?: RunState['battlePolicy'];
}

/** 应答函数：给定决策返回 choiceId。重放时由记录驱动，模拟时由策略驱动。 */
export type AnswerFn = (d: Decision, s: RunState) => string;

export interface RunOutcome {
  state: RunState;
  logs: LogLine[];
  decisions: DecisionRecord[];
  ended: string | null;
  years: number;
}

/**
 * 单局核心循环（纯函数，无 DOM）。
 * `rollYear` / `applyChoice` 交替执行；每次 pending 由 `answer` 应答。
 */
export function runRun(content: ContentBundle, opts: RunOptions, answer: AnswerFn): RunOutcome {
  const rng = makeRngBag(opts.seed);
  const maxYears = opts.maxYears ?? 200;
  const card =
    typeof opts.card === 'function' ? opts.card(rng) : (opts.card ?? drawCard(rng, content, {}));
  const s = createRun(opts.seed, 1, card, rng, {
    runId: opts.seed,
    createdAt: 0,
    battlePolicy: opts.battlePolicy ?? 'manual',
  });
  const logs: LogLine[] = [];
  let ended: string | null = null;

  for (let i = 0; i < maxYears; i++) {
    if (s.dead) break;
    const tick = rollYear(s, rng, content);
    logs.push(...tick.logs);
    if (tick.ended) ended = tick.ended;

    let pending: Decision | null = tick.pending;
    while (pending) {
      const choiceId = answer(pending, s);
      const applied = applyChoice(s, pending, choiceId, rng, content);
      logs.push(...applied.logs);
      if (applied.ended) ended = applied.ended;
      pending = applied.pending;
      if (s.dead) break;
    }

    if (s.dead) {
      ended = ended ?? (s.endedReason as string | null);
      break;
    }
    if (ended) break;
    if (s.endedReason) {
      ended = s.endedReason;
      break;
    }
  }

  return { state: s, logs, decisions: [...s.decisionLog], ended, years: s.year };
}
