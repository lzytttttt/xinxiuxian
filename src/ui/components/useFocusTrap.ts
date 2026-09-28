import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

function focusablesOf(node: HTMLElement): HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
}

/**
 * 弹层焦点陷阱（验收 7.3）。**决策弹层与终局弹层共用同一份逻辑**——
 * 原先它长在 `DecisionModal` 里，导致终局弹层拿不到。
 *
 * `active=false` 时整个 hook 空转：终局弹层是条件渲染的，但 hook 必须无条件调用。
 *
 * **不传 `onEscape` 就不能被 Esc 关闭。** 决策弹层刻意不传——决策是引擎的硬停点，
 * Esc 掉等于绕过仲裁，验收 2.1 会破。
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void,
): void {
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;
    const restoreTo = document.activeElement as HTMLElement | null;
    focusablesOf(node)[0]?.focus();

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && escapeRef.current) {
        event.preventDefault();
        escapeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusablesOf(node);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      restoreTo?.focus?.();
    };
  }, [ref, active]);
}
