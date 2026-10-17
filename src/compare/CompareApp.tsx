// ===== 比較頁上半部（互動區）=====
// 最多 3 個方案（可跨公司）並排；數字不一樣的列自動標黃。
// 清單來源：網址 ?c=firm.plan.size,… → 否則用這個分頁的比較清單 → 否則預設三個熱門方案。
import { useEffect, useState } from 'react';
import { FIRMS, codeOf } from '../data';
import { FIRMS_M, fill, firmOf, planOf, sizesOf, type Plan, type SizeKey, type Spec } from '../missions';
import { MAX_COMPARE, compareKey, parseKey, setCompare } from '../lib/compare';
import { KEYS, local, qs } from '../lib/store';
import { fmt, knownPrice, simulate } from '../tools/calc';
import { CopyBtn, MoneyInput } from '../tools/ui';

const G = '#35E08A', A = '#F5A524';
const DEFAULT = ['lucid.flex.50K', 'tradeify.flex.50K', 'apex.pa-eod.50K'];

type Item = { firm: string; plan: string; size: SizeKey };
const valid = (k: string): Item | null => {
  const { firm, plan, size } = parseKey(k);
  return planOf(firm, plan) && sizesOf(firm, plan).includes(size as SizeKey) ? { firm, plan, size: size as SizeKey } : null;
};

export default function CompareApp() {
  const [items, setItems] = useState<Item[]>(DEFAULT.map((k) => valid(k)!));
  const [daily, setDaily] = useState<number | ''>(300);

  useEffect(() => {
    const fromUrl = qs().get('c')?.split(',') ?? [];
    const fromSession = (() => { try { return JSON.parse(sessionStorage.getItem(KEYS.compare) ?? '[]') as string[]; } catch { return []; } })();
    const src = fromUrl.length ? fromUrl : fromSession;
    const list = src.map(valid).filter((x): x is Item => !!x).slice(0, MAX_COMPARE);
    if (list.length) setItems(list);
    setDaily(local.get<{ daily?: number }>(KEYS.calc, {}).daily ?? 300);
  }, []);

  const update = (next: Item[]) => {
    setItems(next);
    setCompare(next.map((i) => compareKey(i.firm, i.plan, i.size)));
  };

  const cols = items.map((it) => {
    const plan = planOf(it.firm, it.plan)!;
    const s = plan.sizes[it.size]!;
    const firm = FIRMS.find((f) => f.id === it.firm)!;
    return { it, plan, s, firm };
  });

  const rows: { label: string; get: (c: (typeof cols)[number]) => string; tone?: string }[] = [
    { label: '價格（考試費）', get: (c) => { const p = knownPrice(c.it.firm, c.it.plan, c.it.size); return p ? fmt(p) : '見官網'; } },
    { label: '回撤型態', get: (c) => (c.plan.dd === 'EOD' ? 'EOD 收盤結算' : 'Intraday 盤中即時') },
    { label: '① 考試目標', get: (c) => (c.plan.exam === null ? '免考試' : c.s.target ? `+${c.s.target}` : '—'), tone: '#5B9DF4' },
    { label: '考試條件', get: (c) => chips(c.plan.exam, c.s, c.plan) },
    { label: '🚫 最大虧損', get: (c) => c.s.maxLoss, tone: '#F45B5B' },
    { label: '日虧損上限', get: (c) => c.s.dll ?? '無' },
    { label: '② 出金條件', get: (c) => chips(c.plan.payout, c.s, c.plan) },
    { label: '💰 單次最多領', get: (c) => c.s.cap, tone: G },
    { label: '分潤', get: (c) => c.plan.split },
    { label: '最低出金', get: (c) => c.s.minPayout ?? '—' },
    { label: '③ 轉真倉', get: (c) => c.plan.toLive ?? '—' },
    {
      label: `🧮 每天賺 ${daily === '' ? '—' : fmt(+daily)}`, tone: A,
      get: (c) => {
        const r = simulate(c.plan, c.it.size, daily === '' ? 0 : +daily, knownPrice(c.it.firm, c.it.plan, c.it.size));
        return r.ok ? `第 ${(r.examDays ?? 0) + r.payDays} 天拿到第一筆 · 實拿 ${fmt(r.takeHome)}` : r.reason;
      },
    },
  ];

  return (
    <div className="font-body text-white pb-10">
      <header className="border-b border-white/10" style={{ background: 'linear-gradient(180deg,#0F141C,#0C0F14)' }}>
        <div className="max-w-6xl mx-auto px-4 pt-5 pb-6">
          <a href="/" className="font-body text-sm text-white/50 hover:text-white">← PropFirmTW 首頁</a>
          <h1 className="font-heading text-2xl md:text-3xl mt-3">台灣 Prop Firm 比較 2026</h1>
          <p className="font-body text-[15px] text-white/60 mt-1.5">挑最多 {MAX_COMPARE} 個方案（可以跨公司）並排看，<span style={{ color: A }}>黃色＝這列每家不一樣</span>。</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex flex-wrap items-end gap-4 mb-5">
          <div className="w-full sm:w-72">
            <MoneyInput label="試算：平均每天賺多少" value={daily} max={3000} step={25}
              onChange={(v) => { setDaily(v); if (v !== '') local.set(KEYS.calc, { ...local.get(KEYS.calc, {}), daily: v }); }} />
          </div>
          <CopyBtn label="🔗 複製這個比較的連結" text={() => `${location.origin}/compare.html?c=${items.map((i) => compareKey(i.firm, i.plan, i.size)).join(',')}`} />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10" style={{ background: '#0F141C' }}>
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-36 p-3" style={{ background: '#0F141C' }} />
                {cols.map((c, i) => (
                  <th key={i} className="p-3 align-top text-left">
                    <Picker item={c.it} onChange={(n) => update(items.map((x, j) => (j === i ? n : x)))}
                      onRemove={items.length > 1 ? () => update(items.filter((_, j) => j !== i)) : undefined} />
                  </th>
                ))}
                {items.length < MAX_COMPARE && (
                  <th className="p-3 align-top w-40">
                    <button onClick={() => update([...items, valid(DEFAULT.find((d) => !items.some((i) => compareKey(i.firm, i.plan, i.size) === d)) ?? DEFAULT[0])!])}
                      className="w-full rounded-xl border border-dashed border-white/20 py-6 font-heading text-sm text-white/60 hover:text-white">＋ 加一個</button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const vals = cols.map(r.get);
                const diff = new Set(vals).size > 1;
                return (
                  <tr key={r.label} className="border-t border-white/[.07]">
                    <th className="sticky left-0 z-10 p-3 text-left font-heading text-[13px] text-white/70 align-top"
                      style={{ background: diff ? '#1A1608' : '#0F141C', boxShadow: diff ? `inset 3px 0 0 ${A}` : undefined }}>
                      {r.label}
                    </th>
                    {vals.map((v, i) => (
                      <td key={i} className="p-3 align-top text-[14px] leading-relaxed whitespace-pre-line"
                        style={{ color: r.tone ?? 'rgba(255,255,255,.85)', background: diff ? 'rgba(245,165,36,.04)' : undefined }}>
                        {v}
                      </td>
                    ))}
                    {items.length < MAX_COMPARE && <td />}
                  </tr>
                );
              })}
              <tr className="border-t border-white/[.07]">
                <th className="sticky left-0 z-10 p-3" style={{ background: '#0F141C' }} />
                {cols.map((c, i) => (
                  <td key={i} className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <a href={c.firm.link} target="_blank" rel="sponsored nofollow noopener"
                        className="rounded-lg px-3 py-2 font-heading text-sm" style={{ background: G, color: '#06110B' }}>購買 ↗</a>
                      <a href={`/rules/${c.it.firm}.html?plan=${c.it.plan}&size=${c.it.size}`}
                        className="rounded-lg px-3 py-2 font-heading text-sm" style={{ background: 'rgba(255,255,255,.06)', color: '#C7CDD8' }}>看規則</a>
                    </div>
                    {codeOf(c.it.firm) && <div className="font-body text-xs text-white/45 mt-1.5">折扣碼 <b style={{ color: G }}>{codeOf(c.it.firm)}</b></div>}
                  </td>
                ))}
                {items.length < MAX_COMPARE && <td />}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="font-body text-xs text-white/40 mt-3">試算假設每天穩定獲利、沒有虧損日，只是最快情況。價格只列本站有收錄的 50K 方案。</p>
      </main>
    </div>
  );
}

