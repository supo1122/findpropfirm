// 自動核對：把官網現況跟站上資料比對，有出入就報告。
//
//   node scripts/check-official.mjs          # 核對並印報告
//   node scripts/check-official.mjs --quiet  # 只在有出入時才輸出（給排程用）
//
// 設計原則：這支「只回報、不改站」。爬蟲解析錯一次就會publish錯數字，
// 而本站賣點就是規則不會錯，所以一律人工確認後再改。
//
// 期望值直接從 src/data.ts 的 PRICES 讀，不另外維護一份，避免兩邊不同步。
import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const OUT = path.join(root, '.official');
mkdirSync(OUT, { recursive: true });
const QUIET = process.argv.includes('--quiet');

// ── 讀站上目前宣稱的價格 ──
const tmp = path.join(root, '.check.cjs');
execSync(`npx esbuild "${path.join(root, 'src/data.ts')}" --bundle --format=cjs --platform=node --outfile="${tmp}" --log-level=error`);
const { PRICES } = createRequire(import.meta.url)(tmp);
rmSync(tmp, { force: true });

/** 取出金額並正規化成數字，讓 $111 / $111.00 / $1,090 / $1090.00 視為相同 */
const money = (s) => {
  const m = String(s ?? '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : NaN;
};
/** 兩個金額是否不同（任一方讀不到就當「不同」，會被上層降級為 WARN） */
const differs = (a, b) => {
  const x = money(a), y = money(b);
  return Number.isNaN(x) || Number.isNaN(y) || Math.abs(x - y) > 0.005;
};
const claim = (name) => PRICES.find((p) => p.name === name);

const BOM = '﻿'; // 讓 Windows 編輯器用 UTF-8 開報告，不然中文變亂碼
const findings = [];
const add = (level, what, expected, actual) =>
  findings.push({ level, what, expected, actual });

const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 }, locale: 'en-US' });
const p = await ctx.newPage();
const wait = (ms) => p.waitForTimeout(ms);

