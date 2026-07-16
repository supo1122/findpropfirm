// ===== PropFirmTW 資料層（繁體中文，2026/07 核對）=====

function todayTW(): string {
  return new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
}

/** Discord 邀請連結——只在這裡定義一份，App 和 Discord 元件都從這裡拿 */
export const DISCORD = 'https://discord.gg/HC7GBnjwwR';

/** LucidPro 日風控免除活動的最後一天（含當天）。過了就自動切回常規規則。 */
export const LUCID_DLL_WAIVER_UNTIL = '2026-07-24';
export const lucidDllWaived = (): boolean => todayTW() <= LUCID_DLL_WAIVER_UNTIL;


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
    rating: 4.6,
    type: 'futures',
    tags: ['新手首選', 'EOD', '一次性付費'],
    summary: '無月費、免啟動費、EOD 回撤、可新聞交易。Flex / Pro / Direct / Maxx 多條路線，新手第一家首選之一。',
    risk: ['eod'],
    pay: 'once',
    dll: 'no',
    code: 'PFTW',
    link: 'https://lucidtrading.com/ref/pftw',
    anim: '/anim/lucid.html',
    metrics: [
      { label: '分潤', value: '90%' },
      { label: 'Flex 出金一致性', value: '無' },
      { label: '出金門檻', value: '5 獲利日' },
    ],
    blocks: [
      lucidDllWaived()
        ? { kind: 'callout' as const, tone: 'new' as const, title: '🔥 限時：LucidPro 日風控免除中（到 2026/7/24）', body: '常規規則 LucidPro 有日風控（50K $1,200／100K $1,800／150K $2,700；25K 無），活動期間暫時免除，7/24 過後自動恢復。Lucid 所有 DLL 皆為軟違規：碰到只當日禁交易，不會直接失去帳號（除非碰到最大虧損 MLL）。' }
        : { kind: 'callout' as const, tone: 'warn' as const, title: 'LucidPro 日風控（常規已恢復）', body: 'LucidPro 有固定日風控：50K $1,200／100K $1,800／150K $2,700（25K 無）。餘額收在緩衝之上後改用 LucidScale：最高 EOD 利潤 × 60%，只升不降。所有 DLL 皆為軟違規：碰到只當日禁交易，不會直接失去帳號（除非碰到最大虧損 MLL）。' },
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
        `Pro：固定 DLL 50K $1,200／100K $1,800／150K $2,700（25K 無）${lucidDllWaived() ? '——目前活動免除至 2026/7/24' : '（活動已結束，已恢復）'}。出金 40% 一致性＋緩衝區（緩衝＝總風控＋$100）。40% 僅適用 2025/11/28 後購買/重置，之前為 35%；Live 後無一致性。`,
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
    rating: 4.6,
    type: 'futures',
    tags: ['彈性最佳', 'EOD', '一次性付費'],
    summary: 'Select / Growth / Lightning 三條路線，出金節奏最彈性。Select 通關後出金免一致性。',
    risk: ['eod', 'intraday'],
    pay: 'once',
    dll: 'no',
    code: 'JULY',
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
        'Lightning 沒有緩衝區——用「利潤目標」解鎖出金：50K 首次 $3,000、第 2 次起 $2,000（達標後歸零重算）。',
        '⚠️ 利潤目標 ≠ 能領的錢：50K 達標 $3,000，但單次上限只有 $2,000。無最低交易天數。',
        '最大回撤（EOD）：25K $1,000／50K $2,000／100K $4,000／150K $5,250。',
      ] },
      { kind: 'callout', tone: 'warn', title: '平倉時間 4:45 PM ET', body: '所有持倉必須在美東時間 4:45 PM 前平倉（5:00 PM 收盤、5:00–6:00 PM 維護）。適用「所有」帳號類型，含 Live。不能留倉過夜、不能波段。Tradeify 的一個交易日是美東 6:00 PM 到隔天 5:00 PM。' },
    ],
  },
  {
    id: 'tradeday',
    name: 'TradeDay',
    logo: '/logos/tradeday.png',
    rating: 4.6,
    type: 'futures',
    tags: ['出金快', 'Quick Pay / Fast Pass', '月費'],
    summary: 'TradeDay 2.0 兩條路線：Quick Pay（funded 後很快能出金）、Fast Pass（比較快拿到 funded）。分潤最高 90%（Live 90/10）、每日出金、通關 $0 啟動費，出金走 Rise（電匯/加密）。',
    risk: ['eod', 'intraday'],
    pay: 'monthly',
    dll: 'no',
    code: 'TDNEW',
    link: 'https://www.tradeday.com/',
    anim: '/anim/tradeday.html',
    metrics: [
      { label: '分潤', value: '最高 90%' },
      { label: '考試一致性', value: 'Quick 30% / Fast 45%' },
      { label: '通關啟動費', value: '$0' },
    ],
    blocks: [
      { kind: 'callout', tone: 'new', title: '🆕 TradeDay 2.0', body: 'Quick Pay＝通關後先讓你快點出金（Intraday 回撤、$4,000 分潤分界）；Fast Pass＝走 5 獲利日主流路線（EOD 回撤、45% 一致性、官方無最低交易天數）。' },
      { kind: 'h3', text: 'Quick Pay（考試 30% 一致性 · 5 天；折後月費）' },
      { kind: 'table', head: ['規模', 'Intraday/月', 'EOD/月', '獲利目標', '最大回撤'], rows: [
        ['50K', '$62.50', '$87.50', '$3,000', '$2,000'],
        ['100K', '$115', '$142.50', '$6,000', '$3,000'],
        ['150K', '$175', '$197.50', '$9,000', '$4,500'],
      ] },
      { kind: 'list', items: [
        '考試可選 Intraday 或 EOD 回撤，但出金帳號一律 Intraday 回撤；正餘額即可申請、出金後仍須高於起始本金。',
        '分潤：$4,000 以下 50%、超過 $4,000 的部分 80%。',
        '每個 funded 帳號賺到 $10,000 gross profit 進 Live 審查（超過部分會被移除，記得收手）。',
      ] },
      { kind: 'h3', text: 'Fast Pass（考試 45% 一致性 · 無最低交易天數）' },
      { kind: 'table', head: ['規模', '折扣價/月', '獲利目標', '單次出金上限'], rows: [
        ['50K', '約 $90', '$3,000', '$2,000'],
        ['100K', '約 $160', '$6,000', '$2,500'],
        ['150K', '約 $240', '$9,000', '$3,000'],
      ] },
      { kind: 'list', items: [
        'EOD 回撤；funded 出金需 5 個獲利日（50K 每日≥$150）、最多領餘額 50%。',
        '分潤 80%、無緩衝要求；第 5 次出金申請時轉 Funded Live（$0 起始、沿用 EOD 回撤）。',
      ] },
      { kind: 'para', text: '出金速度：5:30 PM CT 前送出於 24 商用小時內處理；款項走 Riseworks（國際電匯每次 $15、L1 加密 $2.5+gas、L2 加密免費）。' },
    ],
  },
  {
    id: 'apex',
    name: 'Apex Trader Funding',
    logo: '/logos/apex.png',
    rating: 4.3,
    type: 'futures',
    tags: ['獲利潛力最高', 'EOD／Intraday', '複製 20 帳'],
    summary: '考試常有大幅折扣（折扣碼 SAVENOW，50K 日內 $249→$24.90），但過關要付啟動費（日內 $59／EOD $119），總成本要含啟動費一起算；考試 30 天內要考完、無重置。可開 20 帳複製下單。模擬 PA 出金 100% 分潤，真倉 Apex Live 為邀請制、90/10。',
    risk: ['eod', 'intraday'],
    pay: 'once',
    dll: 'no',
    link: 'https://apextraderfunding.com/',
    anim: '/anim/apex.html',
    metrics: [
      { label: '分潤', value: '模擬 100% / 真倉 90%' },
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
        '5 個有效獲利日,門檻各規模不同——EOD:25K $100／50K $250／100K $300／150K $350;Intraday:$100／$200／$250／$300。',
        '安全網：50K 需 $52,100，要打到 $52,600 才領得到第一筆；模擬 PA 出金 100% 分潤，但真倉 Apex Live 是 90/10。',
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
    rating: 3.6,
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
        '一致性 50%：單日最高獲利 ≤ 總獲利 50%，超過則獲利目標被調高；最快 2 天可通關。虧損日不會重置最佳日。',
        '日風控 DLL 為「選配」：結帳時可加購（50K $1,000／100K $2,000／150K $3,000），加了不能改；觸發不算違規，只當日強制休息。加 DLL 出金上限加倍。Live 帳戶強制有 DLL。',
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

// 價格比較：一律以 50K 帳號為基準。2026/07 用真實瀏覽器逐家點過官方結帳頁核對。
export type Price = {
  id: string;
  name: string;       // 公司 · 方案
  logo: string;
  model: '一次性' | '月費';
  now: string;        // 50K 折後考試費
  list: string;       // 50K 定價
  activation: string; // 啟動費（'無' 或金額）
  total: string;      // 拿到出金帳號的總成本
  /** 首購再多 10% 的價格（目前只有 Lucid）。
   *  now 一律放「官網當下看得到的價」，首購價另標——
   *  免得使用者照我們寫的去結帳，發現實際比較貴。 */
  firstBuy?: string;
  /** 限時特價：未過期就用 flashPrice 顯示，過了 flashUntil（台灣日）自動恢復原 now。 */
  flashUntil?: string;
  flashPrice?: string;
  flashNote?: string;
  /** runtime 旗標，由 pricesNow() 設定給 UI 顯示「限時」徽章，別手填。 */
  flashOn?: boolean;
  code?: string;
  link: string;
  note?: string;
};
export const PRICES: Price[] = [
  {
    id: 'lucid', name: 'Lucid · Flex', logo: '/logos/lucid.png', model: '一次性',
    now: '$98', list: '$140', activation: '無', total: '$98', firstBuy: '$84', code: 'PFTW',
    link: 'https://lucidtrading.com/ref/pftw',
    note: '無日風控、無緩衝區，規則最單純。考不過可以一直考（無時限）。首購結帳時再多 10%＝6 折 $84',
  },
  {
    id: 'lucid', name: 'Lucid · Pro', logo: '/logos/lucid.png', model: '一次性',
    now: '$111', list: '$185', activation: '無', total: '$111', firstBuy: '$92.50', code: 'PFTW',
    link: 'https://lucidtrading.com/ref/pftw',
    note: '出金上限比 Flex 高，但要打過緩衝 $52,100 才領得到。首購結帳時再多 10%＝5 折 $92.50',
  },
  {
    id: 'tradeify', name: 'Tradeify · Growth', logo: '/logos/tradeify.png', model: '一次性',
    now: '$87', list: '$145', activation: '無', total: '$87', code: 'JULY',
    link: 'https://tradeify.co/',
    note: '1 天可通關，但出金要墊到 $53,000',
  },
  {
    id: 'tradeify', name: 'Tradeify · Select', logo: '/logos/tradeify.png', model: '一次性',
    now: '$99', list: '$165', activation: '無', total: '$99', code: 'JULY',
    link: 'https://tradeify.co/',
    note: '通關後可選 Flex（無緩衝）或 Daily（每日領），選了不能改',
  },
  {
    id: 'apex', name: 'Apex · 日內追 · 標準', logo: '/logos/apex.png', model: '一次性',
    now: '$24.90', list: '$249', activation: '$59', total: '$83.90', code: 'SAVENOW',
    link: 'https://apextraderfunding.com/',
    note: '考試費全場最低——沒考過只賠 $24.90，但考過要補 $59',
  },
  {
    id: 'apex', name: 'Apex · 日內追 · 免啟動', logo: '/logos/apex.png', model: '一次性',
    now: '$79', list: '$790', activation: '無', total: '$79', code: 'SAVENOW',
    flashUntil: '2026-07-21', flashPrice: '$49', flashNote: '🚨 FLASH DROP：Apex 史上最低，50K 免啟動費一口價 $49（平常 $79）',
    link: 'https://apextraderfunding.com/',
    note: '確定會考過的話，總成本比標準版還低 $4.90',
  },
  {
    id: 'apex', name: 'Apex · EOD 追尾 · 標準', logo: '/logos/apex.png', model: '一次性',
    now: '$49', list: '$490', activation: '$119', total: '$168', code: 'SAVENOW',
    link: 'https://apextraderfunding.com/',
    note: 'EOD 版盤中不怕浮盈推門檻，但啟動費 $119 讓總成本翻倍',
  },
  {
    id: 'apex', name: 'Apex · EOD 追尾 · 免啟動', logo: '/logos/apex.png', model: '一次性',
    now: '$109', list: '$1,090', activation: '無', total: '$109', code: 'SAVENOW',
    link: 'https://apextraderfunding.com/',
    note: '想要 EOD 就選這個——比 EOD 標準版總共省 $59',
  },
  {
    id: 'tradeday', name: 'TradeDay · Quick Pay', logo: '/logos/tradeday.png', model: '月費',
    now: '$62／月', list: '$125／月', activation: '無', total: '首月 $62', code: 'TDNEW',
    link: 'https://www.tradeday.com/',
    note: 'Intraday 版。分潤有 $4,000 分界，利潤不到 $4,000 只分 50%',
  },
  {
    id: 'tradeday', name: 'TradeDay · Fast Pass', logo: '/logos/tradeday.png', model: '月費',
    now: '$90／月', list: '$180／月', activation: '無', total: '首月 $90', code: 'TDNEW',
    link: 'https://www.tradeday.com/',
    note: '分潤一律 80%，小額出金比 Quick Pay 划算',
  },
  {
    id: 'topstep', name: 'Topstep · 標準', logo: '/logos/topstep.png', model: '月費',
    now: '$49／月', list: '$49／月', activation: '$149', total: '$198（首月＋啟動）', code: '',
    link: 'https://www.topstep.com/',
    note: '月費最低，但每拿到一個出金帳號就要付一次 $149',
  },
  {
    id: 'topstep', name: 'Topstep · 免啟動費', logo: '/logos/topstep.png', model: '月費',
    now: '$85／月', list: '$95／月', activation: '無', total: '首月 $85', code: '',
    link: 'https://www.topstep.com/',
    note: '月費較高但免啟動費；一個月內考過就比標準版划算',
  },
];

/** 價格表要顯示的版本：限時特價未過期就套用 flashPrice，過期自動恢復原價。
 *  UI 一律用這個，不要直接用 PRICES，才會自動下架過期特價。 */
export function pricesNow(): Price[] {
  const today = todayTW();
  return PRICES.map((p) =>
    p.flashUntil && p.flashPrice && today <= p.flashUntil
      ? {
          ...p,
          list: p.now,                    // 特價期間，原本的 now（$79）變成對照的「平常價」
          now: p.flashPrice,              // 顯示特價
          total: p.activation === '無' ? p.flashPrice : p.total,
          note: (p.flashNote ? p.flashNote + '。' : '') + (p.note ?? ''),
          flashOn: true,
        }
      : p,
  );
}

// 優惠：until = 截止日（YYYY-MM-DD，台灣時間當日 23:59 為止）。過期會自動下架，不用手動刪。
export type Offer = {
  firm: string; old: string; now: string; note: string; deadline: string;
  code: string; link: string; until?: string;
};
export const OFFERS: Offer[] = [
  { firm: 'Lucid — LucidFlex 25K', old: '原價 $100', now: '$70', note: '7 折 · 無日風控 · 無緩衝區 · 免啟動費 · 首購再多 10%（6 折）＝$60', deadline: '折扣碼 PFTW · 結帳時輸入', code: 'PFTW', link: 'firms/lucid' },
  { firm: 'Lucid — LucidFlex 50K', old: '原價 $140', now: '$98', note: '7 折 · 5 獲利日出金 · 通關後無一致性 · 首購再多 10%（6 折）＝$84', deadline: '折扣碼 PFTW · 結帳時輸入', code: 'PFTW', link: 'firms/lucid' },
  { firm: 'Lucid — LucidPro 50K', old: '原價 $185', now: '$111', note: '6 折 · 緩衝區 $52,100 · 出金上限比 Flex 高 · 首購再多 10%（5 折）＝$92.50', deadline: '日風控免除活動至 7/24，之後恢復 $1,200', code: 'PFTW', link: 'firms/lucid', until: '2026-07-25' },
  { firm: 'Tradeify — Select 50K', old: '原價 $165', now: '$99', note: '6 折 · 通關後選 Flex（無緩衝）或 Daily（每日領）', deadline: '折扣碼 JULY · 前 5 次 6 折，之後 7 折', code: 'JULY', link: 'firms/tradeify', until: '2026-07-31' },
  { firm: 'Tradeify — Growth 50K', old: '原價 $145', now: '$87', note: '6 折 · 1 天可通關 · 出金需墊到 $53,000', deadline: '折扣碼 JULY · 前 5 次 6 折，之後 7 折', code: 'JULY', link: 'firms/tradeify', until: '2026-07-31' },
  { firm: 'TradeDay — Quick Pay 50K', old: '原價 $125/月', now: '$62.50/月', note: '5 折 · Intraday 版 · 通關 $0 啟動費', deadline: '折扣碼 TDNEW · 結帳時輸入', code: 'TDNEW', link: 'firms/tradeday' },
  { firm: 'Apex — 🚨 FLASH DROP', old: '平常 $79', now: '$49', note: '50K 日內追・免啟動費・一口價，Apex 史上最低', deadline: '限時到 7/21 23:59 ET（折扣碼 SAVENOW）', code: 'SAVENOW', link: 'firms/apex', until: '2026-07-21' },
  { firm: 'Apex — 考試（一次性）', old: '原價 $199', now: '$19.90', note: '折扣碼 SAVENOW · 5 入 $85（每個 $17）· 過關另付啟動費', deadline: '考試 30 天內要考完 · 無重置 · 以官網為準', code: 'SAVENOW', link: 'firms/apex' },
];

/** 台灣時間今天（YYYY-MM-DD） */
/** 還有幾天到期；未設 until 回傳 null（常駐優惠） */
export function daysLeft(until?: string): number | null {
  if (!until) return null;
  const a = new Date(todayTW() + 'T00:00:00Z').getTime();
  const b = new Date(until + 'T00:00:00Z').getTime();
  return Math.round((b - a) / 86400e3);
}
/** 只回傳還沒過期的優惠（過期自動下架） */
export function activeOffers(): Offer[] {
  return OFFERS.filter((o) => !o.until || o.until >= todayTW());
}

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
  // Lucid 規則最單純、無日風控、出金快 → 多數情況主推
  if (a.goal === 'profit') return { id: 'apex', why: '想衝高獲利，Apex 可開 20 帳複製下單、獲利潛力最高（但過關要付啟動費、限 1 個月內考完）。' };
  if (a.goal === 'simple' && a.dll === 'ok') return { id: 'topstep', why: '想要最單純的規則，Topstep 語言最好懂、Live 免數據費（月費制）。' };
  if (a.speed === 'fast' && a.dll === 'ok' && a.goal !== 'cheap') return { id: 'tradeify', why: '想通關快，Tradeify Growth 可一天通關，Select 通關後出金還免一致性。' };
  return { id: 'lucid', why: '規則最單純：Flex 完全無日風控、無緩衝區、5 個獲利日就能出金，考不過還能一直考——新手首選。50K 折後 $98，首購再多 10%＝$84。' };
}
