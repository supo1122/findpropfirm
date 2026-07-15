@echo off
REM Weekly official-site check. Called by Windows Task Scheduler.
REM ASCII only on purpose: Chinese comments here get mangled under cp950
REM and cmd.exe then eats characters off the next command.
REM On difference: copy report to Desktop + show a balloon. Otherwise stay quiet.
setlocal
cd /d "%~dp0.."
set NODE="C:\Program Files\nodejs\node.exe"

%NODE% scripts\check-official.mjs --quiet
set RC=%ERRORLEVEL%

if not exist ".official" mkdir ".official"
echo [%DATE% %TIME%] exit=%RC% >> ".official\check.log"

if %RC% EQU 0 exit /b 0

copy /Y ".official\check-report.md" "%USERPROFILE%\Desktop\PropFirmTW-official-changed.md" >nul

powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\notify.ps1"
exit /b %RC%
