@echo off
chcp 65001 >nul
echo ========================================
echo   黄金日更定时任务安装器
echo   每天 08:00 自动抓取数据生成文章
echo ========================================
echo.

set "TASK_NAME=黄金日更文章生成"
set "SCRIPT_PATH=D:\Codex\黄金文章\auto_daily\daily_run.ps1"

echo [1/2] 清理旧任务...
schtasks /delete /tn "%TASK_NAME%" /f 2>nul

echo [2/2] 创建新任务...
schtasks /create /tn "%TASK_NAME%" /tr "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File \"%SCRIPT_PATH%\"" /sc daily /st 08:00 /ru SYSTEM /rl HIGHEST /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ 定时任务安装成功！
    echo   任务名称: %TASK_NAME%
    echo   执行时间: 每天 08:00
    echo ========================================
) else (
    echo.
    echo ❌ 安装失败，请右键此文件选择"以管理员身份运行"
)

pause
