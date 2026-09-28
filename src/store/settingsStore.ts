import { create } from 'zustand';
import { SETTINGS_KEY } from './persistence';

/** 设置与存档分离（tech/03-persistence.md §六）：存档损坏时偏好不跟着丢 */
export type VisualIntensity = 'low' | 'mid' | 'high';

export interface UiSettings {
  reducedMotion: boolean;
  visualIntensity: VisualIntensity;
  textSpeed: number;
  tickMs: number;
}

export const DEFAULT_SETTINGS: UiSettings = {
  reducedMotion: false,
  visualIntensity: 'mid',
  textSpeed: 1,
  tickMs: 300,
};

export interface SettingsStoreState {
  settings: UiSettings;
  patch: (p: Partial<UiSettings>) => void;
}

export function loadSettings(): UiSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<UiSettings>;
    return {
      reducedMotion: typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : DEFAULT_SETTINGS.reducedMotion,
      visualIntensity:
        parsed.visualIntensity === 'low' || parsed.visualIntensity === 'mid' || parsed.visualIntensity === 'high'
          ? parsed.visualIntensity
          : DEFAULT_SETTINGS.visualIntensity,
      textSpeed: typeof parsed.textSpeed === 'number' && parsed.textSpeed > 0 ? parsed.textSpeed : DEFAULT_SETTINGS.textSpeed,
      tickMs: typeof parsed.tickMs === 'number' && parsed.tickMs > 0 ? parsed.tickMs : DEFAULT_SETTINGS.tickMs,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  settings: loadSettings(),

  patch: (p) => {
    const settings = { ...get().settings, ...p };
    set({ settings });
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* 隐私模式 / 配额满：设置退回内存态，不影响游戏 */
    }
  },
}));

/** 供无头工具与测试读取，不依赖 store 实例 */
export function readSettings(): UiSettings {
  return useSettingsStore.getState().settings;
}
