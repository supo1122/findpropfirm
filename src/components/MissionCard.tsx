import type { Plan, Spec, SizeKey } from '../missions';
import { fill } from '../missions';

/** 出金任務卡:頂部一眼判讀區 + 左「你的任務」綠 / 右「不能碰的線」紅 */
export default function MissionCard({
  plan, size, firmName, verified,
}: { plan: Plan; size: SizeKey; firmName: string; verified?: boolean }) {
  const s: Spec | undefined = plan.sizes[size];
  if (!s) return null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0F141C', border: '1px solid rgba(255,255,255,.1)' }}>
      <div style={{ height: 4, background: 'linear-gradient(90deg,#35E08A,#F45B5B)' }} />
      <div className="p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5">
          <span className="font-body text-sm text-white/45">{firmName}</span>
          <span className="font-heading text-white/90">{plan.name}</span>
          <span className="font-heading text-sm px-2.5 py-1 rounded-lg" style={{ background: 'rgba(53,224,138,.14)', color: '#35E08A' }}>{size}</span>
          <span className="font-body text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)' }}>
            {plan.dd === 'EOD' ? 'EOD 收盤結算回撤' : 'Intraday 盤中即時回撤'}
          </span>
          {(verified === false || plan.unverified) && (
            <span className="font-body text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(245,165,36,.14)', color: '#F5A524' }}>官方核對中</span>
          )}
        </div>

        {/* ── 一眼判讀區 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="🚫 最多虧這麼多" value={s.maxLoss} color="#F45B5B" />
          <Stat label="💰 單次最多領" value={s.cap} color="#35E08A" />
          <Stat label="📅 日虧損上限" value={s.dll ?? '無'} color={s.dll && s.dll !== '無' ? '#F5A524' : 'rgba(255,255,255,.5)'} />
          <Stat label="🤝 分潤" value={plan.split} color="#5B9DF4" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Col title="🎯 你的任務" color="#35E08A" items={plan.tasks.map((t) => fill(t, s, plan))} />
          <Col title="🚫 不能碰的線" color="#F45B5B" items={plan.redlines.map((t) => fill(t, s, plan))} />
        </div>

        {/* 幾次轉真倉：買之前一定要知道 */}
        {plan.toLive && (
          <div className="mt-5 rounded-xl p-3.5 flex items-start gap-2.5"
            style={{ background: 'rgba(91,157,244,.09)', border: '1px solid rgba(91,157,244,.28)' }}>
            <span className="font-heading text-sm shrink-0" style={{ color: '#5B9DF4' }}>🎬 轉真倉</span>
            <span className="font-body text-[14px] leading-relaxed text-white/80">{plan.toLive}</span>
          </div>
        )}

        {/* 補充規格 */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-x-5 gap-y-2 font-body text-xs text-white/45">
          {s.target && <span>考試獲利目標 <b className="text-white/75">{s.target}</b></span>}
          {s.minPayout && <span>最低出金 <b className="text-white/75">{s.minPayout}</b></span>}
          {s.contracts && <span>部位上限 <b className="text-white/75">{s.contracts}</b></span>}
        </div>

        {plan.tip && (
          <div className="mt-4 rounded-xl p-3.5 font-body text-[14px] leading-relaxed"
            style={{ background: 'rgba(245,165,36,.1)', border: '1px solid rgba(245,165,36,.3)', color: '#E9ECF1' }}>
            {plan.tip}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
      <div className="font-body text-[11px] text-white/40 mb-1.5">{label}</div>
      <div className="font-heading leading-tight" style={{ color, fontSize: value.length > 14 ? '13px' : '19px' }}>{value}</div>
    </div>
  );
}

function Col({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div>
      <div className="font-heading text-lg mb-3" style={{ color }}>{title}</div>
      <ul className="space-y-2.5">
        {items.map((t, i) => (
          <li key={i} className="font-body text-[15px] text-white/85 pl-5 relative leading-relaxed">
            <span className="absolute left-0" style={{ color }}>▸</span>
            {highlight(t, color)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 把 $金額 / 百分比 變大變色,讓數字一眼可見 */
function highlight(text: string, color: string) {
  const parts = text.split(/(\$[\d,]*\d(?:\.\d+)?|\d+%)/g);
  return parts.map((p, i) =>
    /^(\$[\d,]|\d+%)/.test(p)
      ? <b key={i} className="font-heading" style={{ color, fontSize: '19px' }}>{p}</b>
      : <span key={i}>{p}</span>
  );
}
