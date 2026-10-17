// 規則頁購買列：手機黏底部、電腦黏右下。現價 + 一鍵複製折扣碼 + 前往購買（推廣連結）
import { useState } from 'react';
import type { Firm } from '../data';
import { codeOf, pricesNow } from '../data';
import { copyText } from '../lib/store';

const G = '#35E08A';

export default function BuyBar({ firm }: { firm: Firm }) {
  const price = pricesNow().find((p) => p.id === firm.id);
  const code = codeOf(firm.id);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (code && (await copyText(code))) { setCopied(true); setTimeout(() => setCopied(false), 1800); }
  };
  const variant = price?.name.split(' · ').slice(1).join(' · ');
  const extra = price && price.activation !== '無' ? ` · 過關另付啟動費 ${price.activation}` : '';

  return (
    <div className="fixed z-40 bottom-0 inset-x-0 md:inset-x-auto md:right-5 md:bottom-5 md:w-[340px]">
      <div className="flex items-center gap-2.5 px-3 py-2.5 md:p-4 md:rounded-2xl md:flex-col md:items-stretch shadow-2xl border-t md:border"
        style={{ background: 'rgba(12,15,20,.97)', borderColor: `${G}44`, backdropFilter: 'blur(10px)' }}>
        <div className="min-w-0 flex-1 md:flex md:items-baseline md:justify-between">
          <div className="font-body text-[11px] text-white/45 truncate">{price ? `${variant} 50K${extra}` : firm.name}{price?.flashOn ? ' · 限時' : ''}</div>
          {price && (
            <div className="font-heading leading-tight" style={{ color: G }}>
              <span className="text-xl">{price.now}</span>
              {price.list !== price.now && <s className="font-body text-xs text-white/35 ml-1.5">{price.list}</s>}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0 md:mt-1">
          {code && (
            <button onClick={copy} className="rounded-xl px-3 py-2.5 font-heading text-sm md:flex-1"
              style={{ border: `1px dashed ${G}99`, color: G, background: 'rgba(53,224,138,.08)' }}>
              {copied ? '已複製 ✓' : <>複製 <b>{code}</b></>}
            </button>
          )}
          <a href={firm.link} target="_blank" rel="sponsored nofollow noopener"
            className="rounded-xl px-4 py-2.5 font-heading text-sm md:flex-1 text-center" style={{ background: G, color: '#06110B' }}>
            前往購買 ↗
          </a>
        </div>
      </div>
    </div>
  );
}
