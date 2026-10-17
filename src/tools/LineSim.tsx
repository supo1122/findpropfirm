// 📏 帳戶線模擬：拖「目前損益」和「最高曾到」，即時看紅線（爆倉）怎麼追、離過關還差多少
import { useEffect, useState } from 'react';
import type { Plan, SizeKey } from '../missions';
import { fmt, gateLine, lossLine, money, startOf } from './calc';
import { A, Btn, CopyBtn, G, R, Seg, shareUrl } from './ui';

type Phase = 'exam' | 'pay';

export default function LineSim({ firmId, plan, size, init }: {
  firmId: string; plan: Plan; size: SizeKey; init?: { ph?: string; c?: number; pk?: number };
}) {
  const s = plan.sizes[size];
  const start = startOf(size);
  const loss = money(s?.maxLoss);
  const hasExam = plan.exam !== null && !!money(s?.target);
  const [phase, setPhase] = useState<Phase>(hasExam ? 'exam' : 'pay');
  const [cur, setCur] = useState(0);
  const [peak, setPeak] = useState(0);

  useEffect(() => {
    setPhase(init?.ph === 'pay' || (init?.ph === 'exam' && hasExam) ? init.ph : hasExam ? 'exam' : 'pay');
    setCur(init?.c ?? 0);
    setPeak(Math.max(0, init?.pk ?? 0, init?.c ?? 0));
  }, [plan.id, size, init]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!s || !start || !loss) return <Empty />;

  const c = plan.calc;
  // 綠線：考試＝目標；出金＝緩衝／安全網／週期目標（沒有就不畫）
  const gate = phase === 'pay' ? gateLine(plan, s, start) : null;
  const win = phase === 'exam' ? start + (money(s.target) ?? 0) : gate?.floor;
  const winLabel = phase === 'exam' ? '過關線' : gate?.label ?? '';
  const top = Math.max((win ?? start) - start, loss) * 1.25;

  const L = lossLine(start, loss, peak, c?.lock);
  const bal = start + cur;
  const room = bal - L;
  const dead = room <= 0;
  const intraday = plan.dd === 'Intraday';
  const lift = L - (start - loss);

  // 畫面座標
  const lo = start - loss - loss * 0.15, hi = start + top;
  const x = (v: number) => `${Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100))}%`;

  const setC = (v: number) => { setCur(v); if (v > peak) setPeak(v); };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {hasExam && <Seg<Phase> value={phase} onChange={setPhase} options={[{ v: 'exam', label: '① 考試' }, { v: 'pay', label: '② 出金帳號' }]} />}
        <span className="font-body text-xs text-white/45">{intraday ? 'Intraday：最高點含「還沒平倉的浮盈」' : 'EOD：最高點只看「收盤」'}</span>
      </div>

      {/* 大數字 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl p-4" style={{ background: dead ? 'rgba(244,91,91,.18)' : 'rgba(244,91,91,.07)', border: `1px solid ${R}55` }}>
          <div className="font-body text-xs text-white/50">離爆倉還有</div>
          <div className="font-heading text-3xl" style={{ color: R }}>{dead ? '💥 爆倉' : fmt(room)}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'rgba(53,224,138,.07)', border: `1px solid ${G}55` }}>
          <div className="font-body text-xs text-white/50">{win ? `離${winLabel}還差` : '出金門檻'}</div>
          <div className="font-heading text-3xl" style={{ color: G }}>
            {win ? (bal >= win ? '✅ 到了' : fmt(win - bal)) : '賺到就能領'}
          </div>
        </div>
      </div>

      {/* 帳戶線 */}
      <div className="relative h-24 select-none">
        <div className="absolute left-0 right-0 top-9 h-3 rounded-full" style={{ background: 'rgba(255,255,255,.08)' }} />
        <div className="absolute top-9 h-3 rounded-l-full" style={{ left: 0, width: x(L), background: `${R}88` }} />
        {win && <div className="absolute top-9 h-3 rounded-r-full" style={{ left: x(win), right: 0, background: `${G}66` }} />}
        <Mark at={x(L)} color={R} label={`爆倉 ${fmt(L)}`} below />
        <Mark at={x(start)} color="rgba(255,255,255,.55)" label="起始" />
        {win && <Mark at={x(win)} color={G} label={winLabel} />}
        <div className="absolute top-[30px] w-5 h-5 -ml-2.5 rounded-full border-2 border-white transition-all"
          style={{ left: x(bal), background: dead ? R : '#fff', boxShadow: '0 0 12px rgba(255,255,255,.5)' }} />
        {peak > 0 && <div className="absolute top-7 h-7 border-l-2 border-dashed -ml-px" style={{ left: x(start + peak), borderColor: A }} />}
      </div>

      {/* 滑桿 */}
      <div className="grid sm:grid-cols-2 gap-5 mt-2">
        <Slider label="目前損益" value={cur} min={-loss} max={Math.round(top)} color="#fff" onChange={setC} />
        <Slider label={intraday ? '盤中最高曾到（含浮盈）' : '收盤最高曾到'} value={peak} min={0} max={Math.round(top)} color={A}
          onChange={(v) => { setPeak(Math.max(v, cur)); }} />
      </div>

      <div className="mt-4 rounded-xl p-3.5 font-body text-[14px] leading-relaxed text-white/80" style={{ background: 'rgba(255,255,255,.03)' }}>
        {lift > 0
          ? <>紅線已經被你的最高點往上拉了 <b style={{ color: R }}>{fmt(lift)}</b>{c?.lock !== undefined && L >= start + c.lock ? <>，而且已經<b style={{ color: G }}>鎖住不再追</b>（起始{c.lock ? ` + ${fmt(c.lock)}` : ''}）</> : ''}。
            {cur < peak && <> 你從最高點吐回 {fmt(peak - cur)}，容錯空間只剩 {fmt(Math.max(0, room))}。</>}</>
          : <>還沒賺過錢，紅線停在起始 − {fmt(loss)}。</>}
        {c?.lock === undefined && lift > 0 && <span className="text-white/45">（這家的鎖定點請看完整規則）</span>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Btn onClick={() => { setCur(0); setPeak(Math.min(1000, Math.round(top))); }}>
          {intraday ? '示範：浮盈 +$1,000 又吐回去' : '示範：收盤賺 $1,000 隔天吐回'}
        </Btn>
        <Btn onClick={() => { setCur(0); setPeak(0); }}>重設</Btn>
        <CopyBtn label="🔗 複製分享連結" text={() => shareUrl(firmId, { plan: plan.id, size, tool: 'line', ph: phase, c: cur, pk: peak })} />
      </div>
    </div>
  );
}

function Mark({ at, color, label, below }: { at: string; color: string; label: string; below?: boolean }) {
  return (
    <div className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left: at, top: below ? 30 : 0 }}>
      {!below && <span className="font-body text-[11px] whitespace-nowrap mb-0.5" style={{ color }}>{label}</span>}
      <span className="w-[3px] h-6 rounded-full" style={{ background: color }} />
      {below && <span className="font-heading text-[11px] whitespace-nowrap mt-0.5" style={{ color }}>{label}</span>}
    </div>
  );
}

function Slider({ label, value, min, max, color, onChange }: {
  label: string; value: number; min: number; max: number; color: string; onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex justify-between font-body text-xs text-white/50">
        <span>{label}</span><b className="font-heading text-sm" style={{ color }}>{value >= 0 ? '+' : ''}{fmt(value)}</b>
      </div>
      <input type="range" min={min} max={max} step={50} value={value}
        onChange={(e) => onChange(+e.target.value)} className="w-full mt-1.5 accent-[#F5A524]" />
    </label>
  );
}

function Empty() {
  return <div className="font-body text-white/60">這個方案沒有固定規模的帳戶線可以模擬。</div>;
}
