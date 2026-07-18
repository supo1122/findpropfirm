// ===== 出金任務資料層（首頁三層選擇器 + 規則頁共用）=====
// 三層:公司 → 帳號類型（方案/回撤型態） → 帳號規模
// 所有數字皆已逐規模預先算好。Lucid / Tradeify / TradeDay / Topstep
// 於 2026/07 逐條核對官方幫助中心;Apex 官網封鎖機房 IP,標示為待核。

import { lucidDllWaived } from './data';

// Apex Live 官方明講「不是 25K/50K/100K 那種分級」，全部同一組參數 → 用「單一規格」
export type SizeKey = '25K' | '50K' | '100K' | '150K' | '單一規格';

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
  /** 幾次出金會轉真倉（每家都不一樣，買之前一定要知道） */
  toLive?: string;
  /** 尚未逐條核對官方原文 */
  unverified?: boolean;
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
        toLive: '第 5 次出金後進真倉審核池（上限 5 次）',
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
        toLive: '第 5 次出金後進真倉審核池（上限 5 次）',
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
          lucidDllWaived()
            ? '日虧損上限 {dll}（軟性）——⚡ 目前活動免除中，2026/7/24 後自動恢復'
            : '日虧損上限 {dll}（軟性，不會沒收帳號）',
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
        toLive: '第 5 次出金後進真倉審核池（上限 5 次）',
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
      {
        id: 'live',
        name: 'LucidLive（真倉）',
        sub: '真錢 · 每日出金 · 規則最寬',
        dd: 'EOD',
        split: '90/10',
        toLive: '從 Flex／Pro／Direct 第 5 次出金後進審核池，由風控團隊決定',
        tasks: [
          '帳戶從 $0 開始，賺到的都是你的利潤',
          '每天都能申請出金，沒有次數與金額上限',
          '無日風控、無一致性、無緩衝——規則比模擬帳號還少',
          '🎁 首次轉真倉限定：賺到 {goal} → 額外領一次性獎金 {cap}',
        ],
        redlines: [
          '回撤 {maxLoss}（沿用你原本 funded 帳號的規模）',
          '⚠️ 回撤還沒鎖上就申請出金 → 最大虧損線直接鎖在 $100，等於幾乎沒有容錯',
          '對沖真倉 = 永久停權（Lucid 和 CME 都禁止，沒有商量餘地）',
          '爆掉真倉要冷卻 2 週才能再買考試；反覆亂玩會被延長',
          '家裡有人在跑真倉，其他人就不能跑模擬帳號',
        ],
        tip: '⚠️ 轉真倉時，所有「有出過金」的 funded 帳號會一起轉，其餘模擬帳號全部關閉——包含你留著沒動的考試帳號（0 次出金的 funded 帳號會退考試費）。不想被關就別囤考試帳號。最多同時 5 個真倉。獎金只有第一次轉真倉能拿，且 LucidMaxx 不適用。',
        sizes: {
          '25K': { maxLoss: '$1,000', dll: '無', goal: '$1,100', cap: '獎金 $1,000', contracts: '2 mini / 20 micro（依獲利分級）' },
          '50K': { maxLoss: '$2,000', dll: '無', goal: '$2,100', cap: '獎金 $2,000', contracts: '4 mini / 40 micro（依獲利分級）' },
          '100K': { maxLoss: '$3,000', dll: '無', goal: '$3,100', cap: '獎金 $3,000', contracts: '6 mini / 60 micro（依獲利分級）' },
          '150K': { maxLoss: '$4,500', dll: '無', goal: '$4,600', cap: '獎金 $4,500', contracts: '10 mini / 100 micro（依獲利分級）' },
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
        toLive: '單帳號 3 次出金，或距上次轉真倉累計 10 次 → 才「被考慮」',
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
        toLive: '單帳號 3 次出金，或距上次轉真倉累計 10 次 → 才「被考慮」',
        sub: '考過後選這條 · 每天可領但有緩衝',
        dd: 'EOD',
        split: '90/10',
        tasks: [
          '先把利潤打過緩衝 {goal}——緩衝內的錢不能領',
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
          '25K': { maxLoss: '$1,000', dll: '$500', goal: '$1,100（餘額要到 $26,100）', cap: '$600', minPayout: '$250', contracts: '起始 1 mini，最高 2 mini' },
          '50K': { maxLoss: '$2,000', dll: '$1,000', goal: '$2,100（餘額要到 $52,100）', cap: '$1,000', minPayout: '$250', contracts: '起始 2 mini，最高 4 mini' },
          '100K': { maxLoss: '$2,500', dll: '$1,250', goal: '$2,600（餘額要到 $102,600）', cap: '$1,500', minPayout: '$250', contracts: '起始 3 mini，最高 8 mini' },
          '150K': { maxLoss: '$3,500', dll: '$1,750', goal: '$3,600（餘額要到 $153,600）', cap: '$2,500', minPayout: '$250', contracts: '起始 3 mini，最高 12 mini' },
        },
      },
      {
        id: 'growth',
        name: 'Growth',
        toLive: '單帳號 3 次出金，或距上次轉真倉累計 10 次 → 才「被考慮」',
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
        toLive: '單帳號 3 次出金，或距上次轉真倉累計 10 次 → 才「被考慮」',
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
      {
        id: 'live',
        name: 'Elite（真倉）',
        sub: '真錢 · 隨時可領 · 無日風控',
        dd: 'EOD',
        split: '80/20',
        toLive: '單帳號 3 次出金，或距上次轉真倉累計 10 次 → 才「被考慮」，非自動',
        tasks: [
          '帳戶從 $0 開始，賺到的都是利潤',
          '隨時可以申請出金，沒有最低天數',
          '無日風控，部位上限比模擬帳號還大',
        ],
        redlines: [
          'EOD 回撤 {maxLoss}（固定，不追蹤）',
          '⚠️ 一筆出金把餘額領到 $0 → 真倉帳號直接關閉',
          '所有持倉一樣要在美東 4:45 PM 前平倉（真倉也適用）',
        ],
        tip: '⚠️ 回撤鎖上前別急著領：官方規定若你在餘額還沒到「回撤 + $100」之前送出申請，不會馬上處理，會壓到隔一個營業日、等 EOD 調整完才扣款——結果是回撤已經往上移、錢才被扣走，你隔天的容錯空間反而變小。等回撤鎖定再申請。只有「出過金至少 1 次」的帳號才會轉真倉，最多 5 個。',
        sizes: {
          '25K': { maxLoss: '$1,500', dll: '無', cap: '無上限（餘額領到 $0 就關戶）', contracts: '$0→回撤:1 mini／回撤之上:2 mini' },
          '50K': { maxLoss: '$2,000', dll: '無', cap: '無上限（餘額領到 $0 就關戶）', contracts: '$0→回撤:2 mini／回撤之上:4 mini' },
          '100K': { maxLoss: '$3,000', dll: '無', cap: '無上限（餘額領到 $0 就關戶）', contracts: '$0→回撤:4 mini／回撤之上:8 mini' },
          '150K': { maxLoss: '$4,500', dll: '無', cap: '無上限（餘額領到 $0 就關戶）', contracts: '$0→回撤:6 mini／回撤之上:12 mini' },
        },
      },
    ],
  },

  // ─────────────────────────── TRADEDAY ───────────────────────────
  {
    id: 'tradeday',
    name: 'TradeDay',
    link: 'https://www.tradeday.com/?a_aid=PFTW',
    plans: [
      {
        id: 'qp-ind',
        name: 'Quick Pay（Intraday 考試）',
        toLive: '毛利到 $10,000 → 當天暫停、審查後轉真倉（不是看次數）',
        sub: '最便宜 · 但回撤含浮盈',
        dd: 'Intraday',
        split: '$4,000 分界:50% / 80%',
        tasks: [
          '考試：最少 5 天 + 賺到 {target} + 最佳單日 ≤ 總獲利 30%',
          '通關後只要正餘額就能領，最低 {minPayout}',
          '💡 建議先累積到利潤 $4,000 再領，分潤才是 80%',
        ],
        redlines: [
          '追蹤回撤 {maxLoss}，含浮動獲利、只升不降（TradeDay 沒有日風控，這是唯一的線）',
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
        toLive: '毛利到 $10,000 → 當天暫停、審查後轉真倉（不是看次數）',
        sub: '考試較好過 · 但出金帳號仍是 Intraday',
        dd: 'EOD',
        split: '$4,000 分界:50% / 80%',
        tasks: [
          '考試：最少 5 天 + 賺到 {target} + 最佳單日 ≤ 總獲利 30%（EOD 結算回撤）',
          '通關後只要正餘額就能領，最低 {minPayout}',
          '💡 建議先累積到利潤 $4,000 再領，分潤才是 80%',
        ],
        redlines: [
          '考試回撤 {maxLoss}（EOD 結算；TradeDay 沒有日風控）',
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
        toLive: '第 5 次出金申請時 → 直接轉真倉，Sim 帳號關閉',
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
          '回撤 {maxLoss}（EOD 結算，考試與出金帳號都是；沒有日風控，這是唯一的線）',
          '第 5 次出金申請時 → 轉真倉，Sim 帳號關閉',
        ],
        tip: '分潤一律 80%，小額出金比 Quick Pay 划算，且無緩衝要求。首次出金時若回撤還沒爬到起始餘額，會自動移上去並固定。⚠️ 送出申請後先別交易，等錢到帳；新週期的 Day 1 要等下一個交易時段才開始算。',
        sizes: {
          '50K': { target: '$3,000', maxLoss: '$2,000', minDay: '$150', cap: '$2,000', minPayout: '$250', contracts: '5 口 / 50 微' },
          '100K': { target: '$6,000', maxLoss: '$3,000', minDay: '$200', cap: '$2,500', minPayout: '$250', contracts: '10 口 / 50 微' },
          '150K': { target: '$9,000', maxLoss: '$4,500', minDay: '$250', cap: '$3,000', minPayout: '$250', contracts: '15 口 / 50 微' },
        },
      },
      {
        id: 'live',
        name: 'Funded Live（真倉）',
        sub: '真錢 · 分潤升到 90%',
        dd: 'EOD',
        split: '90/10',
        toLive: 'Fast Pass 第 5 次出金申請即轉；Quick Pay 毛利到 $10,000 審查後轉',
        tasks: [
          '帳戶從 $0 開始，賺到的都是利潤',
          '分潤從 80% 升到 {split}——真倉才是 TradeDay 最甜的地方',
          '一樣沒有日風控，只有一條最大回撤',
        ],
        redlines: [
          'EOD 回撤 {maxLoss}（沿用你原本考試層級）',
          '⚠️ 爆掉真倉 → 強制冷卻 3 個月，這段期間不能參加任何考試',
          '不能在價格限制 2% 範圍內交易',
          '真倉部位上限被砍到 {contracts}，要調升得看官方臉色',
        ],
        tip: '⚠️ 三個月冷卻是全站最重的處罰——其他家爆真倉大多 2 週（Lucid）或直接再買（Tradeify）。冷卻結束要寄信到 FundedTrader@TradeDay.com 申請。最多同時 5 個真倉。另外真倉還有「滑價風險管理」政策會降你的部位上限。',
        sizes: {
          '50K': { maxLoss: '$2,000', dll: '無', cap: '無上限', contracts: '2 口' },
          '100K': { maxLoss: '$3,000', dll: '無', cap: '無上限', contracts: '3 口' },
          '150K': { maxLoss: '$4,500', dll: '無', cap: '無上限', contracts: '4 口' },
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
        toLive: '沒有次數要求。官方明講「不需要 5 次出金」，全看風控團隊綜合評估',
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
        toLive: '沒有次數要求。官方明講「不需要 5 次出金」，全看風控團隊綜合評估',
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
      {
        id: 'live',
        name: 'Live Funded（真倉）',
        sub: '真錢 · 出金無上限',
        dd: 'EOD',
        split: '90/10',
        toLive: '沒有次數要求。官方明講「不需要 5 次出金」，全看風控團隊綜合評估',
        tasks: [
          '出金完全沒有上限——這是 Topstep 真倉最大的賣點',
          '打滿 30 個獲利日 → 每天都能領，最高可領 100% 利潤',
          '起始餘額 = 你 Express 帳戶累計餘額的 20%，最低保證 $10,000',
          '每達一次獲利目標 {goal} → 解鎖 25% 準備金',
        ],
        redlines: [
          '日風控 {maxLoss}（真倉強制有，不像 Express 是選配）',
          '⚠️ 餘額掉到 $1,000 以下 → 當日直接清算關戶，沒解鎖的準備金全部沒收',
          '⚠️ 被 Call Down（Shoulder Tap）降回模擬帳號時，官方明講「不會事先警告」',
          '轉真倉時，所有 Express 帳戶會全部關閉',
        ],
        tip: '真倉帳號大小 = 所有「有出過金」的 Express 帳戶平均，進位到 50K／100K／150K。例：四個 50K + 一個 150K → 平均 70K → 算你 100K。80% 的錢一開始鎖在準備金裡，要分 4 次解鎖，而且不能用一筆大單一次解鎖多層——每層都要「距上次解鎖後的新淨利」。每週一審核。',
        sizes: {
          '50K': { maxLoss: '$2,000', dll: '$2,000', goal: '$3,000', cap: '無上限', contracts: '依 Live 風險動態調整' },
          '100K': { maxLoss: '$3,000', dll: '$3,000', goal: '$6,000', cap: '無上限', contracts: '依 Live 風險動態調整' },
          '150K': { maxLoss: '$4,500', dll: '$4,500', goal: '$9,000', cap: '無上限', contracts: '依 Live 風險動態調整' },
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
        toLive: '領滿 6 次 → PA 關閉，要再考一次才有新 PA（Apex Live 為另外的邀請制）',
        sub: '回撤收盤才重算 · 但考試有日風控',
        dd: 'EOD',
        split: '100%',
        tasks: [
          '考試：賺到 {target}，不用最低天數，1 天過也可以（30 天內要完成）',
          '出金：餘額要打到 {goal}',
          '5 個獲利日，每日至少賺 {minDay}（不用連續，沒有期限）',
          '最佳單日 < 上次出金後總獲利的 50%',
          '單次最多領 {cap}',
        ],
        redlines: [
          '餘額（含浮動損益）碰到回撤就爆：{maxLoss}',
          '考試階段有日風控 {dll}（Intraday 版沒有）',
          '每個 PA 最多領 6 次，第 6 次後帳號關閉，要再考一次才有新的',
          '安全網是終身門檻，第一次出金後也不會消失',
          '每滾動 30 天要有 2 個獲利 $50 以上的交易日——15 天不動轉休眠，連續 30 天沒達標永久關戶、獎勵全沒收且無法復原',
          '無停損交易（含心理停損）／任何形式對沖／自動化程式 = 立即關戶',
          '禁止把整條回撤當停損扛單；禁止囤折扣考試帳號故意爆倉博暴利',
        ],
        tip: '💡 EOD 版的好處：回撤只在收盤重算，盤中的浮盈不會把門檻往上推。代價是考試多一條日風控，而且獲利日門檻比 Intraday 版高（50K 要 $250 vs $200）。考過後 7 天內要啟用 PA。最多可同時持有 20 個 PA。',
        sizes: {
          '25K': { target: '$1,500', maxLoss: '$1,000', dll: '$500', goal: '$26,600（安全網 $26,100 ＋ 最低出金 $500）', minPayout: '$500', minDay: '$100', cap: '六階皆 $1,000', contracts: '考試 4 口／PA 2 口' },
          '50K': { target: '$3,000', maxLoss: '$2,000', dll: '$1,000', goal: '$52,600（安全網 $52,100 ＋ 最低出金 $500）', minPayout: '$500', minDay: '$250', cap: '首次 $1,500，六階最高 $3,000', contracts: '考試 6 口／PA 4 口' },
          '100K': { target: '$6,000', maxLoss: '$3,000', dll: '$1,500', goal: '$103,600（安全網 $103,100 ＋ 最低出金 $500）', minPayout: '$500', minDay: '$300', cap: '首次 $2,000，六階最高 $4,000', contracts: '考試 8 口／PA 6 口' },
          '150K': { target: '$9,000', maxLoss: '$4,000', dll: '$2,000', goal: '$154,600（安全網 $154,100 ＋ 最低出金 $500）', minPayout: '$500', minDay: '$350', cap: '首次 $2,500，六階最高 $5,000', contracts: '考試 12 口／PA 10 口' },
        },
      },
      {
        id: 'pa-ind',
        name: 'PA（Intraday 回撤）',
        toLive: '領滿 6 次 → PA 關閉，要再考一次才有新 PA（Apex Live 為另外的邀請制）',
        sub: '回撤跟著浮盈即時跑 · 考試無日風控',
        dd: 'Intraday',
        split: '100%',
        tasks: [
          '考試：賺到 {target}，不用最低天數，1 天過也可以（30 天內要完成）',
          '出金：餘額要打到 {goal}',
          '5 個獲利日，每日至少賺 {minDay}（不用連續，沒有期限）',
          '最佳單日 < 上次出金後總獲利的 50%',
          '單次最多領 {cap}',
        ],
        redlines: [
          '餘額（含浮動損益）碰到回撤就爆：{maxLoss}',
          '⚠️ 回撤跟著「最高餘額（含未平倉浮盈）」即時往上跑，只升不降',
          '每個 PA 最多領 6 次，第 6 次後帳號關閉',
          '安全網是終身門檻，第一次出金後也不會消失',
          '每滾動 30 天要有 2 個獲利 $50 以上的交易日——15 天不動轉休眠，連續 30 天沒達標永久關戶、獎勵全沒收且無法復原',
          '無停損交易（含心理停損）／任何形式對沖／自動化程式 = 立即關戶',
          '禁止把整條回撤當停損扛單；禁止囤折扣考試帳號故意爆倉博暴利',
        ],
        tip: '⚠️ Intraday 最容易踩的雷：浮盈 +$1,000 又吐回去，回撤線已經跟上去了，等於白白縮掉 $1,000 空間。好消息是回撤爬到「回撤額 + $100」（= 安全網）就會停住不再追。考試無日風控、獲利日門檻也比 EOD 版低（50K $200 vs $250），但盤中壓力大很多。',
        sizes: {
          '25K': { target: '$1,500', maxLoss: '$1,000', dll: '無', goal: '$26,600（安全網 $26,100 ＋ 最低出金 $500）', minPayout: '$500', minDay: '$100', cap: '六階皆 $1,000', contracts: '考試 4 口／PA 2 口' },
          '50K': { target: '$3,000', maxLoss: '$2,000', dll: '無', goal: '$52,600（安全網 $52,100 ＋ 最低出金 $500）', minPayout: '$500', minDay: '$200', cap: '首次 $1,500，六階最高 $3,000', contracts: '考試 6 口／PA 4 口' },
          '100K': { target: '$6,000', maxLoss: '$3,000', dll: '無', goal: '$103,600（安全網 $103,100 ＋ 最低出金 $500）', minPayout: '$500', minDay: '$250', cap: '首次 $2,000，六階最高 $4,000', contracts: '考試 8 口／PA 6 口' },
          '150K': { target: '$9,000', maxLoss: '$4,000', dll: '無', goal: '$154,600（安全網 $154,100 ＋ 最低出金 $500）', minPayout: '$500', minDay: '$300', cap: '首次 $2,500，六階最高 $5,000', contracts: '考試 12 口／PA 10 口' },
        },
      },
      {
        id: 'live',
        name: 'Apex Live（真倉）',
        sub: '邀請制 · 單一規格 · 真錢 90/10',
        dd: 'EOD',
        split: '90/10（模擬 PA 才是 100%）',
        toLive: '邀請制，沒有硬性門檻。官方舉例的觀察起點：單一 PA 連續 3 次出金，或模擬利潤累積到「該去真倉了」的程度',
        tasks: [
          '帳戶從 $0 開始，回撤 {maxLoss}（EOD 結算）',
          '先打到安全網 {goal} → 回撤鎖在 +$100，之後只能領安全網以上的錢',
          '每天都能申請出金，最低 {minPayout}，沒有上限、沒有最低天數、沒有最低獲利日',
          '獲利到 $4,500 → 可申請第 2 個帳號（每個新帳號都要再到 $4,500，最多 5 個）',
          '🎁 Bonus Vault：每月可領「當月真倉提領額 × 20%」的額外獎金（新帳號第 1 個月是 40%）',
        ],
        redlines: [
          '餘額掉到 $100 以下 → 真倉帳號直接關閉',
          '⚠️ 被選上真倉 = 所有模擬帳號（考試＋PA）全部關閉，真倉與模擬不能並存',
          '⚠️ 安全網 $3,100 以內的錢領不出來——要交易滿 90 天才行，而且領了帳號就關、再也回不去真倉',
          '所有部位要在美東 4:50 PM 前平倉，不能留倉過夜',
          '禁止對沖（只能單邊）、自動化／程式單、用 VPN 隱藏身分、無停損交易',
          '一個月沒交易 → 帳號可能被關（要離開可以事先開票申請延期）',
        ],
        tip: '💰 Bonus Vault 是什麼：轉真倉時，你模擬 PA 裡的獲利會被「記帳」起來（官方明講那不是真錢、只是一張追蹤表）。之後每個月依你真倉的提領金額發 20% 給你，直到記帳金額用完。例：5 個 PA 各 $2,000 → 記 $10,000；某月真倉領 $10,000 → 拿 $9,000（90/10）＋ Bonus Vault $2,000 = $11,000，Vault 剩 $8,000。⚠️ 獎金在隔月 15 號發，那天帳號必須還活著，爆了就沒了。前 3 次爆真倉 Vault 100% 保留；第 3 次後由風控決定要不要給第 4 次，給的話只剩 50%。　📈 等級：Level 1 $0–10,000（10 mini，無 DLL）→ Level 2 $10,000–25,000（25 mini，DLL $5,000）→ Level 3 $25,000–50,000（30 mini，DLL $10,000）→ Level 4 $50,000+ 客製。⚠️ 出金會把餘額降回低等級。　🔁 爆掉的話：Second Chance $199（5 天、40% 一致性、每日最低 $250、目標 $4,000、追蹤回撤 $2,000、3 mini），過了回真倉但只給 1 個帳號，次數不限。　🚪 可以拒絕邀請：拒絕的話整個會員帳號停用、Bonus Vault 沒收，但官方會發 $3,000 最終獎金。',
        sizes: {
          '單一規格': {
            maxLoss: '$3,000',
            dll: '無（Level 1；升級後才有）',
            goal: '$3,100（安全網）',
            cap: '無上限',
            minPayout: '$500',
            contracts: '10 mini / 100 micro（依等級提升）',
          },
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
  apex: true,
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
export function fill(text: string, s: Spec, plan?: Plan): string {
  return text
    .replace(/\{split\}/g, plan?.split ?? '—')
    .replace(/\{contracts\}/g, s.contracts ?? '—')
    .replace(/\{goal\}/g, s.goal ?? '—')
    .replace(/\{minDay\}/g, s.minDay ?? '—')
    .replace(/\{cap\}/g, s.cap)
    .replace(/\{target\}/g, s.target ?? '—')
    .replace(/\{maxLoss\}/g, s.maxLoss)
    .replace(/\{dll\}/g, s.dll ?? '無')
    .replace(/\{minPayout\}/g, s.minPayout ?? '—');
}
