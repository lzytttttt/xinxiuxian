import { create } from 'zustand';
import { STARTER_ART_IDS } from '../content/arts/index';
import { HOME_BUNDLE } from '../content/home';
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
import {
  acceptMission,
  joinSect,
  missionById,
  runTournament,
  sectName,
} from '../engine/sect';
import { createRun, drawCards, type CharCard } from '../engine/newRun';
import { makeRngBag } from '../engine/rng';
import { recordPowerTrail, zones, type ZoneBreakdown } from '../engine/selectors';
import { LOG_LIMIT } from '../engine/constants';
import type { ArtDef, ContentBundle, Decision } from '../engine/types/effects';
import { useMetaStore, legacyInjection, settleRun } from './metaStore';
import type { RngBag } from '../engine/types/rng';
import type { BatchState, RunState } from '../engine/types/run';
import { createSaver, loadEnvelope, shouldPersistYear } from './persistence';

export interface RunStoreState {
  content: ContentBundle;
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
  join: (sectId: string) => void;
  takeMission: (missionId: string) => void;
  enterTournament: () => void;
}

let rng: RngBag = makeRngBag('boot');
let timer: ReturnType<typeof setTimeout> | null = null;
let runCounter = 0;

/* 首屏只带 `HOME_BUNDLE`（命帖 + 开局功法），事件池/名称表/药材丹药丹方是动态 import 的
   独立 chunk。抽卡屏挂载时开始预取，人读三张命帖的时间足够；万一没就绪，`tickOnce`
   本轮不推进、下一次 tick 重试（自愈，不阻塞首屏、不弹等待界面）。 */
let content: ContentBundle = HOME_BUNDLE;
let contentPromise: Promise<void> | null = null;

const slot: { run: RunState | null } = { run: null };
const saver = createSaver(() => ({ meta: useMetaStore.getState().meta, run: slot.run }));

/* 洞府升级、设置修改都发生在 `useMetaStore` 里，而存档器在 runStore。订阅一次即可，
   不必让 metaStore 反向依赖 runStore（那会成环）。 */
