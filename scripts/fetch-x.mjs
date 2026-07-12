// 每小時由 GitHub Actions 執行：抓各家 X 最新推文 → 篩關鍵字 → 寫 public/news.json
// 憑證只從環境變數讀（GitHub Secrets），不寫死、不進版控。
import { Scraper } from '@the-convocation/twitter-scraper';
import { writeFileSync } from 'node:fs';

// 各家 X 帳號（@ 後面的帳號名，若不對再改）
const HANDLES = {
  lucid: 'LucidTrading',
  apex: 'ApexTraderFund',
  topstep: 'topsteptrader',
  tradeify: 'Tradeify',
};

const KEYWORDS = /(discount|off|%|promo|sale|code|coupon|payout|rule|update|maintenance|down|outage|折|優惠|折扣|規則|出金|維護|故障)/i;
const TAGS = [
  [/discount|off|%|promo|sale|code|coupon|折|優惠|折扣/i, '折扣'],
  [/payout|出金/i, '出金'],
  [/maintenance|down|outage|維護|故障/i, '故障'],
  [/rule|update|規則/i, '規則更新'],
];
const tagFor = (t) => (TAGS.find(([re]) => re.test(t)) || [null, '消息'])[1];

async function main() {
  const scraper = new Scraper();
  const authToken = process.env.X_AUTH_TOKEN;
  const ct0 = process.env.X_CT0;
  if (!authToken || !ct0) throw new Error('缺少 X_AUTH_TOKEN / X_CT0');

  // 用 cookie 登入（x.com 與 twitter.com 兩個網域都送，避免 domain 對不上導致 401）
  await scraper.setCookies([
    `auth_token=${authToken}; Domain=.x.com; Path=/; Secure; HttpOnly`,
    `ct0=${ct0}; Domain=.x.com; Path=/; Secure`,
    `auth_token=${authToken}; Domain=.twitter.com; Path=/; Secure; HttpOnly`,
    `ct0=${ct0}; Domain=.twitter.com; Path=/; Secure`,
  ]);

  const items = [];
  for (const [firm, handle] of Object.entries(HANDLES)) {
    try {
      let n = 0;
      for await (const tw of scraper.getTweets(handle, 10)) {
        if (n++ >= 10) break;
        const text = (tw.text || '').replace(/\s+/g, ' ').trim();
        if (!text || !KEYWORDS.test(text)) continue;
        items.push({
          tag: tagFor(text),
          firm,
          html: `${text.slice(0, 90)}${text.length > 90 ? '…' : ''} <a href="https://x.com/${handle}/status/${tw.id}" target="_blank" rel="noopener">原文↗</a>`,
          ts: tw.timeParsed ? new Date(tw.timeParsed).getTime() : Date.now(),
        });
      }
    } catch (e) {
      console.error(`抓 ${handle} 失敗:`, e.message);
    }
  }

  items.sort((a, b) => b.ts - a.ts);
  const payload = {
    updated: new Date().toISOString().slice(0, 16).replace('T', ' '),
    items: items.slice(0, 8).map(({ tag, html }) => ({ tag, html })),
  };
  // 若這次完全沒抓到，保留舊檔（不要清空通知）
  if (payload.items.length === 0) { console.log('無符合關鍵字的新推文，跳過寫檔'); return; }
  writeFileSync('public/news.json', JSON.stringify(payload, null, 2));
  console.log(`寫入 ${payload.items.length} 則`);
}
main().catch((e) => { console.error(e); process.exit(1); });
