import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/* Phase 0 外壳：资源条与日志流均为硬编码演示数据。
   真实数据由 Phase 1 的 tick 循环经 store 提供，本文件的 DEMO_* 届时整体删除。
   决策弹层是视觉基准件——blob 剪影与焦点陷阱的参考实现，Phase 2 接入真实决策。 */

type Tone =
  | 'year'
  | 'brk'
  | 'ev1'
  | 'ev2'
  | 'ev3'
  | 'ev4'
  | 'huan'
  | 'rare'
  | 'red'
  | 'gold'
  | 'xian'
  | 'rainbow'
  | 'god'
  | 'special'
  | 'dead';

interface DemoLine {
  tone: Tone;
  text: string;
}

const DEMO_LOG: DemoLine[] = [
  { tone: 'year', text: '第十七年 · 青芜山，松风过耳。' },
  { tone: 'ev2', text: '你在溪涧拾得一枚温润玉简，其上无名，触之微凉。' },
  { tone: 'gold', text: '修为 +46　悟性 +2' },
  { tone: 'year', text: '第十八年 · 静修不辍，晨昏各一次吐纳。' },
  { tone: 'brk', text: '气息贯通，境界抬升——筑基 · 一层。' },
  { tone: 'ev3', text: '夜半有客踏月而来，自陈散修，欲以三式剑诀换你一坛陈酒。' },
  { tone: 'red', text: '你婉拒。客去时衣袖掠过石阶，阶上留下一道深痕。' },
  { tone: 'rare', text: '得法宝：青竹剑（凡品 · 一档）' },
  { tone: 'huan', text: '灵根微动——天灵根 · 七档。' },
  { tone: 'year', text: '第三十年 · 云海翻涌，如潮如汐。' },
  { tone: 'ev4', text: '山门外老松一夜枯死，根下埋着一枚漆黑的丹，尚有余温。' },
  { tone: 'special', text: '灵根蜕变：你听见血脉里极轻的鸣响。' },
  { tone: 'rainbow', text: '第一重天劫将至！' },
  { tone: 'red', text: '雷光落在脊背上，你咬住牙关，不退。' },
  { tone: 'god', text: '劫云散去，天光垂落一线。' },
  { tone: 'gold', text: '渡劫成功　模拟点 +40' },
  { tone: 'year', text: '第三十七年 · 石室无尘，炉火未熄。' },
];

const DEMO = {
  realm: '筑基 · 三层',
  arc: '凡界',
  age: 37,
  simPoints: 68,
  simPointsMax: 120,
  cultivation: 1284,
  root: '天灵根 · 七档',
  luck: 42,
  artifacts: 3,
  progress: 62,
  life: 3,
  toxicity: 18,
  power: 1528,
  zones: [
    { label: '修为总量', mult: '×1.00' },
    { label: '灵根增幅', mult: '×1.14' },
    { label: '法宝共鸣', mult: '×1.02' },
    { label: '功法被动', mult: '×1.00' },
    { label: '丹药状态', mult: '×1.00' },
    { label: '气运命格', mult: '×1.04' },
  ],
};

const DEMO_CHOICE = {
  title: '夜半访客',
  body: '那散修立于阶下，剑诀三式摊在掌心，酒香从你的石室飘出来。他说，只换一坛。',
  options: ['以酒换剑诀', '请他入内详谈', '婉拒'],
};

const NAV = ['修炼', '构筑', '洞天', '图鉴', '吾身'];

const LINE_INTERVAL = 1100;
const RENDER_CAP = 120;

function Ribbon({ children }: { children: ReactNode }) {
  return (
    <span className="ribbon">
      <span className="ribbon-back-left" aria-hidden="true" />
      <span className="ribbon-back-right" aria-hidden="true" />
      <span className="ribbon-fold-left" aria-hidden="true" />
      <span className="ribbon-fold-right" aria-hidden="true" />
      <span className="ribbon-front">
        <span className="ribbon-text">{children}</span>
      </span>
    </span>
  );
}

/* 决策弹层：不可点击遮罩关闭——选择就是玩法本身。
   Esc 仅在存在"暂缓"选项时可用，此处演示版允许。 */
