import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, useRef, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { DecisionModal } from '../../src/ui/components/DecisionModal';
import { useFocusTrap } from '../../src/ui/components/useFocusTrap';
import { LogFeed } from '../../src/ui/components/LogFeed';
import { Settings } from '../../src/ui/screens/Settings';
import { DEFAULT_SETTINGS, loadSettings, useSettingsStore } from '../../src/store/settingsStore';
import { SETTINGS_KEY, SAVE_KEY, defaultMeta } from '../../src/store/persistence';
import type { Decision } from '../../src/engine/types/effects';

/* 验收 7.3 / 7.5。此前 `tests/integration/` 目录根本不存在，
   `npm test -- ui` 匹配 0 个文件却 exit 0 —— 与 Phase 6 的 R6-6 同一个坑。 */

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  // 设置 store 是模块级的，跨用例不会自动重置
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS } });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  localStorage.clear();
});

const mount = (node: ReactElement): void => {
  act(() => root.render(node));
};

const press = (key: string, shiftKey = false): void => {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
  });
};

const dialogButtons = (): HTMLButtonElement[] =>
  Array.from(container.querySelectorAll<HTMLButtonElement>('.modal-actions button'));

function decision(): Decision {
  return {
    eventId: 'test_decision',
    title: '抉择',
    body: '两条路。',
    choices: [
      { id: 'a', label: '甲', show: true, enable: true },
      { id: 'b', label: '乙', show: true, enable: true },
      { id: 'c', label: '丙', show: true, enable: false, disabledReason: '灵气不足' },
    ],
  } as unknown as Decision;
}

describe('7.3 焦点陷阱', () => {
  it('决策弹层：初始聚焦首个可选项，Tab 在末尾回卷到首位', () => {
    mount(<DecisionModal decision={decision()} onChoose={() => undefined} />);
    const buttons = dialogButtons();
    expect(buttons).toHaveLength(3);
    expect(document.activeElement).toBe(buttons[0]);

    act(() => (buttons[2] as HTMLButtonElement).focus());
    press('Tab');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('决策弹层：Shift+Tab 在首项回卷到**最后一个可聚焦**项（禁用项不进 Tab 序）', () => {
    mount(<DecisionModal decision={decision()} onChoose={() => undefined} />);
    const buttons = dialogButtons();
    expect((buttons[2] as HTMLButtonElement).disabled).toBe(true);
    act(() => (buttons[0] as HTMLButtonElement).focus());
    press('Tab', true);
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('决策弹层：Esc **不能**关闭（决策是引擎的硬停点，验收 2.1）', () => {
    let chosen: string | null = null;
    mount(<DecisionModal decision={decision()} onChoose={(id) => (chosen = id)} />);
    press('Escape');
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(chosen).toBeNull();
  });

  it('终局弹层：接入同一个 hook 后也有初始聚焦，且 Esc 可关', () => {
    function Harness({ onClose }: { onClose: () => void }): ReactElement {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(ref, true, onClose);
      return (
        <div className="modal" role="dialog" aria-modal="true" ref={ref}>
          <h2>一世终了</h2>
          <div className="modal-actions">
            <button type="button">重新入道</button>
          </div>
        </div>
      );
    }

    let closed = 0;
    mount(<Harness onClose={() => (closed += 1)} />);
    expect(document.activeElement).toBe(dialogButtons()[0]);
    press('Escape');
    expect(closed).toBe(1);
  });

  it('active=false 时 hook 空转，不抢焦点（终局弹层是条件渲染，hook 必须无条件调用）', () => {
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    act(() => outside.focus());

    function Harness(): ReactElement {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(ref, false, () => undefined);
      return (
        <div ref={ref} className="modal">
          <button type="button">x</button>
        </div>
      );
    }
    mount(<Harness />);
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });
});

describe('7.5 设置持久化', () => {
  it('默认档为中', () => {
    expect(DEFAULT_SETTINGS.visualIntensity).toBe('mid');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('改设置只写独立键，不碰存档信封', () => {
    act(() => {
      useSettingsStore.getState().patch({ visualIntensity: 'low', reducedMotion: true });
    });
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) as string) as {
      visualIntensity: string;
      reducedMotion: boolean;
    };
    expect(parsed.visualIntensity).toBe('low');
    expect(parsed.reducedMotion).toBe(true);
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('存档损坏被归档后，设置仍在（tech/03-persistence.md §六 的立意）', () => {
    act(() => {
      useSettingsStore.getState().patch({ visualIntensity: 'high' });
    });
    localStorage.setItem(SAVE_KEY, '{ 这不是合法 JSON');
    localStorage.removeItem(SAVE_KEY);

    const persisted = JSON.parse(localStorage.getItem(SETTINGS_KEY) as string) as { visualIntensity: string };
    expect(persisted.visualIntensity).toBe('high');
  });

  it('残缺/越界的设置逐字段夹回默认，不崩', () => {
    localStorage.setItem(SETTINGS_KEY, '{"visualIntensity":"ultra","tickMs":-1,"textSpeed":0}');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('设置已从 MetaState 移出：defaultMeta() 顶层无 settings（存档不再携带偏好）', () => {
    expect(Object.keys(defaultMeta())).not.toContain('settings');
  });
});

describe('7.5 演出门控', () => {
  it('LogFeed 仍按 fx 字段映射 class —— 门控交给 CSS，不改引擎的 fx 置位逻辑', () => {
    mount(<LogFeed lines={[{ cls: 'gold', text: '九重天劫', fx: 'trib' }]} version={1} />);
    expect(container.querySelector('.fx-trib')).not.toBeNull();
  });

  it('三处演出都挂 fx-* class，低档由 base.css 的 [data-intensity="low"] 规则关掉', () => {
    mount(
      <LogFeed
        lines={[
          { cls: 'gold', text: '天劫', fx: 'trib' },
          { cls: 'gold', text: '突破', fx: 'levelup' },
          { cls: 'gold', text: '飞升', fx: 'ascend' },
        ]}
        version={1}
      />,
    );
    for (const cls of ['fx-trib', 'fx-levelup', 'fx-ascend']) {
      expect(container.querySelector(`.${cls}`)).not.toBeNull();
    }
  });
});

describe('设置屏', () => {
  it('三档可选，aria-pressed 跟随当前档', () => {
    mount(<Settings />);
    const group = container.querySelector('[role="group"][aria-label="视觉强度"]');
    expect(group).not.toBeNull();
    expect(group?.querySelectorAll('button')).toHaveLength(3);

    const low = Array.from(group?.querySelectorAll('button') ?? []).find((b) => b.textContent === '低') as HTMLButtonElement;
    act(() => low.click());
    expect(useSettingsStore.getState().settings.visualIntensity).toBe('low');
    expect(low.getAttribute('aria-pressed')).toBe('true');
  });

  it('「减弱动效」开关写进独立键', () => {
    mount(<Settings />);
    const box = container.querySelector<HTMLInputElement>('.switch input');
    expect(box).not.toBeNull();
    act(() => {
      (box as HTMLInputElement).click();
    });
    expect(useSettingsStore.getState().settings.reducedMotion).toBe(true);
  });
});
