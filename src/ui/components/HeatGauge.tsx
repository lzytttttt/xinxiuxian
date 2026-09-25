import type { CSSProperties } from 'react';
import type { BatchState } from '../../engine/types/run';

/* 炉温条：绿带 = 目标温度 ± 容差，指针 = 当前温度，虚影 = 扇风待生效的下一拍。
   噪声用条带模糊宽度表达（噪声越大，温度越难预测），稳定度单列细条。 */

const TEMP_MIN = 30;
const TEMP_MAX = 100;

function pct(temp: number): string {
  const p = ((temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100;
  return `${Math.min(100, Math.max(0, p))}%`;
}

export function HeatGauge({ batch }: { batch: BatchState }) {
  const bandLo = pct(batch.target - batch.tolerance);
  const bandWidth = `${Math.max(0, ((2 * batch.tolerance) / (TEMP_MAX - TEMP_MIN)) * 100)}%`;
  const noiseWidth = `${Math.min(100, batch.noise * 100)}%`;
  const stabilityPct = `${Math.max(0, Math.min(100, (batch.stability / batch.steps) * 100))}%`;

  return (
    <div className="gauge" data-state={batch.exploded ? 'boom' : batch.done ? 'done' : 'live'}>
      <div className="gauge-top">
        <span className="meta">
          第 {Math.min(batch.t + 1, batch.steps)}/{batch.steps} 步
        </span>
        <span className="meta">
          目标 <b className="num">{Math.round(batch.target)}</b> · 炉温{' '}
          <b className="num">{Math.round(batch.temp)}</b> · 容差 ±{batch.tolerance}
        </span>
      </div>

      <div
        className="gauge-track"
        role="meter"
        aria-label="炉温"
        aria-valuemin={TEMP_MIN}
        aria-valuemax={TEMP_MAX}
        aria-valuenow={Math.round(batch.temp)}
      >
        <span className="gauge-band" style={{ left: bandLo, width: bandWidth } as CSSProperties} />
        <span className="gauge-noise" style={{ width: noiseWidth } as CSSProperties} />
        {batch.fanBonus > 0 ? (
          <span className="gauge-ghost" style={{ left: pct(batch.temp + batch.fanBonus) } as CSSProperties} />
        ) : null}
        <span className="gauge-mark" style={{ left: pct(batch.temp) } as CSSProperties} />
      </div>

      <div className="gauge-bottom">
        <span className="meta">
          燃料 <b className="num">{batch.fuel}</b> · 噪声{' '}
          <b className="num">{batch.noise.toFixed(2)}</b>
        </span>
        <span className="meta">温度 30 ─ 100</span>
      </div>

      <div className="gauge-stab">
        <span className="meta">稳定</span>
        <div className="bar" data-tone={batch.stability <= 2 ? 'crimson' : undefined}>
          <i style={{ '--p': stabilityPct } as CSSProperties} />
        </div>
        <span className="num meta">{batch.stability}</span>
      </div>
    </div>
  );
}
