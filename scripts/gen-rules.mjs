// 從 src/missions.ts 產生規則頁的「出金任務」區塊,寫進 public/rules/*.html
// 用法:node scripts/gen-rules.mjs
// 規則頁中以 <!--MISSIONS:START--> ... <!--MISSIONS:END--> 標記插入點。
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const tmp = path.join(root, '.missions.cjs');

execSync(`npx esbuild "${path.join(root, 'src/missions.ts')}" --bundle --format=cjs --platform=node --outfile="${tmp}" --log-level=warning`, { stdio: 'inherit' });
const require = createRequire(import.meta.url);
const { FIRMS_M, VERIFIED, fill } = require(tmp);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** $金額 / 百分比 → 放大變色 */
const num = (s, cls) =>
  esc(s).replace(/(\$[\d,]*\d(?:\.\d+)?|\d+%)/g, `<span class="target-num ${cls}">$1</span>`);

function planBlock(firm, plan) {
  const sizes = Object.keys(plan.sizes);
  const ref = plan.sizes[sizes.includes('50K') ? '50K' : sizes[0]];
  const refSize = sizes.includes('50K') ? '50K' : sizes[0];

  const cols = [
    ['考試獲利目標', (s) => s.target, 'col-pay'],
    ['最大虧損(碰到就爆)', (s) => s.maxLoss, 'col-risk'],
    ['日虧損上限', (s) => s.dll ?? '無', 'col-risk'],
    ['要打到', (s) => s.goal, 'col-pay'],
    ['獲利日門檻', (s) => s.minDay, 'col-pay'],
    ['單次最多領', (s) => s.cap, 'col-pay'],
    ['最低出金', (s) => s.minPayout, ''],
    ['部位上限', (s) => s.contracts, ''],
  ].filter(([, get]) => sizes.some((sz) => get(plan.sizes[sz])));

  const head = cols.map(([l, , c]) => `<th class="${c}">${esc(l)}</th>`).join('');
  const rows = sizes.map((sz) => {
    const s = plan.sizes[sz];
    const tds = cols.map(([, get, c]) => `<td class="${c}">${esc(get(s) ?? '—')}</td>`).join('');
    return `<tr><td><b>${esc(sz)}</b></td>${tds}</tr>`;
  }).join('\n      ');

  const tasks = plan.tasks.map((t) => `<li>${num(fill(t, ref), 'pay')}</li>`).join('\n        ');
  const lines = plan.redlines.map((t) => `<li>${num(fill(t, ref), 'risk')}</li>`).join('\n        ');

  return `
  <h3 class="plan-h">${esc(plan.name)} <span class="plan-sub">${esc(plan.sub)}</span>
    <span class="plan-tag">${plan.dd === 'EOD' ? 'EOD 收盤結算回撤' : 'Intraday 盤中即時回撤'}</span>
    <span class="plan-tag">分潤 ${esc(plan.split)}</span></h3>

  <div class="tw"><table>
    <thead><tr><th>規模</th>${head}</tr></thead>
    <tbody>
      ${rows}
    </tbody>
  </table></div>

  <div class="mission-card"><div class="bar"></div><div class="inner">
    <div class="who">${esc(firm.name)} · <b>${esc(plan.name)}</b>（下列數字以 ${esc(refSize)} 為例，其他規模見上表）</div>
    <div class="mission-grid">
      <div class="mission-col task"><h4>🎯 你的任務</h4><ul>
        ${tasks}
      </ul></div>
      <div class="mission-col line"><h4>🚫 不能碰的線</h4><ul>
        ${lines}
      </ul></div>
    </div>${plan.tip ? `
    <div class="mission-tip">${num(plan.tip, 'pay')}</div>` : ''}
  </div></div>
`;
}

function firmBlock(firm) {
  const v = VERIFIED[firm.id];
  const note = v
    ? `<div class="box new"><b>✅ 已核對官方</b>本頁每條規則於 <b>2026/07</b> 逐條核對官方幫助中心。規則仍以官網為準。</div>`
    : `<div class="box warn"><b>⚠️ 官方核對中</b>本家官網對自動查詢有存取限制，以下數字尚未逐條核對官方原文，<b>請務必以官網為準</b>。</div>`;
  return `<!--MISSIONS:START-->
  <h2><span class="n">★</span> 出金任務：選你的帳號類型與規模</h2>
  ${note}
  <p class="mission-intro">每個帳號類型的規則<b>都不一樣</b>。下面按類型分開列，每種規模要打到多少錢、最多虧多少、單次能領多少，<b>都已經算好</b>。</p>
${firm.plans.map((p) => planBlock(firm, p)).join('\n')}
  <!--MISSIONS:END-->`;
}

let n = 0;
for (const firm of FIRMS_M) {
  const file = path.join(root, 'public/rules', `${firm.id}.html`);
  if (!existsSync(file)) { console.warn(`skip (no file): ${firm.id}`); continue; }
  const html = readFileSync(file, 'utf8');
  if (!html.includes('<!--MISSIONS:START-->')) {
    console.warn(`skip (no marker): ${firm.id}.html — 請先加入 <!--MISSIONS:START--><!--MISSIONS:END-->`);
    continue;
  }
  const out = html.replace(/<!--MISSIONS:START-->[\s\S]*?<!--MISSIONS:END-->/, firmBlock(firm));
  writeFileSync(file, out, 'utf8');
  console.log(`✓ ${firm.id}.html — ${firm.plans.length} 個帳號類型`);
  n++;
}
rmSync(tmp, { force: true });
console.log(`\n完成 ${n} 頁。`);
