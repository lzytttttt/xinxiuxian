import { useRunStore } from '../../store/runStore';
import { realmName } from '../../engine/selectors';
import { SECT_PROMOTE, SECT_STIPEND_INSIGHT, SECT_STIPEND_HERB, SECT_STIPEND_PILL } from '../../engine/constants';
import { pickMissions, rankName, sectById, sectName, stipendOf, tournamentDue } from '../../engine/sect';
import { PowerBreakdown } from '../panels/PowerBreakdown';

function PerkText({ def }: { def: NonNullable<ReturnType<typeof sectById>> }) {
  const p = def.perk;
  const bits: string[] = [];
  if (p.breakBonus) bits.push(`突破 +${Math.round(p.breakBonus * 100)}%`);
  if (p.alchemyBonus) bits.push(`炼丹品质 +${p.alchemyBonus.toFixed(2)}`);
  if (p.toxMult) bits.push(`丹毒 ×${p.toxMult}`);
  if (p.herbMult) bits.push(`俸禄药材 ×${p.herbMult}`);
  if (p.artifactBonus) bits.push(`法宝加成 +${Math.round(p.artifactBonus * 100)}%`);
  if (p.plunderSim) bits.push(`每年掠夺模拟点 +${p.plunderSim}`);
  if (p.damageMult) bits.push(`战败损失 ×${p.damageMult}`);
  if (p.perilMult) bits.push(`走火风险 ×${p.perilMult}`);
  if (p.insightBonus) bits.push(`俸禄悟性 +${p.insightBonus}`);
  return <p className="hint">{bits.join('、') || '无'}</p>;
}

export function Sect() {
  const run = useRunStore((s) => s.run);
  const version = useRunStore((s) => s.version);
  const content = useRunStore((s) => s.content);
  const join = useRunStore((s) => s.join);
  const takeMission = useRunStore((s) => s.takeMission);
  const enterTournament = useRunStore((s) => s.enterTournament);
  void version;
  if (!run) return null;

  const current = sectById(content, run.sect.id);
  const all = content.sects ?? [];

  if (!current) {
    return (
      <>
        <main className="main">
          <section className="panel">
            <div className="panel-title">
              <span>宗门</span>
              <span className="hint">八个宗门，各有专属资源；不入宗也是一条完整的路</span>
            </div>
            <div className="panel-body resbar-chips">
              {all.map((def) => (
                <article key={def.id} className="card" data-rarity={def.mixed ? 'xuan' : 'ling'}>
                  <div className="panel-body">
                    <div className="resbar-top">
                      <span className="resbar-realm">{def.name}</span>
                      <span className="chip">{def.schools.join('/')}</span>
                    </div>
                    <p className="hint mt-sm">{def.text}</p>
                    <PerkText def={def} />
                    <div className="mt-sm">
                      <button className="btn" type="button" onClick={() => join(def.id)}>
                        拜入门下
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
        <aside className="side">
          <PowerBreakdown />
        </aside>
      </>
    );
  }

  const stipend = stipendOf(run, content);
  const nextNeed = SECT_PROMOTE[Math.min(SECT_PROMOTE.length - 1, run.sect.rank + 1)] ?? 0;
  const missions = pickMissions(run, content);
  const due = tournamentDue(run);
  const tensions = Object.entries(run.sect.tension).filter(([id]) => id !== run.sect.id);

  return (
    <>
      <main className="main">
        <section className="panel">
          <div className="panel-title">
            <span>{current.name}</span>
            <span className="hint">{current.schools.join('/')}</span>
          </div>
          <div className="panel-body">
            <div className="zone-row">
              <span>职位</span>
              <span className="num">{rankName(run.sect.rank)}</span>
            </div>
            <div className="zone-row">
              <span>贡献</span>
              <span className="num">
                {run.sect.contribution}
                {run.sect.rank < SECT_PROMOTE.length - 1 ? ` / ${nextNeed}` : '（已至顶）'}
              </span>
            </div>
            <PerkText def={current} />
            <p className="hint mt-sm">
              俸禄：悟性 +{stipend?.insight ?? SECT_STIPEND_INSIGHT[0]}／年、药材 +{stipend?.herbs[0]?.count ?? SECT_STIPEND_HERB[0]}／年
              {stipend && stipend.pills.length > 0 ? `、丹药 +${stipend.pills[0]?.count ?? 0}／年` : ''}
              （走 tick 槽 6，按当阶发放；当前 {realmName(run.realm.level)} → 第 {run.realm.arc === 'immortal' ? Math.ceil((run.realm.level - 100) / 10) : Math.ceil(run.realm.level / 10)} 档）
              {SECT_STIPEND_PILL[run.sect.rank] ? '' : '；丹药俸禄只在宗主任上'}
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>宗门任务</span>
            <span className="hint">可接 {missions.length} 项 · 接取即消耗冷却，不阻塞修行</span>
          </div>
          <div className="panel-body alc-list">
            {missions.length === 0 ? <p className="hint">暂无可接任务（境界或职位不足，或都在冷却中）。</p> : null}
            {missions.map((m) => (
              <div key={m.id} className="alc-row">
                <div className="alc-row-head">
                  <span>{m.title}</span>
                  <span className="hint">
                    贡献 +{m.contribution} · 冷却 {m.cooldownYears} 年
                  </span>
                </div>
                <div className="alc-row-body">
                  <p className="hint">{m.body}</p>
                  <button className="btn-soft" type="button" onClick={() => takeMission(m.id)}>
                    接取
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>宗门大比</span>
            <span className="hint">每 20 年一次 · 夺魁得宗门功法</span>
          </div>
          <div className="panel-body">
            <p className="hint">
              按**构筑**排名（同境界归一化，境界不计）：乘积 1 垫底，触到软封顶拐点即夺魁。
              {run.sect.tournamentPlaces.length > 0
                ? ` 已参赛 ${run.sect.tournamentPlaces.length} 次，最好成绩第 ${Math.min(...run.sect.tournamentPlaces)} 名。`
                : ''}
            </p>
            <div className="mt-sm">
              <button className="btn" type="button" disabled={!due} onClick={enterTournament}>
                {due ? '入场比试' : '未到大比之年'}
              </button>
            </div>
          </div>
        </section>
      </main>

      <aside className="side">
        <section className="panel">
          <div className="panel-title">
            <span>跨宗张力</span>
            <span className="hint">≥ 80 会引来挖角</span>
          </div>
          <div className="panel-body">
            {tensions.map(([id, v]) => (
              <div key={id} className="zone-row">
                <span>{sectName(content, id)}</span>
                <span className="num">{v}</span>
              </div>
            ))}
            <p className="hint mt-sm">讨伐任务抬高张力，交涉任务压低；每年自然 −1。</p>
          </div>
        </section>
        <PowerBreakdown />
      </aside>
    </>
  );
}
