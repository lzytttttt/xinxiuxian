import { create } from 'zustand';
import { BUNDLE, STARTER_ART_IDS } from '../content';
import { artById, equipArt, grantArt, unequipArt, upgradeArt } from '../engine/arts';
import {
  autoFireAndCommit,
  batchRefine,
  canAutoFire,
  buyHerb,
  canUsePill,
  parsePillKey,
  pillById,
  recipeById,
  resolveBatch,
  startBatch,
  stepBatch,
  usePill,
  type BatchAction,
  type CraftResult,
} from '../engine/alchemy';
import { applyChoice, rollYear } from '../engine/tick';
import { createRun, drawCards, type CharCard } from '../engine/newRun';
import { makeRngBag } from '../engine/rng';
import { recordPowerTrail, zones, type ZoneBreakdown } from '../engine/selectors';
import { LOG_LIMIT } from '../engine/constants';
import type { ArtDef, ContentBundle, Decision } from '../engine/types/effects';
import type { MetaState } from '../engine/types/meta';
import type { RngBag } from '../engine/types/rng';
import type { BatchState, RunState } from '../engine/types/run';
import { createSaver, defaultMeta, loadEnvelope, shouldPersistYear } from './persistence';

export interface RunStoreState {
  content: ContentBundle;
  meta: MetaState;
  run: RunState | null;
  pending: Decision | null;
  cards: CharCard[];
  /** 开局三选一的候选功法（选了命帖之后） */
  starterOptions: ArtDef[];
  pendingCard: CharCard | null;
  running: boolean;
  ended: string | null;
  version: number;
  tickMs: number;
  refreshCards: () => void;
  pickCard: (card: CharCard) => void;
  chooseStarter: (artId: string) => void;
  cancelStarter: () => void;
  zonesOf: () => ZoneBreakdown | null;
  equip: (id: string) => void;
  unequip: (id: string) => void;
  upgrade: (id: string) => void;
  tickOnce: () => void;
  setRunning: (running: boolean) => void;
  choose: (choiceId: string) => void;
  abandon: () => void;
  /** 炼丹：当前炉（UI 本地状态，不落盘；中途弃炉视为报废） */
  batch: BatchState | null;
  batchRecipeId: string | null;
  batchResult: CraftResult | null;
  startCraft: (recipeId: string) => void;
  stepCraft: (action: BatchAction) => void;
  finishCraft: () => void;
  discardCraft: () => void;
  autoCraft: (recipeId: string) => void;
  refine: (recipeId: string) => void;
  takePill: (key: string) => void;
  buy: (herbId: string, count: number) => void;
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
  const log = (run: RunState, text: string, cls: 'ev1' | 'gold' | 'red' = 'ev1'): void => {
    run.log.push({ cls, text });
    if (run.log.length > LOG_LIMIT) run.log.splice(0, run.log.length - LOG_LIMIT);
  };

