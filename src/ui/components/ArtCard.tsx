import { insightCost } from '../../engine/arts';
import { ART_LEVEL_MAX } from '../../engine/constants';
import type { ArtDef, ZoneId } from '../../engine/types/effects';
import type { ArtState } from '../../engine/types/run';

/* 功法卡：流派 / 品质 / 等级 / 被动明细 / 升级成本。
   被动只显示内容侧声明值 × 等级（引擎算得的区间增益在战力构成面板里看）。 */

const ZONE_LABEL: Record<ZoneId, string> = {
  z1: '修为总量',
  z2: '灵根增幅',
  z3: '法宝共鸣',
  z4: '功法被动',
  z6: '气运命格',
};

const QUALITY_LABEL = ['凡', '灵', '玄', '地', '天'];

export function ArtCard({
  def,
  state,
  equipped,
  insight,
  compact = false,
  chooseLabel,
  onEquip,
  onUnequip,
  onUpgrade,
}: {
  def: ArtDef;
  state: ArtState | undefined;
  equipped: boolean;
  insight: number;
  compact?: boolean;
  /** 设了它 = 选择模式（开局三选一）：只给一个按钮 */
  chooseLabel?: string;
  onEquip?: () => void;
  onUnequip?: () => void;
  onUpgrade?: () => void;
}) {
  const level = state?.level ?? 0;
  const owned = level > 0;
  const nextCost = owned && level < ART_LEVEL_MAX ? insightCost(level + 1) : null;
  const canUpgrade = nextCost !== null && insight >= nextCost;
  const passives = Object.entries(def.passives) as [ZoneId, number][];

  return (
    <article className="art-card" data-equipped={equipped}>
      <div className="art-head">
        <span className="art-name">{def.name}</span>
        <span className="chip">
          {def.school} · {QUALITY_LABEL[def.quality - 1] ?? '凡'}
        </span>
      </div>
      {compact ? null : <p className="hint">{def.text}</p>}
      <div className="art-passives">
        {passives.map(([zone, per]) => (
          <span key={zone} className="zone-src">
            <span>{ZONE_LABEL[zone]}</span>
            <span className="num">
              {per >= 0 ? '+' : ''}
              {((owned ? per * level : per) * 100).toFixed(1)}
              {owned ? `%（L${level}）` : '%/级'}
            </span>
          </span>
        ))}
      </div>
      {chooseLabel ? (
        <div className="art-actions">
          <button className="btn" type="button" onClick={onEquip}>
            {chooseLabel}
          </button>
        </div>
      ) : owned ? (
        <div className="art-actions">
          {equipped ? (
            <button className="btn-soft" type="button" onClick={onUnequip}>
              卸下
            </button>
          ) : (
            <button className="btn-soft" type="button" onClick={onEquip}>
              装备
            </button>
          )}
          <button
            className="btn"
            type="button"
            disabled={!canUpgrade}
            onClick={onUpgrade}
            title={nextCost === null ? '已满级' : `需悟性 ${nextCost}`}
          >
            {nextCost === null ? '已满级' : `升级 · 悟性 ${nextCost}`}
          </button>
        </div>
      ) : (
        <p className="hint">尚未习得</p>
      )}
    </article>
  );
}
