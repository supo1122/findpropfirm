// 每 15 分由 GitHub Actions 執行：用「你自己的正規 Bot」讀你 staging 伺服器的集中頻道
// （各家 PF 公告已由 Discord 官方 Follow 鏡像進來）→ 只留故障/優惠/規則 → 翻繁中
// → 把折扣碼換成你的 → 用 Webhook 發到正式群。狀態存 public/discord-state.json 避免重複。
// 憑證只從環境變數讀（GitHub Secrets）。讀的是「你自己的伺服器」，用官方 Bot API，非 self-bot。
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
// 集中頻道 ID：已內建你的 #各家公告，要改也可用環境變數覆蓋
const SOURCE = process.env.DISCORD_SOURCE_CHANNEL_ID || '1528058945782939680';
const WEBHOOK = process.env.DISCORD_OUTPUT_WEBHOOK;      // 正式群輸出頻道的 Webhook URL
if (!TOKEN || !WEBHOOK) {
  throw new Error('缺少 DISCORD_BOT_TOKEN / DISCORD_OUTPUT_WEBHOOK（頻道 ID 已內建）');
}

const STATE_FILE = 'public/discord-state.json';
const API = 'https://discord.com/api/v10';
const H = { Authorization: `Bot ${TOKEN}`, 'User-Agent': 'PropFirmTW-Bot (github actions, v1)' };

// 你的折扣碼：偵測到某家 → 換成你的碼、並附上你的碼
const MY_CODES = { lucid: 'PFTW', tradeday: 'PFTW', tradeify: 'JULY', apex: 'SAVENOW' };
// 由內文關鍵字判斷是哪一家
const FIRM_MATCH = [
  ['lucid', /lucid/i],
  ['apex', /apex/i],
  ['topstep', /top\s?step/i],
  ['tradeify', /tradeify/i],
  ['tradeday', /trade\s?day/i],
];
const FIRM_ZH = { lucid: 'Lucid', apex: 'Apex', topstep: 'Topstep', tradeify: 'Tradeify', tradeday: 'TradeDay' };

// 只留「真的有料」：折扣/促銷、活動、出金、規則、故障。純閒聊一律濾掉。（沿用 X 爬蟲同一套）
const STRONG = [
  [/\b\d{1,3}\s?%(\s?off)?\b|\b\d\s?折\b|折扣|優惠|\bpromo\b|\bsale\b|\bcoupon\b|\bdiscount\b|\bcode[s]?\b/i, '折扣'],
  [/\bflash\s?(drop|sale)\b|\ball[\s.-]?in\b|\blowest\b|\blimited[\s-]?time\b|\bdeal[s]?\b|\bspecial\b|\bends?\s+(mon|tue|wed|thu|fri|sat|sun|today|tomorrow|\w+day|\d)|\bexpir|\blast\s?(chance|day)|\bends\s?(soon|tonight)|限時|限量|閃購|特價|最低|截止|倒數/i, '折扣'],
  [/\blaunch|\bintroduc|\bannounc|\bnow (available|live)|\bnew (account|plan|program|challenge|payout)|\bgiveaway\b|\bcontest\b|\bbonus\b|\bfree\b|贈|競賽|活動|上線|推出|新方案/i, '活動'],
  [/\bpayout[s]?\b|\bwithdraw(al)?\b|出金/i, '出金'],
  [/\bconsistency\b|\bdrawdown\b|\bnew rule[s]?\b|\brule[s]? (change|update)|規則|一致性|回撤/i, '規則更新'],
  [/\bmaintenance\b|\boutage\b|\bdegraded\b|\bincident\b|\bdowntime\b|\bdisconnect|系統|維護|故障|中斷|斷線/i, '故障'],
];
function classify(text) {
  for (const [re, tag] of STRONG) if (re.test(text)) return tag;
  return null;
}
function firmOf(text) {
  for (const [id, re] of FIRM_MATCH) if (re.test(text)) return id;
  return null;
}

