import { useState, type ReactNode } from 'react';
import type { Item, Plan, Spec, SizeKey } from '../missions';
import { fill } from '../missions';

const G = '#35E08A', R = '#F45B5B', A = '#F5A524', B = '#5B9DF4';

/** 出金任務卡：① 考試 → ② 出金帳號 → ③ 轉真倉，每階段一個大數字 + 圖示短句 + 帳戶線圖 */
export default function MissionCard({
  plan, size, firmName, verified, actions,
}: { plan: Plan; size: SizeKey; firmName: string; verified?: boolean; actions?: ReactNode }) {
  const s: Spec | undefined = plan.sizes[size];
  if (!s) return null;
  const f = (t: string) => fill(t, s, plan);
  const isLive = plan.id === 'live';

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0F141C', border: '1px solid rgba(255,255,255,.1)' }}>
      <div style={{ height: 4, background: `linear-gradient(90deg,${B},${G},${A})` }} />
      <div className="p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5">
          <span className="font-body text-sm text-white/45">{firmName}</span>
          <span className="font-heading text-white/90">{plan.name}</span>
          <span className="font-heading text-sm px-2.5 py-1 rounded-lg" style={{ background: 'rgba(53,224,138,.14)', color: G }}>{size}</span>
          <span className="font-body text-xs px-2 py-1 rounded-md" style={plan.dd === 'Intraday'
            ? { background: 'rgba(245,165,36,.14)', color: A }
            : { background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)' }}>
            {plan.dd === 'EOD' ? 'EOD 收盤結算回撤' : 'Intraday 盤中即時回撤'}
          </span>
          {(verified === false || plan.unverified) && (
            <span className="font-body text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(245,165,36,.14)', color: A }}>官方核對中</span>
          )}
          {actions && <div className="ml-auto flex flex-wrap gap-2">{actions}</div>}
        </div>

        {isLive ? <LiveView plan={plan} s={s} f={f} /> : <Journey plan={plan} s={s} size={size} f={f} />}

        <Mines items={plan.redlines.map(f)} />

        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-x-5 gap-y-2 font-body text-xs text-white/45">
          {s.minPayout && <span>最低出金 <b className="text-white/75">{s.minPayout}</b></span>}
          {s.contracts && <span>部位上限 <b className="text-white/75">{s.contracts}</b></span>}
          {s.dll && s.dll !== '無' && <span>日虧損上限 <b className="text-white/75">{s.dll}</b></span>}
        </div>

        {plan.tip && (
          <details className="mt-4 rounded-xl group" style={{ background: 'rgba(245,165,36,.08)', border: '1px solid rgba(245,165,36,.28)' }}>
            <summary className="cursor-pointer list-none p-3.5 font-heading text-sm flex items-center justify-between" style={{ color: A }}>
              💡 看例子・細節
              <span className="transition group-open:rotate-180">▾</span>
            </summary>
            <div className="px-3.5 pb-3.5 font-body text-[14px] leading-relaxed text-white/80">{plan.tip}</div>
          </details>
        )}
      </div>
    </div>
  );
}

