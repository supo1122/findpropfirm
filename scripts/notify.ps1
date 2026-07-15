# 核對到官網有變動時跳通知。由 weekly-check.cmd 呼叫。
# （PowerShell 讀 UTF-8 沒問題，中文放這裡才安全，不能放 .cmd）
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$n = New-Object System.Windows.Forms.NotifyIcon
$n.Icon = [System.Drawing.SystemIcons]::Warning
$n.Visible = $true
$n.ShowBalloonTip(
  20000,
  'PropFirmTW：官網有變動',
  '有價格或折扣碼跟站上對不上，報告已放到桌面（PropFirmTW-official-changed.md）。',
  [System.Windows.Forms.ToolTipIcon]::Warning
)
Start-Sleep -Seconds 8
$n.Dispose()
