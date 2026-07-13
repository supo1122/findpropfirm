// ===== PropFirmTW 資料層（繁體中文，2026/07 核對）=====

export type Block =
  | { kind: 'callout'; tone: 'new' | 'warn'; title: string; body: string }
  | { kind: 'para'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] };

export type Firm = {
  id: string;
  name: string;
  logo: string;
  rating: number;
  type: 'futures' | 'cfd';
  tags: string[];
  summary: string;
  risk: string[];
  pay: string;
  dll: string;
  code?: string;
  link: string;
  anim?: string; // 動畫專區的 HTML（放 public/anim/，用 iframe 嵌入）
  metrics: { label: string; value: string }[];
  blocks: Block[];
};

export const FIRMS: Firm[] = [
  {
    id: 'lucid',
    name: 'Lucid Trading',
    logo: '/logos/lucid.png',
    rating: 4.8,
    type: 'futures',
    tags: ['新手首選', 'EOD', '一次性付費'],
    summary: '無月費、免啟動費、EOD 回撤、可新聞交易。Flex / Pro / Direct / Maxx 多條路線，新手第一家首選之一。',
    risk: ['eod'],
    pay: 'once',
    dll: 'no',
    code: 'PFTW',
    link: 'https://lucidtrading.com/ref/patrigger/',
    anim: '/anim/lucid.html',
    metrics: [
      { label: '分潤', value: '90%' },
      { label: 'Flex 出金一致性', value: '無' },
      { label: '出金門檻', value: '5 獲利日' },
    ],
    blocks: [
      { kind: 'callout', tone: 'new', title: '🆕 7/5 Pro 新制', body: '台灣時間 2026/7/5 12:01 後新購或重置的 LucidPro，考試與出金階段都取消 DLL（無日風控）；舊帳號不追溯。仍有 40% 出金一致性與緩衝區。' },
      { kind: 'h3', text: 'LucidFlex 考試（一致性 50%）' },
      { kind: 'table', head: ['規模', '獲利目標', '總風控 EOD', '口數上限'], rows: [
        ['25K', '$1,250', '$1,000', '2 Mini / 20 Micro'],
        ['50K', '$3,000', '$2,000', '4 Mini / 40 Micro'],
        ['100K', '$6,000', '$3,000', '6 Mini / 60 Micro'],
        ['150K', '$9,000', '$4,500', '10 Mini / 100 Micro'],
      ] },
      { kind: 'callout', tone: 'warn', title: '一致性 50% 是什麼', body: '50K 考試目標 $3,000，單日最高獲利不得超過總獲利 50%（$1,500）。超過不違規但目標會往上加，等於逼你至少交易 2 天。' },
      { kind: 'h3', text: 'LucidFlex 出金（通關後無一致性）' },
      { kind: 'table', head: ['規模', '單次出金上限', '獲利日門檻'], rows: [
        ['25K', '$1,000', '$100'], ['50K', '$2,000', '$150'], ['100K', '$2,500', '$200'], ['150K', '$3,000', '$250'],
      ] },
      { kind: 'h3', text: 'LucidPro / Direct' },
      { kind: 'list', items: [
        'Pro：7/5 後取消 DLL，仍有 40% 出金一致性與緩衝區（緩衝＝總風控＋$100）。',
        'Direct：免考試直接出金，一致性最嚴 20%。',
        '每週期最低獲利目標：25K→$250／50K→$500／100K→$750／150K→$1,000。',
      ] },
      { kind: 'h3', text: 'Lucid Live（2026/7 新制）' },
      { kind: 'list', items: [
        '單帳號第 5 次出金轉 Live；表現穩定可能提前。',
        'Live 從 $0 起始、EOD 回撤、無日風控、每日可出金、分潤 90%。',
        '首次轉 Live 有 Live Bonus；爆倉冷卻 2 週。',
      ] },
    ],
  },
  {
    id: 'tradeify',
    name: 'Tradeify',
    logo: '/logos/tradeify.png',
    rating: 4.7,
    type: 'futures',
    tags: ['彈性最佳', 'EOD', '一次性付費'],
    summary: 'Select / Growth / Lightning 三條路線，出金節奏最彈性。Select 通關後出金免一致性。',
    risk: ['eod', 'intraday'],
    pay: 'once',
    dll: 'no',
    link: 'https://tradeify.co/',
    anim: '/anim/tradeify.html',
    metrics: [
      { label: '分潤', value: '90%' },
      { label: 'Select 出金一致性', value: '無' },
      { label: '最快通關', value: '1 天' },
    ],
    blocks: [
      { kind: 'callout', tone: 'new', title: '🔄 2026 更名', body: 'Advanced→Select、Straight to Sim→Lightning、Growth 不變；全方案已免啟動費。' },
      { kind: 'h3', text: 'Select（考試 40% 一致性，通關後無）' },
      { kind: 'list', items: [
        '最快 3 天通關；通關後可選「每日出金」或「5 獲利日出金」。',
        'Flex 模式無日風控、大額出金；Daily 模式有 DLL、需緩衝區。',
        '分潤 90%。',
      ] },
      { kind: 'h3', text: 'Growth（快速通關）' },
      { kind: 'table', head: ['規模', '獲利目標', '總風控', 'DLL'], rows: [
        ['25K', '$1,500', '$1,000', '$600'], ['50K', '$3,000', '$2,000', '$1,250'],
        ['100K', '$6,000', '$3,500', '$2,500'], ['150K', '$9,000', '$5,000', '$3,750'],
      ] },
      { kind: 'list', items: ['出金 35% 一致性、5 獲利日、緩衝區（50K 需達 $53,000）。分潤統一 90/10。'] },
      { kind: 'h3', text: 'Lightning（免考試直接開帳）' },
      { kind: 'list', items: [
        '階梯式一致性：第 1 次出金 20%、第 2 次 25%、第 3 次起 30%。',
        '需先賺到緩衝區（＝最大回撤）才能出金。',
      ] },
      { kind: 'callout', tone: 'warn', title: '平倉時間', body: '2026/7/13 起所有持倉須在美東 4:45 PM 前平倉（比原本早 14 分鐘）。' },
    ],
  },
  {
    id: 'apex',
    name: 'Apex Trader Funding',
    logo: '/logos/apex.png',
    rating: 4.5,
    type: 'futures',
    tags: ['獲利潛力最高', 'EOD／Intraday', '複製 20 帳'],
    summary: '考試費常有 1–2 折，但過關需付啟動費（付啟動費版：日內 $59／EOD $119），總成本要含啟動費；限 1 個月內考完。可開 20 帳複製下單，2026/03 大改革取消 MAE、改自動出金。',
    risk: ['eod', 'intraday'],
    pay: 'once',
    dll: 'no',
    link: 'https://apextraderfunding.com/',
    anim: '/anim/apex.html',
    metrics: [
      { label: '分潤', value: '首階 100%→90%' },
      { label: 'PA 一致性', value: '50%' },
      { label: '可複製', value: '20 帳' },
    ],
    blocks: [
      { kind: 'callout', tone: 'new', title: '🆕 2026/03「4.0」大改革', body: '①新增 EOD 風控模式；②取消 MAE（未實現虧損）規則；③取消人工出金審查改自動化；④一致性由 30% 放寬為 50%。' },
      { kind: 'h3', text: '考試目標與風控（EOD／Intraday 皆同）' },
      { kind: 'table', head: ['規模', '獲利目標', '總風控', 'DLL（限EOD考試）'], rows: [
        ['25K', '$1,500', '$1,000', '$500'], ['50K', '$3,000', '$2,000', '$1,000'],
        ['100K', '$6,000', '$3,000', '$1,500'], ['150K', '$9,000', '$4,000', '$2,000'],
      ] },
      { kind: 'h3', text: 'PA 出金規則' },
      { kind: 'list', items: [
        '5 個有效獲利日（50K：EOD>$250／Intraday>$200）。',
        '安全網：50K 需 $52,100；分潤前階 100% → 之後 90%。',
        '一致性 50%（單日 ≤ 上次出金後累積利潤 50%）；最多出金 6 次後轉 Live。',
        '允許 DCA、新聞交易；可開 20 帳複製。',
      ] },
      { kind: 'h3', text: 'Apex Live（2026/06 公布）' },
      { kind: 'list', items: [
        '邀請制。Live 從 $0 起始、$3,000 EOD 回撤、無 DLL、每日可出金、分潤 90/10。',
        'Bonus Vault 每月 20%（新帳戶首月 40%）；爆倉 14 天冷卻走 Second Chance（$199）。',
      ] },
    ],
  },
  {
    id: 'topstep',
    name: 'Topstep',
    logo: '/logos/topstep.png',
    rating: 4.3,
    type: 'futures',
    tags: ['規則最簡單', 'EOD', '月費'],
    summary: '老牌自營商，TopstepX 內建 TradingView。規則語言最好懂，Live 帳戶免數據費。',
    risk: ['eod'],
    pay: 'monthly',
    dll: 'no',
    link: 'https://www.topstep.com/',
    metrics: [
      { label: '分潤', value: '90%' },
      { label: '考試一致性', value: '50%' },
      { label: '付費', value: '訂閱月費' },
    ],
    blocks: [
      { kind: 'callout', tone: 'new', title: '🆕 分潤新制（2026/1/12）', body: '新用戶自第一美元起統一 90/10；舊用戶保留「首 $10,000 終身利潤 100% → 之後 90/10」。' },
      { kind: 'h3', text: '考試（Trading Combine）' },
      { kind: 'list', items: [
        'EOD 最大虧損，虧損線隨最高餘額上移至初始資金後固定。',
        '一致性 50%：單日最高獲利 ≤ 總獲利 50%（建議壓在 40–45%）。',
        '兩種方案：標準（月費低、通關付 $149 啟動費）／免啟動費（月費高、通關 $0）。',
      ] },
      { kind: 'h3', text: 'EX 出金上限（官網現制）' },
      { kind: 'table', head: ['帳戶', '標準路徑', '一致性路徑'], rows: [
        ['50K', '$2,000', '$3,000'], ['100K', '$3,000', '$4,000'], ['150K', '$5,000', '$6,000'],
      ] },
      { kind: 'list', items: [
        '單日淨利 ≥ $150 算 1 個獲利日；累積 5 個可出金，每次領餘額 50%。有 DLL 時上限加倍。',
        '單帳號 5 次出金轉 Live；Live 免 CME 數據費、30 獲利日後解鎖每日出金與 100% 提領。',
      ] },
    ],
  },
];

