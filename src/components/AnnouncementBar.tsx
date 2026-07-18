import { useEffect, useState } from 'react';

const GIVEAWAY_DISCORD = 'https://discord.gg/rmCgMQn43T';

// 抽獎截止：2026/07/31 23:59:59（台灣時間 UTC+8）。過此時間自動切換成最新優惠跑馬燈。
const GIVEAWAY_DEADLINE = new Date('2026-07-31T23:59:59+08:00').getTime();

// 抽獎進行中的文案
const GIVEAWAY_ITEMS = [
  '🎉 Discord 頻道抽獎中：送出 2 組 Lucid 帳號——LucidFlex 50K ＋ LucidFlex 25K',
  '🎁 加入 Discord 參加抽獎，兩名幸運兒直接抱走 Lucid 帳號',
  '🔥 LucidFlex 50K ＋ LucidFlex 25K，各一名，7/31 開獎，把握最後機會',
];

// 抽獎結束後的最新優惠文案（跑馬燈）
const PROMO_ITEMS = [
  '💎 Lucid 7 折 · 折扣碼 PFTW · LucidFlex 50K $98／25K $70 · 首購再多 10%',
  '⚡ Apex FLASH · 折扣碼 SAVENOW · 50K 一口價 $49 · 史上最低',
  '🚀 Tradeify 6 折 · 折扣碼 JULY · Select 50K $99／Growth 50K $87',
  '📈 TradeDay 5 折 · 折扣碼 PFTW · Quick Pay 50K 首月 $62.50',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** 上方跑馬燈：抽獎期間顯示倒數計時，7/31 截止後自動切換為最新優惠 */
export default function AnnouncementBar() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = GIVEAWAY_DEADLINE - now;
  const giveawayActive = remaining > 0;

  // 依狀態決定內容與外觀
  let items: string[];
  let background: string;
  let ariaLabel: string;

  if (giveawayActive) {
    const totalSec = Math.floor(remaining / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const countdown =
      `⏳ 距離開獎倒數 ${days} 天 ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    // 倒數放在最前，後接抽獎文案
    items = [countdown, ...GIVEAWAY_ITEMS];
    background = 'linear-gradient(90deg,#5865F2,#3B3F8F)';
    ariaLabel = '加入 Discord 參加 Lucid 帳號抽獎，倒數計時中';
  } else {
    items = PROMO_ITEMS;
    background = 'linear-gradient(90deg,#0EA5A0,#0B5F6B)';
    ariaLabel = '最新 Prop Firm 優惠與折扣碼';
  }

  // 內容重複兩輪，讓 -50% 位移可以無縫接回開頭
  const loop = [...items, ...items];

  return (
    <a
      href={GIVEAWAY_DISCORD}
      target="_blank"
      rel="noopener"
      className="relative z-30 flex w-full overflow-hidden select-none"
      style={{ background, borderBottom: '1px solid rgba(255,255,255,.12)' }}
      aria-label={ariaLabel}
    >
      <div className="flex whitespace-nowrap py-2.5" style={{ animation: 'marquee 26s linear infinite' }}>
        {loop.map((t, i) => (
          <span key={i} className="font-body text-sm md:text-[15px] text-white/95 px-8 flex items-center gap-2">
            {t}
            <span className="text-white/60">·</span>
          </span>
        ))}
      </div>
    </a>
  );
}
