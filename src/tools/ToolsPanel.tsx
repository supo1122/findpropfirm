// 規則頁的互動工具區：🧮 出金試算 ／ 📏 帳戶線模擬 ／ ⚖️ 一致性計算
import { useEffect, useRef, useState } from 'react';
import type { Plan, SizeKey } from '../missions';
import Calculator from './Calculator';
import ConsCalc from './ConsCalc';
import LineSim from './LineSim';
import { G } from './ui';

export type Tool = 'calc' | 'line' | 'cons';
/** 從分享連結解析出來的參數 */
export type ToolInit = { tool?: Tool; d?: number; price?: number; ph?: string; c?: number; pk?: number; e?: number[] };

const TABS: { v: Tool; icon: string; label: string; hint: string }[] = [
  { v: 'calc', icon: '🧮', label: '出金試算', hint: '每天賺多少 → 幾天能領錢' },
  { v: 'line', icon: '📏', label: '帳戶線模擬', hint: '拖拖看，離爆倉還多遠' },
  { v: 'cons', icon: '⚖️', label: '一致性計算', hint: '填每天損益，看能不能出金' },
];

export default function ToolsPanel({ firmId, firmName, code, plan, size, init }: {
  firmId: string; firmName: string; code?: string; plan: Plan; size: SizeKey; init?: ToolInit;
}) {
  const [tool, setTool] = useState<Tool>('calc');
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!init?.tool) return;
    setTool(init.tool);
    // 分享連結打開：等方案／規模換好、版面定了再捲過來
    const t = setTimeout(() => ref.current?.scrollIntoView({ block: 'start' }), 60);
    return () => clearTimeout(t);
  }, [init]);
  const mine = (t: Tool) => (init?.tool === t ? init : undefined);

  return (
    <section ref={ref} id="tools" className="scroll-mt-6 rounded-2xl overflow-hidden" style={{ background: '#0F141C', border: '1px solid rgba(255,255,255,.1)' }}>
      <div className="grid grid-cols-3 border-b border-white/10">
        {TABS.map((t) => {
          const on = tool === t.v;
          return (
            <button key={t.v} onClick={() => setTool(t.v)} className="px-2 py-3.5 text-center transition"
              style={on ? { background: 'rgba(53,224,138,.1)', boxShadow: `inset 0 -3px 0 ${G}` } : {}}>
              <div className="text-xl leading-none">{t.icon}</div>
              <div className="font-heading text-sm mt-1.5" style={{ color: on ? G : '#C7CDD8' }}>{t.label}</div>
              <div className="hidden sm:block font-body text-[11px] text-white/40 mt-0.5">{t.hint}</div>
            </button>
          );
        })}
      </div>
      <div className="p-5 md:p-6">
        {!plan.calc ? (
          <div className="font-body text-white/65 text-[15px]">
            真倉方案不需要試算——上面選一個<b className="text-white/90">考試／出金帳號方案</b>再來玩。
          </div>
        ) : tool === 'calc' ? (
          <Calculator firmId={firmId} firmName={firmName} code={code} plan={plan} size={size} init={mine('calc')} />
        ) : tool === 'line' ? (
          <LineSim firmId={firmId} plan={plan} size={size} init={mine('line')} />
        ) : (
          <ConsCalc firmId={firmId} plan={plan} size={size} init={mine('cons')} />
        )}
      </div>
    </section>
  );
}

/** 讀網址上的工具參數 */
export function parseToolInit(q: URLSearchParams): ToolInit {
  const n = (k: string) => (q.get(k) !== null && q.get(k) !== '' && !isNaN(+q.get(k)!) ? +q.get(k)! : undefined);
  const t = q.get('tool');
  return {
    tool: t === 'calc' || t === 'line' || t === 'cons' ? t : undefined,
    d: n('d'), price: n('price'), ph: q.get('ph') ?? undefined, c: n('c'), pk: n('pk'),
    e: q.get('e') ? q.get('e')!.split('_').map(Number).filter((x) => !isNaN(x)) : undefined,
  };
}