// 價格比較（以 50K 為代表；定價常有 70–90% 折扣，實際以官網結帳為準。2026/07 查證）
export type Price = {
  id: string; name: string; logo: string; model: string;
  evalFee: string; activation: string; total: string; code?: string; link: string;
};
export const PRICES: Price[] = [
  {
    id: 'lucid', name: 'Lucid Trading', logo: '/logos/lucid.png', model: '一次性 · 無月費',
    evalFee: '50K 定價約 $175', activation: '無啟動費',
    total: '首購 $70', code: 'PFTW', link: 'https://lucidtrading.com/ref/patrigger/',
  },
  {
    id: 'tradeify', name: 'Tradeify', logo: '/logos/tradeify.png', model: '一次性 · 免啟動費',
    evalFee: '50K Select 定價約 $165', activation: '無啟動費',
    total: '$87 起（Select $99）', code: '', link: 'https://tradeify.co/',
  },
  {
    id: 'apex', name: 'Apex（付啟動費版）', logo: '/logos/apex.png', model: '限 1 個月內考完',
    evalFee: '日內考試 $24.9 / EOD $49', activation: '日內啟動費 $59 / EOD $119（過關後）',
    total: '考試 $24.9 起', code: '', link: 'https://apextraderfunding.com/',
  },
  {
    id: 'apex', name: 'Apex（免啟動費版）', logo: '/logos/apex.png', model: '限 1 個月內考完',
    evalFee: '日內考試 $79 / EOD $109', activation: '無啟動費（$0）',
    total: '啟動費 $0', code: '', link: 'https://apextraderfunding.com/',
  },
  {
    id: 'topstep', name: 'Topstep', logo: '/logos/topstep.png', model: '月費 + 啟動費',
    evalFee: '50K $49/月（標準）或 $109/月（免啟動）', activation: '標準 $149 / 免啟動 $0（過關後）',
    total: '無折扣', code: '', link: 'https://www.topstep.com/',
  },
];

