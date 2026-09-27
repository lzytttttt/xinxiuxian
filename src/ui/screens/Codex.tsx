import { useState } from 'react';
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS, goldBoostOf } from '../../content/achievements';
import { useMetaStore } from '../../store/metaStore';
import { countBits } from '../../engine/meta';
import { ACHIEVEMENT_BONUS_CAP } from '../../engine/constants';
import type { AchievementGroup } from '../../content/achievements';

/* 图鉴：成就 / 六张图鉴 / 世次高光 / 本地三榜。全是纯本地的单机数据，
   不伪造任何「全区排行」（product/08-legacy-cave.md §五）。 */

type Tab = '成就' | '图鉴' | '高光' | '榜';

const TABS: readonly Tab[] = ['成就', '图鉴', '高光', '榜'];

const CODEX_KINDS = [
  { key: 'encounters', name: '机缘', hint: '20 档' },
  { key: 'artifacts', name: '法宝', hint: '20 档' },
  { key: 'realms', name: '境界', hint: '20 重' },
  { key: 'pills', name: '丹药', hint: '丹方' },
  { key: 'arts', name: '功法', hint: '42 门' },
  { key: 'herbs', name: '药材', hint: '药材表' },
] as const;

export function Codex() {
  const meta = useMetaStore((s) => s.meta);
  const [tab, setTab] = useState<Tab>('成就');
  const bonus = goldBoostOf(meta.achievements);

  return (
    <main className="main">
      <section className="panel">
        <div className="panel-title">
          <span>图鉴</span>
          <span className="meta">
            {TABS.map((t) => (
              <button
                key={t}
                className={t === tab ? 'btn-soft' : 'btn'}
                type="button"
                aria-pressed={t === tab}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </span>
        </div>
        <div className="panel-body">
          <p className="hint">
            全部为本机记录。累计成 {meta.achievements.length} / {ACHIEVEMENTS.length}，
            气运抽取加成 <span className="num">+{bonus}</span>（上限 +{ACHIEVEMENT_BONUS_CAP}）。
            成就是气运，不是灵根 —— 传承买不到更高的突破概率。
          </p>
        </div>
      </section>

      {tab === '成就' ? <Achievements owned={meta.achievements} /> : null}
      {tab === '图鉴' ? <CodexBitsView bits={meta.codex} /> : null}
      {tab === '高光' ? <Highlights /> : null}
      {tab === '榜' ? <Boards /> : null}
    </main>
  );
}

function Achievements({ owned }: { owned: string[] }) {
  const has = new Set(owned);
  return (
    <section className="panel">
      <div className="panel-title">
        <span>成就</span>
        <span className="hint">{owned.length} / {ACHIEVEMENTS.length}</span>
      </div>
      <div className="panel-body">
        {ACHIEVEMENT_GROUPS.map((group) => (
          <GroupBlock key={group} group={group} has={has} />
        ))}
      </div>
    </section>
  );
}

function GroupBlock({ group, has }: { group: AchievementGroup; has: Set<string> }) {
  const rows = ACHIEVEMENTS.filter((a) => a.group === group);
  const done = rows.filter((a) => has.has(a.id)).length;
  return (
    <div className="zone-block">
      <div className="zone-head">
        <span>{group}</span>
        <span className="num">
          {done} / {rows.length}
        </span>
      </div>
      {rows.map((a) => (
        <div key={a.id} className="zone-row">
          <span className={has.has(a.id) ? '' : 'hint'}>{a.name}</span>
          <span className="num">
            {has.has(a.id) ? (a.bonus > 0 ? `+${a.bonus} 气运` : '已解锁') : '未解锁'}
          </span>
        </div>
      ))}
    </div>
  );
}

function CodexBitsView({ bits }: { bits: ReturnType<typeof useMetaStore.getState>['meta']['codex'] }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <span>图鉴</span>
        <span className="hint">位串存储，跨局累积</span>
      </div>
      <div className="panel-body">
        {CODEX_KINDS.map((k) => (
          <div key={k.key} className="zone-row">
            <span>
              {k.name} <span className="hint">{k.hint}</span>
            </span>
            <span className="num">{countBits(bits[k.key])} 条</span>
          </div>
        ))}
        <p className="hint mt-sm">
          机缘档位来自决策记录里的 <span className="num">enc_tier{'{n}'}</span>；法宝按档位去重；
          境界只记凡界二十重。丹药与功法、药材按内容表下标去重，重复收集不再计数。
        </p>
      </div>
    </section>
  );
}

function Highlights() {
  const lives = useMetaStore((s) => s.meta.pastLives);
  return (
    <section className="panel">
      <div className="panel-title">
        <span>高光</span>
        <span className="hint">最近 {lives.length} 世</span>
      </div>
      <div className="panel-body">
        {lives.length === 0 ? (
          <p className="hint">还没有走完的一世。</p>
        ) : (
          lives.map((l) => (
            <div key={`${l.life}-${l.years}-${l.level}`} className="zone-row">
              <span>
                第 {l.life} 世 · {l.reason} · {l.years} 年
                {l.ascendMode ? `（${l.ascendMode}）` : ''}
              </span>
              <span className="num">
                L{l.level} · {l.power.toExponential(1)}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function Boards() {
  const lives = useMetaStore((s) => s.meta.pastLives);
  const byPower = [...lives].sort((a, b) => b.power - a.power).slice(0, 10);
  const ascents = lives.filter((l) => l.ascendMode !== '').sort((a, b) => b.level - a.level);
  const zhengdao = lives.filter((l) => l.ascendMode === 'zhengdao').sort((a, b) => b.level - a.level);

  return (
    <section className="panel">
      <div className="panel-title">
        <span>本地榜</span>
        <span className="hint">单机 · 非全区</span>
      </div>
      <div className="panel-body">
        <Board title="总战力榜" rows={byPower.map((l) => `第 ${l.life} 世 · ${l.power.toExponential(1)}`)} />
        <Board title="飞升榜" rows={ascents.map((l) => `第 ${l.life} 世 · ${l.ascendMode} · L${l.level}`)} />
        <Board title="证道榜" rows={zhengdao.map((l) => `第 ${l.life} 世 · L${l.level}`)} />
        <p className="hint mt-sm">
          榜单只存在这台机器的存档里。本作不做假数据，也不伪装成全区排行。
        </p>
      </div>
    </section>
  );
}

function Board({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="zone-block">
      <div className="zone-head">
        <span>{title}</span>
        <span className="num">{rows.length}</span>
      </div>
      {rows.length === 0 ? (
        <div className="zone-row">
          <span className="hint">暂无记录</span>
        </div>
      ) : (
        rows.map((r, i) => (
          <div key={r} className="zone-row">
            <span>
              <span className="num">{String(i + 1).padStart(2, '0')}</span> {r}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
