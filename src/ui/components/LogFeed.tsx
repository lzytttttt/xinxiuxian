import { useEffect, useRef } from 'react';
import type { LogLine } from '../../engine/types/log';

const RENDER_CAP = 120;

export function LogFeed({ lines, version }: { lines: LogLine[]; version: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [version]);

  const shown = lines.slice(-RENDER_CAP);

  return (
    <div className="feed" ref={ref} role="log" aria-live="polite" aria-label="修行日志">
      {shown.map((line, i) => (
        <p
          key={`${i}-${line.text}`}
          className={line.fx ? `log fx-${line.fx}` : 'log'}
          data-cls={line.cls}
        >
          {line.text}
        </p>
      ))}
    </div>
  );
}
