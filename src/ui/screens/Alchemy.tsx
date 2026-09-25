import { useMemo, useState } from 'react';
import { useRunStore } from '../../store/runStore';
import {
  actionInfos,
  canAutoFire,
  herbById,
  marketOffers,
  missingInputs,
  parsePillKey,
  pillById,
  pillStacks,
  potencyCap,
  qualityMult,
  qualityName,
  recipeById,
  recipeAvailable,
  schoolBonusOf,
} from '../../engine/alchemy';
import {
  ALCHEMY_AUTO_MASTERY,
  ALCHEMY_BATCH_COUNT,
  HERB_MARKET_YEARLY_STOCK,
} from '../../engine/constants';
import { PowerBreakdown } from '../panels/PowerBreakdown';
import { HeatGauge } from '../components/HeatGauge';
import type { BatchAction } from '../../engine/alchemy';
import type { Recipe } from '../../engine/types/effects';

/* 炼丹屏：左列丹方（可炼/缺料/未解锁），主区控火台，右列战力构成。
   自动控火与批量炼制都需要该丹方精通 ≥3（防枯燥三件套的其中两件）。 */

const TYPE_ORDER: Record<string, number> = {
  聚气: 0,
  洗髓: 1,
  天机: 2,
  炼宝: 3,
  破境: 4,
  护劫: 5,
  疗毒: 6,
};

