import { useRef } from 'react';
import type { Decision } from '../../engine/types/effects';
import { useFocusTrap } from './useFocusTrap';

export function DecisionModal({
  decision,
  onChoose,
}: {
  decision: Decision;
  onChoose: (choiceId: string) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  // 决策是引擎的硬停点：不传 onEscape，Esc 不能关掉它（验收 2.1）
  useFocusTrap(boxRef, true);

  const visible = decision.choices.filter((c) => c.show);
  const dots = (n: number): string => '●'.repeat(n) + '○'.repeat(3 - n);

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
              <span className="choice-stack">
                <span>{choice.label}</span>
                {choice.costLabel ? <span className="choice-sub">代价 {choice.costLabel}</span> : null}
                {choice.hint ? (
                  <span
                    className="choice-hint"
                    aria-label={`风险 ${choice.hint.risk} 档，收益 ${choice.hint.reward} 档`}
                  >
                    险 {dots(choice.hint.risk)} · 利 {dots(choice.hint.reward)}
                  </span>
                ) : null}
                {!choice.enable && choice.disabledReason ? (
                  <span className="choice-sub">需 {choice.disabledReason}</span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
