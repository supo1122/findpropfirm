// ⚖️ 一致性計算器：逐日填損益 → 最佳單日佔比、能不能出金／過關、還要再賺多少
// 日誌存在瀏覽器（localStorage），可匯出成檔案備份、換裝置再匯入。
import { useEffect, useRef, useState } from 'react';
import type { Plan, SizeKey } from '../missions';
import { KEYS, download, local } from '../lib/store';
import { checkCons, consModes, fmt, money, pct } from './calc';
import { A, B, Btn, CopyBtn, G, R, Seg, shareUrl } from './ui';

type Phase = 'exam' | 'payout';
type Log = Record<string, number[]>;

export default function ConsCalc({ firmId, plan, size, init }: {
  firmId: string; plan: Plan; size: SizeKey; init?: { ph?: string; e?: number[] };
}) {
  const s = plan.sizes[size];
  const modes = s ? consModes(plan, s) : {};
  const phases = (['exam', 'payout'] as Phase[]).filter((p) => modes[p]);
  const [phase, setPhase] = useState<Phase>(phases[0] ?? 'exam');
  const [days, setDays] = useState<number[]>([]);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const k = `${firmId}.${plan.id}.${size}.${phase}`;

  useEffect(() => {
    const ph = phases.find((p) => p === init?.ph) ?? phases[0] ?? 'exam';
    setPhase(ph);
  }, [plan.id, size, init]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // 分享連結帶進來的資料先顯示；使用者動手改了才會存進他自己的日誌
    if (init?.e?.length) { setDays(init.e); return; }
    setDays(local.get<Log>(KEYS.cons, {})[k] ?? []);
  }, [k, init]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!phases.length) {
    return <div className="rounded-xl p-4 font-body text-[15px]" style={{ background: 'rgba(53,224,138,.07)', border: `1px solid ${G}44` }}>
      🎉 這個方案{plan.exam === null ? '' : '考試和出金'}都<b style={{ color: G }}>沒有一致性限制</b>，不用算。
    </div>;
  }

  const mode = modes[phase]!;
  const save = (v: number[]) => {
    setDays(v);
    const log = local.get<Log>(KEYS.cons, {});
    if (v.length) log[k] = v; else delete log[k];
    local.set(KEYS.cons, log);
  };
  const res = checkCons(days, mode);
  const target = phase === 'exam' ? money(s?.target) : undefined;
  const reached = target ? res.total >= target : true;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {phases.length > 1 && <Seg<Phase> value={phase} onChange={setPhase}
          options={phases.map((p) => ({ v: p, label: p === 'exam' ? '① 考試' : '② 出金帳號' }))} />}
        <span className="font-body text-sm" style={{ color: A }}>規則：{mode.label}</span>
      </div>

      <div className="grid md:grid-cols-[1fr_1.1fr] gap-5">
        {/* 逐日輸入 */}
        <div>
          <div className="font-body text-xs text-white/50 mb-2">每天的損益（虧損填負數）</div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {days.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-body text-xs text-white/40 w-12">第 {i + 1} 天</span>
                <input type="number" inputMode="decimal" value={d}
                  onChange={(e) => save(days.map((x, j) => (j === i ? +e.target.value : x)))}
                  className="flex-1 min-w-0 rounded-lg px-3 py-1.5 font-heading text-white outline-none"
                  style={{ background: '#0B0F15', border: `1px solid ${d === res.best && d > 0 ? A : 'rgba(255,255,255,.14)'}` }} />
                <button onClick={() => save(days.filter((_, j) => j !== i))} className="text-white/35 hover:text-white px-1" aria-label="刪除">✕</button>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Btn tone="solid" onClick={() => save([...days, 0])}>＋ 新增一天</Btn>
            {days.length > 0 && <Btn onClick={() => { if (confirm('清空這個方案的所有紀錄？')) save([]); }}>清空</Btn>}
          </div>
        </div>

        {/* 結果 */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <Stat label="總獲利" value={fmt(res.total)} color={res.total >= 0 ? G : R} />
            <Stat label="最佳單日" value={fmt(res.best)} color={A} />
            <Stat label="佔比" value={res.ratio === null ? '—' : pct(res.ratio)} color={res.ok ? G : R} />
          </div>

          {/* 佔比量尺 */}
          {!mode.ofTarget && (
            <div className="relative h-3 rounded-full mb-5" style={{ background: 'rgba(255,255,255,.08)' }}>
              <div className="absolute inset-y-0 left-0 rounded-full transition-all"
                style={{ width: `${Math.min(100, (res.ratio ?? 0) * 100)}%`, background: res.ok ? G : R }} />
              <div className="absolute -top-1 h-5 w-[3px] rounded" style={{ left: `${mode.ratio * 100}%`, background: '#fff' }} />
              <span className="absolute top-4 -translate-x-1/2 font-body text-[10px] text-white/60" style={{ left: `${mode.ratio * 100}%` }}>上限 {pct(mode.ratio)}</span>
            </div>
          )}

          <div className="font-body text-[15px] leading-relaxed">
            {days.length === 0 ? <span className="text-white/50">← 先填幾天的損益</span>
              : res.ok && reached ? <b style={{ color: G }}>✅ 一致性合格{phase === 'exam' ? '，而且已達考試目標' : '，可以申請出金'}</b>
              : res.ok ? <span><b style={{ color: G }}>✅ 一致性合格</b>，但離考試目標 {fmt(target!)} 還差 <b style={{ color: B }}>{fmt(target! - res.total)}</b></span>
              : mode.ofTarget ? <span><b style={{ color: R }}>❌ 最佳單日超過 {fmt(mode.ofTarget * mode.ratio)}</b>，這筆已違反考試一致性</span>
              : <span><b style={{ color: R }}>❌ 還不行</b>：還要再賺 <b style={{ color: A }}>{fmt(res.need)}</b>，而且之後每天都不能超過 {fmt(res.best)}（不然最佳單日會變更大）</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Btn onClick={() => download(`PFTW-一致性日誌-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ app: 'PFTW', v: 1, log: local.get<Log>(KEYS.cons, {}) }, null, 1))}>⬇️ 匯出備份</Btn>
        <Btn onClick={() => fileRef.current?.click()}>⬆️ 匯入</Btn>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          try {
            const j = JSON.parse(await f.text());
            if (j?.app !== 'PFTW' || typeof j.log !== 'object') throw new Error();
            local.set(KEYS.cons, { ...local.get<Log>(KEYS.cons, {}), ...j.log });
            setDays(j.log[k] ?? local.get<Log>(KEYS.cons, {})[k] ?? []);
            setMsg('✓ 已匯入');
          } catch { setMsg('✕ 這不是 PFTW 的備份檔'); }
          setTimeout(() => setMsg(''), 2500);
        }} />
        {days.length > 0 && <CopyBtn label="🔗 複製分享連結" text={() => shareUrl(firmId, { plan: plan.id, size, tool: 'cons', ph: phase, e: days.join('_') })} />}
        <span className="font-body text-xs text-white/40">{msg || '紀錄只存在你這台裝置的瀏覽器，換手機前記得匯出。'}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="font-body text-[11px] text-white/45">{label}</div>
      <div className="font-heading text-xl" style={{ color }}>{value}</div>
    </div>
  );
}