export function Alchemy() {
  const run = useRunStore((s) => s.run);
  const content = useRunStore((s) => s.content);
  const version = useRunStore((s) => s.version);
  const batch = useRunStore((s) => s.batch);
  const batchRecipeId = useRunStore((s) => s.batchRecipeId);
  const batchResult = useRunStore((s) => s.batchResult);
  const startCraft = useRunStore((s) => s.startCraft);
  const stepCraft = useRunStore((s) => s.stepCraft);
  const finishCraft = useRunStore((s) => s.finishCraft);
  const discardCraft = useRunStore((s) => s.discardCraft);
  const autoCraft = useRunStore((s) => s.autoCraft);
  const refine = useRunStore((s) => s.refine);
  const takePill = useRunStore((s) => s.takePill);
  const buy = useRunStore((s) => s.buy);
  const [selected, setSelected] = useState<string | null>(null);

  const view = useMemo(() => {
    if (!run) return null;
    const recipes = (content.recipes ?? [])
      .filter((r) => recipeAvailable(run, r, content))
      .sort(
        (a, b) =>
          a.tier - b.tier ||
          (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9) ||
          a.name.localeCompare(b.name),
      );
    const stacks = pillStacks(run, content);
    const herbs = Object.entries(run.herbs)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => ({ id, n, def: herbById(content, id) }))
      .sort((a, b) => (b.def?.tier ?? 0) - (a.def?.tier ?? 0) || a.id.localeCompare(b.id));
    const offers = marketOffers(run, content);
    const boughtThisYear =
      (run.flags['market_year'] ?? -1) === run.year ? (run.flags['market_bought'] ?? 0) : 0;
    return { recipes, stacks, herbs, offers, boughtThisYear };
  }, [run, content, version]);

  if (!run || !view) return null;

  const activeRecipe: Recipe | null = batchRecipeId ? recipeById(content, batchRecipeId) ?? null : null;
  const resultPill = batchResult ? pillById(content, parsePillKey(batchResult.key).pillId) : undefined;

  const qualityClass = (q: number): string =>
    ['', 'fan', 'fan', 'ling', 'xuan', 'di', 'tian'][Math.min(6, Math.max(1, q))] ?? 'fan';

  return (
    <>
      <main className="main">
        <section className="panel">
          <div className="panel-title">
            <span>炼丹台</span>
            <span className="meta">
              丹毒 <b className="num">{Math.round(run.toxicity)}</b>/100 · 丹修加成{' '}
              {schoolBonusOf(run, content) > 0 ? `+${schoolBonusOf(run, content).toFixed(1)}` : '无'}
            </span>
          </div>
          <div className="panel-body">
            {batch && activeRecipe ? (
              <>
                <HeatGauge batch={batch} />
                <div className="alc-actions">
                  {actionInfos(batch).map((info) => (
                    <button
                      key={info.action}
                      className="btn-soft"
                      type="button"
                      disabled={!info.enabled || Boolean(batchResult)}
                      onClick={() => stepCraft(info.action as BatchAction)}
                      title={info.reason || `${info.effect}（${info.cost}）`}
                    >
                      <b>{info.label}</b>
                      <span className="meta">
                        {info.effect} · {info.cost}
                      </span>
                    </button>
                  ))}
                </div>
                {batchResult ? null : (
                  <button className="btn-ghost" type="button" onClick={discardCraft}>
                    弃炉（材料不返还）
                  </button>
                )}
                {batchResult ? (
                  <div className="alc-result" data-tone={batchResult.count > 0 ? 'gold' : 'red'}>
                    <span className="art-name">
                      {batchResult.count > 0
                        ? `${resultPill?.name ?? ''} · ${qualityName(batchResult.outcome.quality)}`
                        : '炸炉'}
                    </span>
                    <span className="meta">
                      {batchResult.count > 0
                        ? `品质 ${batchResult.outcome.quality}/6（效果 ×${qualityMult(batchResult.outcome.quality)}） · 丹毒 +${batchResult.toxicity.toFixed(1)}`
                        : `材料全损，丹毒未增（第 ${activeRecipe.name} 炉）`}
                    </span>
                    <button className="btn" type="button" onClick={finishCraft}>
                      收炉
                    </button>
                  </div>
                ) : (
                  <p className="hint">
                    四动作：添柴升温、撤火降温、扇风借势（抬噪声）、稳火微调（耗稳定度）。
                    稳定度耗尽后强用稳火会炸炉——材料全损。
                  </p>
                )}
              </>
            ) : batchResult && resultPill ? (
              <div className="alc-result" data-tone={batchResult.count > 0 ? 'gold' : 'red'}>
                <span className="art-name">
                  {batchResult.count > 0
                    ? `${resultPill.name} · ${qualityName(batchResult.outcome.quality)} ×${batchResult.count}`
                    : '炸炉'}
                </span>
                <span className="meta">
                  {batchResult.count > 0
                    ? `效果倍率 ×${qualityMult(batchResult.outcome.quality)} · 丹毒 +${batchResult.toxicity.toFixed(1)}`
                    : '材料全损'}
                </span>
                <button className="btn" type="button" onClick={finishCraft}>
                  知道了
                </button>
              </div>
            ) : (
              <p className="hint">
                选择一张丹方开炉。控火质量决定成品品质（品质越高，效果越强、丹毒越轻）。
                同一丹方炼满 {ALCHEMY_AUTO_MASTERY} 炉后解锁自动控火。
              </p>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>丹方</span>
            <span className="meta">共 {view.recipes.length} 张可炼</span>
          </div>
          <div className="panel-body alc-list">
            {view.recipes.length === 0 ? (
              <p className="hint">尚无可用丹方。低阶丹方随境界自然通晓，高阶丹方需机缘或传承。</p>
            ) : (
              view.recipes.map((r) => {
                const miss = missingInputs(run, r);
                const mastery = run.recipes[r.id]?.mastery ?? 0;
                const cap = potencyCap(content, r);
                const canBatch = canAutoFire(mastery) && missingInputs(run, r, ALCHEMY_BATCH_COUNT).length === 0;
                return (
                  <div className="alc-row" key={r.id} data-selected={selected === r.id}>
                    <button
                      className="alc-row-head"
                      type="button"
                      onClick={() => setSelected(selected === r.id ? null : r.id)}
                    >
                      <span className="art-name">{r.name}</span>
                      <span className="chip">
                        {r.tier} 阶 · {r.type}
                      </span>
                      <span className="meta">
                        精通 {mastery}/5 · 品质上限 {cap}/6
                        {r.school ? ` · ${r.school}专属` : ''}
                      </span>
                    </button>
                    <div className="alc-row-body">
                      <span className="meta">
                        材料：
                        {r.inputs
                          .map((i) => `${herbById(content, i.herb)?.name ?? i.herb}×${i.count}`)
                          .join('、')}
                      </span>
                      {miss.length > 0 ? (
                        <span className="hint">
                          缺：{miss.map((m) => `${herbById(content, m.herb)?.name ?? m.herb} ${m.have}/${m.need}`).join('、')}
                        </span>
                      ) : null}
                      <div className="art-actions">
                        <button
                          className="btn"
                          type="button"
                          disabled={miss.length > 0 || Boolean(batch)}
                          onClick={() => startCraft(r.id)}
                        >
                          开炉（手动控火）
                        </button>
                        <button
                          className="btn-soft"
                          type="button"
                          disabled={miss.length > 0 || Boolean(batch) || mastery < ALCHEMY_AUTO_MASTERY}
                          title={mastery < ALCHEMY_AUTO_MASTERY ? `需精通 ≥${ALCHEMY_AUTO_MASTERY}` : '按贪心策略取期望品质'}
                          onClick={() => autoCraft(r.id)}
                        >
                          自动控火
                        </button>
                        <button
                          className="btn-ghost"
                          type="button"
                          disabled={!canBatch || Boolean(batch)}
                          title={mastery < ALCHEMY_AUTO_MASTERY ? `需精通 ≥${ALCHEMY_AUTO_MASTERY}` : `消耗 ${ALCHEMY_BATCH_COUNT} 份材料`}
                          onClick={() => refine(r.id)}
                        >
                          批量炼制（{ALCHEMY_BATCH_COUNT} 份）
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>药材</span>
            <span className="meta">{view.herbs.length} 味</span>
          </div>
          <div className="panel-body">
            {view.herbs.length === 0 ? (
              <p className="hint">尚无药材。采药、药市、丹房遗承等机缘可得。</p>
            ) : (
              view.herbs.map((h) => (
                <div className="zone-row" key={h.id}>
                  <span>
                    {h.def?.name ?? h.id}
                    <span className="meta">
                      {' '}
                      · {h.def?.tier} 阶 {h.def?.nature} · 药力 {h.def?.potency}
                      {h.def?.tags.length ? ` · ${h.def.tags.join('')}` : ''}
                    </span>
                  </span>
                  <span className="num">{h.n}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <aside className="side">
        <PowerBreakdown />

        <section className="panel">
          <div className="panel-title">
            <span>药市</span>
            <span className="meta">
              悟性 {run.insight} · 本年限购 {Math.max(0, HERB_MARKET_YEARLY_STOCK - view.boughtThisYear)}/
              {HERB_MARKET_YEARLY_STOCK}
            </span>
          </div>
          <div className="panel-body">
            {view.offers.map((offer) => (
              <div className="zone-row" key={offer.herb.id}>
                <span>
                  {offer.herb.name}
                  <span className="meta">
                    {' '}
                    · {offer.herb.tier} 阶 · 药力 {offer.herb.potency}
                  </span>
                </span>
                <button
                  className="btn-ghost"
                  type="button"
                  disabled={run.insight < offer.price || view.boughtThisYear >= HERB_MARKET_YEARLY_STOCK}
                  title={`悟性 −${offer.price}`}
                  onClick={() => buy(offer.herb.id, 1)}
                >
                  购 · 悟性 {offer.price}
                </button>
              </div>
            ))}
          </div>
          <p className="hint">
            以悟性易药：与功法升级共用同一份悟性预算。药园（Phase 6）与宗门药材（Phase 5）上线后，这里只是补货口。
          </p>
        </section>

        <section className="panel">
          <div className="panel-title">
            <span>丹药</span>
            <span className="meta">{view.stacks.reduce((a, s) => a + s.count, 0)} 颗</span>
          </div>
          <div className="panel-body">
            {view.stacks.length === 0 ? (
              <p className="hint">尚无丹药。</p>
            ) : (
              view.stacks.map((stack) => (
                <div className="pill-row" key={stack.key}>
                  <span>
                    <b className="pill-name" data-rarity={qualityClass(stack.quality)}>
                      {stack.def.name}
                    </b>
                    <span className="meta">
                      {' '}
                      · {qualityName(stack.quality)} ×{stack.count}
                    </span>
                  </span>
                  <button className="btn-ghost" type="button" onClick={() => takePill(stack.key)}>
                    服用
                  </button>
                </div>
              ))
            )}
          </div>
          <p className="hint">
            破境丹大境界顶不可用；护劫丹在天劫当年服下，效果覆盖九重；其余丹药 3 年冷却。
          </p>
        </section>
      </aside>
    </>
  );
}
