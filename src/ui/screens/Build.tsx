import { useMemo } from 'react';
import { useRunStore } from '../../store/runStore';
import {
  equippedIds,
  resonanceOf,
  schoolCount,
  SCHOOLS,
  slotCount,
  synergiesOf,
  upgradeCostOf,
} from '../../engine/arts';
import { ART_SLOTS_TOTAL } from '../../engine/constants';
import { ArtCard } from '../components/ArtCard';
import { PowerBreakdown } from '../panels/PowerBreakdown';
import type { ArtDef, SchoolId } from '../../engine/types/effects';

/* 构筑屏：六槽（本 Phase 实解锁 3 + 道台 1）、功法库、悟性与共鸣状态。
   槽位 4/5 的解锁条件随 Phase 6 洞府上线（悟道室 L2/L4）。 */

const SYNERGY_NAMES: Record<string, string> = {
  swordHeart: '剑心通明',
  poisonBody: '毒体',
  fireImmunity: '丹火不侵',
  treasureArt: '炼宝诀',
  thunderBody: '雷罚加身',
  plunder: '掠夺',
};

export function Build() {
  const run = useRunStore((s) => s.run);
  const content = useRunStore((s) => s.content);
  const version = useRunStore((s) => s.version);
  const equip = useRunStore((s) => s.equip);
  const unequip = useRunStore((s) => s.unequip);
  const upgrade = useRunStore((s) => s.upgrade);

  const view = useMemo(() => {
    if (!run) return null;
    const owned = Object.entries(run.arts)
      .filter(([, st]) => st.level > 0)
      .map(([id, st]) => ({ def: content.arts?.find((a) => a.id === id), st }))
      .filter((x): x is { def: ArtDef; st: (typeof run.arts)[string] } => x.def !== undefined);
    owned.sort((a, b) => b.st.level - a.st.level || a.def.name.localeCompare(b.def.name));
    return {
      owned,
      equipped: equippedIds(run),
      resonance: resonanceOf(run, content),
      synergies: synergiesOf(run, content),
      slots: slotCount(run),
      schools: SCHOOLS.map((s) => [s, schoolCount(run, content, s)] as [SchoolId, number]),
    };
  }, [run, content, version]);

  if (!run || !view) return null;
  const lockedHint = (i: number): string => {
    if (i === 3) return '悟道室 L2（Phase 6）或道台现世可解锁';
    if (i === 4) return '悟道室 L4（Phase 6）可解锁';
    return '道台现世（一次性机缘）可解锁';
  };

  return (
    <>
      <main className="main">
        <section className="panel">
          <div className="panel-title">
            <span>功法槽位</span>
            <span className="meta">
              悟性 <span className="num">{run.insight}</span> · 共鸣{' '}
              <b>{view.resonance.name}</b>
              {view.resonance.mult > 1 ? ` ×${view.resonance.mult.toFixed(2)}` : ''}
              {view.resonance.extra ? ` · ${view.resonance.extra}` : ''}
            </span>
          </div>
          <div className="panel-body">
            <div className="slot-grid">
              {Array.from({ length: ART_SLOTS_TOTAL }, (_, i) => {
                const id = run.slots[i];
                const def = id ? content.arts?.find((a) => a.id === id) : undefined;
                const unlocked = i < view.slots;
                return (
                  <div className="slot" key={i} data-locked={!unlocked}>
                    <span className="meta">第 {i + 1} 槽</span>
                    {!unlocked ? (
                      <span className="hint">{lockedHint(i)}</span>
                    ) : def ? (
                      <>
                        <span className="art-name">{def.name}</span>
                        <span className="meta num">
                          L{run.arts[id ?? '']?.level ?? 1} · {def.school}
                        </span>
                        <button className="btn-ghost" type="button" onClick={() => unequip(def.id)}>
                          卸下
                        </button>
                      </>
                    ) : (
                      <span className="hint">空</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="zone-row">
              <span>流派分布（已装备）</span>
              <span className="num">
                {view.schools
                  .filter(([, n]) => n > 0)
                  .map(([s, n]) => `${s}×${n}`)
                  .join('、') || '无'}
              </span>
            </div>
            <div className="zone-row">
              <span>协同</span>
              <span className="num">
                {Object.entries(view.synergies)
                  .filter(([, on]) => on)
                  .map(([k]) => SYNERGY_NAMES[k] ?? k)
                  .join('、') || '未激活'}
              </span>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>功法库</span>
            <span className="meta">共 {view.owned.length} 门</span>
          </div>
          <div className="panel-body art-list">
            {view.owned.length === 0 ? (
              <p className="hint">
                尚未习得任何功法。机缘事件可习得功法，入道时也会三选一赐下一门起手功法。
              </p>
            ) : (
              view.owned.map(({ def }) => (
                <ArtCard
                  key={def.id}
                  def={def}
                  state={run.arts[def.id]}
                  equipped={view.equipped.includes(def.id)}
                  insight={run.insight}
                  onEquip={() => equip(def.id)}
                  onUnequip={() => unequip(def.id)}
                  onUpgrade={() => upgrade(def.id)}
                />
              ))
            )}
          </div>
          <p className="hint">
            升级消耗悟性（满级 L10）；悟性每年随境界自然增长，也来自事件。
            {view.owned.length > 0 && view.owned[0]
              ? ` 下一级需 ${upgradeCostOf(run, view.owned[0].def.id, content) ?? '—'} 悟性。`
              : ''}
          </p>
        </section>
      </main>

      <aside className="side">
        <PowerBreakdown />
      </aside>
    </>
  );
}