function DecisionModal({ onClose }: { onClose: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = boxRef.current;
    if (!node) return;

    const focusables = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );

    focusables()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="mask">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="choice-title" ref={boxRef}>
        <h2 className="modal-title" id="choice-title">
          {DEMO_CHOICE.title}
        </h2>
        <p className="modal-body">{DEMO_CHOICE.body}</p>
        <div className="modal-actions">
          {DEMO_CHOICE.options.map((label, index) => (
            <button
              key={label}
              type="button"
              className={index === 0 ? 'btn' : 'btn-soft'}
              onClick={onClose}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [count, setCount] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (count >= DEMO_LOG.length) return;
    const timer = setTimeout(() => setCount((c) => c + 1), LINE_INTERVAL);
    return () => clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count]);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const lines = DEMO_LOG.slice(0, count).slice(-RENDER_CAP);
  const ringStyle = { '--p': `${DEMO.progress}%` } as CSSProperties;
  const toxStyle = { '--p': `${DEMO.toxicity}%` } as CSSProperties;

  return (
    <>
      <div className="shell">
        <aside className="rail">
          <div className="brand">
            <Ribbon>修仙模拟器</Ribbon>
          </div>
          <div className="ring" style={ringStyle}>
            <span className="ring-label">
              <span className="meta">境界进度</span>
              <span className="num ring-value">{DEMO.progress}%</span>
            </span>
          </div>
          <div>
            <div className="meta">
              第 {DEMO.life} 世 · {DEMO.arc}
            </div>
            <div className="meta">{DEMO.realm}</div>
          </div>
          <nav aria-label="主导航">
            <ul>
              {NAV.map((item) => (
                <li key={item}>
                  <button className="nav-item" aria-current={item === '修炼'} disabled={item !== '修炼'}>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <p className="hint">Phase 0 演示外壳：数值与日志均为静态示例。</p>
        </aside>

        <main className="main">
          <div className="resbar">
            <div className="resbar-top">
              <span className="resbar-realm">{DEMO.realm}</span>
              <span className="meta">
                <span className="num">{DEMO.age}</span> 岁 · 模拟点{' '}
                <span className="num">
                  {DEMO.simPoints}/{DEMO.simPointsMax}
                </span>
              </span>
            </div>
            <div className="resbar-chips">
              <span className="chip">
                修为 <b className="num">{DEMO.cultivation}</b>
              </span>
              <span className="chip">
                灵根 <b>{DEMO.root}</b>
              </span>
              <span className="chip">
                气运 <b className="num">{DEMO.luck}</b>
              </span>
              <span className="chip">
                法宝 <b className="num">×{DEMO.artifacts}</b>
              </span>
            </div>
          </div>

          <section className="panel">
            <div className="panel-title">
              <Ribbon>修行纪事</Ribbon>
              <button className="btn-ghost" onClick={() => setCount(1)}>
                重播
              </button>
            </div>
            <div className="feed" ref={feedRef} role="log" aria-live="polite" aria-label="修行日志">
              {lines.map((line, i) => (
                <p key={`${i}-${line.text}`} className="log" data-cls={line.tone}>
                  {line.text}
                </p>
              ))}
            </div>
          </section>
        </main>

        <aside className="side">
          <section className="panel">
            <div className="panel-title">
              <span>战力构成</span>
              <span className="hint">Phase 3 接入</span>
            </div>
            <div className="panel-body">
              {DEMO.zones.map((zone) => (
                <div key={zone.label} className="zone-row">
                  <span>{zone.label}</span>
                  <span className="num">{zone.mult}</span>
                </div>
              ))}
              <div className="zone-total">
                <span>最终战力</span>
                <span className="num">{DEMO.power}</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-title">
              <span>丹毒</span>
              <span className="num meta">{DEMO.toxicity}/100</span>
            </div>
            <div className="panel-body">
              <div className="bar" data-tone="crimson" style={toxStyle}>
                <i />
              </div>
              <p className="hint mt-sm">Phase 4 接入：丹毒累积、惩罚与净化。</p>
            </div>
          </section>

          <section className="panel">
            <div className="panel-title">
              <span>视觉基准件</span>
            </div>
            <div className="panel-body">
              <button className="btn-soft" onClick={() => setModalOpen(true)}>
                打开决策弹层
              </button>
              <p className="hint mt-sm">blob 剪影与焦点陷阱的参考实现，Phase 2 接真实决策。</p>
            </div>
          </section>

          <section className="panel">
            <div className="panel-title">
              <span>羁绊</span>
            </div>
            <div className="panel-body">
              <p className="hint">尚未结缘。Phase 5 接入。</p>
            </div>
          </section>
        </aside>
      </div>

      <nav className="tabbar" aria-label="底部导航">
        {NAV.map((item) => (
          <button key={item} aria-current={item === '修炼'} disabled={item !== '修炼'}>
            {item}
          </button>
        ))}
      </nav>

      {modalOpen && <DecisionModal onClose={closeModal} />}
    </>
  );
}
