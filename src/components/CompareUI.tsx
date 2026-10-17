// 「＋比較」按鈕 + 畫面左下的浮動比較列
import { useState } from 'react';
import { firmOf, planOf } from '../missions';
import { MAX_COMPARE, compareKey, compareUrl, parseKey, setCompare, toggleCompare, useCompare } from '../lib/compare';

const G = '#35E08A';

export function CompareButton({ firm, plan, size }: { firm: string; plan: string; size: string }) {
  const list = useCompare();
  const k = compareKey(firm, plan, size);
  const on = list.includes(k);
  const [full, setFull] = useState(false);
  return (
    <button
      onClick={() => {
        if (toggleCompare(k) === 'full') { setFull(true); setTimeout(() => setFull(false), 1800); }
      }}
      className="font-heading text-xs rounded-lg px-2.5 py-1.5 transition"
      style={on
        ? { background: G, color: '#06110B' }
        : { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.16)', color: '#C7CDD8' }}>
      {full ? `最多 ${MAX_COMPARE} 個` : on ? '✓ 已加入比較' : '＋ 比較'}
    </button>
  );
}

/** 有加入比較時才出現；手機在購買列上方 */
export function CompareTray({ aboveBar }: { aboveBar?: boolean }) {
  const list = useCompare();
  if (!list.length) return null;
  return (
    <div className={`fixed left-3 z-40 ${aboveBar ? 'bottom-[84px] md:bottom-5' : 'bottom-5'}`}>
      <div className="flex items-center gap-2 rounded-2xl p-2 pl-3 shadow-2xl"
        style={{ background: 'rgba(15,20,28,.96)', border: `1px solid ${G}55`, backdropFilter: 'blur(8px)' }}>
        <div className="hidden sm:flex gap-1.5">
          {list.map((k) => {
            const { firm, plan, size } = parseKey(k);
            const p = planOf(firm, plan);
            return (
              <span key={k} className="font-body text-xs rounded-md px-2 py-1 flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,.06)', color: '#C7CDD8' }}>
                {firmOf(firm)?.name.split(' ')[0]} {p?.name} {size}
                <button onClick={() => toggleCompare(k)} className="text-white/40 hover:text-white" aria-label="移除">✕</button>
              </span>
            );
          })}
        </div>
        <a href={compareUrl(list)} className="font-heading text-sm rounded-xl px-3.5 py-2" style={{ background: G, color: '#06110B' }}>
          比較 ({list.length}) →
        </a>
        <button onClick={() => setCompare([])} className="font-body text-xs text-white/40 hover:text-white px-1" aria-label="清空比較">清空</button>
      </div>
    </div>
  );
}
