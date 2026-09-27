import { create } from 'zustand';
import { upgradeCave } from '../engine/meta';
import { defaultMeta } from './persistence';
import { bestPowerOf, legacyInjection, settleRun } from './settle';
import type { MetaState, UiSettings } from '../engine/types/meta';
import type { RoomId } from '../engine/types/run';

export interface MetaStoreState {
  meta: MetaState;
  replace: (meta: MetaState) => void;
  upgrade: (room: RoomId) => void;
  patchSettings: (patch: Partial<UiSettings>) => void;
  reset: () => void;
}

export const useMetaStore = create<MetaStoreState>((set, get) => ({
  meta: defaultMeta(),

  replace: (meta) => set({ meta }),

  upgrade: (room) => {
    const { meta } = get();
    const res = upgradeCave(meta.cave, room, meta.legacyPoints);
    if (res.spent === 0) return;
    set({ meta: { ...meta, cave: res.cave, legacyPoints: res.points } });
  },

  patchSettings: (patch) =>
    set({ meta: { ...get().meta, settings: { ...get().meta.settings, ...patch } } }),

  reset: () => set({ meta: defaultMeta() }),
}));

export { bestPowerOf, legacyInjection, settleRun };