// ───────── ①考試 → ②出金 → ③真倉 ─────────
function Journey({ plan, s, size, f }: { plan: Plan; s: Spec; size: SizeKey; f: (t: string) => string }) {
  const start = startOf(size);
  const loss = money(s.maxLoss);
  const noExam = plan.exam === null;
  const exam = plan.exam ?? [];
  // 舊資料（沒有 payout）就退回 tasks 全文
  const payout: Item[] = plan.payout ?? plan.tasks.map((t) => ['▸', t]);

  const examWin = start && s.target ? start + (money(s.target) ?? 0) : undefined;
  const g = money(s.goal);
  const payWin = start && g ? (g > start / 2 ? g : start + g) : undefined;

  return (
    <>
      {noExam && (
        <>
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
            <span className="font-heading text-sm shrink-0 rounded-md px-2 py-0.5" style={{ color: '#06110B', background: 'rgba(255,255,255,.4)' }}>① 考試</span>
            <span className="font-body text-[14px] text-white/70"><b className="font-heading text-white/90">免考試</b>・付費直接拿到出金帳號</span>
          </div>
          <div className="flex justify-center py-1.5 font-heading text-white/25">↓</div>
        </>
      )}
      <div className={`grid gap-3 md:gap-2 items-stretch ${noExam ? '' : 'md:grid-cols-[1fr_28px_1fr]'}`}>
        {!noExam && (
          <>
            <Phase n="①" title="考試" color={B} bigLabel="過關目標" big={s.target ? `+${s.target}` : '—'}>
              <Chips items={exam} f={f} color={B} />
              {start && loss && examWin && (
                <RangeBar start={start} loss={loss} win={examWin} winLabel="過關" intraday={plan.dd === 'Intraday'} />
              )}
            </Phase>
            <Arrow />
          </>
        )}

        <Phase n="②" title="出金帳號" color={G} bigLabel="單次最多領" big={s.cap} note={`分潤 ${plan.split}`}>
          <Chips items={payout} f={f} color={G} />
          {start && loss && (
            <RangeBar start={start} loss={loss} win={payWin} winLabel="可出金" intraday={plan.dd === 'Intraday'} />
          )}
        </Phase>
      </div>

      {plan.toLive && (
        <>
          <div className="flex justify-center py-1.5 font-heading text-white/25">↓</div>
          <div className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: 'rgba(245,165,36,.07)', border: `1px solid ${A}40` }}>
            <span className="font-heading text-sm shrink-0 rounded-md px-2 py-0.5" style={{ color: '#06110B', background: A }}>③ 轉真倉</span>
            <span className="font-body text-[14px] leading-relaxed text-white/80">{plan.toLive}</span>
          </div>
        </>
      )}
    </>
  );
}

/** 真倉方案：沒有考試，直接講「怎麼進來」跟「進來後可以幹嘛」 */
function LiveView({ plan, s, f }: { plan: Plan; s: Spec; f: (t: string) => string }) {
  return (
    <>
      {plan.toLive && (
        <div className="rounded-xl p-3.5 flex items-start gap-3 mb-3" style={{ background: 'rgba(91,157,244,.08)', border: `1px solid ${B}40` }}>
          <span className="font-heading text-sm shrink-0 rounded-md px-2 py-0.5" style={{ color: '#06110B', background: B }}>怎麼進來</span>
          <span className="font-body text-[14px] leading-relaxed text-white/80">{plan.toLive}</span>
        </div>
      )}
      <Phase n="🏦" title="真倉可以幹嘛" color={A} bigLabel="出金上限" big={s.cap} note={`分潤 ${plan.split}`}>
        <Chips items={plan.tasks.map((t) => ['✅', t] as Item)} f={f} color={A} />
      </Phase>
    </>
  );
}

function Phase({ n, title, color, big, bigLabel, note, children }: {
  n: string; title: string; color: string; big: string; bigLabel?: string; note?: string; children?: ReactNode;
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col" style={{
      background: `${color}0D`,
      border: `1px solid ${color}40`,
    }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-heading text-sm rounded-md px-2 py-0.5" style={{ color: '#06110B', background: color }}>{n} {title}</span>
      </div>
      {bigLabel && <div className="font-body text-[11px] text-white/45">{bigLabel}</div>}
      <div className="font-heading leading-tight mb-1" style={{ color, fontSize: big.length > 12 ? '17px' : '28px' }}>{big}</div>
      {note && <div className="font-body text-xs text-white/45 mb-3">{note}</div>}
      {children}
    </div>
  );
}

function Chips({ items, f, color }: { items: Item[]; f: (t: string) => string; color: string }) {
  return (
    <ul className="space-y-1.5 mt-1">
      {items.map(([icon, t], i) => (
        <li key={i} className="flex items-start gap-2.5 rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,.035)' }}>
          <span className="shrink-0 w-5 text-center">{icon}</span>
          <span className="font-body text-[14px] leading-snug text-white/85">{highlight(f(t), color)}</span>
        </li>
      ))}
    </ul>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center font-heading text-white/25">
      <span className="hidden md:inline">→</span>
      <span className="md:hidden">↓</span>
    </div>
  );
}