export const OFFERS = [
  { firm: 'Lucid — LucidFlex 50K', old: '原價 $109', now: '首購 $70', note: '一次性付費 · 無日風控 · 終身擁有', deadline: '折扣碼 PFTW · Flex 約 7 折', code: 'PFTW', link: 'firms/lucid' },
  { firm: 'Lucid — LucidPro', old: '', now: '6 折', note: '7/5 起考試與出金皆無日風控', deadline: '台灣時間 7/25 11:59 截止', code: 'PFTW', link: 'firms/lucid' },
  { firm: 'Apex — 付啟動費版', old: '', now: '日內啟動費 $59', note: '限時 · 考試 $24.9 起（限 1 個月內考完）', deadline: '限時優惠 · 以官網為準', code: '', link: 'firms/apex' },
];

export const NOTES = [
  { tag: '折扣', html: '🔥 Lucid Pro 6 折碼 <b>PFTW</b>，台灣時間 7/25 11:59 截止' },
  { tag: '規則更新', html: '📊 LucidPro 7/5 新制：考試與出金都<b>取消日風控</b>' },
  { tag: '規則更新', html: '⚡ Apex 4.0：出金改<b>全自動</b>，不再人工審查' },
];

export const QUIZ = [
  { q: 'dll', title: '你在意「盤中日風控」嗎？', opts: [
    { v: 'care', label: '很在意，最好完全沒有日風控' },
    { v: 'ok', label: '還好，我能控制單日虧損' },
  ] },
  { q: 'speed', title: '通關與出金節奏？', opts: [
    { v: 'fast', label: '越快越好（最好一天通關）' },
    { v: 'flex', label: '彈性穩穩來就好' },
  ] },
  { q: 'goal', title: '你最重視哪一點？', opts: [
    { v: 'cheap', label: '成本越低越好' },
    { v: 'profit', label: '獲利潛力越高越好' },
    { v: 'simple', label: '規則越單純越好' },
  ] },
];

export function recommend(a: Record<string, string>): { id: string; why: string } {
  // Lucid 最便宜（首購 $70）、無日風控、出金快 → 多數情況主推
  if (a.goal === 'profit') return { id: 'apex', why: '想衝高獲利，Apex 可開 20 帳複製下單、獲利潛力最高（但過關要付啟動費、限 1 個月內考完）。' };
  if (a.goal === 'simple' && a.dll === 'ok') return { id: 'topstep', why: '想要最單純的規則，Topstep 語言最好懂、Live 免數據費（月費制）。' };
  if (a.speed === 'fast' && a.dll === 'ok' && a.goal !== 'cheap') return { id: 'tradeify', why: '想通關快，Tradeify Growth 可一天通關，Select 通關後出金還免一致性。' };
  return { id: 'lucid', why: 'CP 值最高：首購 $70 最便宜、完全無日風控、5 個獲利日就能出金——新手首選。' };
}