// 免費 Google 翻譯端點 → 繁體中文（沿用 X 爬蟲）
async function toZh(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-TW&dt=t&q=${encodeURIComponent(text)}`;
    const r = await fetch(url);
    const j = await r.json();
    return j[0].map((seg) => seg[0]).join('').trim();
  } catch { return text; }
}

// 把別人的折扣碼換成你的（有對應才換）；並在結尾附上你的碼
function swapCode(zh, firm) {
  const mine = MY_CODES[firm];
  if (!mine) return zh;
  let out = zh.replace(/(折扣碼|優惠碼|代碼|coupon|code)\s*[:：]?\s*[A-Z0-9]{3,15}/gi, `$1 ${mine}`);
  if (!new RegExp(mine, 'i').test(out)) out += `\n👉 本站專屬折扣碼：**${mine}**`;
  return out;
}

// 把一則 Discord 訊息（含 embeds）攤成純文字
function messageText(m) {
  let parts = [m.content || ''];
  for (const e of m.embeds || []) {
    if (e.title) parts.push(e.title);
    if (e.description) parts.push(e.description);
    for (const f of e.fields || []) parts.push(`${f.name} ${f.value}`);
  }
  return parts.join('\n').replace(/\s+\n/g, '\n').trim();
}

async function loadState() {
  if (existsSync(STATE_FILE)) { try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); } catch {} }
  return { lastId: null, posted: [] };
}

async function main() {
  const state = await loadState();

  // ── 整合：把 X 爬蟲的新消息（public/news.json）也轉發到同一個正式群 ──
  // 用推文 id 去重；第一次執行只記基準、不回填洗版。
  try {
    if (existsSync('public/news.json')) {
      const news = JSON.parse(readFileSync('public/news.json', 'utf8'));
      const firstX = state.postedX === undefined;   // 第一次整合 → 只記基準
      const sentX = new Set(state.postedX || []);
      for (const it of news.items || []) {
        const m = /x\.com\/[^/]+\/status\/(\d+)/.exec(it.html || '');
        if (!m) continue;                 // 沒有推文 id（置頂促銷）→ 跳過
        const id = m[1];
        if (sentX.has(id)) continue;
        if (firstX) { sentX.add(id); continue; }   // 首次只記基準
        const text = (it.html || '')
          .replace(/<a [^>]*href="([^"]+)"[^>]*>.*?<\/a>/g, ' $1')
          .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        const content = `🐦 **X 快訊**  \`${it.tag || '消息'}\`\n${text}`.slice(0, 1900);
        const wr = await fetch(WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
        });
        if (wr.ok) { sentX.add(id); await new Promise((r) => setTimeout(r, 1200)); }
        else console.error('X 轉發失敗', wr.status, await wr.text());
      }
      state.postedX = [...sentX].slice(0, 300);
    }
  } catch (e) { console.error('轉發 X 消息失敗:', e.message); }

  // 讀集中頻道訊息（新→舊）。有 lastId 就只抓它之後的新訊息。
  const q = new URLSearchParams({ limit: '50' });
  if (state.lastId) q.set('after', state.lastId);
  const res = await fetch(`${API}/channels/${SOURCE}/messages?${q}`, { headers: H });
  if (!res.ok) throw new Error(`讀取頻道失敗 ${res.status}: ${await res.text()}`);
  let msgs = await res.json();
  msgs = msgs.sort((a, b) => (a.id < b.id ? -1 : 1)); // 轉成舊→新

  // 首次執行（沒有 lastId）：只記錄目前最新的 id，不回填洗版
  if (!state.lastId) {
    if (msgs.length) state.lastId = msgs[msgs.length - 1].id;
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log('首次執行：已記錄基準點，之後只發新公告');
    return;
  }

  let posted = 0;
  for (const m of msgs) {
    state.lastId = m.id;
    if (m.type !== 0) continue;         // 跳過系統訊息（如「已將…新增至此頻道」）
    if ((state.posted || []).includes(m.id)) continue;  // 防重複：發過的不再發
    const text = messageText(m);
    if (!text) continue;
    const tag = classify(text) || '公告';  // DC 不過濾：抓不到分類就標「公告」，全部轉
    const firm = firmOf(text);
    let zh = await toZh(text.replace(/https?:\/\/\S+/g, '').trim());
    zh = swapCode(zh, firm);
    const head = `📢 **官方公告 · ${firm ? FIRM_ZH[firm] : 'PropFirm'}**  \`${tag}\``;
    const content = `${head}\n${zh}`.slice(0, 1900);

    const wr = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    });
    if (wr.ok) { posted++; state.posted = [m.id, ...(state.posted || [])].slice(0, 200); }
    else console.error('發送失敗', wr.status, await wr.text());
    await new Promise((r) => setTimeout(r, 1200)); // 輕微間隔避免觸發速率限制
  }

  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`本輪發布 ${posted} 則到正式群`);
}
main().catch((e) => { console.error(e); process.exit(1); });
