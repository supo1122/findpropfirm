// 抓 50K 價格（含有無啟動費版本）+ Trustpilot 星等。用本機真實 Chrome。
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../.official');
mkdirSync(OUT, { recursive: true });

const PRICE_PAGES = [
  ['tradeday', 'https://www.tradeday.com/#pricing'],
  ['topstep', 'https://www.topstep.com/topstep-prop'],
];

const TRUSTPILOT = [
  ['lucid', 'https://www.trustpilot.com/review/lucidtrading.com'],
  ['tradeify', 'https://www.trustpilot.com/review/tradeify.co'],
  ['tradeday', 'https://www.trustpilot.com/review/tradeday.com'],
  ['apex', 'https://www.trustpilot.com/review/apextraderfunding.com'],
  ['topstep', 'https://www.trustpilot.com/review/topstep.com'],
];

const browser = await chromium.launch({ channel: 'chrome', headless: false });
const page = await (await browser.newContext({ viewport: { width: 1400, height: 950 }, locale: 'en-US' })).newPage();

console.log('===== 價格頁 =====');
for (const [name, url] of PRICE_PAGES) {
  try {
    const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4500);
    const t = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n'));
    writeFileSync(path.join(OUT, `p-${name}.txt`), `${url}\n${'='.repeat(50)}\n${t}`, 'utf8');
    console.log(`\n### ${name} HTTP ${r?.status()}  ${t.length} 字`);
    // 抓含 50K / activation 的段落
    const lines = t.split('\n');
    lines.forEach((l, i) => {
      if (/50K|50,000|activation|activation fee|no activation/i.test(l))
        console.log('   ' + lines.slice(i, i + 2).join(' / ').slice(0, 130));
    });
  } catch (e) { console.log(`### ${name} ERR ${e.message.slice(0, 60)}`); }
  await page.waitForTimeout(800);
}

console.log('\n===== Trustpilot =====');
for (const [name, url] of TRUSTPILOT) {
  try {
    const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    const info = await page.evaluate(() => {
      const t = document.body.innerText;
      const rating = t.match(/([0-5]\.\d)\s*\n?\s*(?:TrustScore|out of 5)/i)
        || t.match(/TrustScore\s*([0-5]\.\d)/i);
      const count = t.match(/([\d,]+)\s*(?:total\s*)?reviews?/i);
      return { rating: rating?.[1] ?? null, count: count?.[1] ?? null, title: document.title };
    });
    console.log(`${name.padEnd(10)} HTTP ${r?.status()}  星等=${info.rating ?? '?'}  評論數=${info.count ?? '?'}  | ${info.title.slice(0, 60)}`);
  } catch (e) { console.log(`${name.padEnd(10)} ERR ${e.message.slice(0, 50)}`); }
  await page.waitForTimeout(1000);
}

await browser.close();
console.log(`\n輸出：${OUT}`);
