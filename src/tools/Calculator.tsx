// 🧮 出金試算器（簡單版）：輸入「平均每天賺多少」→ 幾天過關、幾天第一次出金、領多少、實拿多少
import { useEffect, useState } from 'react';
import type { Plan, SizeKey } from '../missions';
import { KEYS, local } from '../lib/store';
import { fmt, knownPrice, simulate } from './calc';
import { downloadCard } from './shareCard';
import { A, Arrow, B, Btn, CopyBtn, G, MoneyInput, Tile, shareUrl } from './ui';

type Saved = { daily?: number; price?: Record<string, number> };

export default function Calculator({ firmId, firmName, code, plan, size, init }: {
  firmId: string; firmName: string; code?: string; plan: Plan; size: SizeKey;
  init?: { d?: number; price?: number };
}) {
  const key = `${firmId}.${plan.id}.${size}`;
  const [daily, setDaily] = useState<number | ''>(300);
  const [price, setPrice] = useState<number | ''>(knownPrice(firmId, plan.id, size) ?? '');

  // 讀上次輸入（第一次渲染不讀，避免與預先產生的 HTML 不一致）；網址參數優先
  useEffect(() => {
    const s = local.get<Saved>(KEYS.calc, {});
    setDaily(init?.d ?? s.daily ?? 300);
    setPrice(init?.price ?? s.price?.[key] ?? knownPrice(firmId, plan.id, size) ?? '');
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = (patch: Partial<{ daily: number | ''; price: number | '' }>) => {
    const s = local.get<Saved>(KEYS.calc, {});
    if (patch.daily !== undefined && patch.daily !== '') s.daily = patch.daily;
    if (patch.price !== undefined) {
      s.price = { ...s.price };
      if (patch.price === '') delete s.price[key]; else s.price[key] = patch.price;
    }
    local.set(KEYS.calc, s);
  };

  const r = simulate(plan, size, daily === '' ? 0 : daily, price === '' ? undefined : price);
  const title = `${firmName} ${plan.name}`;

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <MoneyInput label="平均每天賺多少（只算獲利日）" value={daily} max={3000} step={25}
          onChange={(v) => { setDaily(v); save({ daily: v }); }} />
        <MoneyInput label={`考試費${knownPrice(firmId, plan.id, size) ? '（已帶入本站價格，可改）' : '（自己填，選填）'}`}
          value={price} max={600} step={1} slider={false}
          onChange={(v) => { setPrice(v); save({ price: v }); }} />
      </div>

      {!r.ok ? (
        <div className="rounded-xl p-4 font-body text-[15px]" style={{ background: 'rgba(245,165,36,.08)', border: `1px solid ${A}55`, color: '#F2D9A8' }}>
          ⚠️ {r.reason}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 items-stretch">
            <Tile label="① 考試" value={r.examDays === null ? '免考試' : `${r.examDays} 天`} color={B}
              sub={r.examDays === null ? '直接開帳' : '最快過關'} />
            <Arrow />
            <Tile label="② 出金帳號" value={`${r.payDays} 天`} color={G} sub="可申請第一次出金" />
            <Arrow />
            <Tile label="第一次可領" value={fmt(r.amount)} color={G} sub={`實拿 ${fmt(r.takeHome)}（分潤後）`} />
            <Arrow />
            <Tile label="扣掉考試費" value={r.net === undefined ? '—' : fmt(r.net)} color={r.net !== undefined && r.net < 0 ? '#F45B5B' : A}
              sub={r.net === undefined ? '填考試費才算' : '第一次出金淨賺'} />
          </div>
          <div className="mt-3 font-body text-xs text-white/45 leading-relaxed">
            總共約 <b className="text-white/80">{(r.examDays ?? 0) + r.payDays} 個交易日</b> 拿到第一筆錢。
            ⚠️ 假設每天穩定賺、沒有虧損日——實際一定會有虧損日，請當作「最快情況」。
            {r.notes.map((n) => <span key={n}><br />ℹ️ {n}</span>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyBtn label="🔗 複製分享連結" text={() => shareUrl(firmId, { plan: plan.id, size, tool: 'calc', d: daily, ...(price !== '' ? { price } : {}) })} />
            <Btn onClick={() => downloadCard(`PFTW-${firmId}-${plan.id}-${size}.png`, {
              title, sub: `${size} · 每天賺 ${fmt(+daily)}`,
              rows: [
                { label: '① 考試', value: r.examDays === null ? '免考試' : `${r.examDays} 天`, color: B },
                { label: '② 出金帳號第幾天可領', value: `第 ${r.payDays} 天`, color: G },
                { label: '可領 → 實拿', value: `${fmt(r.amount)} → ${fmt(r.takeHome)}`, color: G },
                ...(r.net !== undefined ? [{ label: '扣考試費淨賺', value: fmt(r.net), color: A }] : []),
              ],
              code,
              foot: 'propfirmtw.com · 試算假設每天穩定獲利，非投資建議',
            })}>🖼 下載圖卡</Btn>
          </div>
        </>
      )}
    </div>
  );
}