// ─────────── Lucid：價格藏在方案分頁後面 ───────────
try {
  await p.goto('https://lucidtrading.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait(4000);
  const read = () => p.evaluate(() => {
    const out = {};
    document.querySelectorAll('*').forEach((e) => {
      const t = (e.textContent || '').trim();
      if (/^\d+K\s+(PRO|FLEX|DIRECT)\s+EVAL$/i.test(t) && e.children.length === 0) {
        let c = e; for (let i = 0; i < 6 && c.parentElement; i++) c = c.parentElement;
        const m = (c.textContent || '').replace(/\s+/g, ' ').match(/(\d+K\s+\w+)\s+EVAL\s*\$?([\d,.]+)\$([\d,.]+)/i);
        if (m) out[m[1].toUpperCase().replace(/\s+/g, ' ')] = { list: m[2], now: m[3] };
      }
    });
    return out;
  });
  for (const [tab, key, claimName] of [['LucidPro', '50K PRO', 'Lucid · Pro'], ['LucidFlex', '50K FLEX', 'Lucid · Flex']]) {
    try { await p.getByText(new RegExp('^' + tab + '$', 'i')).first().click({ timeout: 4000 }); await wait(2200); } catch { /* 預設分頁 */ }
    const got = (await read())[key];
    const c = claim(claimName);
    if (!got) { add('WARN', `${claimName} 抓不到價格（版面可能改了）`, `${c.now}`, '—'); continue; }
    if (differs(got.now, c.now) || differs(got.list, c.list))
      add('DIFF', `${claimName} 50K 價格`, `${c.list} → ${c.now}`, `$${got.list} → $${got.now}`);

    // 首購價是「官網折後再 −10%」推算的（官網沒有明列首購價，是店家告知的規則）。
    // 折扣率一變，首購價就跟著錯，所以這裡驗算它跟官網折後價還對不對得起來。
    if (c.firstBuy) {
      const expect = money(got.list) * (1 - ((money(got.list) - money(got.now)) / money(got.list) + 0.10));
      if (differs(c.firstBuy, expect))
        add('DIFF', `${claimName} 首購價（＝官網折後再 −10% 推算）`, c.firstBuy, `$${expect.toFixed(2)}`);
    }
  }
} catch (e) { add('ERR', 'Lucid 抓取失敗', '', e.message.slice(0, 60)); }

// ─────────── Tradeify：定價 + 現行折扣碼 ───────────
try {
  await p.goto('https://tradeify.co/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait(4000);
  const t = await p.evaluate(() => document.body.innerText);
  const code = t.match(/USE CODE:?\s*([A-Z0-9]{3,15})/i)?.[1];
  const off = t.match(/(\d{2})%\s*OFF/i)?.[1];
  const c = claim('Tradeify · Select');
  if (code && code.toUpperCase() !== (c.code || '').toUpperCase())
    add('DIFF', 'Tradeify 折扣碼', c.code, code.toUpperCase());
  if (off && Number(off) !== 40)
    add('DIFF', 'Tradeify 折扣幅度（站上算 6 折）', '40% OFF', `${off}% OFF`);
} catch (e) { add('ERR', 'Tradeify 抓取失敗', '', e.message.slice(0, 60)); }

// ─────────── TradeDay：50K 月費 + 折扣碼 ───────────
try {
  await p.goto('https://www.tradeday.com/#pricing', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait(4500);
  const t = await p.evaluate(() => document.body.innerText);
  const code = t.match(/USE CODE\s*"?([A-Z0-9]{3,15})"?/i)?.[1];
  const c = claim('TradeDay · Quick Pay');
  if (code && code.toUpperCase() !== (c.code || '').toUpperCase())
    add('DIFF', 'TradeDay 折扣碼', c.code, code.toUpperCase());
  const m = t.match(/50k\s*\n\s*\$(\d+)\s*\n\s*\$(\d+)/i);
  if (m && differs(c.list, m[1])) add('DIFF', 'TradeDay 50K 原價', c.list, `$${m[1]}`);
  if (m && differs(c.now, m[2])) add('DIFF', 'TradeDay 50K 折後', c.now, `$${m[2]}`);
  if (!m) add('WARN', 'TradeDay 50K 價格抓不到（版面可能改了）', c.now, '—');
} catch (e) { add('ERR', 'TradeDay 抓取失敗', '', e.message.slice(0, 60)); }

// ─────────── Topstep：標準版 + 免啟動費版 50K ───────────
// 兩件事要注意：
// ① /topstep-prop 的 Standard／No-activation 是切換分頁，預設不固定，靠位置解析會抓到別張卡
//    （實測抓到過 $49 標準價與 $3,000 獲利目標），所以不從那頁讀價。
// ② 官方價格文章有完整兩版表格（50K | $49/month | $95/month），拿它當唯一來源。
// 這裡只確認「站上宣稱的金額，官方頁面還找不找得到」——寧可漏報也不誤報。
try {
  await p.goto('https://help.topstep.com/en/articles/14289835-topstep-pricing-and-payment-questions',
    { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait(3500);
  const t = (await p.evaluate(() => document.body.innerText)).replace(/,/g, '');
  // 反斜線一定要寫兩個：'\$' 在 JS 字串裡會變成 '$'，regex 就壞了（這裡踩過兩次）
  const has = (src, n) => new RegExp('\\$\\s?' + n + '(?:\\.00)?(?!\\d)').test(src);

  // 官方價格文章列的是「定價」：標準 $49、免啟動 $95，啟動費 $149
  for (const claimName of ['Topstep · 標準', 'Topstep · 免啟動費']) {
    const c = claim(claimName);
    if (!has(t, money(c.list)))
      add('WARN', `${claimName} 定價 ${c.list} 在官方價格頁找不到——可能改價，請人工確認`, c.list, '—');
  }
  if (!has(t, 149))
    add('WARN', 'Topstep 標準版啟動費 $149 在官方價格頁找不到——請人工確認', '$149', '—');

  // $85 是行銷頁的「特價」，官方價格文章不會有，要去 /topstep-prop 看
  await p.goto('https://www.topstep.com/topstep-prop', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait(4000);
  const t2 = (await p.evaluate(() => document.body.innerText)).replace(/,/g, '');
  const sale = claim('Topstep · 免啟動費');
  if (!has(t2, money(sale.now)))
    add('WARN', `Topstep 免啟動費特價 ${sale.now} 在官網找不到——特價可能結束了，請人工確認`, sale.now, '—');
} catch (e) { add('ERR', 'Topstep 抓取失敗', '', e.message.slice(0, 60)); }

// ─────────── Apex：四種方案 50K（價格在按鈕後面）───────────
try {
  await p.goto('https://apextraderfunding.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait(5000);
  const tap = (label) => p.evaluate((l) => {
    const el = [...document.querySelectorAll('button')].find((e) => (e.textContent || '').trim().toLowerCase() === l.toLowerCase());
    if (!el) return false; el.click(); return true;
  }, label);
  const read = () => p.evaluate(() => {
    for (const e of document.querySelectorAll('*')) {
      const t = (e.textContent || '').trim();
      if (/^\d+K\s+[A-Z ]+$/.test(t) && e.children.length === 0) {
        let c = e; for (let i = 0; i < 8 && c.parentElement; i++) c = c.parentElement;
        const s = (c.textContent || '').replace(/\s+/g, ' ');
        const pr = s.match(/\$([\d,]+\.\d{2})\s*\$([\d,]+\.\d{2})/);
        const act = s.match(/Activation Fee:?\s*\$?([\d,]+(?:\.\d{2})?|FREE)/i);
        if (pr) return { card: t, list: pr[1], now: pr[2], act: act?.[1] ?? null };
      }
    }
    return null;
  });
  const combos = [
    ['Intraday Trail', 'Standard', 'Apex · 日內追 · 標準'],
    ['Intraday Trail', 'No Activation Fee', 'Apex · 日內追 · 免啟動'],
    ['EOD Trail', 'Standard', 'Apex · EOD 追尾 · 標準'],
    ['EOD Trail', 'No Activation Fee', 'Apex · EOD 追尾 · 免啟動'],
  ];
  for (const [dd, fee, claimName] of combos) {
    if (!(await tap(dd))) { add('WARN', `Apex 點不到「${dd}」（版面可能改了）`, '', ''); continue; }
    await wait(1200);
    if (!(await tap(fee))) { add('WARN', `Apex 點不到「${fee}」`, '', ''); continue; }
    await wait(1200);
    await tap('50k'); await wait(2200);
    const got = await read();
    const c = claim(claimName);
    if (!got) { add('WARN', `${claimName} 抓不到`, c.now, '—'); continue; }
    if (differs(got.now, c.now)) add('DIFF', `${claimName} 50K 考試費`, c.now, `$${got.now}`);
    if (differs(got.list, c.list)) add('DIFF', `${claimName} 50K 定價`, c.list, `$${got.list}`);
    const gotAct = /free/i.test(got.act ?? '') ? '無' : `$${got.act}`;
    if (gotAct !== c.activation) add('DIFF', `${claimName} 啟動費`, c.activation, gotAct);
  }
} catch (e) { add('ERR', 'Apex 抓取失敗', '', e.message.slice(0, 60)); }

// ─────────── Trustpilot 星等 ───────────
const TP = [['lucid', 'lucidtrading.com', 4.6], ['tradeify', 'tradeify.co', 4.6],
            ['tradeday', 'tradeday.com', 4.6], ['apex', 'apextraderfunding.com', 4.3],
            ['topstep', 'topstep.com', 3.6]];
for (const [name, domain, claimed] of TP) {
  try {
    await p.goto(`https://www.trustpilot.com/review/${domain}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await wait(2500);
    const v = await p.evaluate(() => {
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const j = JSON.parse(s.textContent);
          for (const o of (Array.isArray(j) ? j : (j['@graph'] || [j]))) {
            const ag = o.aggregateRating || o.review?.aggregateRating;
            if (ag?.ratingValue) return Number(ag.ratingValue);
          }
        } catch { /* 這個 ld+json 不是評分 */ }
      }
      return null;
    });
    if (v == null) add('WARN', `${name} Trustpilot 抓不到星等`, String(claimed), '—');
    else if (Math.abs(v - claimed) >= 0.1) add('DIFF', `${name} Trustpilot 星等`, String(claimed), String(v));
  } catch (e) { add('ERR', `${name} Trustpilot 失敗`, '', e.message.slice(0, 50)); }
  await wait(900);
}

await browser.close();

// ── 報告 ──
const stamp = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
const diffs = findings.filter((f) => f.level === 'DIFF');
const others = findings.filter((f) => f.level !== 'DIFF');

const lines = [`# 官方核對報告　${stamp}`, ''];
if (!findings.length) lines.push('✅ 全部相符，網站不用改。');
if (diffs.length) {
  lines.push(`## ⚠️ 有 ${diffs.length} 處跟官網對不上（要改）`, '');
  lines.push('| 項目 | 站上寫 | 官網現在 |', '|---|---|---|');
  diffs.forEach((f) => lines.push(`| ${f.what} | ${f.expected} | **${f.actual}** |`));
  lines.push('');
}
if (others.length) {
  lines.push(`## 抓不到／出錯（${others.length}）——不代表數字錯，是這支腳本沒讀到`, '');
  others.forEach((f) => lines.push(`- [${f.level}] ${f.what}　${f.actual}`));
}
const report = lines.join('\n');
writeFileSync(path.join(OUT, 'check-report.md'), BOM + report, 'utf8');

if (!QUIET || findings.length) console.log('\n' + report);
console.log(`\n報告：${path.join(OUT, 'check-report.md')}`);
process.exit(diffs.length ? 1 : 0);
