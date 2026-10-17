// 互動工具共用的小元件（深色卡片風格，與任務卡一致）
import { useState, type ReactNode } from 'react';
import { copyText } from '../lib/store';

export const G = '#35E08A', R = '#F45B5B', A = '#F5A524', B = '#5B9DF4';

/** 分段切換鈕 */
export function Seg<T extends string>({ value, options, onChange }: {
  value: T; options: { v: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,.05)' }}>
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className="rounded-lg px-3.5 py-1.5 font-heading text-sm transition"
          style={value === o.v ? { background: G, color: '#06110B' } : { color: '#B9C0CB' }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** 金額輸入：數字框 + 滑桿 */
export function MoneyInput({ label, value, onChange, min = 0, max, step = 50, slider = true }: {
  label: string; value: number | ''; onChange: (v: number | '') => void;
  min?: number; max: number; step?: number; slider?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-body text-xs text-white/50">{label}</span>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-heading text-white/40">$</span>
        <input type="number" inputMode="decimal" value={value} min={min} step={step}
          onChange={(e) => onChange(e.target.value === '' ? '' : +e.target.value)}
          className="w-28 rounded-lg px-3 py-2 font-heading text-lg text-white outline-none focus:ring-2"
          style={{ background: '#0B0F15', border: '1px solid rgba(255,255,255,.14)' }} />
      </div>
      {slider && (
        <input type="range" min={min} max={max} step={step} value={value === '' ? min : value}
          onChange={(e) => onChange(+e.target.value)} className="w-full mt-2 accent-[#35E08A]" />
      )}
    </label>
  );
}

export function Btn({ children, onClick, tone = 'ghost', title }: {
  children: ReactNode; onClick: () => void; tone?: 'ghost' | 'solid'; title?: string;
}) {
  return (
    <button onClick={onClick} title={title}
      className="rounded-lg px-3.5 py-2 font-heading text-sm transition hover:brightness-110"
      style={tone === 'solid'
        ? { background: G, color: '#06110B' }
        : { background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', color: '#C7CDD8' }}>
      {children}
    </button>
  );
}

/** 複製按鈕：按下後短暫顯示「已複製」 */
export function CopyBtn({ text, label, done = '已複製 ✓', tone }: { text: () => string; label: string; done?: string; tone?: 'ghost' | 'solid' }) {
  const [ok, setOk] = useState(false);
  return (
    <Btn tone={tone} onClick={async () => {
      if (await copyText(text())) { setOk(true); setTimeout(() => setOk(false), 1600); }
    }}>{ok ? done : label}</Btn>
  );
}

/** 結果小卡 */
export function Tile({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="rounded-xl p-3.5 flex-1 min-w-[130px]" style={{ background: `${color}12`, border: `1px solid ${color}40` }}>
      <div className="font-body text-[11px] text-white/50">{label}</div>
      <div className="font-heading text-2xl leading-tight mt-0.5" style={{ color }}>{value}</div>
      {sub && <div className="font-body text-[11px] text-white/45 mt-0.5">{sub}</div>}
    </div>
  );
}

export function Arrow() {
  return <div className="hidden sm:flex items-center font-heading text-white/25 px-0.5">→</div>;
}

/** 分享連結：同一頁＋方案＋工具參數 */
export function shareUrl(firm: string, params: Record<string, string | number>) {
  const u = new URL(`/rules/${firm}.html`, typeof window === 'undefined' ? 'https://propfirmtw.com' : window.location.origin);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, String(v)));
  u.hash = 'tools';
  return u.toString();
}
