// Apex 有 2×2 種方案：回撤型態（Intraday Trail / EOD Trail）× 收費（Standard / No Activation Fee）
// 每種再乘 4 個規模。價格全部藏在按鈕後面，要一個一個點。
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../.official');
mkdirSync(OUT, { recursive: true });

const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: 1500, height: 1000 }, locale: 'en-US' })).newPage();
await p.goto('https://apextraderfunding.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(5000);

/** 點頁面上文字完全相符的按鈕 */
const tap = async (label) =>
  p.evaluate((label) => {
    const el = [...document.querySelectorAll('button')]
      .find((e) => (e.textContent || '').trim().toLowerCase() === label.toLowerCase());
    if (!el) return false;
    el.click();
    return true;
  }, label);

const read = async () => {
  await p.waitForTimeout(2200);
  return p.evaluate(() => {
    for (const e of document.querySelectorAll('*')) {
      const t = (e.textContent || '').trim();
      if (/^\d+K\s+[A-Z ]+$/.test(t) && e.children.length === 0) {
        let c = e;
        for (let i = 0; i < 8 && c.parentElement; i++) c = c.parentElement;
        const s = (c.textContent || '').replace(/\s+/g, ' ');
        const pr = s.match(/\$([\d,]+\.\d{2})\s*\$([\d,]+\.\d{2})/);
        const act = s.match(/Activation Fee:?\s*\$?([\d,]+(?:\.\d{2})?|FREE)/i);
        const tgt = s.match(/Profit Goal[^$]*\$([\d,]+)/i) || s.match(/Profit Target[^$]*\$([\d,]+)/i);
        const dd = s.match(/(?:Trailing )?(?:Threshold|Drawdown)[^$]*\$([\d,]+)/i);
        return {
          card: t,
          list: pr?.[1] ?? null, now: pr?.[2] ?? null,
          act: act?.[1] ?? null, target: tgt?.[1] ?? null, dd: dd?.[1] ?? null,
        };
      }
    }
    return null;
  });
};

const rows = [];
for (const ddType of ['Intraday Trail', 'EOD Trail']) {
  for (const feeType of ['Standard', 'No Activation Fee']) {
    if (!(await tap(ddType))) { console.log(`✗ 點不到 ${ddType}`); continue; }
    await p.waitForTimeout(1200);
    if (!(await tap(feeType))) { console.log(`✗ 點不到 ${feeType}`); continue; }
    await p.waitForTimeout(1200);
    for (const size of ['25k', '50k', '100k', '150k']) {
      if (!(await tap(size))) continue;
      const r = await read();
      if (!r) continue;
      rows.push({ ddType, feeType, size, ...r });
      console.log(
        `${ddType.padEnd(14)} ${feeType.padEnd(18)} ${size.padEnd(6)} ` +
        `${(r.card || '').padEnd(22)} 原價 $${(r.list || '?').padEnd(9)} → $${(r.now || '?').padEnd(9)} 啟動費 ${r.act ?? '?'}`
      );
    }
    console.log('');
  }
}

writeFileSync(path.join(OUT, 'apex-prices.json'), JSON.stringify(rows, null, 2), 'utf8');
await b.close();
console.log(`共 ${rows.length} 筆 → ${path.join(OUT, 'apex-prices.json')}`);
