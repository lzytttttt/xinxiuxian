import type { ReactNode } from 'react';
import { realmName } from './engine/selectors';
import { useRunStore } from './store/runStore';
import { Cultivate } from './ui/screens/Cultivate';
import { Home } from './ui/screens/Home';

/* 外壳：左栏（品牌/境界）+ 主屏 + 右栏（由各屏自绘）+ 移动端底部导航。
   决策弹层与结算弹层由 Cultivate 挂载。 */

const NAV = ['修炼', '构筑', '洞天', '图鉴', '吾身'];

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
  void version;

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
                  <button className="nav-item" aria-current={item === '修炼'} disabled={item !== '修炼'}>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <p className="hint">Phase 1：核心循环已接通（抽卡 → 修行 → 机缘 → 天劫）。</p>
        </aside>

        {run ? <Cultivate /> : <Home />}
      </div>

      <nav className="tabbar" aria-label="底部导航">
        {NAV.map((item) => (
          <button key={item} aria-current={item === '修炼'} disabled={item !== '修炼'}>
            {item}
          </button>
        ))}
      </nav>
    </>
  );
}
