// ===== 出金任務資料層（首頁三層選擇器 + 規則頁共用）=====
// 三層:公司 → 帳號類型（方案/回撤型態） → 帳號規模
// 所有數字皆已逐規模預先算好。Lucid / Tradeify / TradeDay / Topstep
// 於 2026/07 逐條核對官方幫助中心;Apex 官網封鎖機房 IP,標示為待核。

export type SizeKey = '25K' | '50K' | '100K' | '150K';

export type Spec = {
  /** 考試獲利目標（免考試方案為 undefined） */
  target?: string;
  /** 🚫 最大虧損:碰到就爆 */
  maxLoss: string;
  /** 日虧損上限 */
  dll?: string;
  /** 🎯 要打到的數字（餘額或利潤，視方案） */
  goal?: string;
  /** 獲利日門檻 */
  minDay?: string;
  /** 💰 單次最多能領多少 */
  cap: string;
  /** 最低出金 */
  minPayout?: string;
  /** 部位上限 */
  contracts?: string;
};

export type Plan = {
  id: string;
  /** 帳號類型名稱 */
  name: string;
  /** 一句話定位 */
  sub: string;
  /** 回撤型態 */
  dd: 'EOD' | 'Intraday';
  /** 分潤 */
  split: string;
  /** 🎯 任務。可用 {goal} {minDay} {cap} {target} {maxLoss} {dll} {minPayout} 代入該規模數字 */
  tasks: string[];
  /** 🚫 紅線 */
  redlines: string[];
  tip?: string;
  sizes: Partial<Record<SizeKey, Spec>>;
};

export type FirmM = { id: string; name: string; link: string; plans: Plan[] };

