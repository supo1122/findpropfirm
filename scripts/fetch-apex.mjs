// 用本機真實 Chrome 讀 Apex 官方幫助中心（Cloudflare 會擋 curl / headless）。
// 會開一個可見的瀏覽器視窗，跟你自己開網頁一樣，同一個 IP。
// 用法：node scripts/fetch-apex.mjs
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../.apex');
mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['eod-payouts', 'https://apextraderfunding.com/help-center/eod-trailing-drawdown-accounts/eod-payouts/'],
  ['eod-pa', 'https://apextraderfunding.com/help-center/eod-trailing-drawdown-accounts/eod-performance-accounts-pa/'],
  ['eod-evals', 'https://apextraderfunding.com/help-center/eod-trailing-drawdown-accounts/eod-evaluations/'],
  ['eod-dd', 'https://apextraderfunding.com/help-center/eod-trailing-drawdown-accounts/eod-drawdown-explained/'],
  ['ind-payouts', 'https://apextraderfunding.com/help-center/intraday-trailing-drawdown-accounts/intraday-trailing-drawdown-payouts/'],
  ['ind-pa', 'https://apextraderfunding.com/help-center/intraday-trailing-drawdown-accounts/intraday-trailing-drawdown-performance-accounts-pa/'],
  ['ind-dd', 'https://apextraderfunding.com/help-center/intraday-trailing-drawdown-accounts/intraday-trailing-drawdown-explained/'],
  ['ind-evals', 'https://apextraderfunding.com/help-center/evaluation-accounts-ea/intraday-trailing-drawdown-evaluations/'],
];

const blocked = (t) => /just a moment|attention required|enable javascript and cookies|cf-chl/i.test(t);

const browser = await chromium.launch({
  channel: 'chrome',
  headless: false, // Cloudflare 會偵測 headless，必須開真視窗
  args: ['--disable-blink-features=AutomationControlled'],
});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: 'en-US',
});
const page = await ctx.newPage();

const results = [];
for (const [name, url] of PAGES) {
  process.stdout.write(`→ ${name} ... `);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // 等 Cloudflare 挑戰自己跑完（最多 30 秒）
    for (let i = 0; i < 30; i++) {
      const t = await page.title().catch(() => '');
      if (!blocked(t)) break;
      await page.waitForTimeout(1000);
    }
    await page.waitForTimeout(1500);

    const title = await page.title();
    if (blocked(title)) { console.log('仍被擋'); results.push([name, 'BLOCKED']); continue; }

    // 抽正文
    const text = await page.evaluate(() => {
      const el = document.querySelector('article, main, .entry-content, .hc-article, #content') || document.body;
      const walk = (n) => {
        if (n.nodeType === 3) return n.textContent;
        if (n.nodeType !== 1) return '';
        const tag = n.tagName.toLowerCase();
        if (['script', 'style', 'nav', 'footer', 'svg', 'header'].includes(tag)) return '';
        let s = [...n.childNodes].map(walk).join('');
        if (['td', 'th'].includes(tag)) return ' | ' + s.trim();
        if (['tr', 'p', 'li', 'h1', 'h2', 'h3', 'h4', 'div', 'br', 'table'].includes(tag)) return s + '\n';
        return s;
      };
      return walk(el).replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
    });

    writeFileSync(path.join(OUT, `${name}.txt`), `${title}\n${url}\n${'='.repeat(60)}\n${text}`, 'utf8');
    console.log(`OK ${text.length} 字`);
    results.push([name, text.length]);
  } catch (e) {
    console.log('ERR ' + e.message.split('\n')[0]);
    results.push([name, 'ERR']);
  }
  await page.waitForTimeout(800); // 客氣一點，別狂打官網
}

await browser.close();
console.log('\n' + results.map(([n, r]) => `${n.padEnd(14)} ${r}`).join('\n'));
console.log(`\n輸出：${OUT}`);
