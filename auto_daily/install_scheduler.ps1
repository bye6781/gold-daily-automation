# ============================================
# 安装 Windows 定时任务
# 每天 8:00 自动运行 daily_run.ps1
# ============================================

$taskName = "黄金日更文章生成"
$scriptPath = "D:\Codex\黄金文章\auto_daily\daily_run.ps1"
$workingDir = "D:\Codex\黄金文章\auto_daily"

# 先删除已有任务（如果存在）
try {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
} catch {}

# 创建新的定时任务
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""

$trigger = New-ScheduledTaskTrigger -Daily -At "08:00"

$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" `
    -LogonType Interactive -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

Register-ScheduledTask -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "每天早8点自动抓取黄金数据并生成公众号文章" `
    -Force

Write-Host "============================================" -ForegroundColor Green
Write-Host "  定时任务已创建！" -ForegroundColor Green
Write-Host "  任务名称: $taskName" -ForegroundColor Green
Write-Host "  执行时间: 每天 08:00" -ForegroundColor Green
Write-Host "  脚本路径: $scriptPath" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "管理命令:" -ForegroundColor Yellow
Write-Host "  手动运行: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "  查看状态: Get-ScheduledTask -TaskName '$taskName'"
Write-Host "  删除任务: Unregister-ScheduledTask -TaskName '$taskName'"
