import { realmName, talentTier } from '../../engine/selectors';
import { TALENT_NAMES } from '../../engine/constants';
import { useRunStore } from '../../store/runStore';

/* 吾身：人物全量状态 + 事件记忆（调试面板，Phase 2 P2 项） */

function Rows({ rows }: { rows: [string, string | number][] }) {
  return (
    <>
      {rows.map(([k, v]) => (
        <div key={k} className="zone-row">
          <span>{k}</span>
          <span className="num">{v}</span>
        </div>
      ))}
    </>
  );
}

export function Self() {
  const run = useRunStore((s) => s.run);
  if (!run) return null;

  const flags = Object.entries(run.flags).filter(([, v]) => v !== 0);
  const cooldowns = Object.entries(run.cooldowns);
  const recent = [...run.decisionLog].slice(-10).reverse();

  return (
    <main className="main">
      <section className="panel">
        <div className="panel-title">
          <span>吾身</span>
          <span className="meta">
            {realmName(run.realm.level)} · 第 {run.life} 世
          </span>
        </div>
        <div className="panel-body">
          <Rows
            rows={[
              ['年龄', run.age],
              ['模拟点', run.simPoints],
              ['灵根', `${TALENT_NAMES[talentTier(run.root) - 1] ?? ''} · ${run.root}`],
              ['气运', run.luck],
              ['修为', Math.round(run.cultivation)],
              ['仙灵气', run.xianqi],
              ['混沌气', run.chaosQi],
              ['丹毒', Math.round(run.toxicity)],
              ['悟性', run.insight],
              ['法宝', run.fruits.length],
            ]}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <span>决策</span>
          <span className="meta">本世 {run.stats.decisions} 次</span>
        </div>
        <div className="panel-body">
          {recent.length === 0 ? (
            <p className="hint">尚未做过抉择。</p>
          ) : (
            recent.map((d, i) => (
              <div key={`${d.year}-${d.eventId}-${i}`} className="zone-row">
                <span>
                  第 {d.year} 年 · {d.kind}
                </span>
                <span className="num">
                  {d.eventId} → {d.choiceId}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <span>事件记忆</span>
          <span className="meta">调试</span>
        </div>
        <div className="panel-body">
          <Rows
            rows={[
              ['已触发事件', run.stats.events],
              ['最近队列', run.recencyQueue.length],
              ['顺延队列', run.deferredQueue.map((d) => d.eventId).join('、') || '空'],
              ['一次性已用', run.onceFired.length],
            ]}
          />
          <div className="zone-row">
            <span>印记 flags</span>
            <span className="num">{flags.map(([k, v]) => `${k}=${v}`).join('、') || '空'}</span>
          </div>
          <div className="zone-row">
            <span>冷却</span>
            <span className="num">
              {cooldowns.length === 0
                ? '空'
                : cooldowns.map(([k, v]) => `${k}@${v}`).join('、')}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