/** 帳戶線：紅＝爆倉線、灰＝起始、綠＝過關／可出金線。一眼看出離兩邊各多遠 */
function RangeBar({ start, loss, win, winLabel, intraday }: {
  start: number; loss: number; win?: number; winLabel: string; intraday?: boolean;
}) {
  const lo = start - loss;
  const hi = win ?? start + loss;
  const pad = (hi - lo) * 0.14;
  const min = lo - pad, max = hi + pad;
  const pos = (v: number) => ((v - min) / (max - min)) * 100;
  const pl = pos(lo), ps = pos(start), pw = win ? pos(win) : 100;

  return (
    <div className="mt-auto pt-4">
      <div className="font-body text-[10px] text-white/35 mb-1.5 tracking-wider">帳戶線（以起始餘額為準）</div>
      <div className="relative h-2.5 rounded-full" style={{
        background: `linear-gradient(90deg, ${R}66 0%, ${R}66 ${pl}%, rgba(255,255,255,.1) ${pl}%, rgba(255,255,255,.1) ${pw}%, ${G}66 ${pw}%)`,
      }}>
        <Pin at={pl} color={R} />
        <Pin at={ps} color="rgba(255,255,255,.7)" />
        {win && <Pin at={pw} color={G} />}
      </div>
      <div className="relative h-10 mt-1.5 font-body text-[11px] leading-tight">
        <Label at={pl} color={R} top={`−${fmt(loss)}`} sub="爆倉" />
        <Label at={ps} color="rgba(255,255,255,.55)" top={fmt(start)} sub="起始" />
        {win
          ? <Label at={pw} color={G} top={`+${fmt(win - start)}`} sub={winLabel} />
          : <Label at={100} color={G} top="賺到就能領" sub="→" />}
      </div>
      {intraday && (
        <div className="font-body text-[11px] mt-0.5" style={{ color: A }}>⚠️ Intraday：紅線會跟著最高餘額（含浮盈）往上追</div>
      )}
    </div>
  );
}

function Pin({ at, color }: { at: number; color: string }) {
  return <span className="absolute -top-1 w-[3px] h-[18px] rounded-full" style={{ left: `calc(${at}% - 1.5px)`, background: color }} />;
}

function Label({ at, color, top, sub }: { at: number; color: string; top: string; sub: string }) {
  const tx = at < 14 ? '0' : at > 86 ? '-100%' : '-50%';
  const align = at < 14 ? 'left' : at > 86 ? 'right' : 'center';
  return (
    <div className="absolute whitespace-nowrap" style={{ left: `${at}%`, transform: `translateX(${tx})`, textAlign: align as 'left' }}>
      <div className="font-heading" style={{ color }}>{top}</div>
      <div className="text-white/40">{sub}</div>
    </div>
  );
}

/** 🚫 地雷區：先露 2 條，其餘收起來 */
function Mines({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, 2);
  return (
    <div className="mt-5 rounded-xl p-4" style={{ background: 'rgba(244,91,91,.06)', border: `1px solid ${R}33` }}>
      <div className="font-heading text-sm mb-2.5" style={{ color: R }}>🚫 地雷：碰到就出事</div>
      <ul className="space-y-2">
        {shown.map((t, i) => (
          <li key={i} className="font-body text-[14px] text-white/80 pl-5 relative leading-relaxed">
            <span className="absolute left-0" style={{ color: R }}>✕</span>
            {highlight(t, R)}
          </li>
        ))}
      </ul>
      {items.length > 2 && (
        <button onClick={() => setOpen(!open)} className="mt-2.5 font-body text-xs underline underline-offset-4" style={{ color: `${R}CC` }}>
          {open ? '收起' : `還有 ${items.length - 2} 條 ▾`}
        </button>
      )}
    </div>
  );
}

// ───────── 小工具 ─────────
const startOf = (size: SizeKey) => { const m = /^(\d+)K$/.exec(size); return m ? +m[1] * 1000 : undefined; };
/** 取字串中第一個 $金額 */
const money = (str?: string) => { const m = str?.match(/\$([\d,]+)/); return m ? +m[1].replace(/,/g, '') : undefined; };
const fmt = (n: number) => '$' + n.toLocaleString('en-US');

/** 把 $金額 / 百分比 變粗變色，讓數字一眼可見 */
function highlight(text: string, color: string) {
  const parts = text.split(/(\$[\d,]*\d(?:\.\d+)?|\d+%)/g);
  return parts.map((p, i) =>
    /^(\$[\d,]|\d+%)/.test(p)
      ? <b key={i} className="font-heading" style={{ color }}>{p}</b>
      : <span key={i}>{p}</span>
  );
}
