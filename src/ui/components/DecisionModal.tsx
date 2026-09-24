import { useEffect, useRef } from 'react';
import type { Decision } from '../../engine/types/effects';

export function DecisionModal({
  decision,
  onChoose,
}: {
  decision: Decision;
  onChoose: (choiceId: string) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = boxRef.current;
    if (!node) return;

    const focusables = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );

    focusables()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusables();
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
    return () => document.removeEventListener('keydown', onKey);
  }, [decision.eventId]);

  const visible = decision.choices.filter((c) => c.show);

  return (
    <div className="mask">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-title"
        ref={boxRef}
      >
        <h2 className="modal-title" id="decision-title">
          {decision.title}
        </h2>
        <p className="modal-body">{decision.body}</p>
        <div className="modal-actions">
          {visible.map((choice, index) => (
            <button
              key={choice.id}
              type="button"
              className={index === 0 ? 'btn' : 'btn-soft'}
              disabled={!choice.enable}
              title={choice.enable ? undefined : choice.disabledReason}
              onClick={() => onChoose(choice.id)}
            >
              {choice.label}
              {!choice.enable && choice.disabledReason ? `（${choice.disabledReason}）` : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