export const FIRMS_M: FirmM[] = [
  // ─────────────────────────── LUCID ───────────────────────────
  {
    id: 'lucid',
    name: 'Lucid Trading',
    link: 'https://lucidtrading.com/ref/pftw',
    plans: [
      {
        id: 'flex',
        name: 'LucidFlex',
        sub: '規則最單純 · 新手首選',
        dd: 'EOD',
        split: '90/10',
        tasks: [
          '5 個獲利日，每日至少賺 {minDay}',
          '該出金週期淨獲利為正（賺 $1 也算）',
          '單次最多領 {cap}',
        ],
        redlines: [
          '餘額碰到最大虧損線就爆：{maxLoss}',
          '這個帳號最多只能領 5 次，第 5 次後轉真倉',
        ],
        tip: '通關後無日風控、無一致性、無緩衝區——沒有隱藏門檻。注意考試階段仍有 50% 一致性（最佳單日不得超過總獲利一半）。',
        sizes: {
          '25K': { target: '$1,250', maxLoss: '$1,000', minDay: '$100', cap: '獲利的 50%，最高 $1,000', minPayout: '$500', contracts: '2 mini / 20 micro' },
          '50K': { target: '$3,000', maxLoss: '$2,000', minDay: '$150', cap: '獲利的 50%，最高 $2,000', minPayout: '$500', contracts: '4 mini / 40 micro' },
          '100K': { target: '$6,000', maxLoss: '$3,000', minDay: '$200', cap: '獲利的 50%，最高 $2,500', minPayout: '$500', contracts: '6 mini / 60 micro' },
          '150K': { target: '$9,000', maxLoss: '$4,500', minDay: '$250', cap: '獲利的 50%，最高 $3,000', minPayout: '$500', contracts: '10 mini / 100 micro' },
        },
      },
      {
        id: 'pro',
        name: 'LucidPro',
        sub: '有緩衝區 · 出金上限較高',
        dd: 'EOD',
        split: '90/10',
        tasks: [
          '餘額要打過緩衝 {goal}（緩衝內的錢不能領）',
          '該週期至少賺到 {target}',
          '最佳單日 ≤ 該週期總獲利的 40%',
          '單次最多領 {cap}',
        ],
        redlines: [
          '餘額碰到最大虧損線就爆：{maxLoss}',
          '日虧損上限 {dll}（軟性，不會沒收帳號）',
        ],
        tip: '餘額收在緩衝之上後，固定日風控會換成 LucidScale：最高 EOD 利潤 × 60%，只升不降。2025/11/28 前買的帳號一致性是 35%。',
        sizes: {
          '25K': { target: '$250', maxLoss: '$1,000', dll: '無', goal: '$26,100', cap: '首次 $1,000，第 2 次起 $1,500', minPayout: '$500', contracts: '2 mini / 20 micro' },
          '50K': { target: '$500', maxLoss: '$2,000', dll: '$1,200', goal: '$52,100', cap: '首次 $2,000，第 2 次起 $2,500', minPayout: '$500', contracts: '4 mini / 40 micro' },
          '100K': { target: '$750', maxLoss: '$3,000', dll: '$1,800', goal: '$103,100', cap: '首次 $2,500，第 2 次起 $3,000', minPayout: '$500', contracts: '6 mini / 60 micro' },
          '150K': { target: '$1,000', maxLoss: '$4,500', dll: '$2,700', goal: '$154,600', cap: '首次 $3,000，第 2 次起 $3,500', minPayout: '$500', contracts: '10 mini / 100 micro' },
        },
      },
      {
        id: 'direct',
        name: 'LucidDirect',
        sub: '免考試直接開帳 · 一致性最嚴',
        dd: 'EOD',
        split: '90/10',
        tasks: [
          '該週期賺到利潤目標 {goal}',
          '最佳單日 ≤ 該週期總獲利的 20%（全站最嚴）',
          '單次最多領 {cap}',
        ],
        redlines: [
          '餘額碰到最大虧損線就爆：{maxLoss}',
          '日虧損上限 {dll}（軟性）',
        ],
        tip: '20% 一致性代表你至少要打 5 天以上才可能達標——想快速出金別選這個。',
        sizes: {
          '25K': { maxLoss: '$1,000', dll: '無', goal: '首次 $1,500，第 2 次起 $1,250', cap: '第 1–3 次 $1,000，第 4–5 次 $1,000', minPayout: '$500', contracts: '2 mini / 20 micro' },
          '50K': { maxLoss: '$2,000', dll: '$1,200', goal: '首次 $3,000，第 2 次起 $2,500', cap: '第 1–3 次 $2,000，第 4–5 次 $2,500', minPayout: '$500', contracts: '4 mini / 40 micro' },
          '100K': { maxLoss: '$3,500', dll: '$2,100', goal: '首次 $6,000，第 2 次起 $3,500', cap: '第 1–3 次 $2,500，第 4–5 次 $3,000', minPayout: '$500', contracts: '6 mini / 60 micro' },
          '150K': { maxLoss: '$5,000', dll: '$3,000', goal: '首次 $9,000，第 2 次起 $4,500', cap: '第 1–3 次 $3,000，第 4–5 次 $3,500', minPayout: '$500', contracts: '10 mini / 100 micro' },
        },
      },
    ],
  },

  // ─────────────────────────── TRADEIFY ───────────────────────────
  {
    id: 'tradeify',
    name: 'Tradeify',
    link: 'https://tradeify.co/',
    plans: [
      {
        id: 'flex',
        name: 'Select Flex',
        sub: '考過後選這條 · 無日風控、無緩衝',
        dd: 'EOD',
        split: '90/10',
        tasks: [
          '5 個獲利日，每日至少賺 {minDay}',
          '單次可領總獲利的 50%，最高 {cap}',
          '沒有最低餘額要求，達標就能領',
        ],
        redlines: [
          '餘額碰到最大虧損線就爆：{maxLoss}',
          '第 2 次起：該週期淨獲利必須為正',
        ],
        tip: '⚠️ 第 2 次起當期必須為正。例：第一次出金後餘額 $51,250，之後虧到 $50,800（當期 −$450）→ 不能出金，要先賺回 $450 讓當期轉正。注意 50% 是算「總獲利」（現在餘額 − 起始餘額），不是只算這一輪賺的。',
        sizes: {
          '25K': { maxLoss: '$1,000', dll: '無', minDay: '$100', cap: '$1,250', contracts: '起始 1 mini，最高 2 mini' },
          '50K': { maxLoss: '$2,000', dll: '無', minDay: '$150', cap: '$3,000', contracts: '起始 2 mini，最高 4 mini' },
          '100K': { maxLoss: '$3,000', dll: '無', minDay: '$200', cap: '$4,000', contracts: '起始 3 mini，最高 8 mini' },
          '150K': { maxLoss: '$4,500', dll: '無', minDay: '$250', cap: '$5,000', contracts: '起始 3 mini，最高 12 mini' },
        },
      },
      {
        id: 'daily',
        name: 'Select Daily',
        sub: '考過後選這條 · 每天可領但有緩衝',
        dd: 'EOD',
        split: '90/10',
        tasks: [
          '利潤要先超過緩衝 {goal}（緩衝內的錢不能領）',
          '之後每天都能申請',
          '單次可領「上次出金後利潤 × 2」，最高 {cap}',
        ],
        redlines: [
          '餘額碰到最大虧損線就爆：{maxLoss}',
          '日虧損上限 {dll}',
          '第 2 次起：該週期淨獲利必須為正',
        ],
        tip: '⚠️ 緩衝算的是「利潤」不是餘額。例（50K）：賺了 $250 → 2×$250，最多領 $500；賺 $700 → 2×$700=$1,400 但上限 $1,000，只能領 $1,000。賺不到 $125 連最低 $250 都領不了。',
        sizes: {
          '25K': { maxLoss: '$1,000', dll: '$500', goal: '利潤 $1,100（餘額 $26,100）', cap: '$600', minPayout: '$250', contracts: '起始 1 mini，最高 2 mini' },
          '50K': { maxLoss: '$2,000', dll: '$1,000', goal: '利潤 $2,100（餘額 $52,100）', cap: '$1,000', minPayout: '$250', contracts: '起始 2 mini，最高 4 mini' },
          '100K': { maxLoss: '$2,500', dll: '$1,250', goal: '利潤 $2,600（餘額 $102,600）', cap: '$1,500', minPayout: '$250', contracts: '起始 3 mini，最高 8 mini' },
          '150K': { maxLoss: '$3,500', dll: '$1,750', goal: '利潤 $3,600（餘額 $153,600）', cap: '$2,500', minPayout: '$250', contracts: '起始 3 mini，最高 12 mini' },
        },
      },
      {
        id: 'growth',
        name: 'Growth',
        sub: '1 天就能考過 · 但出金要墊最低餘額',
        dd: 'EOD',
        split: '90/10',
        tasks: [
          '餘額要打到 {goal} 才能申請',
          '5 個獲利日，每日至少賺 {minDay}',
          '最佳單日 ≤ 該週期總獲利的 35%',
          '單次最多領 {cap}',
        ],
        redlines: [
          '餘額碰到最大虧損線就爆：{maxLoss}',
          '日虧損上限 {dll}（軟性）',
        ],
        tip: '考試無一致性、1 天可過，是最快通關的路；代價是出金要墊到最低餘額，且考試就有日風控。',
        sizes: {
          '25K': { target: '$1,500', maxLoss: '$1,000', dll: '$600', goal: '$26,500', minDay: '$100', cap: '各階皆 $1,000', minPayout: '$250', contracts: '1 mini / 10 micro' },
          '50K': { target: '$3,000', maxLoss: '$2,000', dll: '$1,250', goal: '$53,000', minDay: '$150', cap: '第 1 次 $1,500 → 第 4 次起 $3,000', minPayout: '$500', contracts: '4 mini / 40 micro' },
          '100K': { target: '$6,000', maxLoss: '$3,500', dll: '$2,500', goal: '$104,500', minDay: '$200', cap: '第 1 次 $2,000 → 第 4 次起 $4,000', minPayout: '$1,000', contracts: '8 mini / 80 micro' },
          '150K': { target: '$9,000', maxLoss: '$5,000', dll: '$3,750', goal: '$156,500', minDay: '$250', cap: '第 1 次 $2,500 → 第 4 次起 $5,000', minPayout: '$1,500', contracts: '12 mini / 120 micro' },
        },
      },
      {
        id: 'lightning',
        name: 'Lightning',
        sub: '免考試直接開帳 · 無最低天數',
        dd: 'EOD',
        split: '90/10',
        tasks: [
          '該週期賺到利潤目標 {goal}（達標才解鎖申請）',
          '一致性：第 1 次 20% → 第 2 次 25% → 第 3 次起 30%',
          '沒有最低交易天數，達標當天就能領',
          '單次最多領 {cap}',
        ],
        redlines: [
          '餘額碰到最大虧損線就爆：{maxLoss}',
          '日虧損上限 {dll}（軟性）',
          '第 2 次起：該週期淨獲利必須為正',
        ],
        tip: '⚠️ 利潤目標 ≠ 能領的錢。例（50K）：達成 $3,000 目標，但單次上限只有 $2,000，剩下留在帳戶。目標達成後歸零重算，上一輪剩的利潤不會累積過去。',
        sizes: {
          '25K': { maxLoss: '$1,000', dll: '無', goal: '首次 $1,500，第 2 次起 $1,000', cap: '固定 $1,000', minPayout: '$1,000', contracts: '1 mini / 10 micro' },
          '50K': { maxLoss: '$2,000', dll: '$1,250', goal: '首次 $3,000，第 2 次起 $2,000', cap: '第 1–3 次 $2,000，第 4 次起 $2,500', minPayout: '$1,000', contracts: '4 mini / 40 micro' },
          '100K': { maxLoss: '$4,000', dll: '$2,500', goal: '首次 $6,000，第 2 次起 $3,500', cap: '第 1–3 次 $2,500，第 4 次起 $3,000', minPayout: '$1,000', contracts: '8 mini / 80 micro' },
          '150K': { maxLoss: '$5,250', dll: '$3,000', goal: '首次 $9,000，第 2 次起 $4,500', cap: '第 1–3 次 $3,000，第 4 次起 $3,500', minPayout: '$1,000', contracts: '12 mini / 120 micro' },
        },
      },
    ],
  },

  // ─────────────────────────── TRADEDAY ───────────────────────────
  {
    id: 'tradeday',
    name: 'TradeDay',
    link: 'https://www.tradeday.com/',
    plans: [
      {
        id: 'qp-ind',
        name: 'Quick Pay（Intraday 考試）',
        sub: '最便宜 · 但回撤含浮盈',
        dd: 'Intraday',
        split: '$4,000 分界:50% / 80%',
        tasks: [
          '考試：最少 5 天 + 賺到 {target} + 最佳單日 ≤ 總獲利 30%',
          '通關後只要正餘額就能領，最低 {minPayout}',
          '💡 建議先累積到利潤 $4,000 再領，分潤才是 80%',
        ],
        redlines: [
          '追蹤回撤 {maxLoss}，含浮動獲利、只升不降',
          '毛利碰到 $10,000 就必須停手，超過的部分直接沒收',
          '不能在價格限制 2% 範圍內交易',
        ],
        tip: '⚠️ 分潤看「帳戶當前利潤」：當前利潤 < $4,000 → 整筆只分 50%。例：賺 $3,000 領 $1,000 → 實拿 $500。當前利潤 > $4,000 且領完仍 > $4,000 → 全額 80%。跨越 $4,000 則分開算：賺 $6,000 領 $3,000 → 80%×$2,000 + 50%×$1,000 = $2,100。想小額快領，選 Fast Pass 更划算。',
        sizes: {
          '50K': { target: '$3,000', maxLoss: '$2,000', cap: '無固定上限（受正餘額限制）', minPayout: '$250', contracts: '5 口 / 50 微' },
          '100K': { target: '$6,000', maxLoss: '$3,000', cap: '無固定上限（受正餘額限制）', minPayout: '$250', contracts: '10 口 / 50 微' },
          '150K': { target: '$9,000', maxLoss: '$4,500', cap: '無固定上限（受正餘額限制）', minPayout: '$250', contracts: '15 口 / 50 微' },
        },
      },
      {
        id: 'qp-eod',
        name: 'Quick Pay（EOD 考試）',
        sub: '考試較好過 · 但出金帳號仍是 Intraday',
        dd: 'EOD',
        split: '$4,000 分界:50% / 80%',
        tasks: [
          '考試：最少 5 天 + 賺到 {target} + 最佳單日 ≤ 總獲利 30%（EOD 結算回撤）',
          '通關後只要正餘額就能領，最低 {minPayout}',
          '💡 建議先累積到利潤 $4,000 再領，分潤才是 80%',
        ],
        redlines: [
          '考試回撤 {maxLoss}（EOD 結算）',
          '⚠️ 通關後出金帳號一律換成 Intraday 回撤——就算你用 EOD 考過也一樣',
          '毛利碰到 $10,000 就必須停手，超過的部分直接沒收',
        ],
        tip: '⚠️ 這個方案唯一的差別是「考試」用 EOD 比較好過（貴一點）；通關後的出金帳號規則跟 Intraday 版完全一樣，含 Intraday 回撤與 $4,000 分潤分界。',
        sizes: {
          '50K': { target: '$3,000', maxLoss: '$2,000', cap: '無固定上限（受正餘額限制）', minPayout: '$250', contracts: '5 口 / 50 微' },
          '100K': { target: '$6,000', maxLoss: '$3,000', cap: '無固定上限（受正餘額限制）', minPayout: '$250', contracts: '10 口 / 50 微' },
          '150K': { target: '$9,000', maxLoss: '$4,500', cap: '無固定上限（受正餘額限制）', minPayout: '$250', contracts: '15 口 / 50 微' },
        },
      },
      {
        id: 'fp',
        name: 'Fast Pass',
        sub: '無最低天數 · 分潤一律 80%',
        dd: 'EOD',
        split: '80/20（無分界）',
        tasks: [
          '考試：賺到 {target} + 最佳單日 ≤ 總獲利 45%，無最低交易天數',
          '出金:5 個獲利日，每日至少賺 {minDay}',
          '餘額要高於起始餘額，且當期淨利為正',
          '單次可領餘額的 50%，最高 {cap}',
        ],
        redlines: [
          '回撤 {maxLoss}（EOD 結算，考試與出金帳號都是）',
          '第 5 次出金申請時 → 轉真倉，Sim 帳號關閉',
        ],
        tip: '分潤一律 80%，小額出金比 Quick Pay 划算，且無緩衝要求。首次出金時若回撤還沒爬到起始餘額，會自動移上去並固定。⚠️ 送出申請後先別交易，等錢到帳；新週期的 Day 1 要等下一個交易時段才開始算。',
        sizes: {
          '50K': { target: '$3,000', maxLoss: '$2,000', minDay: '$150', cap: '$2,000', minPayout: '$250', contracts: '5 口 / 50 微' },
          '100K': { target: '$6,000', maxLoss: '$3,000', minDay: '$200', cap: '$2,500', minPayout: '$250', contracts: '10 口 / 50 微' },
          '150K': { target: '$9,000', maxLoss: '$4,500', minDay: '$250', cap: '$3,000', minPayout: '$250', contracts: '15 口 / 50 微' },
        },
      },
    ],
  },

  // ─────────────────────────── TOPSTEP ───────────────────────────
  {
    id: 'topstep',
    name: 'Topstep',
    link: 'https://www.topstep.com/',
    plans: [
      {
        id: 'xfa-std',
        name: 'Express 標準路徑',
        sub: '5 個獲利日 · 老牌路線',
        dd: 'EOD',
        split: '90/10',
        tasks: [
          '先考過 Combine：賺到 {target}，最佳單日 < 獲利目標的 50%（最快 2 天，不能 1 天）',
          '出金:5 個獲利日，每日至少賺 {minDay}',
          '單次可領餘額的 50%，最高 {cap}',
        ],
        redlines: [
          '餘額碰到最大虧損線就爆：{maxLoss}（追蹤，到起始餘額後鎖住）',
          '⚠️ 出金帳號從 $0 開始；首次出金後虧損線一律設為 $0——餘額碰 $0 就關戶',
        ],
        tip: '💡 結帳時自願加購日風控（DLL），出金上限直接加倍。最低出金只要 $125，是五家裡門檻最低的。',
        sizes: {
          '50K': { target: '$3,000', maxLoss: '$2,000', minDay: '$150', cap: '$2,000（加 DLL 變 $4,000）', minPayout: '$125', contracts: '5 口 / 50 微' },
          '100K': { target: '$6,000', maxLoss: '$3,000', minDay: '$200', cap: '$3,000（加 DLL 變 $6,000）', minPayout: '$125', contracts: '10 口 / 100 微' },
          '150K': { target: '$9,000', maxLoss: '$4,500', minDay: '$250', cap: '$5,000（加 DLL 變 $10,000）', minPayout: '$125', contracts: '15 口 / 150 微' },
        },
      },
      {
        id: 'xfa-cons',
        name: 'Express 一致性路徑',
        sub: '只要 3 天 · 出金上限更高',
        dd: 'EOD',
        split: '90/10',
        tasks: [
          '先考過 Combine：賺到 {target}，最佳單日 < 獲利目標的 50%',
          '出金：只要交易 3 天（每天至少 1 筆）',
          '最佳單日 ÷ 總淨利 ≤ 40%',
          '單次可領餘額的 50%，最高 {cap}',
        ],
        redlines: [
          '餘額碰到最大虧損線就爆：{maxLoss}',
          '⚠️ 首次出金後虧損線一律設為 $0——餘額碰 $0 就關戶',
        ],
        tip: '💡 比標準路徑快（3 天 vs 5 個獲利日）且上限更高，代價是要控制單日佔比。例：總獲利 $1,000、最佳單日 $400 = 40% ✅；$450 = 45% ❌，要繼續打把比例壓下來。路徑在啟用 Express 帳號時選，可與標準路徑混用（最多 5 個帳號）。',
        sizes: {
          '50K': { target: '$3,000', maxLoss: '$2,000', cap: '$3,000（加 DLL 變 $6,000）', minPayout: '$125', contracts: '5 口 / 50 微' },
          '100K': { target: '$6,000', maxLoss: '$3,000', cap: '$4,000（加 DLL 變 $8,000）', minPayout: '$125', contracts: '10 口 / 100 微' },
          '150K': { target: '$9,000', maxLoss: '$4,500', cap: '$6,000（加 DLL 變 $12,000）', minPayout: '$125', contracts: '15 口 / 150 微' },
        },
      },
    ],
  },

  // ─────────────────────────── APEX ───────────────────────────
  {
    id: 'apex',
    name: 'Apex Trader Funding',
    link: 'https://apextraderfunding.com/',
    plans: [
      {
        id: 'pa-eod',
        name: 'PA（EOD 回撤）',
        sub: '回撤收盤才重算 · 盤中不動',
        dd: 'EOD',
        split: '100%（達標後）',
        tasks: [
          '餘額要高於安全網 {goal}（安全網 = 回撤 + $100）',
          '5 個有效獲利日，每日至少賺 {minDay}',
          '最佳單日 < 上次出金後總獲利的 50%',
          '單次最多領 {cap}，最低 {minPayout}',
        ],
        redlines: [
          '餘額碰到回撤就爆：{maxLoss}',
          '每個 PA 帳號最多領 6 次，領滿就關戶',
          '每 30 天內要有 2 個獲利 $50 以上的交易日，否則帳號會被關',
          '無停損交易 / 對沖 / 自動化 = 沒收帳號',
        ],
        tip: '⚠️ 安全網是永久門檻，每次出金都要清過。EOD 回撤只在收盤重算，盤中的上影線不會把門檻往上推。',
        sizes: {
          '25K': { target: '$1,500', maxLoss: '$1,500', goal: '$26,100', minDay: '$250', cap: '六階皆 $1,000', minPayout: '$500', contracts: '4 口 / 40 微' },
          '50K': { target: '$3,000', maxLoss: '$2,000', goal: '$52,100', minDay: '$250', cap: '$1,500 起，六階遞增至 $3,000', minPayout: '$500', contracts: '6 口 / 60 微' },
          '100K': { target: '$6,000', maxLoss: '$3,000', goal: '$103,100', minDay: '$250', cap: '$2,000 起，六階遞增至 $4,000', minPayout: '$500', contracts: '6 口 / 60 微' },
          '150K': { target: '$9,000', maxLoss: '$4,000', goal: '$154,100', minDay: '$250', cap: '$2,500 起，六階遞增至 $5,000', minPayout: '$500', contracts: '8 口 / 80 微' },
        },
      },
      {
        id: 'pa-ind',
        name: 'PA（Intraday 回撤）',
        sub: '回撤跟著浮盈跑 · 逐筆即時',
        dd: 'Intraday',
        split: '100%（達標後）',
        tasks: [
          '餘額要高於安全網 {goal}（安全網 = 回撤 + $100）',
          '5 個有效獲利日',
          '最佳單日 < 上次出金後總獲利的 50%',
          '單次最多領 {cap}，最低 {minPayout}',
        ],
        redlines: [
          '餘額碰到回撤就爆：{maxLoss}',
          '⚠️ 回撤跟著盤中最高浮動權益即時往上跑，只升不降——沒平倉的浮盈也算',
          '每個 PA 帳號最多領 6 次，領滿就關戶',
          '每 30 天內要有 2 個獲利 $50 以上的交易日，否則帳號會被關',
        ],
        tip: '⚠️ Intraday 版最容易踩雷：你賺到浮盈 +$1,000 又吐回去，回撤線已經跟著上去了，等於白白縮掉 $1,000 空間。不想被浮盈追著跑就選 EOD 版。',
        sizes: {
          '25K': { target: '$1,500', maxLoss: '$1,500', goal: '$26,100', minDay: '$250', cap: '六階皆 $1,000', minPayout: '$500', contracts: '4 口 / 40 微' },
          '50K': { target: '$3,000', maxLoss: '$2,000', goal: '$52,100', minDay: '$250', cap: '$1,500 起，六階遞增至 $3,000', minPayout: '$500', contracts: '6 口 / 60 微' },
          '100K': { target: '$6,000', maxLoss: '$3,000', goal: '$103,100', minDay: '$250', cap: '$2,000 起，六階遞增至 $4,000', minPayout: '$500', contracts: '6 口 / 60 微' },
          '150K': { target: '$9,000', maxLoss: '$4,000', goal: '$154,100', minDay: '$250', cap: '$2,500 起，六階遞增至 $5,000', minPayout: '$500', contracts: '8 口 / 80 微' },
        },
      },
    ],
  },
];

