import { create } from 'zustand';
import { BUNDLE } from '../content';
import { applyChoice, rollYear } from '../engine/tick';
import { createRun, drawCards, type CharCard } from '../engine/newRun';
import { makeRngBag } from '../engine/rng';
import type { ContentBundle, Decision } from '../engine/types/effects';
import type { MetaState } from '../engine/types/meta';
import type { RngBag } from '../engine/types/rng';
import type { RunState } from '../engine/types/run';
import { createSaver, defaultMeta, loadEnvelope, shouldPersistYear } from './persistence';

export interface RunStoreState {
  content: ContentBundle;
  meta: MetaState;
  run: RunState | null;
  pending: Decision | null;
  cards: CharCard[];
  running: boolean;
  ended: string | null;
  version: number;
  tickMs: number;
  refreshCards: () => void;
  startRun: (card: CharCard) => void;
  tickOnce: () => void;
  setRunning: (running: boolean) => void;
  choose: (choiceId: string) => void;
  abandon: () => void;
}

let rng: RngBag = makeRngBag('boot');
let timer: ReturnType<typeof setTimeout> | null = null;
let runCounter = 0;

interface SaveSlot {
  meta: MetaState;
  run: RunState | null;
}
const slot: SaveSlot = { meta: defaultMeta(), run: null };
const saver = createSaver(() => slot);

function stopTimer(): void {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

export const useRunStore = create<RunStoreState>((set, get) => {
  const loop = (): void => {
    const state = get();
    if (!state.running || state.pending || state.ended) {
      stopTimer();
      return;
    }
    const nextTimer = setTimeout(() => {
      const current = get();
      if (!current.running || current.pending || current.ended) {
        stopTimer();
        return;
      }
      current.tickOnce();
      loop();
    }, state.tickMs);
    timer = nextTimer;
  };

  const afterTick = (
    run: RunState,
    result: { pending: Decision | null; ended: string | null },
  ): void => {
    if (result.ended) {
      set({
        run,
        pending: null,
        ended: result.ended,
        running: false,
        version: get().version + 1,
      });
      saver.flush();
      stopTimer();
      return;
    }
    if (result.pending) {
      set({
        run,
        pending: result.pending,
        running: false,
        version: get().version + 1,
      });
      saver.flush();
      stopTimer();
      return;
    }
    if (shouldPersistYear(run.year)) saver.request();
    set({ run, pending: result.pending, version: get().version + 1 });
  };

  return {
    content: BUNDLE,
    meta: slot.meta,
    run: null,
    pending: null,
    cards: [],
    running: false,
    ended: null,
    version: 0,
    tickMs: 300,

    refreshCards: () => {
      const loaded = loadEnvelope();
      if (loaded) {
        slot.meta = loaded.meta;
        slot.run = loaded.run;
      }
      const seed = `card-${Date.now()}-${Math.round(performance.now())}`;
      const bag = makeRngBag(seed);
      const cards = drawCards(bag, BUNDLE, {});
      set({ cards, meta: slot.meta, version: get().version + 1 });
    },

    startRun: (card) => {
      runCounter += 1;
      const seed = `run-${Date.now()}-${runCounter}`;
      rng = makeRngBag(seed);
      const run = createRun(seed, slot.meta.totals.runs + 1, card, rng, {
        runId: seed,
        createdAt: Date.now(),
        battlePolicy: slot.meta.autoPolicy.battlePolicy,
      });
      slot.run = run;
      set({ run, pending: null, ended: null, running: true, version: get().version + 1 });
      saver.flush();
      loop();
    },

    tickOnce: () => {
      const run = get().run;
      if (!run || run.dead) return;
      const result = rollYear(run, rng, BUNDLE);
      afterTick(run, { pending: result.pending, ended: result.ended });
    },

    setRunning: (running) => {
      set({ running });
      if (running) loop();
      else stopTimer();
    },

    choose: (choiceId) => {
      const { run, pending } = get();
      if (!run || !pending) return;
      const result = applyChoice(run, pending, choiceId, rng, BUNDLE);
      afterTick(run, { pending: result.pending, ended: result.ended });
      const state = get();
      if (!state.ended && !state.pending) {
        set({ running: true });
        loop();
      }
    },

    abandon: () => {
      stopTimer();
      slot.run = null;
      saver.flush();
      set({ run: null, pending: null, ended: null, running: false, version: get().version + 1 });
    },
  };
});
