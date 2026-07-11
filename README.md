# findpropfirm — Liquid Glass 版

暗色電影感 + liquid glass 玻璃擬態的 Prop Firm 一站式比較站。
React + Vite + TypeScript + Tailwind + Framer Motion。全繁體中文，2026/07 核對。

## 一鍵啟動（Windows）
**雙擊 `start.bat`** —— 首次會自動安裝套件，然後開瀏覽器到 http://localhost:5173。

或手動：
```
npm install
npm run dev
```

## 已搬入的全部功能
- 開場 Preloader（進度條 + clip-path 幕簾）
- 自訂游標（綠點 + 圓環，hover 放大）、捲動進度條
- Hero（玻璃導覽、徽章、統計卡、可放背景影片）
- 排行榜（五家依 Trustpilot 排序，點開完整規則 Modal）
- 本月優惠（真實折扣 + 錨定價 + 折扣碼一鍵複製 + confetti 粒子）
- 30 秒 3 題測驗 → 推薦最適合的一家
- 篩選器（風控 / 付費 / 日風控 / 商品）+ 卡片即時篩選
- 各家完整規則 Modal（Lucid / Apex / Topstep / Tradeify / SiegPath 全含考試與出金表）
- 通知系統（鈴鐺 + toast，只放真實資訊，可開關、24h 冷卻）
- 免責聲明 + 商標識別用途聲明 + 聯盟連結揭露（合法）

## 背景動畫（你自己的影片，避免版權問題）
放到 `public/videos/hero.mp4` 會自動當 Hero 背景。
路徑常數在 `src/App.tsx` 的 `HERO_VIDEO`。沒放也能跑（純黑底 + 玻璃 UI）。

## 改內容
所有五家規則、折扣、通知、測驗邏輯都集中在 **`src/data.ts`**，改資料不用動畫面。

## 部署到網域（免費）
```
npm run build      # 產出 dist/
```
Cloudflare Pages：Framework=None、Build command=`npm run build`、Output=`dist`。
接上 `twpropfirm.pages.dev` 或免費 `twpropfirm.is-a.dev`。
