@echo off
chcp 65001 >nul
cd /d "%~dp0"
title findpropfirm 一鍵啟動

if not exist node_modules (
  echo [1/2] 首次啟動，正在安裝套件（約 1 分鐘）...
  call npm install
) else (
  echo [1/2] 套件已安裝，略過。
)

echo [2/2] 啟動開發伺服器 http://localhost:5173 ...
start "" http://localhost:5173
call npm run dev
pause
