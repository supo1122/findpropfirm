import type { Mission } from '../missions';

/** 出金任務卡：左「你的任務」綠、右「不能碰的線」紅 */
export default function MissionCard({ m }: { m: Mission }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0F141C', border: '1px solid rgba(255,255,255,.1)' }}>
      <div style={{ height: 4, background: 'linear-gradient(90deg,#35E08A,#F45B5B)' }} />
      <div className="p-6 md:p-7">
        <div className="font-body text-sm text-white/45 mb-4">{m.firmName} · <b className="text-white/80">{m.plan}</b>（以 50K 為例）</div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 任務 */}
          <div>
            <div className="font-heading text-lg mb-3" style={{ color: '#35E08A' }}>🎯 你的任務</div>
            <ul className="space-y-2.5">
              {m.tasks.map((t, i) => (
                <li key={i} className="font-body text-[15px] text-white/85 pl-5 relative leading-relaxed">
                  <span className="absolute left-0" style={{ color: '#35E08A' }}>▸</span>
                  {highlight(t, '#35E08A')}
                </li>
              ))}
            </ul>
          </div>
          {/* 紅線 */}
          <div>
            <div className="font-heading text-lg mb-3" style={{ color: '#F45B5B' }}>🚫 不能碰的線</div>
            <ul className="space-y-2.5">
              {m.redlines.map((t, i) => (
                <li key={i} className="font-body text-[15px] text-white/85 pl-5 relative leading-relaxed">
                  <span className="absolute left-0" style={{ color: '#F45B5B' }}>▸</span>
                  {highlight(t, '#F45B5B')}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 各規模門檻 */}
        {m.targets && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <span className="font-body text-xs text-white/45 mr-2">{m.targets.label}：</span>
            <span className="font-body text-sm">
              {m.targets.items.map((it, i) => (
                <span key={it.size}>
                  {i > 0 && <span className="text-white/25 mx-2">｜</span>}
                  <span className="text-white/50">{it.size}→</span>
                  <b style={{ color: '#35E08A' }}>{it.value}</b>
                </span>
              ))}
            </span>
          </div>
        )}

        {/* tip */}
        {m.tip && (
          <div className="mt-4 rounded-xl p-3.5 font-body text-[14px] leading-relaxed"
            style={{ background: 'rgba(245,165,36,.1)', border: '1px solid rgba(245,165,36,.3)', color: '#E9ECF1' }}>
            {m.tip}
          </div>
        )}
      </div>
    </div>
  );
}

/** 把 $金額 / 百分比 變大變色，讓數字一眼可見 */
function highlight(text: string, color: string) {
  const parts = text.split(/(\$[\d,]+(?:\.\d+)?|\d+%)/g);
  return parts.map((p, i) =>
    /^(\$[\d,]|(\d+%))/.test(p)
      ? <b key={i} className="font-heading" style={{ color, fontSize: '20px' }}>{p}</b>
      : <span key={i}>{p}</span>
  );
}
