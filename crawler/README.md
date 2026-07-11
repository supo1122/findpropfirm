# X（Twitter）最新消息爬蟲

前端（`NotificationBell`）會讀 `public/news.json` 顯示各家最新消息。這個檔案要由**後端排程**定期更新——因為瀏覽器無法直接抓 X（CORS + 需登入授權）。

## 為什麼不能在前端直接爬 X
- X/Twitter API 需要付費金鑰或 OAuth，前端 JS 直接 fetch 會被 CORS 擋。
- 直接抓網頁 HTML 也被 X 擋（需登入）。
- 所以一定要有一個「後端定時去抓、寫成 news.json」的角色。

## 建議做法：Cloudflare Cron Worker（跟網站同一個 Cloudflare 帳號，免費額度夠）

`crawler/worker.js` 是骨架。部署後設 cron（例如每 30 分鐘），它會：
1. 從各家 X 抓最新推文（透過官方 X API v2，或改用 RSS 橋接如 rss.app / nitter RSS）。
2. 篩選含「discount / payout / rule / off / % / promo」等關鍵字的推文。
3. 轉成 `{ tag, html }` 陣列，寫進 KV 或 R2 的 `news.json`，前端就會自動更新。

### 需要準備
- **方案 A（官方，穩定）**：X API Bearer Token（付費）。填進 Worker 的環境變數 `X_BEARER`。
- **方案 B（免費，較不穩）**：用 rss.app 幫每個帳號產生 RSS，把 RSS 網址填進 `FEEDS`，Worker 解析 RSS。

### 部署
```
npm i -g wrangler
cd crawler
wrangler deploy          # 部署 Worker
wrangler triggers ...    # 或在 dashboard 設 Cron Trigger（*/30 * * * *）
```
把 Worker 寫出的 news.json 綁到網站網域 `/news.json`（用 Cloudflare 路由或 R2 public bucket）。

## 合規提醒
- 遵守 X 開發者條款，勿高頻抓取、勿轉載全文，僅摘要 + 連結到原推文。
- 只顯示真實推文，不得捏造。
