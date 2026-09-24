import { useEffect, useMemo } from 'react';
import { powerOf, realmName, talentTier } from '../../engine/selectors';
import { TALENT_NAMES, TOXICITY_MAX } from '../../engine/constants';
import { useRunStore } from '../../store/runStore';
import { DecisionModal } from '../components/DecisionModal';
import { LogFeed } from '../components/LogFeed';
import type { CSSProperties } from 'react';

const END_TEXT: Record<string, string> = {
  simDepleted: '模拟点耗尽，寿元终了。这一世到此为止。',
  tribFail: '九重天劫之下，道消身陨。',
  immortal: '你止步仙门之外，留下这一世的传说。',
  gateFail: '仙劫之下，仙躯崩解。',
  peril: '心魔翻涌，道体自内而外崩解。',
  zhengdao: '大道加身，你证道成圣，自此超脱仙域。',
  voluntary: '你主动结束了这一世的修行。',
};

export function Cultivate() {
  const run = useRunStore((s) => s.run);
  const pending = useRunStore((s) => s.pending);
  const ended = useRunStore((s) => s.ended);
  const running = useRunStore((s) => s.running);
  const version = useRunStore((s) => s.version);
  const tickMs = useRunStore((s) => s.tickMs);
  const setRunning = useRunStore((s) => s.setRunning);
  const choose = useRunStore((s) => s.choose);
  const abandon = useRunStore((s) => s.abandon);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') useRunStore.getState().setRunning(false);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  const power = useMemo(() => (run ? powerOf(run) : 0), [run, version]);
  if (!run) return null;

  const toxStyle = { '--p': `${(run.toxicity / TOXICITY_MAX) * 100}%` } as CSSProperties;
  const progress = (run.realm.level % 10) * 10;

  return (
    <>
      <main className="main">
        <div className="resbar">
          <div className="resbar-top">
            <span className="resbar-realm">{realmName(run.realm.level)}</span>
            <span className="meta">
              <span className="num">{run.age}</span> 岁 · 模拟点{' '}
              <span className="num">{run.simPoints}</span> · 第 <span className="num">{run.year}</span> 年
            </span>
          </div>
          <div className="resbar-chips">
            <span className="chip">
              修为 <b className="num">{Math.round(run.cultivation)}</b>
            </span>
            <span className="chip">
              灵根 <b>{TALENT_NAMES[talentTier(run.root) - 1] ?? ''} · {run.root}</b>
            </span>
            <span className="chip">
              气运 <b className="num">{run.luck}</b>
            </span>
            <span className="chip">
              法宝 <b className="num">×{run.fruits.length}</b>
            </span>
            <span className="chip">
              仙灵气 <b className="num">{run.xianqi}</b>
            </span>
          </div>
        </div>

        <section className="panel">
          <div className="panel-title">
            <span>修行纪事</span>
            <span>
              <button className="btn-ghost" type="button" onClick={() => setRunning(!running)}>
                {running ? '暂歇' : '继续'}
              </button>
              <button className="btn-ghost" type="button" onClick={abandon}>
                弃此一世
              </button>
            </span>
          </div>
          <LogFeed lines={run.log} version={version} />
          <p className="hint">
            速度 {tickMs}ms/年（Phase 6 开放调速与结算）
          </p>
        </section>
      </main>

      <aside className="side">
        <section className="panel">
          <div className="panel-title">
            <span>战力</span>
            <span className="hint">六乘区 Phase 3</span>
          </div>
          <div className="panel-body">
            <div className="zone-row">
              <span>修为</span>
              <span className="num">{Math.round(run.cultivation)}</span>
            </div>
            <div className="zone-row">
              <span>法宝之力</span>
              <span className="num">{Math.round(run.artifactPower)}</span>
            </div>
            <div className="zone-total">
              <span>总战力</span>
              <span className="num">{Math.round(power)}</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>境界进度</span>
            <span className="num meta">{progress}%</span>
          </div>
          <div className="panel-body">
            <div className="bar" style={{ '--p': `${progress}%` } as CSSProperties}>
              <i />
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>丹毒</span>
            <span className="num meta">
              {Math.round(run.toxicity)}/{TOXICITY_MAX}
            </span>
          </div>
          <div className="panel-body">
            <div className="bar" data-tone="crimson" style={toxStyle}>
              <i />
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>命格</span>
          </div>
          <div className="panel-body">
            {run.fates.map((f) => (
              <div key={f.id} className="zone-row">
                <span>{f.name}</span>
                <span className="num">{f.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>本世纪事</span>
          </div>
          <div className="panel-body">
            <div className="zone-row">
              <span>突破</span>
              <span className="num">{run.stats.breakthroughs}</span>
            </div>
            <div className="zone-row">
              <span>事件</span>
              <span className="num">{run.stats.events}</span>
            </div>
            <div className="zone-row">
              <span>机缘胜负</span>
              <span className="num">
                {run.stats.battlesWon}/{run.stats.battlesLost}
              </span>
            </div>
            <div className="zone-row">
              <span>法宝</span>
              <span className="num">{run.stats.artifacts}</span>
            </div>
          </div>
        </section>
      </aside>

      {pending && !ended ? <DecisionModal decision={pending} onChoose={choose} /> : null}

      {ended ? (
        <div className="mask">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="end-title">
            <h2 className="modal-title" id="end-title">
              一世终了
            </h2>
            <p className="modal-body">{END_TEXT[ended] ?? '这一世到此为止。'}</p>
            <div className="panel-body">
              <div className="zone-row">
                <span>终章境界</span>
                <span className="num">{realmName(run.realm.level)}</span>
              </div>
              <div className="zone-row">
                <span>总战力</span>
                <span className="num">{Math.round(power)}</span>
              </div>
              <div className="zone-row">
                <span>享年</span>
                <span className="num">{run.age}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" type="button" onClick={abandon}>
                重新入道
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
