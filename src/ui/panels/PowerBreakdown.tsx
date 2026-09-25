import { useMemo } from 'react';
import { formatPower } from '../../engine/encounter';
import { useRunStore } from '../../store/runStore';
import type { ZoneBreakdown, ZoneDetail } from '../../engine/selectors';

/* 战力构成面板：逐项来源 Δ%、软封顶状态、最近变化。
   数据只来自 zones()——面板不自行计算任何系数（验收 3.4 面板诚实）。 */

const ZONES: { key: 'z1' | 'z2' | 'z3' | 'z4' | 'z5' | 'z6'; name: string }[] = [
  { key: 'z1', name: 'Z1 修为总量' },
  { key: 'z2', name: 'Z2 灵根增幅' },
  { key: 'z3', name: 'Z3 法宝共鸣' },
  { key: 'z4', name: 'Z4 功法被动' },
  { key: 'z5', name: 'Z5 丹药状态' },
  { key: 'z6', name: 'Z6 气运命格' },
];

function pct(v: number): string {
  return `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`;
}

function sharesOf(z: ZoneBreakdown): Record<string, number> {
  let total = 0;
  for (const { key } of ZONES) total += Math.max(0, z[key].mult - 1);
  const out: Record<string, number> = {};
  for (const { key } of ZONES) out[key] = total > 0 ? Math.max(0, z[key].mult - 1) / total : 0;
  return out;
}

function ZoneBlock({ detail, name, share }: { detail: ZoneDetail; name: string; share: number }) {
  return (
    <div className="zone-block">
      <div className="zone-head" data-cap={detail.atCap}>
        <span>{name}</span>
        <span className="num">
          ×{detail.mult.toFixed(2)}
          <span className="meta"> 占 {(share * 100).toFixed(0)}%</span>
          {detail.atCap ? <span className="chip">触顶</span> : null}
        </span>
      </div>
      {detail.sources.map((src, i) => (
        <div className="zone-src" key={`${src.label}-${i}`}>
          <span>
            ├ {src.label}
            {src.kind === 'cap' ? '（硬上限截断）' : ''}
          </span>
          <span className="num">{pct(src.delta)}</span>
        </div>
      ))}
      {detail.sources.length === 0 ? (
        <div className="zone-src">
          <span className="meta">无来源（基础值 ×1.00）</span>
          <span className="num meta">—</span>
        </div>
      ) : null}
    </div>
  );
}

export function PowerBreakdown({ showTrail = true }: { showTrail?: boolean }) {
  const run = useRunStore((s) => s.run);
  const zonesFn = useRunStore((s) => s.zonesOf);
  const version = useRunStore((s) => s.version);
  const z = useMemo(() => (run ? zonesFn() : null), [run, zonesFn, version]);
  if (!run || !z) return null;
  const shares = sharesOf(z);

  return (
    <section className="panel">
      <div className="panel-title">
        <span>战力构成</span>
        <span className="meta num">{formatPower(z.finalPower)}</span>
      </div>
      <div className="panel-body">
        {ZONES.map(({ key, name }) => (
          <ZoneBlock key={key} detail={z[key]} name={name} share={shares[key] ?? 0} />
        ))}
        <div className="zone-total">
          <span>原始乘积</span>
          <span className="num">{z.rawProduct.toFixed(2)}</span>
        </div>
        <div className="zone-row" data-cap={z.capApplied}>
          <span>软封顶</span>
          <span className="num">
            {z.softCapped.toFixed(2)}
            {z.capApplied ? '（已触发，边际收益降低）' : '（未触发）'}
          </span>
        </div>
        <div className="zone-total">
          <span>最终战力</span>
          <span className="num">{formatPower(z.finalPower)}</span>
        </div>
        {showTrail && run.powerTrail ? (
          <div className="zone-src">
            <span>
              最近变化 · {run.powerTrail.label}（第 {run.powerTrail.year} 年）
            </span>
            <span className="num">{pct(run.powerTrail.pct / 100)}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
