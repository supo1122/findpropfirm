// 用本機真實 Chrome 抓五家官方頁面（Cloudflare 會擋 curl 與 headless）。
// 會開一個可見的瀏覽器視窗，跟你自己開網頁一樣，同一個 IP。
//
//   node scripts/fetch-official.mjs            # 抓全部
//   node scripts/fetch-official.mjs prices     # 只抓價格頁
//   node scripts/fetch-official.mjs apex       # 只抓某一組
//
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../.official');
mkdirSync(OUT, { recursive: true });

/** group: 用第一個參數挑選 */
const TARGETS = [
  // ── 價格（變動最快，最需要定期重抓）──
  ['prices', 'price-lucid', 'https://lucidtrading.com/'],
  ['prices', 'price-tradeify', 'https://tradeify.co/'],
  ['prices', 'price-tradeify-ref', 'https://help.tradeify.co/en/articles/14369021-tradeify-pricing-reference'],
  ['prices', 'price-tradeday', 'https://www.tradeday.com/pricing/'],
  ['prices', 'price-topstep', 'https://www.topstep.com/pricing/'],
  ['prices', 'price-topstep-ref', 'https://help.topstep.com/en/articles/14289835-topstep-pricing-and-payment-questions'],
  ['prices', 'price-apex', 'https://apextraderfunding.com/'],

  // ── Apex 規則 ──
  ['apex', 'apex-eod-payouts', 'https://apextraderfunding.com/help-center/eod-trailing-drawdown-accounts/eod-payouts/'],
  ['apex', 'apex-eod-pa', 'https://apextraderfunding.com/help-center/eod-trailing-drawdown-accounts/eod-performance-accounts-pa/'],
  ['apex', 'apex-ind-payouts', 'https://apextraderfunding.com/help-center/intraday-trailing-drawdown-accounts/intraday-trailing-drawdown-payouts/'],
  ['apex', 'apex-inactivity', 'https://apextraderfunding.com/help-center/performance-accounts-pa/inactivity-rule/'],
  ['apex', 'apex-prohibited', 'https://apextraderfunding.com/help-center/getting-started/prohibited-activities/'],
  ['apex', 'apex-live', 'https://apextraderfunding.com/help-center/apex-live/'],
];

const blocked = (t) => /just a moment|attention required|enable javascript and cookies|cf-chl/i.test(t);
const pick = process.argv[2];
const jobs = TARGETS.filter(([g]) => !pick || g === pick);

const browser = await chromium.launch({
  channel: 'chrome',
  headless: false, // Cloudflare 偵測 headless，必須開真視窗
  args: ['--disable-blink-features=AutomationControlled'],
});
const page = await (await browser.newContext({ viewport: { width: 1400, height: 950 }, locale: 'en-US' })).newPage();

const log = [];
for (const [, name, url] of jobs) {
  process.stdout.write(`→ ${name.padEnd(20)} `);
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const status = resp?.status() ?? 0;
    for (let i = 0; i < 30; i++) {          // 等 Cloudflare 挑戰跑完
      if (!blocked(await page.title().catch(() => ''))) break;
      await page.waitForTimeout(1000);
    }
    await page.waitForTimeout(2500);         // 等前端把價格算出來

    const title = await page.title();
    if (blocked(title)) { console.log('BLOCKED'); log.push([name, 'BLOCKED']); continue; }
    if (status >= 400) { console.log(`HTTP ${status}`); log.push([name, `HTTP ${status}`]); continue; }

    const text = await page.evaluate(() => {
      const walk = (n) => {
        if (n.nodeType === 3) return n.textContent;
        if (n.nodeType !== 1) return '';
        const tag = n.tagName.toLowerCase();
        if (['script', 'style', 'svg', 'noscript'].includes(tag)) return '';
        const s = [...n.childNodes].map(walk).join('');
        if (['td', 'th'].includes(tag)) return ' | ' + s.trim();
        if (['tr', 'p', 'li', 'h1', 'h2', 'h3', 'h4', 'div', 'br', 'table', 'section'].includes(tag)) return s + '\n';
        return s;
      };
      return walk(document.body).replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
    });

    writeFileSync(path.join(OUT, `${name}.txt`), `${title}\n${url}\n${'='.repeat(60)}\n${text}`, 'utf8');
    // 順手把價格樣式的數字挑出來，方便快速核對
    const prices = [...new Set(text.match(/\$\s?\d[\d,]*(?:\.\d{2})?/g) || [])].slice(0, 25);
    console.log(`OK ${String(text.length).padStart(6)} 字  ${prices.slice(0, 8).join(' ')}`);
    log.push([name, text.length]);
  } catch (e) {
    console.log('ERR ' + e.message.split('\n')[0].slice(0, 60));
    log.push([name, 'ERR']);
  }
  await page.waitForTimeout(1000); // 客氣一點，別狂打官網
}

await browser.close();
console.log('\n' + log.map(([n, r]) => `${n.padEnd(22)} ${r}`).join('\n'));
console.log(`\n輸出：${OUT}`);
