// ===== 規則頁上半部（互動區）=====
// 一眼看懂：品牌 + 3 個關鍵數字 → 選方案/規模的任務卡 → 互動工具。
// 原本的長文在下半部摺疊（由 build/pages.ts 從 src/pages-src 組進來，不經過 React）。
import { useEffect, useState } from 'react';
import { FIRMS, codeOf } from '../data';
import { VERIFIED, firmOf, planOf, sizesOf, type SizeKey } from '../missions';
import MissionCard from '../components/MissionCard';
import BuyBar from '../components/BuyBar';
import { CompareButton, CompareTray } from '../components/CompareUI';
import ToolsPanel, { parseToolInit, type ToolInit } from '../tools/ToolsPanel';
import { qs } from '../lib/store';

const G = '#35E08A';
const defaultSize = (s: SizeKey[]): SizeKey => (s.includes('50K') ? '50K' : s[0]);

export default function RulesApp({ firmId }: { firmId: string }) {
  const firm = FIRMS.find((f) => f.id === firmId)!;
  const fm = firmOf(firmId);
  const [planId, setPlanId] = useState(fm.plans[0].id);
  const sizes = sizesOf(firmId, planId);
  const [size, setSize] = useState<SizeKey>(defaultSize(sizes));
  const [init, setInit] = useState<ToolInit>();
  const plan = planOf(firmId, planId)!;

  // 分享連結：?plan=&size=&tool=…（第一次渲染後才讀，與預先產生的 HTML 一致）
  useEffect(() => {
    const q = qs();
    const p = q.get('plan');
    if (p && planOf(firmId, p)) {
      setPlanId(p);
      const sz = q.get('size') as SizeKey | null;
      setSize(sz && sizesOf(firmId, p).includes(sz) ? sz : defaultSize(sizesOf(firmId, p)));
    }
    const t = parseToolInit(q);
    if (t.tool) setInit(t); // 捲到工具區由 ToolsPanel 在換好方案後處理
  }, [firmId]);

  const pickPlan = (id: string) => {
    setPlanId(id);
    const s = sizesOf(firmId, id);
    if (!s.includes(size)) setSize(defaultSize(s));
    setInit(undefined);
  };

  return (
    <div className="font-body text-white pb-6">
      {/* ── 品牌區 ── */}
      <header className="border-b border-white/10" style={{ background: 'linear-gradient(180deg,#0F141C,#0C0F14)' }}>
        <div className="max-w-4xl mx-auto px-4 pt-5 pb-7">
          <a href="/" className="font-body text-sm text-white/50 hover:text-white">← PropFirmTW 首頁</a>
          <div className="flex items-center gap-4 mt-4">
            <img src={firm.logo} alt={firm.name} className="h-14 w-14 rounded-xl bg-white p-1.5 object-contain shrink-0" />
            <div className="min-w-0">
              <h1 className="font-heading text-2xl md:text-3xl leading-tight">{firm.name} 完整規則</h1>
              <div className="font-body text-sm mt-1" style={{ color: '#F5A524' }}>
                ★ {firm.rating} · Trustpilot <span className="text-white/40">· 期貨 · 更新 2026/10/17 · 以官網為準</span>
              </div>
            </div>
          </div>
          <p className="font-body text-[15px] text-white/70 mt-4 leading-relaxed">{firm.summary}</p>
          <div className="grid grid-cols-3 gap-2.5 mt-5">
            {firm.metrics.map((m) => (
              <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(53,224,138,.07)', border: '1px solid rgba(53,224,138,.22)' }}>
                <div className="font-heading text-xl md:text-2xl" style={{ color: G }}>{m.value}</div>
                <div className="font-body text-[11px] text-white/50 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
          <nav className="flex flex-wrap gap-2 mt-5">
            {[['#mission', '🎯 任務卡'], ['#tools', '🧮 試算工具'], ['#full', '📖 完整規則']].map(([h, l]) => (
              <a key={h} href={h} className="font-heading text-sm rounded-full px-3.5 py-1.5" style={{ background: 'rgba(255,255,255,.06)', color: '#C7CDD8' }}>{l}</a>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        {/* ── 選方案 → 任務卡 ── */}
        <section id="mission" className="scroll-mt-6 pt-7">
          <h2 className="font-heading text-xl mb-1">🎯 一眼看懂：要完成什麼任務？</h2>
          <p className="font-body text-sm text-white/50 mb-4">選帳號類型和規模，數字會自動換。</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {fm.plans.map((p) => {
              const on = p.id === planId;
              return (
                <button key={p.id} onClick={() => pickPlan(p.id)} className="rounded-lg px-3.5 py-2 text-left transition"
                  style={on ? { background: 'rgba(53,224,138,.15)', border: `1px solid ${G}` } : { background: '#0F141C', border: '1px solid rgba(255,255,255,.12)' }}>
                  <div className="font-heading text-sm" style={{ color: on ? G : '#C7CDD8' }}>{p.name}</div>
                  <div className="font-body text-[11px] mt-0.5" style={{ color: on ? 'rgba(53,224,138,.7)' : '#6B7484' }}>{p.sub}</div>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {sizes.map((sz) => (
              <button key={sz} onClick={() => { setSize(sz); setInit(undefined); }} className="rounded-lg px-4 py-1.5 font-heading text-sm transition"
                style={size === sz ? { background: G, color: '#06110B' } : { background: '#0F141C', border: '1px solid rgba(255,255,255,.12)', color: '#8A93A2' }}>
                {sz}
              </button>
            ))}
          </div>
          <MissionCard plan={plan} size={size} firmName={fm.name} verified={VERIFIED[firmId]}
            actions={<CompareButton firm={firmId} plan={planId} size={size} />} />
        </section>

        {/* ── 互動工具 ── */}
        <div className="pt-8">
          <h2 className="font-heading text-xl mb-1">🧮 玩玩看：用你的數字算</h2>
          <p className="font-body text-sm text-white/50 mb-4">
            目前套用 <b className="text-white/80">{plan.name} · {size}</b> 的規則，上面換方案這裡跟著換。
          </p>
          <ToolsPanel firmId={firmId} firmName={fm.name} code={codeOf(firmId)} plan={plan} size={size} init={init} />
        </div>
      </main>

      <BuyBar firm={firm} />
      <CompareTray aboveBar />
    </div>
  );
}
