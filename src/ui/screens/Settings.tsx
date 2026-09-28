import { useSettingsStore, type VisualIntensity } from '../../store/settingsStore';

const INTENSITY: readonly { v: VisualIntensity; label: string; desc: string }[] = [
  { v: 'low', label: '低', desc: '关闭天劫、飞升、顿悟三处演出，其余过渡保留' },
  { v: 'mid', label: '中', desc: '三处演出全开（默认）' },
  { v: 'high', label: '高', desc: '同「中」。默认档已是设计观感，此档留给确定受得住闪光的玩家' },
];

const TEXT_SPEEDS: readonly { v: number; label: string }[] = [
  { v: 0.8, label: '慢' },
  { v: 1, label: '常' },
  { v: 1.4, label: '快' },
];

export function Settings() {
  const settings = useSettingsStore((s) => s.settings);
  const patch = useSettingsStore((s) => s.patch);

  return (
    <main className="main">
      <section className="panel">
        <div className="panel-title">
          <span>视觉强度</span>
          <span className="meta">天劫 · 飞升 · 顿悟</span>
        </div>
        <div className="panel-body">
          <div className="seg" role="group" aria-label="视觉强度">
            {INTENSITY.map((o) => (
              <button
                key={o.v}
                type="button"
                className={settings.visualIntensity === o.v ? 'btn-soft' : 'btn'}
                aria-pressed={settings.visualIntensity === o.v}
                onClick={() => patch({ visualIntensity: o.v })}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="hint">
            {INTENSITY.find((o) => o.v === settings.visualIntensity)?.desc ?? ''}
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <span>动效</span>
          <span className="meta">动画与过渡</span>
        </div>
        <div className="panel-body">
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => patch({ reducedMotion: e.target.checked })}
            />
            <span>减弱动效</span>
          </label>
          <p className="hint">
            与系统级「减弱动态效果」同效：全部动画停用，过渡只保留不透明度。持续光晕/位移类动效
            对前庭功能敏感者不友好。
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <span>文本速度</span>
          <span className="meta">影响正文与日志的推进</span>
        </div>
        <div className="panel-body">
          <div className="seg" role="group" aria-label="文本速度">
            {TEXT_SPEEDS.map((o) => (
              <button
                key={o.v}
                type="button"
                className={settings.textSpeed === o.v ? 'btn-soft' : 'btn'}
                aria-pressed={settings.textSpeed === o.v}
                onClick={() => patch({ textSpeed: o.v })}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-body">
          <p className="hint">
            设置存在本机的独立键 <code>xiuxian.settings</code>，不随存档迁移。存档损坏被归档时，
            偏好不会跟着丢。
          </p>
        </div>
      </section>
    </main>
  );
}