  const loop = (): void => {
    const state = get();
    if (!state.running || state.pending || state.ended || state.batch) {
      stopTimer();
      return;
    }
    const nextTimer = setTimeout(() => {
      const current = get();
      if (!current.running || current.pending || current.ended || current.batch) {
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

    starterOptions: [],
    pendingCard: null,

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

    pickCard: (card) => {
      // 三选一的候选：六门起步功法里抽三（独立 RNG 流，不动本局主线序列）
      const bag = makeRngBag(`starter-${Date.now()}-${card.value}-${card.luck}`);
      const pool = [...STARTER_ART_IDS];
      const options: ArtDef[] = [];
      while (options.length < 3 && pool.length > 0) {
        const id = pool.splice(Math.min(pool.length - 1, bag.misc.int(0, pool.length - 1)), 1)[0];
        const def = id ? artById(BUNDLE, id) : undefined;
        if (def) options.push(def);
      }
      set({ pendingCard: card, starterOptions: options, version: get().version + 1 });
    },

    cancelStarter: () => {
      set({ pendingCard: null, starterOptions: [], version: get().version + 1 });
    },

    chooseStarter: (artId) => {
      const card = get().pendingCard;
      if (!card) return;
      runCounter += 1;
      const seed = `run-${Date.now()}-${runCounter}`;
      rng = makeRngBag(seed);
      const run = createRun(seed, slot.meta.totals.runs + 1, card, rng, {
        runId: seed,
        createdAt: Date.now(),
        battlePolicy: slot.meta.autoPolicy.battlePolicy,
      });
      grantArt(run, artId, BUNDLE);
      run.slots[0] = artId;
      slot.run = run;
      set({
        run,
        pending: null,
        ended: null,
        running: true,
        pendingCard: null,
        starterOptions: [],
        version: get().version + 1,
      });
      saver.flush();
      loop();
    },

    zonesOf: () => {
      const run = get().run;
      return run ? zones(run, BUNDLE) : null;
    },

    equip: (id) => {
      const run = get().run;
      if (!run) return;
      const before = zones(run, BUNDLE).finalPower;
      if (!equipArt(run, id, BUNDLE)) return;
      const def = artById(BUNDLE, id);
      recordPowerTrail(run, BUNDLE, `装备「${def?.name ?? id}」`, before);
      set({ version: get().version + 1 });
      saver.flush();
    },

    unequip: (id) => {
      const run = get().run;
      if (!run) return;
      const before = zones(run, BUNDLE).finalPower;
      if (!unequipArt(run, id)) return;
      const def = artById(BUNDLE, id);
      recordPowerTrail(run, BUNDLE, `卸下「${def?.name ?? id}」`, before);
      set({ version: get().version + 1 });
      saver.flush();
    },

    upgrade: (id) => {
      const run = get().run;
      if (!run) return;
      const before = zones(run, BUNDLE).finalPower;
      if (!upgradeArt(run, id, BUNDLE)) return;
      const def = artById(BUNDLE, id);
      const st = run.arts[id];
      recordPowerTrail(run, BUNDLE, `升「${def?.name ?? id}」至 L${st?.level ?? 0}`, before);
      set({ version: get().version + 1 });
      saver.flush();
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
      set({
        run: null,
        pending: null,
        ended: null,
        running: false,
        batch: null,
        batchRecipeId: null,
        batchResult: null,
        version: get().version + 1,
      });
    },

    batch: null,
    batchRecipeId: null,
    batchResult: null,

    startCraft: (recipeId) => {
      const run = get().run;
      if (!run || run.dead || get().batch) return;
      const recipe = recipeById(BUNDLE, recipeId);
      if (!recipe) return;
      stopTimer();
      const batch = startBatch(run, recipe);
      if (!batch) return;
      set({ batch, batchRecipeId: recipeId, batchResult: null, running: false, version: get().version + 1 });
      saver.flush();
    },

    stepCraft: (action) => {
      const { batch, run } = get();
      if (!batch || !run) return;
      stepBatch(batch, action, rng.alchemy);
      if (batch.done || batch.exploded) {
        const recipe = recipeById(BUNDLE, get().batchRecipeId ?? '');
        if (!recipe) return;
        const powerBefore = zones(run, BUNDLE).finalPower;
        const result = resolveBatch(run, recipe, batch, BUNDLE);
        recordPowerTrail(run, BUNDLE, `炼丹「${recipe.name}」`, powerBefore);
        set({ batchResult: result, version: get().version + 1 });
        saver.flush();
        return;
      }
      set({ version: get().version + 1 });
    },

    finishCraft: () => {
      set({ batch: null, batchRecipeId: null, running: false, version: get().version + 1 });
    },

    discardCraft: () => {
      set({
        batch: null,
        batchRecipeId: null,
        batchResult: null,
        running: false,
        version: get().version + 1,
      });
    },

    autoCraft: (recipeId) => {
      const run = get().run;
      if (!run || run.dead) return;
      const recipe = recipeById(BUNDLE, recipeId);
      const mastery = run.recipes[recipeId]?.mastery ?? 0;
      if (!recipe || !canAutoFire(mastery)) return;
      const powerBefore = zones(run, BUNDLE).finalPower;
      const result = autoFireAndCommit(run, recipe, BUNDLE);
      if (!result) return;
      recordPowerTrail(run, BUNDLE, `炼丹「${recipe.name}」`, powerBefore);
      set({
        batch: null,
        batchRecipeId: null,
        batchResult: result,
        running: false,
        version: get().version + 1,
      });
      saver.flush();
    },

    refine: (recipeId) => {
      const run = get().run;
      if (!run || run.dead) return;
      const recipe = recipeById(BUNDLE, recipeId);
      const mastery = run.recipes[recipeId]?.mastery ?? 0;
      if (!recipe || !canAutoFire(mastery)) return;
      const powerBefore = zones(run, BUNDLE).finalPower;
      const result = batchRefine(run, recipe, BUNDLE);
      if (!result) return;
      recordPowerTrail(run, BUNDLE, `批量炼丹「${recipe.name}」`, powerBefore);
      set({
        batch: null,
        batchRecipeId: null,
        batchResult: result,
        running: false,
        version: get().version + 1,
      });
      saver.flush();
    },

    buy: (herbId, count) => {
      const run = get().run;
      if (!run || run.dead) return;
      if (!buyHerb(run, BUNDLE, herbId, count)) return;
      set({ version: get().version + 1 });
      saver.flush();
    },

    takePill: (key) => {
      const run = get().run;
      if (!run || run.dead) return;
      const check = canUsePill(run, key, BUNDLE);
      if (!check.ok) return;
      const powerBefore = zones(run, BUNDLE).finalPower;
      const { pillId } = parsePillKey(key);
      const name = pillById(BUNDLE, pillId)?.name ?? pillId;
      const res = usePill(run, key, BUNDLE);
      if (!res.ok) return;
      log(run, `【丹药】${name} · ${res.text}`, 'gold');
      recordPowerTrail(run, BUNDLE, `服丹「${name}」`, powerBefore);
      set({ version: get().version + 1 });
      saver.flush();
    },
  };
});
