import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Preloader from './components/Preloader';
import Chrome from './components/Chrome';
import NotificationBell from './components/NotificationBell';
import Discord from './components/Discord';
import FirmAnim from './components/FirmAnim';
import { ArrowUpRight } from './components/icons';
import { FIRMS, OFFERS, PRICES, QUIZ, recommend } from './data';
import { copyCode } from './lib/confetti';

// 規則頁在新視窗開啟（避免 Modal 卡住）
const openRules = (id: string) => window.open(`/rules/${id}.html`, '_blank', 'noopener');
// 推廣連結：一點直接前往官網購買頁
const buy = (url: string) => window.open(url, '_blank', 'noopener');

const DISCORD = 'https://discord.gg/YGWXTN7qcd';
const FAQ = [
  ['Prop Firm 是什麼？', '自營商用「先考核、後資助」模式：你付費考試，通過後用他們的（模擬）資金操盤並分潤。'],
  ['出金要多久？', '各家不同，多為 1～2 個工作日。Lucid 支援 WorkMarket 或加密貨幣（USDC / USDT）出金。'],
  ['台灣可以用嗎？', '四家目前台灣皆可使用。付款以主要信用卡 / 簽帳卡為主，部分支援加密貨幣。'],
  ['新手推薦哪家？', '想單純無日風控 → Lucid Flex；想通關快 → Tradeify；想壓成本多帳複製 → Apex。可用首頁「快速選擇」測驗。'],
];

const rise = {
  initial: { filter: 'blur(10px)', opacity: 0, y: 24 },
  whileInView: { filter: 'blur(0px)', opacity: 1, y: 0 },
};
const vp = { once: true, amount: 0.3 } as const;

// 強烈購買按鈕（發光綠）；規則按鈕走低調灰
const BUY = { background: '#35E08A', color: '#06110B', boxShadow: '0 0 26px rgba(53,224,138,.5)' } as const;

function SecHead({ tag, title, sub }: { tag: string; title: string; sub?: string }) {
  return (
    <motion.div className="mb-10" initial={rise.initial} whileInView={rise.whileInView} viewport={vp} transition={{ duration: 0.7 }}>
      <div className="font-body text-sm text-[#F5A524] tracking-widest">{tag}</div>
      <h2 className="font-heading text-4xl md:text-5xl mt-2">{title}</h2>
      {sub && <p className="text-white/60 font-body mt-3 max-w-xl">{sub}</p>}
    </motion.div>
  );
}