function chips(items: Plan['exam'], s: Spec, plan: Plan): string {
  if (items === null) return '—';
  return (items ?? []).map(([icon, t]) => `${icon} ${fill(t, s, plan)}`).join('\n');
}

/** 三層下拉：公司 → 方案 → 規模 */
function Picker({ item, onChange, onRemove }: { item: Item; onChange: (i: Item) => void; onRemove?: () => void }) {
  const sel = 'w-full rounded-lg px-2 py-1.5 font-body text-[13px] text-white outline-none';
  const st = { background: '#0B0F15', border: '1px solid rgba(255,255,255,.14)' };
  const firstSize = (f: string, p: string) => { const s = sizesOf(f, p); return s.includes('50K') ? '50K' : s[0]; };
  return (
    <div className="space-y-1.5 min-w-[150px]">
      <div className="flex items-center gap-2">
        <span className="font-heading text-sm text-white">{firmOf(item.firm).name.split(' ')[0]}</span>
        {onRemove && <button onClick={onRemove} className="ml-auto text-white/35 hover:text-white text-sm" aria-label="移除">✕</button>}
      </div>
      <select className={sel} style={st} value={item.firm} onChange={(e) => {
        const f = e.target.value; const p = firmOf(f).plans[0].id; onChange({ firm: f, plan: p, size: firstSize(f, p) });
      }}>
        {FIRMS_M.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <select className={sel} style={st} value={item.plan} onChange={(e) => {
        const p = e.target.value; const s = sizesOf(item.firm, p); onChange({ ...item, plan: p, size: s.includes(item.size) ? item.size : firstSize(item.firm, p) });
      }}>
        {firmOf(item.firm).plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <select className={sel} style={st} value={item.size} onChange={(e) => onChange({ ...item, size: e.target.value as SizeKey })}>
        {sizesOf(item.firm, item.plan).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}
