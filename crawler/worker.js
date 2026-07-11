// Cloudflare Cron Worker 骨架：抓各家 X 最新消息 → 寫 news.json
// 設定 Cron Trigger（例：*/30 * * * *），把輸出綁到網站的 /news.json（KV 或 R2）。

// 方案 B：用 RSS 橋接（免費）。用 rss.app / nitter 幫每個帳號產生 RSS 後填進來。
const FEEDS = {
  lucid: 'https://rss.app/feeds/XXXX_lucid.xml',
  apex: 'https://rss.app/feeds/XXXX_apex.xml',
  topstep: 'https://rss.app/feeds/XXXX_topstep.xml',
  tradeify: 'https://rss.app/feeds/XXXX_tradeify.xml',
};
const KEYWORDS = /(discount|payout|rule|off|%|promo|折|優惠|出金|規則|啟動費)/i;
const TAGS = [
  [/discount|off|%|promo|折|優惠/i, '折扣'],
  [/payout|出金/i, '出金'],
  [/rule|規則|啟動費/i, '規則更新'],
];

function tagFor(text) {
  for (const [re, t] of TAGS) if (re.test(text)) return t;
  return '消息';
}

async function parseRss(url) {
  try {
    const xml = await (await fetch(url)).text();
    const items = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>/g)];
    return items.slice(0, 3).map((m) => {
      const title = m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      const link = m[2].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      return { title, link };
    });
  } catch { return []; }
}

export default {
  async scheduled(_event, env) {
    const items = [];
    for (const [firm, url] of Object.entries(FEEDS)) {
      const posts = await parseRss(url);
      for (const p of posts) {
        if (!KEYWORDS.test(p.title)) continue;
        items.push({
          tag: tagFor(p.title),
          // 只摘要 + 連到原推文，勿轉載全文
          html: `${p.title.slice(0, 80)} <a href="${p.link}" target="_blank">原文↗</a>`,
        });
      }
    }
    const payload = { updated: new Date().toISOString().slice(0, 10), items: items.slice(0, 8) };
    // 寫入 KV（需在 wrangler.toml 綁定 NEWS_KV），前端從 /news.json 讀
    await env.NEWS_KV.put('news.json', JSON.stringify(payload));
  },

  // 讓 /news.json 直接由 Worker 提供（或改用 R2 public bucket）
  async fetch(_req, env) {
    const data = (await env.NEWS_KV.get('news.json')) || '{"items":[]}';
    return new Response(data, { headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
  },
};
