// ===== 出金任務卡資料層（首頁選擇器 + 規則頁共用）=====
// 數字皆以 50K 為主，targets 列四種規模。與規則頁表格一致。

export type Mission = {
  firmId: string;   // lucid / tradeify / tradeday / apex / topstep
  firmName: string;
  plan: string;     // 方案名
  tasks: string[];  // 🎯 你的任務
  redlines: string[]; // 🚫 不能碰的線
  tip?: string;     // 💡 建議 / 實例
  targets?: { label: string; items: { size: string; value: string }[] };
};

export const MISSIONS: Mission[] = [
  // ── Lucid ──
  {
    firmId: 'lucid', firmName: 'Lucid Trading', plan: 'Flex（新手首選）',
    tasks: ['5 個獲利日（每日 ≥ $150）', '該週期總獲利為正 → 就能領'],
    redlines: ['EOD 總回撤 $2,000（餘額不能低於回撤線）'],
    tip: '無緩衝區、無一致性、無日風控——沒有隱藏門檻，全場最單純。',
    targets: { label: '獲利日門檻', items: [
      { size: '25K', value: '$100' }, { size: '50K', value: '$150' },
      { size: '100K', value: '$200' }, { size: '150K', value: '$250' },
    ] },
  },
  {
    firmId: 'lucid', firmName: 'Lucid Trading', plan: 'Pro（穩健型）',
    tasks: ['餘額打到 → $52,100（緩衝＝總風控＋$100）', '週期獲利 ≥ $500', '單日最大獲利 ≤ 總獲利 40%'],
    redlines: ['最大虧損 MLL $2,000', '日風控 DLL $1,200（軟性；活動免除至 2026/7/24）'],
    targets: { label: '緩衝區（要打到）', items: [
      { size: '25K', value: '$26,100' }, { size: '50K', value: '$52,100' },
      { size: '100K', value: '$103,100' }, { size: '150K', value: '$154,600' },
    ] },
  },
  {
    firmId: 'lucid', firmName: 'Lucid Trading', plan: 'Direct（免考試）',
    tasks: ['首次出金目標 $3,000（第 2 次起 $2,500）', '單日最大獲利 ≤ 總獲利 20%（最嚴）'],
    redlines: ['總風控 $2,000', '日風控 DLL $1,200'],
  },
  // ── Tradeify ──
  {
    firmId: 'tradeify', firmName: 'Tradeify', plan: 'Select Flex（5 日出金）',
    tasks: ['5 個獲利日 → 可領餘額 50%（有上限）'],
    redlines: ['EOD 回撤 $2,000'],
    tip: '⚠️ 第 2 次起：該週期淨獲利必須為正。例：第一次出金後帳戶 $51,500，之後虧到 $50,800（當期 −$700）→ 不能出金，要先賺回 $700 讓當期轉正。',
  },
  {
    firmId: 'tradeify', firmName: 'Tradeify', plan: 'Select Daily（每日出金）',
    tasks: ['先打出緩衝 → $52,100', '之後每日可申請（50K 每日上限 $1,000）'],
    redlines: ['日風控 DLL $1,000', 'EOD 回撤 $2,000', '第 2 次起當期須為正（同 Flex 例）'],
  },
  {
    firmId: 'tradeify', firmName: 'Tradeify', plan: 'Growth（快速通關）',
    tasks: ['餘額打到 → $53,000（緩衝 $3,000）', '5 個獲利日', '單日最大獲利 ≤ 總獲利 35%'],
    redlines: ['EOD 回撤 $2,000', '日風控 DLL $1,250（軟；獲利超 6% 後變 $2,000）'],
  },
  {
    firmId: 'tradeify', firmName: 'Tradeify', plan: 'Lightning（免考試直接開帳）',
    tasks: ['先打到 → $52,500（緩衝＝最大回撤，這筆永遠不能領）', '符合階梯一致性 20% → 25% → 30%'],
    redlines: ['EOD 回撤 $2,500', '日風控 DLL $1,250（軟）'],
    tip: '緩衝金是隱形成本；不想墊這筆就選 Select（無緩衝）。',
  },
  // ── TradeDay ──
  {
    firmId: 'tradeday', firmName: 'TradeDay', plan: 'Quick Pay（快速出金）',
    tasks: ['正餘額即可申請（最低出金 $250）', '💡 建議先打到毛利 $4,000 再領，分潤才划算'],
    redlines: ['Intraday 追蹤回撤 $2,000（含浮盈、只升不降）', '毛利 $10,000 天花板：超過直接註銷，達標即停'],
    tip: '⚠️ 分潤分界：毛利 < $4,000 只分 50%；≥ $4,000 的部分才 80%。例：賺 $3,000 領 $1,000 → 實拿只有 $500。小額快領選 Fast Pass 更划算。',
  },
  {
    firmId: 'tradeday', firmName: 'TradeDay', plan: 'Fast Pass（5 獲利日）',
    tasks: ['5 個獲利日（每日 ≥ $150）→ 可領餘額 50%（上限 $2,000）'],
    redlines: ['EOD 回撤 $2,000'],
    tip: '分潤一律 80%，小額出金比 Quick Pay 划算。官方無最低交易天數。',
  },
  // ── Apex ──
  {
    firmId: 'apex', firmName: 'Apex Trader Funding', plan: 'PA 出金帳號',
    tasks: ['餘額打到 → $52,600（安全網 $52,100 ＋ 最低出金 $500）', '5 個有效獲利日（EOD 版每日 > $250）', '單日獲利 ≤ 上次出金後累積利潤 50%'],
    redlines: ['總風控 $2,000', '只能領 6 次，領滿帳號關閉', '30 天內須有 2 個 $50 獲利日，否則關帳', '無停損交易／對沖／自動化 = 沒收帳號'],
    targets: { label: '安全網（餘額須高於）', items: [
      { size: '25K', value: '$26,100' }, { size: '50K', value: '$52,100' },
      { size: '100K', value: '$103,100' }, { size: '150K', value: '$154,100' },
    ] },
  },
  // ── Topstep ──
  {
    firmId: 'topstep', firmName: 'Topstep', plan: 'EX 帳戶（標準路徑）',
    tasks: ['5 個獲利日（每日 ≥ $150）→ 可領餘額 50%（上限 $2,000）'],
    redlines: ['EOD 最大虧損 $2,000', '⚠️ 第一次出金後虧損線永久鎖在 $50,000——記得留利潤當緩衝'],
  },
];

export const MISSION_FIRMS = ['lucid', 'tradeify', 'tradeday', 'apex', 'topstep'];
export const plansOf = (firmId: string) => MISSIONS.filter((m) => m.firmId === firmId);
