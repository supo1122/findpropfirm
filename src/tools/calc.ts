// ===== 試算引擎：出金試算器／帳戶線模擬／一致性計算器共用 =====
// 全部是純函式，數字一律從 missions.ts 的 Spec 字串解析，規則從 plan.calc 來。
import type { Plan, SizeKey, Spec } from '../missions';
import { PRICES } from '../data';

/** 取字串中第一個 $金額 */
export const money = (str?: string): number | undefined => {
  const m = str?.match(/\$([\d,]+(?:\.\d+)?)/);
  return m ? +m[1].replace(/,/g, '') : undefined;
};
export const fmt = (n: number) => (n < 0 ? '−' : '') + '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
export const startOf = (size: SizeKey): number | undefined => {
  const m = /^(\d+)K$/.exec(size);
  return m ? +m[1] * 1000 : undefined;
};
export const pct = (x: number) => `${Math.round(x * 100)}%`;

/** 出金前要站上的線（餘額）。null＝沒有這種門檻 */
export function gateLine(plan: Plan, s: Spec, start: number): { floor: number; label: string } | null {
  const c = plan.calc;
  const g = money(s.goal);
  if (!c?.gate || g === undefined) return null;
  if (c.gate === 'balance') {
    // Apex 的 goal 寫「$52,600（安全網 $52,100 ＋ 最低出金 $500）」→ 能領的是安全網以上
    const net = /安全網 \$([\d,]+)/.exec(s.goal ?? '');
    return { floor: net ? +net[1].replace(/,/g, '') : g, label: net ? '安全網' : '緩衝線' };
  }
  if (c.gate === 'profit') return { floor: start + g, label: '緩衝線' };
  return { floor: start + g, label: '週期目標' };
}

// ───────── 出金試算 ─────────
export type CalcResult =
  | { ok: false; reason: string }
  | {
      ok: true;
      examDays: number | null; // null＝免考試
      payDays: number;
      amount: number;
      takeHome: number;
      split: number;
      price?: number;
      net?: number;
      notes: string[];
    };

/** 假設每天穩定賺 daily、沒有虧損日，算「幾天過考試 → 幾天第一次出金 → 領多少」 */
export function simulate(plan: Plan, size: SizeKey, daily: number, price?: number): CalcResult {
  const c = plan.calc;
  const s = plan.sizes[size];
  const start = startOf(size);
  if (!c || !s || !start) return { ok: false, reason: '這個方案不適用試算（真倉或單一規格）' };
  if (!(daily > 0)) return { ok: false, reason: '請輸入每天平均賺多少' };
  const notes: string[] = [];

  // ① 考試
  let examDays: number | null = null;
  if (plan.exam !== null) {
    const target = money(s.target);
    if (!target) return { ok: false, reason: '這個規模沒有考試目標資料' };
    if (c.examConsOfTarget && c.examCons && daily > c.examCons * target)
      return { ok: false, reason: `單日賺 ${fmt(daily)} 會違反考試一致性（最佳單日要 ≤ ${fmt(c.examCons * target)}），請把每日獲利調低` };
    let n = Math.ceil(target / daily);
    if (c.examDays) n = Math.max(n, c.examDays);
    if (c.examCons && !c.examConsOfTarget) n = Math.max(n, Math.ceil(1 / c.examCons - 1e-9));
    examDays = n;
  }

  // ② 出金帳號（從起始餘額重新算）
  const minDay = money(s.minDay);
  if (c.payDays && minDay && daily < minDay)
    return { ok: false, reason: `每天要賺 ≥ ${fmt(minDay)} 才算「獲利日」，目前 ${fmt(daily)} 永遠湊不滿 ${c.payDays} 天` };
  const cap = c.noCap ? undefined : money(s.cap);
  const minPayout = money(s.minPayout) ?? 0;
  const gate = gateLine(plan, s, start);

  for (let n = 1; n <= 365; n++) {
    const P = n * daily;
    const bal = start + P;
    if (c.payDays && n < c.payDays) continue;
    if (c.payTradeDays && n < c.payTradeDays) continue;
    if (c.payCons && daily > c.payCons * P + 1e-9) continue;
    if (gate && bal < gate.floor + (c.amount === 'aboveGate' ? minPayout : 0)) continue;
    if (c.amount === 'double' && gate && bal - daily < gate.floor) continue; // 過緩衝後隔天才算

    let amt =
      c.amount === 'half' ? P * 0.5
      : c.amount === 'aboveGate' ? bal - (gate?.floor ?? start)
      : c.amount === 'double' ? daily * 2
      : P;
    if (cap !== undefined) amt = Math.min(amt, cap);
    if (amt < minPayout || amt <= 0) continue;

    const takeHome = c.splitTier ? tierSplit(P, amt) : amt * c.split;
    if (c.splitTier && P < 4000) notes.push('TradeDay：當前利潤沒過 $4,000，這筆只分 50%');
    if (c.note) notes.push(c.note);
    return {
      ok: true, examDays, payDays: n, amount: amt, takeHome, split: c.split,
      price, net: price !== undefined ? takeHome - price : undefined, notes,
    };
  }
  return { ok: false, reason: '一年內都達不到出金條件，請調高每日獲利' };
}