function Code({ code, onToast }: { code: string; onToast: (m: string) => void }) {
  return (
    <button
      onClick={(e) => copyCode(code, e.clientX, e.clientY, (c) => onToast('已複製折扣碼　' + c))}
      className="glass-hover liquid-glass rounded-lg px-3 py-2 font-body text-sm text-[#F5A524]"
    >
      {code} ⧉
    </button>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [ans, setAns] = useState<Record<string, string>>({});
  const [qi, setQi] = useState(0);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1800); };
  // 展示排序（編輯精選；星等維持真實不造假）
  const ORDER = ['lucid', 'tradeday', 'tradeify', 'apex', 'topstep'];
  const ranked = useMemo(() => [...FIRMS].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id)), []);
  const filtered = useMemo(() => FIRMS.filter((f) => {
    if (filter.risk && !f.risk.includes(filter.risk)) return false;
    if (filter.pay && f.pay !== filter.pay) return false;
    if (filter.dll && f.dll !== filter.dll) return false;
    if (filter.type && f.type !== filter.type) return false;
    return true;
  }), [filter]);
  const setF = (k: string, v: string) => setFilter((s) => (s[k] === v ? (({ [k]: _, ...r }) => r)(s) : { ...s, [k]: v }));

  const rec = ans.dll && ans.speed && ans.goal ? recommend(ans) : null;
  const recFirm = rec ? FIRMS.find((f) => f.id === rec.id)! : null;

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <Chrome />
      <NotificationBell />
      <Discord />

      <AnimatePresence>
        {toast && (
          <motion.div className="fixed bottom-8 left-1/2 z-[9000] -translate-x-1/2 rounded-full px-6 py-3 text-sm font-body font-medium text-black"
            style={{ background: '#35E08A' }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`bg-black transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
        {/* ===== HERO ===== */}
        <section className="relative min-h-screen overflow-hidden flex flex-col">
          <video src="/videos/hero.mp4" autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover z-0" style={{ opacity: 0.7 }} />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />

          <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 pt-6">
            <div className="font-heading text-2xl">PropFirm<span className="text-[#35E08A]">TW</span></div>
            <div className="hidden md:flex liquid-glass rounded-full px-1.5 py-1.5 items-center gap-1">
              {[['公司', 'showcase'], ['優惠', 'offers'], ['價格', 'prices'], ['測驗', 'quiz'], ['篩選', 'compare'], ['客服', 'support']].map(([l, h]) => (
                <a key={h} href={'#' + h} className="px-3 py-2 text-sm font-medium text-white/90 font-body">{l}</a>
              ))}
            </div>
          </nav>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
            <motion.div {...rise} animate={rise.whileInView} transition={{ duration: 0.8, delay: 0.2 }}
              className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2 mb-8">
              <span className="rounded-full bg-white text-black text-xs font-medium px-2 py-0.5 font-body">2026</span>
              <span className="text-sm text-white/90 font-body">給台灣人的一站式 Prop Firm 整合 · 定期更新</span>
            </motion.div>

            <motion.h1 {...rise} animate={rise.whileInView} transition={{ duration: 0.9, delay: 0.35 }}
              className="max-w-4xl text-5xl md:text-7xl font-heading leading-[1.15]">
              找到最適合你的<br /><span className="text-[#35E08A]">Prop Firm</span>
            </motion.h1>

            <motion.p {...rise} animate={rise.whileInView} transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-6 max-w-2xl text-lg text-white/85 font-body leading-relaxed">
              五大期貨與外匯自營商，規則、出金、分潤一頁看懂。規則看錯一條，考試費可能直接沒了。
            </motion.p>

            <motion.div {...rise} animate={rise.whileInView} transition={{ duration: 0.8, delay: 0.85 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
              <a href="#showcase"
                className="glass-hover w-full sm:w-auto flex-1 justify-center rounded-full px-8 py-4 flex items-center gap-2 text-lg font-heading text-black"
                style={{ background: '#35E08A' }}>
                看規則 <ArrowUpRight className="h-5 w-5" />
              </a>
              <a href="#quiz"
                className="glass-hover w-full sm:w-auto flex-1 justify-center liquid-glass-strong rounded-full px-8 py-4 flex items-center justify-center text-lg font-heading">
                快速選擇
              </a>
            </motion.div>
          </div>

          <div className="relative z-10 pb-8 text-center font-body text-xs text-white/50 tracking-widest">向下滑看五家公司 ↓</div>
        </section>

        {/* ===== 公司展示 Showcase（圖左文右 zigzag）===== */}
        <section id="showcase" className="relative">
          {ranked.map((f, i) => {
            const flip = i % 2 === 1;
            return (
              <div key={f.id} className="relative min-h-[90vh] flex items-center px-6 md:px-12 py-16 max-w-6xl mx-auto">
                <div className={`w-full grid md:grid-cols-2 gap-8 md:gap-14 items-center ${flip ? 'md:[direction:rtl]' : ''}`}>
                  {/* 動畫側 */}
                  <motion.div className="[direction:ltr]"
                    initial={{ opacity: 0, x: flip ? 60 : -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={vp}
                    transition={{ duration: 0.7, ease: 'easeOut' }}>
                    <FirmAnim firm={f} />
                  </motion.div>
                  {/* 文字側 */}
                  <motion.div className="[direction:ltr]"
                    initial={{ opacity: 0, x: flip ? -60 : 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={vp}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}>
                    <div className="font-body text-sm text-white/40 tracking-widest mb-3">
                      NO.{String(i + 1).padStart(2, '0')} · {f.type === 'cfd' ? '外匯 / CFD' : '期貨'}
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <img src={f.logo} alt={f.name} className="h-14 w-14 rounded-xl bg-white p-1.5 object-contain" />
                      <div>
                        <div className="font-heading text-3xl md:text-4xl">{f.name}</div>
                        <div className="font-body text-sm mt-0.5" style={{ color: '#F5A524' }}>★ {f.rating} · Trustpilot</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-6 my-6">
                      {f.metrics.map((m) => (
                        <div key={m.label}>
                          <div className="font-heading text-2xl md:text-3xl text-[#35E08A]">{m.value}</div>
                          <div className="font-body text-xs text-white/50 mt-1">{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-white/75 font-body text-lg leading-relaxed max-w-md">{f.summary}</p>
                    <div className="mt-7 flex items-center gap-4 flex-wrap">
                      <button onClick={() => buy(f.link)}
                        className="glass-hover rounded-full px-7 py-3.5 flex items-center gap-2 font-heading text-lg"
                        style={BUY}>
                        直接購買 <ArrowUpRight className="h-5 w-5" />
                      </button>
                      <button onClick={() => openRules(f.id)}
                        className="glass-hover liquid-glass rounded-full px-5 py-3 flex items-center gap-2 font-heading text-white/60">
                        看完整規則
                      </button>
                      {f.code && <Code code={f.code} onToast={showToast} />}
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ===== 優惠 ===== */}
        <section id="offers" className="relative px-6 md:px-12 py-24 max-w-5xl mx-auto">
          <SecHead tag="// 本月優惠" title="當期有效折扣" sub="只列真實、未過期的活動。以官網結帳金額為準。" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {OFFERS.map((o, i) => (
              <motion.div key={i} className="liquid-glass rounded-2xl p-6"
                initial={rise.initial} whileInView={rise.whileInView} viewport={vp} transition={{ duration: 0.6, delay: i * 0.1 }}>
                <h4 className="font-heading text-xl">{o.firm}</h4>
                <div className="font-body my-3">
                  {o.old && <span className="text-white/40 line-through text-sm mr-2">{o.old}</span>}
                  <span className="text-[#35E08A] text-2xl font-bold">{o.now}</span>
                </div>
                <p className="text-white/60 text-sm font-body">{o.note}</p>
                <p className="text-[#F5A524] font-body text-xs mt-2">⏳ {o.deadline}</p>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {o.code && <Code code={o.code} onToast={showToast} />}
                  <button onClick={() => buy(FIRMS.find((f) => o.link.endsWith(f.id))?.link || '#')}
                    className="glass-hover rounded-lg px-3 py-2 font-heading text-sm text-black" style={{ background: '#35E08A' }}>直接購買 ↗</button>
                  <span className="font-body text-[10.5px] text-white/40">推薦連結</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== 價格比較 ===== */}
        <section id="prices" className="relative px-6 md:px-12 py-24 max-w-5xl mx-auto">
          <SecHead tag="// 價格" title="價格比較（以 50K 為例）"
            sub="Apex 過關要付啟動費，總成本不一定最低。定價常有 70–90% 折扣，實際以官網結帳為準。" />

          {/* 快速購買：最重要的連結一眼可見（不用捲表格） */}
          <div className="flex flex-wrap gap-3 mb-8">
            {PRICES.map((p, i) => (
              <button key={i} onClick={() => buy(p.link)}
                className="glass-hover rounded-2xl px-5 py-4 flex items-center gap-3 text-left"
                style={{ background: '#0F141C', border: '1px solid rgba(53,224,138,.35)' }}>
                <img src={p.logo} alt={p.name} className="h-9 w-9 rounded-lg bg-white p-1 object-contain" />
                <span>
                  <span className="block font-heading text-white leading-tight">{p.name}</span>
                  <span className="block font-heading text-lg leading-tight" style={{ color: p.total === '無折扣' ? '#8A93A2' : '#35E08A' }}>{p.total}</span>
                </span>
                <span className="ml-1 rounded-full px-3 py-2 font-heading text-sm text-black whitespace-nowrap" style={BUY}>直接購買 ↗</span>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 overflow-x-auto" style={{ background: '#0F141C' }}>
            <table className="w-full text-left" style={{ minWidth: 720, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1B2230' }}>
                  {['公司', '付費模式', '考試費（定價）', '啟動費', '折後總成本', '折扣碼'].map((h) => (
                    <th key={h} className="px-4 py-3 font-heading text-sm text-white/80 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRICES.map((p, i) => (
                  <tr key={i} style={{ background: i % 2 ? '#141A24' : '#10151D' }}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={p.logo} alt={p.name} className="h-9 w-9 rounded-lg bg-white p-1 object-contain" />
                        <span className="font-heading">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-body text-sm text-white/80 whitespace-nowrap">{p.model}</td>
                    <td className="px-4 py-4 font-body text-sm text-white/80">{p.evalFee}</td>
                    <td className="px-4 py-4 font-body text-sm" style={{ color: p.activation.includes('無') ? '#35E08A' : '#F45B5B' }}>{p.activation}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-heading text-xl md:text-2xl" style={{ color: p.total === '無折扣' ? '#8A93A2' : '#35E08A' }}>{p.total}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {p.code
                        ? <Code code={p.code} onToast={showToast} />
                        : <span className="font-body text-xs text-white/35">官網折扣</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="font-body text-sm text-white/50 mt-4 space-y-1">
            <p>⏱️ <b className="text-white/70">考試時限</b>：Apex <span style={{ color: '#F45B5B' }}>限 1 個月內考完</span>；Lucid、Tradeify <span style={{ color: '#35E08A' }}>可考到過（無時限）</span>；Topstep 每月給重置點數。</p>
            <p>※ 按「直接購買」會透過推薦連結前往官網購買頁。價格與折扣以官網結帳金額為準。</p>
          </div>
        </section>

        {/* ===== 測驗 ===== */}
        <section id="quiz" className="relative px-6 md:px-12 py-24 max-w-3xl mx-auto">
          <SecHead tag="// 快速選擇" title="30 秒找到你的 Firm" sub="三題就好，直接給你最合適的一家。" />
          <div className="liquid-glass rounded-3xl p-8 md:p-10">
            <div className="h-1 bg-white/10 rounded mb-8 overflow-hidden">
              <div className="h-full bg-[#35E08A] transition-all" style={{ width: (recFirm ? 100 : (qi / QUIZ.length) * 100 || 8) + '%' }} />
            </div>
            {!recFirm ? (
              <div>
                <div className="font-body text-xs text-[#35E08A] tracking-widest mb-2">// 第 {qi + 1} 題</div>
                <h3 className="font-heading text-3xl mb-6">{QUIZ[qi].title}</h3>
                <div className="flex flex-col gap-3">
                  {QUIZ[qi].opts.map((o) => (
                    <button key={o.v} onClick={() => { setAns((a) => ({ ...a, [QUIZ[qi].q]: o.v })); if (qi < QUIZ.length - 1) setQi(qi + 1); }}
                      className="glass-hover liquid-glass rounded-xl text-left px-5 py-4 font-body text-lg hover:translate-x-1 transition-transform">
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <img src={recFirm.logo} alt={recFirm.name} className="h-[72px] w-[72px] rounded-2xl bg-white p-2.5 mx-auto mb-4 object-contain" />
                <div className="font-body text-xs text-[#35E08A] tracking-widest">// 你的推薦</div>
                <h3 className="font-heading text-4xl mt-1">{recFirm.name}</h3>
                <p className="text-white/70 font-body text-lg my-4">{rec!.why}</p>
                {recFirm.code &&
                  <p className="font-body text-sm text-white/80 mb-4">專屬折扣碼 <span className="font-heading" style={{ color: '#35E08A' }}>{recFirm.code}</span>，結帳直接省——<b className="text-white">折扣為限時活動，過期即恢復原價</b>。</p>}
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                  <button onClick={() => buy(recFirm.link)}
                    className="glass-hover rounded-full px-8 py-4 font-heading text-lg flex items-center gap-2" style={BUY}>
                    立即前往購買 <ArrowUpRight className="h-5 w-5" />
                  </button>
                  <button onClick={() => openRules(recFirm.id)} className="glass-hover liquid-glass rounded-full px-6 py-3.5 font-heading text-white/60">先看完整規則</button>
                </div>
                <button onClick={() => { setAns({}); setQi(0); }} className="mt-4 text-sm font-body text-white/40">重新測驗</button>
                <p className="font-body text-[11px] text-white/40 mt-4">※ 依作答簡化推薦，實際規則以官網為準</p>
              </div>
            )}
          </div>
        </section>

        {/* ===== 篩選 + 卡片 ===== */}
        <section id="compare" className="relative px-6 md:px-12 py-24 max-w-5xl mx-auto">
          <SecHead tag="// 篩選" title="依需求篩選" sub="點條件即時篩出符合的自營商。" />
          <div className="liquid-glass rounded-2xl p-6 mb-8 space-y-3">
            {[
              ['核心風控', 'risk', [['EOD 每日結算', 'eod'], ['Intraday 即時', 'intraday']]],
              ['付費方式', 'pay', [['一次性付費', 'once'], ['訂閱月費', 'monthly']]],
              ['日風控', 'dll', [['可選無日風控', 'no']]],
              ['商品', 'type', [['期貨', 'futures'], ['外匯 / CFD', 'cfd']]],
            ].map(([label, key, opts]) => (
              <div key={key as string} className="flex flex-wrap gap-2 items-center">
                <span className="font-body text-sm text-white/50 w-24">{label as string}</span>
                {(opts as string[][]).map(([l, v]) => (
                  <button key={v} onClick={() => setF(key as string, v)}
                    className={`glass-hover font-body text-sm px-4 py-2 rounded-lg border transition ${filter[key as string] === v ? 'bg-[#35E08A] text-black border-[#35E08A]' : 'liquid-glass text-white/80 border-transparent'}`}>
                    {l}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence>
              {filtered.map((f) => (
                <motion.button key={f.id} layout onClick={() => openRules(f.id)}
                  className="glass-hover liquid-glass rounded-2xl p-6 text-left"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
                  <div className="flex items-center gap-3 mb-3">
                    <img src={f.logo} alt={f.name} className="h-11 w-11 rounded-lg bg-white p-1.5 object-contain" />
                    <div>
                      <div className="font-heading text-2xl">{f.name}</div>
                      <div className="font-body text-xs text-[#F5A524]">★ {f.rating}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {f.tags.map((t) => <span key={t} className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/80 font-body">{t}</span>)}
                  </div>
                  <p className="text-[15px] text-white/70 font-body">{f.summary}</p>
                  <span className="inline-block mt-4 text-sm font-body text-[#35E08A]">看完整規則 →</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          {filtered.length === 0 && <p className="text-center text-white/50 font-body mt-8">沒有符合條件的自營商，試著放寬篩選。</p>}
        </section>

        {/* ===== 客服問答 ===== */}
        <section id="support" className="relative px-6 md:px-12 py-24 max-w-3xl mx-auto">
          <SecHead tag="// 客服" title="常見問答與客服" sub="更多問題歡迎加入 Discord 直接問版主。" />
          <div className="space-y-3">
            {FAQ.map(([q, a], i) => (
              <motion.details key={i} className="liquid-glass rounded-xl px-5 py-4"
                initial={rise.initial} whileInView={rise.whileInView} viewport={vp} transition={{ duration: 0.5, delay: i * 0.06 }}>
                <summary className="font-heading text-lg cursor-pointer list-none flex justify-between items-center">
                  {q}<span className="text-[#35E08A]">＋</span>
                </summary>
                <p className="text-white/70 font-body mt-3">{a}</p>
              </motion.details>
            ))}
          </div>
          <motion.a href={DISCORD} target="_blank" rel="noopener"
            className="glass-hover mt-8 rounded-2xl p-6 flex items-center justify-between gap-4"
            style={{ background: 'linear-gradient(135deg,#3B3F8F33,#5865F233)', border: '1px solid rgba(88,101,242,0.4)' }}
            initial={rise.initial} whileInView={rise.whileInView} viewport={vp} transition={{ duration: 0.6 }}>
            <div>
              <div className="font-heading text-2xl">加入 Discord 客服社群</div>
              <div className="font-body text-white/60 text-sm mt-1">即時發問、規則討論、折扣通知，版主與群友都在。</div>
            </div>
            <span className="rounded-full px-5 py-3 font-heading text-white whitespace-nowrap" style={{ background: '#5865F2' }}>前往 →</span>
          </motion.a>
        </section>

        {/* ===== 關於與免責 ===== */}
        <section id="about" className="relative px-6 md:px-12 py-20 max-w-3xl mx-auto">
          <SecHead tag="// ABOUT" title="關於與免責" />
          <div className="rounded-2xl p-6 md:p-8 space-y-4 text-[15px] leading-relaxed font-body text-white/75"
            style={{ background: '#0F141C', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p><b className="font-heading text-white">一站式整合。</b> PropFirmTW 把五大 Prop Firm 的規則用繁體中文整理、定期更新官網與可靠來源，讓你花最少時間挑到適合自己的方案。</p>
            <div className="rounded-xl p-4 border-l-4" style={{ background: 'rgba(244,91,91,0.10)', borderColor: '#F45B5B' }}>
              <b className="font-heading block mb-1" style={{ color: '#F45B5B' }}>⚠️ 風險揭露</b>
              交易期貨與差價合約（CFD）具<b className="text-white">高度風險</b>，可能導致損失全部本金。Prop Firm 約 <b className="text-white">90% 的收入來自失敗交易員的考試費用</b>，請理性評估自身風險承受能力後再參與。
            </div>
            <p><b className="font-heading text-white">非投資建議。</b> 本頁及相關內容僅為個人交易紀錄與教育性質分享，並不構成任何證券、期貨、差價合約或其他金融商品之投資建議或買賣招攬。</p>
            <p><b className="font-heading text-white">以官網為準。</b> Prop Firm 規則、價格與優惠變動頻繁，實際考試與出金前請務必以各家官方網站公告為準，本站不對任何因規則變動造成的損失負責。</p>
            <p><b className="font-heading text-white">商標與連結。</b> 所引用之各公司名稱與商標僅為識別用途，商標權皆屬原公司所有，本站與各公司無隸屬關係。部分連結為聯盟推薦連結。</p>
          </div>
        </section>

        <footer className="px-6 md:px-12 py-10 border-t border-white/10 flex flex-wrap justify-between gap-4 font-body text-sm text-white/40 max-w-5xl mx-auto">
          <span>© 2026 PropFirmTW · 給台灣人的一站式 Prop Firm 整合</span>
          <span>更新 2026/07</span>
        </footer>
      </main>
    </>
  );
}
