// 使用者提供的三個 Apex 網址 + 確認 Lucid/Topstep「幾次出金轉真倉」
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../.official');
mkdirSync(OUT, { recursive: true });

const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: 1400, height: 1000 }, locale: 'en-US' })).newPage();

// 先進首頁拿 Cloudflare cookie，慢慢來避免被限速
await p.goto('https://apextraderfunding.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(6000);

const grab = async (name, url, keys = []) => {
  for (let i = 0; i < 4; i++) {
    const r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForTimeout(4000);
    const t = await p.evaluate(() => {
      const el = document.querySelector('article, main, .entry-content, #content') || document.body;
      return el.innerText.replace(/\n{2,}/g, '\n').trim();
    });
    if ((r?.status() ?? 0) < 400 && t.length > 400) {
      writeFileSync(path.join(OUT, `x-${name}.txt`), `${url}\n${'='.repeat(50)}\n${t}`, 'utf8');
      console.log(`\n✓ ${name} (${t.length} 字)`);
      for (const k of keys) {
        const re = new RegExp(`[^\\n]{0,90}${k}[^\\n]{0,140}`, 'gi');
        [...new Set(t.match(re) || [])].slice(0, 5).forEach((m) => console.log('   ▸ ' + m.trim()));
      }
      return t;
    }
    console.log(`  (${name} 第 ${i + 1} 次 HTTP ${r?.status()}，等 15 秒)`);
    await p.waitForTimeout(15000);
  }
  console.log(`✗ ${name} 抓不到`);
  return null;
};

await grab('apex-live-faq', 'https://apextraderfunding.com/help-center/getting-started/apex-live-prop-trading-program-faq/',
  ['live', 'invit', 'requirement', 'payout', 'split', '100%', '90%', 'account']);
await p.waitForTimeout(3000);
await grab('apex-prohibited', 'https://apextraderfunding.com/help-center/getting-started/prohibited-activities/',
  ['stop loss', 'hedg', 'automat', 'copy', 'news', 'prohibit', 'DCA']);
await p.waitForTimeout(3000);
await grab('apex-inactivity', 'https://apextraderfunding.com/help-center/billing/inactivity-policy-on-performance-accounts-pa/',
  ['30 day', '\\$50', 'inactiv', 'dormant', 'closed', '15 day']);

// Lucid Pro / Direct 的出金次數上限
await p.waitForTimeout(2000);
await grab('lucid-pro-payouts', 'https://support.lucidtrading.com/en/articles/12890092',
  ['payout', 'live', 'number of requests', 'up to \\d']);
await p.waitForTimeout(1500);
await grab('lucid-newlive', 'https://support.lucidtrading.com/en/articles/13425130',
  ['Payout 5', 'live review pool', 'final payout']);
// Topstep 幾次出金轉 Live
await p.waitForTimeout(1500);
await grab('ts-live', 'https://help.topstep.com/en/articles/10657969-live-funded-account-parameters',
  ['call.?up', 'eligib', 'payout', 'how do i get']);

await b.close();
console.log(`\n輸出：${OUT}`);