/** TradeDay Quick Pay：利潤 $4,000 以上的部分 80%、以下 50% */
function tierSplit(profit: number, w: number) {
  const above = Math.max(0, Math.min(w, profit - 4000));
  return above * 0.8 + (w - above) * 0.5;
}

/** 本站有收錄 50K 價格的方案 → 自動帶入考試費（其他規模/方案讓使用者自己填） */
const PRICE_NAME: Record<string, string> = {
  'lucid.flex': 'Lucid · Flex',
  'lucid.pro': 'Lucid · Pro',
  'tradeify.flex': 'Tradeify · Select',
  'tradeify.daily': 'Tradeify · Select',
  'tradeify.growth': 'Tradeify · Growth',
  'tradeday.qp-ind': 'TradeDay · Quick Pay',
  'tradeday.qp-eod': 'TradeDay · Quick Pay',
  'tradeday.fp': 'TradeDay · Fast Pass',
  'topstep.xfa-std': 'Topstep · 標準',
  'topstep.xfa-cons': 'Topstep · 標準',
};
export function knownPrice(firmId: string, planId: string, size: SizeKey): number | undefined {
  if (size !== '50K') return undefined;
  const p = PRICES.find((x) => x.name === PRICE_NAME[`${firmId}.${planId}`]);
  return money(p?.total);
}

// ───────── 帳戶線 ─────────
/** 追蹤回撤：紅線 = 起始 − 回撤 + 最高點獲利，爬到「起始 + lock」就停 */
export function lossLine(start: number, maxLoss: number, peakProfit: number, lock?: number) {
  const line = start - maxLoss + Math.max(0, peakProfit);
  return lock === undefined ? line : Math.min(line, start + lock);
}

// ───────── 一致性 ─────────
export type ConsMode = { ratio: number; ofTarget?: number; label: string };
/** 這個方案有哪些階段要看一致性 */
export function consModes(plan: Plan, s: Spec): { exam?: ConsMode; payout?: ConsMode } {
  const c = plan.calc;
  if (!c) return {};
  const out: { exam?: ConsMode; payout?: ConsMode } = {};
  if (c.examCons) {
    const t = money(s.target);
    out.exam = c.examConsOfTarget && t
      ? { ratio: c.examCons, ofTarget: t, label: `最佳單日 ≤ 目標 ${fmt(t)} 的 ${pct(c.examCons)}` }
      : { ratio: c.examCons, label: `最佳單日 ≤ 總獲利 ${pct(c.examCons)}` };
  }
  if (c.payCons) out.payout = { ratio: c.payCons, label: `最佳單日 ≤ 週期總獲利 ${pct(c.payCons)}` };
  return out;
}

export type ConsResult = {
  total: number; best: number; ratio: number | null;
  ok: boolean;
  /** 還要再賺多少（且之後每天都不能超過目前最佳單日）才會合格 */
  need: number;
};
export function checkCons(days: number[], mode: ConsMode): ConsResult {
  const total = days.reduce((a, b) => a + b, 0);
  const best = days.length ? Math.max(0, ...days) : 0;
  if (mode.ofTarget) {
    const limit = mode.ofTarget * mode.ratio;
    return { total, best, ratio: best / mode.ofTarget, ok: best <= limit, need: 0 };
  }
  if (total <= 0) return { total, best, ratio: null, ok: false, need: best > 0 ? best / mode.ratio - total : 0 };
  const ratio = best / total;
  const ok = ratio <= mode.ratio + 1e-9;
  return { total, best, ratio, ok, need: ok ? 0 : best / mode.ratio - total };
}
