// 一次查證使用者提出的疑點。用本機真實 Chrome。
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../.official');
mkdirSync(OUT, { recursive: true });

const text = (p) => p.evaluate(() => {
  const el = document.querySelector('article, main, .entry-content, #content') || document.body;
  return el.innerText.replace(/\n{2,}/g, '\n').trim();
});

const browser = await chromium.launch({ channel: 'chrome', headless: false });
const page = await (await browser.newContext({ viewport: { width: 1400, height: 1000 }, locale: 'en-US' })).newPage();

const go = async (name, url, keys) => {
  try {
    const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    const t = await text(page);
    writeFileSync(path.join(OUT, `q-${name}.txt`), `${url}\n${'='.repeat(50)}\n${t}`, 'utf8');
    console.log(`\n##### ${name}  HTTP ${r?.status()}  ${t.length} 字`);
    for (const k of keys) {
      const re = new RegExp(`[^\\n]{0,90}${k}[^\\n]{0,110}`, 'gi');
      [...new Set(t.match(re) || [])].slice(0, 4).forEach((m) => console.log('   ▸ ' + m.trim()));
    }
  } catch (e) { console.log(`\n##### ${name} ERR ${e.message.slice(0, 60)}`); }
  await page.waitForTimeout(700);
};

// ① Apex：分潤到底是不是「前 $25,000 100%」
await go('apex-split', 'https://apextraderfunding.com/help-center/payouts/payout-split/',
  ['profit split', 'payout split', '100%', '90%', '25,000', 'first \\$']);
await go('apex-payout-faq', 'https://apextraderfunding.com/help-center/payouts/',
  ['split', '100%', '90%', '25,000']);

// ② Apex 閒置規則（我先前只有搜尋摘要，沒有原文）
await go('apex-inactivity', 'https://apextraderfunding.com/help-center/performance-accounts-pa/inactivity-rule/',
  ['inactiv', '30 day', '\\$50', 'dormant', 'closed']);

// ③ TradeDay 有沒有日虧損上限
await go('td-dll', 'https://tradeday.freshdesk.com/en/support/search/solutions?term=daily+loss+limit',
  ['daily loss', 'no daily']);
await go('td-onerule', 'https://tradeday.freshdesk.com/en/support/solutions/articles/103000008855',
  ['only rule', 'one rule', 'daily loss', 'maximum drawdown']);

// ④ Tradeify Lightning 利潤目標的官方原文
await go('tfy-lightning-payout', 'https://help.tradeify.co/en/articles/10495932-lightning-funded-account-payout-policy',
  ['profit goal', 'buffer', 'minimum balance', 'consistency', 'reset']);

await browser.close();
console.log(`\n輸出：${OUT}`);
