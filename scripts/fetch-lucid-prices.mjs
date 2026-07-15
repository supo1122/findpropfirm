// Lucid 首頁的方案價格藏在分頁（Flex / Pro / Direct）後面，要點過去才看得到。
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'chrome', headless: false });
const page = await (await browser.newContext({ viewport: { width: 1400, height: 950 } })).newPage();
await page.goto('https://lucidtrading.com/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);

// 找出所有看起來像方案分頁的可點元素
const tabs = await page.evaluate(() =>
  [...document.querySelectorAll('button,a,[role=tab],li,span,div')]
    .filter((e) => /^(lucid)?(flex|pro|direct|maxx|black)$/i.test((e.textContent || '').trim()) && e.offsetParent)
    .map((e) => (e.textContent || '').trim())
);
console.log('偵測到分頁：', [...new Set(tabs)]);

const grab = async (label) => {
  const rows = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach((e) => {
      const t = (e.textContent || '').trim();
      if (/^\d+K\s+(PRO|FLEX|DIRECT|MAXX)\s+EVAL$/i.test(t) && e.children.length === 0) {
        // 往上找卡片，再抓卡片內的價格
        let card = e;
        for (let i = 0; i < 6 && card.parentElement; i++) card = card.parentElement;
        const txt = (card.textContent || '').replace(/\s+/g, ' ');
        const m = txt.match(/(\d+K\s+\w+\s+EVAL)\s*\$?([\d,.]+)\$([\d,.]+)/i);
        if (m) out.push(`${m[1].padEnd(18)} 原價 $${m[2].padEnd(8)} → 折後 $${m[3]}`);
      }
    });
    return [...new Set(out)];
  });
  console.log(`\n===== ${label}`);
  rows.forEach((r) => console.log('  ' + r));
};

await grab('預設分頁');
for (const name of [...new Set(tabs)]) {
  try {
    await page.getByText(new RegExp(`^${name}$`, 'i')).first().click({ timeout: 4000 });
    await page.waitForTimeout(2000);
    await grab(name);
  } catch { console.log(`\n(${name} 點不到，略過)`); }
}

await browser.close();
