import { useEffect } from 'react';
import { TALENT_NAMES } from '../../engine/constants';
import { useRunStore } from '../../store/runStore';
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
  const startRun = useRunStore((s) => s.startRun);

  useEffect(() => {
    if (cards.length === 0) refreshCards();
  }, [cards.length, refreshCards]);

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
              <Card key={`${card.tier}-${card.value}-${card.luck}`} card={card} onPick={() => startRun(card)} />
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
