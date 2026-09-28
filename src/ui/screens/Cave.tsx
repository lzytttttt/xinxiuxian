import { useRunStore } from '../../store/runStore';
import { useMetaStore } from '../../store/metaStore';
import { CAVE_LEVEL_MAX } from '../../engine/constants';
import { ROOMS, ROOM_META } from '../../engine/cave';
import { canUpgradeCave, caveUpgradeCost, codexCountOf } from '../../engine/meta';
import { slotCount } from '../../engine/arts';
import { buyableDoctrines, canBuyDoctrine } from '../../store/doctrines';
import { PowerBreakdown } from '../panels/PowerBreakdown';
import type { RoomId } from '../../engine/types/run';

/* 洞天：跨局层的花销界面。六室用传承点升级，效果全部落在已封顶的乘区或资源侧——
   洞府买的是「起跑线更高」，不是「上限更高」（product/08-legacy-cave.md §四）。
   道统是洞府满级之后的第二出口：同样只买持有与已知，不买概率。 */

export function Cave() {
  const run = useRunStore((s) => s.run);
  const version = useRunStore((s) => s.version);
  const content = useRunStore((s) => s.content);
  const meta = useMetaStore((s) => s.meta);
  const upgrade = useMetaStore((s) => s.upgrade);
  const buy = useMetaStore((s) => s.buy);
  void version;
  if (!run) return null;

  const points = meta.legacyPoints;
  const totalLevels = ROOMS.reduce((a, room) => a + (meta.cave[room] ?? 0), 0);
  const slots = slotCount(run);
  const catalog = buyableDoctrines(content);
  const owned = new Set(meta.doctrines);

  return (
    <>
      <main className="main">
        <section className="panel">
          <div className="panel-title">
            <span>洞天</span>
            <span className="meta">
              传承点 <span className="num">{points}</span> · 六室{' '}
              <span className="num">
                {totalLevels}/{ROOMS.length * CAVE_LEVEL_MAX}
              </span>
            </span>
          </div>
          <div className="panel-body">
            <p className="hint">
              传承点由每世的境界、飞升、图鉴、宗门、成就与羁绊结算而来（局末入账，累计已得{' '}
              <span className="num">{meta.lifetimeLegacy}</span>）。
              六室的效果只落在已封顶的乘区与资源侧 —— 洞府能让你更快到达上限，但上限本身不会变。
            </p>
            <p className="hint mt-sm">
              升级成本按 <span className="num">1.6^n</span> 递增，而传承点收入随境界线性增长：
              成本是指数、收入是线性，收益递减是设计自带的，不需要额外衰减。
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>六室</span>
            <span className="hint">当前功法槽 {slots} 个</span>
          </div>
          <div className="panel-body">
            {ROOMS.map((room) => (
              <RoomRow
                key={room}
                room={room}
                level={meta.cave[room] ?? 0}
                points={points}
                canBuy={canUpgradeCave(meta.cave, room, points)}
                onBuy={() => upgrade(room)}
              />
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>前世道统</span>
            <span className="hint">
              已承 <span className="num">{owned.size}</span> / {catalog.length}
            </span>
          </div>
          <div className="panel-body">
            <p className="hint">
              洞府满级之后传承点无处可花，这是第二个出口。道统给的是**起手就持有**——
              功法给持有不占槽、丹方给已知、药材给存量。买不到的东西：灵根、突破概率、寿元。
              传承能让你少走弯路，改不了你走的路。
            </p>
            {(['art', 'recipe', 'herb'] as const).map((kind) => {
              const rows = catalog.filter((d) => d.kind === kind);
              if (rows.length === 0) return null;
              return (
                <div key={kind} className="zone-block">
                  <div className="zone-head">
                    <span>{KIND_LABEL[kind]}</span>
                  </div>
                  {rows.map((d) => {
                    const has = owned.has(d.id);
                    const can = canBuyDoctrine(d.id, d.cost, points, meta.doctrines);
                    return (
                      <div className="zone-row" key={d.id}>
                        <span className="zone-src">
                          <b>{d.name}</b>
                          <br />
                          {d.text}
                        </span>
                        <button
                          className="btn-soft"
                          type="button"
                          disabled={has || !can}
                          onClick={() => buy(d.id, d.cost)}
                        >
                          {has ? '已承' : `${d.cost} 传承点`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>跨局</span>
            <span className="hint">这一世已经带在身上的</span>
          </div>
          <div className="panel-body">
            <div className="zone-row">
              <span>图鉴收集</span>
              <span className="num">{codexCountOf(meta.codex)} 条</span>
            </div>
            <div className="zone-row">
              <span>已解锁功法 / 丹方 / 宗门</span>
              <span className="num">
                {meta.unlocks.arts.length} / {meta.unlocks.recipes.length} /{' '}
                {meta.unlocks.sects.length}
              </span>
            </div>
            <div className="zone-row">
              <span>成就</span>
              <span className="num">{meta.achievements.length}</span>
            </div>
            <div className="zone-row">
              <span>前世道侣</span>
              <span className="num">
                {meta.pastPartners[0]
                  ? `${meta.pastPartners[0].name}（羁绊 ${meta.pastPartners[0].level}）`
                  : '暂无'}
              </span>
            </div>
            <div className="zone-row">
              <span>历史职位</span>
              <span className="num">
                {Object.entries(meta.sectLegacy).length === 0
                  ? '暂无'
                  : Object.entries(meta.sectLegacy)
                      .map(([id, rank]) => `${id} ${rank}`)
                      .join('、')}
              </span>
            </div>
          </div>
        </section>
      </main>

      <aside className="side">
        <PowerBreakdown />
      </aside>
    </>
  );
}

const KIND_LABEL: Record<'art' | 'recipe' | 'herb', string> = {
  art: '功法道统',
  recipe: '丹方道统',
  herb: '药圃道统',
};

function RoomRow({
  room,
  level,
  points,
  canBuy,
  onBuy,
}: {
  room: RoomId;
  level: number;
  points: number;
  canBuy: boolean;
  onBuy: () => void;
}) {
  const maxed = level >= CAVE_LEVEL_MAX;
  const cost = maxed ? 0 : caveUpgradeCost(room, level);
  return (
    <div className="zone-block">
      <div className="zone-head">
        <span>{room}</span>
        <span className="num" data-cap={maxed ? 'full' : undefined}>
          L{level} / {CAVE_LEVEL_MAX}
        </span>
      </div>
      <div className="zone-row">
        <span className="zone-src">{ROOM_META[room].effect}</span>
      </div>
      <div className="zone-row">
        <button className="btn" type="button" disabled={!canBuy} onClick={onBuy}>
          {maxed ? '已满级' : `升级 · ${cost} 传承点`}
        </button>
        <span className="num">{maxed ? '—' : `余额 ${points}`}</span>
      </div>
    </div>
  );
}
