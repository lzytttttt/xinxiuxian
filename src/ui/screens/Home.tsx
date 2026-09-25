import { useEffect } from 'react';
import { TALENT_NAMES } from '../../engine/constants';
import { useRunStore } from '../../store/runStore';
import { ArtCard } from '../components/ArtCard';
import type { CharCard } from '../../engine/newRun';

function rarityOf(card: CharCard): string {
  if (card.guard) return 'xian';
  const t = card.tier;
  if (t <= 2) return 'fan';
  if (t <= 4) return 'ling';
  if (t <= 6) return 'xuan';
  if (t <= 8) return 'di';
  return 'tian';
}

function Card({ card, onPick }: { card: CharCard; onPick: () => void }) {
  return (
    <article className="card" data-rarity={rarityOf(card)}>
      <div className="panel-body">
        <div className="resbar-top">
          <span className="resbar-realm">
            {TALENT_NAMES[card.tier - 1] ?? '灵根'} · {card.value}
          </span>
          {card.guard ? <span className="chip">保底</span> : null}
        </div>
        <div className="zone-row">
          <span>气运</span>
          <span className="num">{card.luck}</span>
        </div>
        <div className="zone-row">
          <span>模拟点</span>
          <span className="num">{card.simPoints}</span>
        </div>
        <div className="mt-sm">
          {card.fates.map((f) => (
            <p key={f.id} className="hint">
              {f.name}（{f.value}）
            </p>
          ))}
        </div>
        <div className="mt-sm">
          <button className="btn" type="button" onClick={onPick}>
            以此身入道
          </button>
        </div>
      </div>
    </article>
  );
}

export function Home() {
  const cards = useRunStore((s) => s.cards);
  const refreshCards = useRunStore((s) => s.refreshCards);
  const pickCard = useRunStore((s) => s.pickCard);
  const pendingCard = useRunStore((s) => s.pendingCard);
  const starterOptions = useRunStore((s) => s.starterOptions);
  const chooseStarter = useRunStore((s) => s.chooseStarter);
  const cancelStarter = useRunStore((s) => s.cancelStarter);

  useEffect(() => {
    if (cards.length === 0) refreshCards();
  }, [cards.length, refreshCards]);

  if (pendingCard && starterOptions.length > 0) {
    return (
      <>
        <main className="main">
          <section className="panel">
            <div className="panel-title">
              <span>择一功法定道途</span>
              <span className="hint">六流派各一门入门功法，三选一</span>
            </div>
            <div className="panel-body resbar-chips">
              {starterOptions.map((def) => (
                <ArtCard
                  key={def.id}
                  def={def}
                  state={undefined}
                  equipped={false}
                  insight={0}
                  chooseLabel="以此门入道"
                  onEquip={() => chooseStarter(def.id)}
                />
              ))}
            </div>
            <div className="panel-body">
              <button className="btn-soft" type="button" onClick={cancelStarter}>
                返回重择命帖
              </button>
            </div>
          </section>
        </main>

        <aside className="side">
          <section className="panel">
            <div className="panel-title">
              <span>你选的命帖</span>
            </div>
            <div className="panel-body">
              <div className="zone-row">
                <span>灵根</span>
                <span className="num">
                  {TALENT_NAMES[pendingCard.tier - 1] ?? '灵根'} · {pendingCard.value}
                </span>
              </div>
              <div className="zone-row">
                <span>气运</span>
                <span className="num">{pendingCard.luck}</span>
              </div>
              <div className="zone-row">
                <span>模拟点</span>
                <span className="num">{pendingCard.simPoints}</span>
              </div>
              <p className="hint mt-sm">
                起手功法决定你的起步方向：四条同流派可成「二重共鸣」，六条为「极意」（随洞府开放）。
              </p>
            </div>
          </section>
        </aside>
      </>
    );
  }

  return (
    <>
      <main className="main">
        <section className="panel">
          <div className="panel-title">
            <span>入道</span>
            <span className="hint">三张命帖，择一而行</span>
          </div>
          <div className="panel-body resbar-chips">
            {cards.map((card) => (
              <Card key={`${card.tier}-${card.value}-${card.luck}`} card={card} onPick={() => pickCard(card)} />
            ))}
          </div>
          <div className="panel-body">
            <button className="btn-soft" type="button" onClick={refreshCards}>
              重抽命帖
            </button>
          </div>
        </section>
      </main>

      <aside className="side">
        <section className="panel">
          <div className="panel-title">
            <span>一世之始</span>
          </div>
          <div className="panel-body">
            <p className="hint">
              灵根决定突破之难易，气运影响机缘、法宝与仙缘。命格随身而入，一世不改。
            </p>
            <p className="hint mt-sm">模拟点既是寿元也是回合：每年减一，归零则身死道消。</p>
          </div>
        </section>
      </aside>
    </>
  );
}
