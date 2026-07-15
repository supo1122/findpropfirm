// 核對剩下沒驗過的：Apex 閒置規則 / Apex Live / 各家禁止行為 / Tradeify 平倉時間
// Apex help center 是 JS 動態載入，所以先爬類別頁把真實連結挖出來。
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../.official');
mkdirSync(OUT, { recursive: true });

const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: 1400, height: 1000 }, locale: 'en-US' })).newPage();

const grab = async (name, url, keys = []) => {
  try {
    const r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForTimeout(2800);
    const t = await p.evaluate(() => {
      const el = document.querySelector('article, main, .entry-content, #content') || document.body;
      return el.innerText.replace(/\n{2,}/g, '\n').trim();
    });
    if (r?.status() >= 400) { console.log(`  ✗ ${name} HTTP ${r.status()}`); return null; }
    writeFileSync(path.join(OUT, `r-${name}.txt`), `${url}\n${'='.repeat(50)}\n${t}`, 'utf8');
    console.log(`  ✓ ${name} (${t.length} 字)`);
    for (const k of keys) {
      const re = new RegExp(`[^\\n]{0,80}${k}[^\\n]{0,120}`, 'gi');
      [...new Set(t.match(re) || [])].slice(0, 3).forEach((m) => console.log('      ▸ ' + m.trim()));
    }
    return t;
  } catch (e) { console.log(`  ✗ ${name} ERR ${e.message.slice(0, 50)}`); return null; }
};

// ── 1) 爬 Apex 各類別頁，把所有文章連結挖出來
console.log('\n=== 挖 Apex help center 連結 ===');
const cats = [
  'getting-started', 'performance-accounts-pa', 'payouts', 'eod-trailing-drawdown-accounts',
  'intraday-trailing-drawdown-accounts', 'evaluation-accounts-ea', 'apex-live', 'rules', 'helpful-items',
];
const found = new Set();
for (const c of cats) {
  try {
    await p.goto(`https://apextraderfunding.com/hc-category/${c}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForTimeout(2200);
    const links = await p.evaluate(() =>
      [...document.querySelectorAll('a[href*="/help-center/"]')].map((a) => a.href));
    links.forEach((l) => found.add(l.split('#')[0]));
  } catch { /* 類別可能不存在 */ }
}
const all = [...found].sort();
console.log(`共 ${all.length} 篇`);
const want = all.filter((l) => /inactiv|dormant|live|payout|split|prohibit|consistency|safety/i.test(l));
want.forEach((l) => console.log('  · ' + l));

// ── 2) 抓其中關鍵幾篇
console.log('\n=== Apex 關鍵文章 ===');
for (const url of want.slice(0, 8)) {
  const name = 'apex-' + url.replace(/\/$/, '').split('/').pop().slice(0, 40);
  await grab(name, url, ['inactiv', '30 day', '\\$50', '100%', '90%', '25,000']);
  await p.waitForTimeout(600);
}

// ── 3) 各家禁止行為 + Tradeify 平倉時間
console.log('\n=== 禁止行為 / 交易時間 ===');
await grab('tfy-times', 'https://help.tradeify.co/en/articles/10495876-rules-permitted-times-to-trade', ['4:4', 'close', 'flat', 'EST', 'ET']);
await grab('tfy-hedge', 'https://help.tradeify.co/en/articles/10495868-rules-hedging-trading-micros-or-minis', ['hedg', 'prohibit', 'micro']);
await grab('lucid-prohibited-hft', 'https://support.lucidtrading.com/en/articles/11404736-prohibited-high-frequency-trading', ['prohibit', 'HFT', 'second']);
await grab('lucid-prohibited-hedge', 'https://support.lucidtrading.com/en/articles/11404734-prohibited-hedging', ['hedg', 'prohibit']);
await grab('lucid-microscalp', 'https://support.lucidtrading.com/en/articles/11404742-prohibited-microscalping', ['scalp', 'second', '%']);
await grab('td-prohibited', 'https://tradeday.freshdesk.com/en/support/solutions/articles/103000121031-prohibited-trade-practices', ['prohibit', '2%', 'price limit']);
await grab('ts-prohibited', 'https://help.topstep.com/en/articles/10305426-prohibited-trading-strategies-at-topstep', ['prohibit', 'strateg']);

await b.close();
console.log(`\n輸出：${OUT}`);
