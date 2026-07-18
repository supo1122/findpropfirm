const GIVEAWAY_DISCORD = 'https://discord.gg/rmCgMQn43T';

const ITEMS = [
  '🎉 Discord 頻道抽獎中：送出 2 組 Lucid 帳號——LucidFlex 50K ＋ LucidFlex 25K',
  '🎁 加入 Discord 參加抽獎，兩名幸運兒直接抱走 Lucid 帳號',
  '🔥 LucidFlex 50K ＋ LucidFlex 25K，各一名，Discord 頻道抽獎進行中',
];

/** 上方跑馬燈：Discord 頻道抽獎公告，無限循環捲動 */
export default function AnnouncementBar() {
  // 內容重複兩輪，讓 -50% 位移可以無縫接回開頭
  const loop = [...ITEMS, ...ITEMS];

  return (
    <a
      href={GIVEAWAY_DISCORD}
      target="_blank"
      rel="noopener"
      className="relative z-30 flex w-full overflow-hidden select-none"
      style={{ background: 'linear-gradient(90deg,#5865F2,#3B3F8F)', borderBottom: '1px solid rgba(255,255,255,.12)' }}
      aria-label="加入 Discord 參加 Lucid 帳號抽獎"
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