/** 官方核對狀態:true = 已逐條核對官方幫助中心(2026/07) */
export const VERIFIED: Record<string, boolean> = {
  lucid: true,
  tradeify: true,
  tradeday: true,
  topstep: true,
  apex: false,
};

export const firmOf = (id: string) => FIRMS_M.find((f) => f.id === id)!;
export const plansOf = (firmId: string) => firmOf(firmId).plans;
export const planOf = (firmId: string, planId: string) =>
  plansOf(firmId).find((x) => x.id === planId);
export const sizesOf = (firmId: string, planId: string): SizeKey[] => {
  const p = planOf(firmId, planId);
  return p ? (Object.keys(p.sizes) as SizeKey[]) : [];
};

/** 把 {goal} {minDay} {cap} 等換成該規模的實際數字 */
export function fill(text: string, s: Spec): string {
  return text
    .replace(/\{goal\}/g, s.goal ?? '—')
    .replace(/\{minDay\}/g, s.minDay ?? '—')
    .replace(/\{cap\}/g, s.cap)
    .replace(/\{target\}/g, s.target ?? '—')
    .replace(/\{maxLoss\}/g, s.maxLoss)
    .replace(/\{dll\}/g, s.dll ?? '無')
    .replace(/\{minPayout\}/g, s.minPayout ?? '—');
}