useMetaStore.subscribe(() => saver.request());

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

  /** 载入完整内容并把 `content` 从 HOME_BUNDLE 换掉（幂等；失败不回滚，下次 tick 重试） */
  const loadContent = (): void => {
    contentPromise ??= import('../content').then((m) => {
      content = m.BUNDLE;
      set({ content: m.BUNDLE, version: get().version + 1 });
    });
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
      const meta = useMetaStore.getState().meta;
      const settled = settleRun(meta, { state: run, content, power: zones(run, content).finalPower });
      useMetaStore.getState().replace(settled.meta);
      for (const id of settled.unlocked) log(run, `【成就】${id}`, 'gold');
      log(run, `【传承】此世结算 ${settled.gained} 点传承，洞府可升级。`, 'gold');
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
    content,
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
      loadContent();
      const loaded = loadEnvelope();
      if (loaded) {
        useMetaStore.getState().replace(loaded.meta);
        slot.run = loaded.run;
      }
      const meta = useMetaStore.getState().meta;
      const seed = `card-${Date.now()}-${Math.round(performance.now())}`;
      const bag = makeRngBag(seed);
      const cards = drawCards(bag, content, { goldBoost: legacyInjection(meta).goldBoost });
      set({ cards, version: get().version + 1 });
    },

    pickCard: (card) => {
      // 三选一的候选：六门起步功法里抽三（独立 RNG 流，不动本局主线序列）
      const bag = makeRngBag(`starter-${Date.now()}-${card.value}-${card.luck}`);
      const pool = [...STARTER_ART_IDS];
      const options: ArtDef[] = [];
      while (options.length < 3 && pool.length > 0) {
        const id = pool.splice(Math.min(pool.length - 1, bag.misc.int(0, pool.length - 1)), 1)[0];
        const def = id ? artById(content, id) : undefined;
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
      const meta = useMetaStore.getState().meta;
      const legacy = legacyInjection(meta);
      const run = createRun(seed, meta.totals.runs + 1, card, rng, {
        runId: seed,
        createdAt: Date.now(),
        battlePolicy: meta.autoPolicy.battlePolicy,
        pastPartner: legacy.pastPartner,
        cave: legacy.cave,
      });
      grantArt(run, artId, content);
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
      return run ? zones(run, content) : null;
    },

    equip: (id) => {
      const run = get().run;
      if (!run) return;
      const before = zones(run, content).finalPower;
      if (!equipArt(run, id, content)) return;
      const def = artById(content, id);
      recordPowerTrail(run, content, `装备「${def?.name ?? id}」`, before);
      set({ version: get().version + 1 });
      saver.flush();
    },

    unequip: (id) => {
      const run = get().run;
      if (!run) return;
      const before = zones(run, content).finalPower;
      if (!unequipArt(run, id)) return;
      const def = artById(content, id);
      recordPowerTrail(run, content, `卸下「${def?.name ?? id}」`, before);
      set({ version: get().version + 1 });
      saver.flush();
    },

    upgrade: (id) => {
      const run = get().run;
      if (!run) return;
      const before = zones(run, content).finalPower;
      if (!upgradeArt(run, id, content)) return;
      const def = artById(content, id);
      const st = run.arts[id];
      recordPowerTrail(run, content, `升「${def?.name ?? id}」至 L${st?.level ?? 0}`, before);
      set({ version: get().version + 1 });
      saver.flush();
    },

    tickOnce: () => {
      const run = get().run;
      if (!run || run.dead) return;
      // 完整内容尚未就绪：本轮不推进，下一拍重试（抽卡屏已开始预取，正常不会走到这里）
      if (content === HOME_BUNDLE) {
        loadContent();
        return;
      }
      const result = rollYear(run, rng, content);
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
      const result = applyChoice(run, pending, choiceId, rng, content);
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
      const recipe = recipeById(content, recipeId);
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
        const recipe = recipeById(content, get().batchRecipeId ?? '');
        if (!recipe) return;
        const powerBefore = zones(run, content).finalPower;
        const result = resolveBatch(run, recipe, batch, content);
        recordPowerTrail(run, content, `炼丹「${recipe.name}」`, powerBefore);
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
      const recipe = recipeById(content, recipeId);
      const mastery = run.recipes[recipeId]?.mastery ?? 0;
      if (!recipe || !canAutoFire(mastery)) return;
      const powerBefore = zones(run, content).finalPower;
      const result = autoFireAndCommit(run, recipe, content);
      if (!result) return;
      recordPowerTrail(run, content, `炼丹「${recipe.name}」`, powerBefore);
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
      const recipe = recipeById(content, recipeId);
      const mastery = run.recipes[recipeId]?.mastery ?? 0;
      if (!recipe || !canAutoFire(mastery)) return;
      const powerBefore = zones(run, content).finalPower;
      const result = batchRefine(run, recipe, content);
      if (!result) return;
      recordPowerTrail(run, content, `批量炼丹「${recipe.name}」`, powerBefore);
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
      if (!buyHerb(run, content, herbId, count)) return;
      set({ version: get().version + 1 });
      saver.flush();
    },

    takePill: (key) => {
      const run = get().run;
      if (!run || run.dead) return;
      const check = canUsePill(run, key, content);
      if (!check.ok) return;
      const powerBefore = zones(run, content).finalPower;
      const { pillId } = parsePillKey(key);
      const name = pillById(content, pillId)?.name ?? pillId;
      const res = usePill(run, key, content);
      if (!res.ok) return;
      log(run, `【丹药】${name} · ${res.text}`, 'gold');
      recordPowerTrail(run, content, `服丹「${name}」`, powerBefore);
      set({ version: get().version + 1 });
      saver.flush();
    },

    join: (sectId) => {
      const run = get().run;
      if (!run || run.dead) return;
      const before = run.sect.id;
      if (!joinSect(run, sectId, content)) return;
      const name = sectName(content, sectId);
      log(run, before ? `【宗门】你自旧门叛出，转投${name}。` : `【宗门】你拜入${name}。`, 'gold');
      set({ version: get().version + 1 });
      saver.flush();
    },

    takeMission: (missionId) => {
      const { run, pending } = get();
      if (!run || run.dead || pending) return;
      const mission = missionById(content, missionId);
      if (!mission) return;
      const decision = acceptMission(run, mission, content, rng.event);
      if (!decision) return;
      set({ pending: decision, running: false, version: get().version + 1 });
      saver.flush();
    },

    enterTournament: () => {
      const run = get().run;
      if (!run || run.dead) return;
      const powerBefore = zones(run, content).finalPower;
      const result = runTournament(run, content);
      if (!result) return;
      for (const line of result.logs) {
        run.log.push(line);
        if (run.log.length > LOG_LIMIT) run.log.splice(0, run.log.length - LOG_LIMIT);
      }
      recordPowerTrail(run, content, `大比第 ${result.place} 名`, powerBefore);
      set({ version: get().version + 1 });
      saver.flush();
    },
  };
});
