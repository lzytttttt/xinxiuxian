import { useState, type ReactNode } from 'react';
import { realmName } from './engine/selectors';
import { useRunStore } from './store/runStore';
import { DecisionModal } from './ui/components/DecisionModal';
import { Alchemy } from './ui/screens/Alchemy';
import { Build } from './ui/screens/Build';
import { Cultivate } from './ui/screens/Cultivate';
import { Home } from './ui/screens/Home';
import { Self } from './ui/screens/Self';

/* 外壳：左栏（品牌/境界）+ 主屏 + 右栏（由各屏自绘）+ 移动端底部导航。
   决策弹层挂在外壳层：任何屏（修炼/吾身）下都必须能看到并结算。 */

type Screen = '修炼' | '构筑' | '炼丹' | '吾身';
const NAV = ['修炼', '构筑', '炼丹', '洞天', '图鉴', '吾身'];

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

export default function App() {
  const run = useRunStore((s) => s.run);
  const version = useRunStore((s) => s.version);
  const pending = useRunStore((s) => s.pending);
  const ended = useRunStore((s) => s.ended);
  const choose = useRunStore((s) => s.choose);
  const [screen, setScreen] = useState<Screen>('修炼');
  void version;

  const enabled = (item: string): boolean =>
    item === '修炼' || item === '构筑' || item === '炼丹' || item === '吾身';

  return (
    <>
      <div className="shell">
        <aside className="rail">
          <div className="brand">
            <Ribbon>修仙模拟器</Ribbon>
          </div>
          {run ? (
            <>
              <div>
                <div className="meta">
                  第 {run.life} 世 · {run.realm.arc === 'immortal' ? '仙界' : '凡界'}
                </div>
                <div className="meta">{realmName(run.realm.level)}</div>
              </div>
              <div>
                <div className="meta">
                  <span className="num">{run.age}</span> 岁 · 模拟点{' '}
                  <span className="num">{run.simPoints}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="hint">未入道。自命帖中择一而行。</p>
          )}
          <nav aria-label="主导航">
            <ul>
              {NAV.map((item) => (
                <li key={item}>
                  <button
                    className="nav-item"
                    aria-current={item === screen}
                    disabled={!enabled(item)}
                    onClick={() => setScreen(item as Screen)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <p className="hint">
            Phase 4：炼丹已上线（控火小游戏 / 丹毒 / 七类丹药 / 60 药材 / 35 丹方）。
          </p>
        </aside>

        {!run ? (
          <Home />
        ) : screen === '吾身' ? (
          <Self />
        ) : screen === '构筑' ? (
          <Build />
        ) : screen === '炼丹' ? (
          <Alchemy />
        ) : (
          <Cultivate />
        )}
      </div>

      {run && pending && !ended ? <DecisionModal decision={pending} onChoose={choose} /> : null}

      <nav className="tabbar" aria-label="底部导航">
        {NAV.map((item) => (
          <button
            key={item}
            aria-current={item === screen}
            disabled={!enabled(item)}
            onClick={() => setScreen(item as Screen)}
          >
            {item}
          </button>
        ))}
      </nav>
    </>
  );
}
