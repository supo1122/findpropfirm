// 每小時由 GitHub Actions 執行：抓各家 X 最新推文 → 只留有料的（折扣/出金/規則/故障）
// → 翻成繁體中文 → 寫 public/news.json。憑證只從環境變數讀（GitHub Secrets）。
import { Scraper } from '@the-convocation/twitter-scraper';
import { writeFileSync } from 'node:fs';

const HANDLES = {
  lucid: 'LucidTrading',
  apex: 'ApexTradeFund',
  topstep: 'topsteptrader',
  tradeify: 'Tradeify',
  tradeday: 'TradeDayFunding',
};

// 只留「真的有料」的推文：折扣碼/百分比、出金、規則、維護故障。純閒聊一律濾掉。
const STRONG = [
  [/\b\d{1,3}\s?%(\s?off)?\b|\b\d\s?折\b|折扣|優惠|\bpromo\b|\bsale\b|\bcoupon\b|\bdiscount\b|\bcode[s]?\b/i, '折扣'],
  [/\bpayout[s]?\b|\bwithdraw(al)?\b|出金/i, '出金'],
  [/\bconsistency\b|\bdrawdown\b|\bnew rule[s]?\b|\brule[s]? (change|update)|規則|一致性|回撤/i, '規則更新'],
  [/\bmaintenance\b|\boutage\b|\bdegraded\b|\bincident\b|\bdowntime\b|系統|維護|故障|中斷/i, '故障'],
];
function classify(text) {
  for (const [re, tag] of STRONG) if (re.test(text)) return tag;
  return null; // 不符合 = 純閒聊，丟掉
}

// 免費 Google 翻譯端點 → 繁體中文
async function toZh(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-TW&dt=t&q=${encodeURIComponent(text)}`;
    const r = await fetch(url);
    const j = await r.json();
    return j[0].map((seg) => seg[0]).join('').trim();
  } catch { return text; }
}

async function main() {
  const scraper = new Scraper();
  const authToken = process.env.X_AUTH_TOKEN, ct0 = process.env.X_CT0;
  if (!authToken || !ct0) throw new Error('缺少 X_AUTH_TOKEN / X_CT0');
  await scraper.setCookies([
    `auth_token=${authToken}; Domain=.x.com; Path=/; Secure; HttpOnly`,
    `ct0=${ct0}; Domain=.x.com; Path=/; Secure`,
    `auth_token=${authToken}; Domain=.twitter.com; Path=/; Secure; HttpOnly`,
    `ct0=${ct0}; Domain=.twitter.com; Path=/; Secure`,
  ]);

  const FIRM_ZH = { lucid: 'Lucid', apex: 'Apex', topstep: 'Topstep', tradeify: 'Tradeify', tradeday: 'TradeDay' };
  const raw = [];
  for (const [firm, handle] of Object.entries(HANDLES)) {
    try {
      let n = 0;
      for await (const tw of scraper.getTweets(handle, 12)) {
        if (n++ >= 12) break;
        const text = (tw.text || '').replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
        if (!text) continue;
        const tag = classify(text);
        if (!tag) continue; // 過濾純閒聊
        raw.push({ firm, handle, tag, text, id: tw.id, ts: tw.timeParsed ? new Date(tw.timeParsed).getTime() : Date.now() });
      }
    } catch (e) { console.error(`抓 ${handle} 失敗:`, e.message); }
  }

  raw.sort((a, b) => b.ts - a.ts);
  // 去重：同內容（前 30 字相同）只留最新一則
  const seen = new Set();
  const uniq = raw.filter((t) => {
    const key = t.firm + '|' + t.text.slice(0, 30);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  const items = [];
  for (const t of uniq.slice(0, 6)) {
    const zh = await toZh(t.text);
    const body = zh.length > 80 ? zh.slice(0, 80) + '…' : zh;
    items.push({
      tag: t.tag,
      html: `<b>${FIRM_ZH[t.firm]}</b>：${body} <a href="https://x.com/${t.handle}/status/${t.id}" target="_blank" rel="noopener">原文↗</a>`,
    });
  }

  // 常駐置頂：Lucid 首購優惠（Lucid 很少發 X，但這是主力分潤，永遠顯示）
  const PINNED = [
    { tag: '折扣', html: '<b>Lucid</b>：🔥 首購 $70！折扣碼 <b>PFTW</b>，無日風控、一次性付費、終身擁有 <a href="https://lucidtrading.com/ref/patrigger/" target="_blank" rel="noopener">前往購買↗</a>' },
  ];
  const finalItems = [...PINNED, ...items].slice(0, 8);

  writeFileSync('public/news.json', JSON.stringify({
    updated: new Date().toISOString().slice(0, 16).replace('T', ' '),
    items: finalItems,
  }, null, 2));
  console.log(`寫入 ${finalItems.length} 則（含置頂 Lucid + 去重 + 翻譯）`);
}
main().catch((e) => { console.error(e); process.exit(1); });
