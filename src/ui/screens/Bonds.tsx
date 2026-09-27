import { useRunStore } from '../../store/runStore';
import { aidBonus, bondStrainCount } from '../../engine/bonds';
import { AidSummary, BondCard } from '../components/BondCard';
import { PowerBreakdown } from '../panels/PowerBreakdown';

export function Bonds() {
  const run = useRunStore((s) => s.run);
  const version = useRunStore((s) => s.version);
  void version;
  if (!run) return null;

  const list = run.bonds.list;
  const alive = list.filter((n) => n.alive);
  const dead = list.filter((n) => !n.alive);
  const strain =
    bondStrainCount(run, '挚友') + bondStrainCount(run, '同门') + bondStrainCount(run, '道侣');

  return (
    <>
      <main className="main">
        <section className="panel">
          <div className="panel-title">
            <span>羁绊</span>
            <span className="hint">
              在册 {list.length} 人 · 在世 {alive.length} 人
            </span>
          </div>
          <div className="panel-body">
            <p className="hint">
              每年小概率结识新人；关系由事件推进，背叛有前置条件（好感 ≤ 30 或长期未走动），
              不是随机背刺。死亡不可逆 —— 他/她带来的加成都随之消失。
            </p>
            {strain > 0 ? (
              <p className="hint mt-sm">当前有 {strain} 段关系已生嫌隙，变故可能随时上门。</p>
            ) : null}
            {run.pastPartner ? (
              <p className="hint mt-sm">
                前世道侣：{run.pastPartner.name}（羁绊 {run.pastPartner.level}）—— 若这一世还未结道侣，
                某个渡口会有一场似曾相识。
              </p>
            ) : null}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>在世</span>
            <span className="hint">好感与羁绊等级决定助战与收益</span>
          </div>
          <div className="panel-body resbar-chips">
            {alive.length === 0 ? <p className="hint">这一世还没有遇到谁。</p> : null}
            {alive.map((npc) => (
              <BondCard key={npc.id} npc={npc} year={run.year} />
            ))}
          </div>
        </section>

        {dead.length > 0 ? (
          <section className="panel">
            <div className="panel-title">
              <span>已故</span>
              <span className="hint">记录保留，加成归零</span>
            </div>
            <div className="panel-body resbar-chips">
              {dead.map((npc) => (
                <BondCard key={npc.id} npc={npc} year={run.year} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <aside className="side">
        <AidSummary bonus={aidBonus(run)} />
        <PowerBreakdown />
      </aside>
    </>
  );
}
