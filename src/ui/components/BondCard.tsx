import { realmName } from '../../engine/selectors';
import { isActiveAt } from '../../engine/bonds';
import { BOND_AID_CAP, BOND_LEVEL_MAX } from '../../engine/constants';
import type { Npc } from '../../engine/types/effects';

function rarityOf(npc: Npc): string {
  if (!npc.alive) return 'fan';
  if (npc.bondLevel >= 5) return 'xian';
  if (npc.bondLevel >= 4) return 'tian';
  if (npc.bondLevel >= 3) return 'di';
  if (npc.bondLevel >= 2) return 'xuan';
  return 'ling';
}

/** NPC 卡：关系 / 好感 / 羁绊等级 / 境界 / 性格·出身 / 随行状态 */
export function BondCard({ npc, year }: { npc: Npc; year: number }) {
  const active = isActiveAt(npc, year);
  const injured = npc.injuredUntil > year;
  return (
    <article className="card" data-rarity={rarityOf(npc)}>
      <div className="panel-body">
        <div className="resbar-top">
          <span className="resbar-realm">{npc.name}</span>
          <span className="chip">{npc.bondType ?? '无关系'}</span>
        </div>
        <div className="zone-row">
          <span>羁绊</span>
          <span className="num">
            L{npc.bondLevel} / {BOND_LEVEL_MAX}
          </span>
        </div>
        <div className="zone-row">
          <span>好感</span>
          <span className="num">{npc.affinity}</span>
        </div>
        <div className="zone-row">
          <span>境界</span>
          <span className="num">{realmName(npc.level)}</span>
        </div>
        <p className="hint mt-sm">
          {npc.personality} · {npc.origin} · 灵根第 {npc.rootTier} 档
        </p>
        {!npc.alive ? (
          <p className="hint">已故。其带来的加成都已随他/她而去。</p>
        ) : injured ? (
          <p className="hint">伤停中（至第 {npc.injuredUntil} 年），暂不可随行。</p>
        ) : active ? (
          <p className="hint">随行中 —— 助战 {Math.round(npc.bondLevel * 3 + (npc.bondType === '道侣' ? 5 : 0))}%</p>
        ) : (
          <p className="hint">未结关系或羁绊为 0，不提供助战。</p>
        )}
        {npc.neglect >= 20 && npc.alive ? <p className="hint">已有 {npc.neglect} 年未曾走动。</p> : null}
      </div>
    </article>
  );
}

export function AidSummary({ bonus }: { bonus: number }) {
  const pct = Math.round(bonus * 100);
  const cap = Math.round(BOND_AID_CAP * 100);
  return (
    <section className="panel">
      <div className="panel-title">
        <span>助战总览</span>
        <span className="hint">硬上限 {cap}%（移植红线 G5）</span>
      </div>
      <div className="panel-body">
        <div className="zone-row">
          <span>当前助战</span>
          <span className="num">{pct}%</span>
        </div>
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${Math.min(100, (pct / cap) * 100)}%` }} />
        </div>
        <p className="hint mt-sm">
          每名随行 NPC 贡献「羁绊等级 × 3%」，道侣额外 +5%。加成在机缘战斗里生效，代价是败则伤停、逃则失好感。
        </p>
      </div>
    </section>
  );
}
