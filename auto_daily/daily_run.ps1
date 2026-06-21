# ============================================
# 黄金日更总入口：daily_run.ps1 (v3.0 含草稿推送)
# 1. 数据抓取  →  fetch_data.mjs
# 2. 文章生成  →  generate_article.mjs
# 3. 合规审查  →  compliance_agent.py
# 4. 数据核验  →  内联校验
# 5. 成品交付  →  6. 草稿推送  →  打开预览 + 汇总报告
# ============================================

$ErrorActionPreference = "Continue"
$root = "D:\Codex\黄金文章\auto_daily"
$today = Get-Date -Format "yyyyMMdd"
$mdPath = "D:\Codex\黄金文章\daily_output\黄金文章_$today.md"

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  黄金日更系统 v2.0 - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# === 第1步：抓取数据 ===
Write-Host "`n[1/5] 正在抓取最新黄金数据..." -ForegroundColor Cyan
try {
    Push-Location $root
    $nodeResult = node fetch_data.mjs 2>&1
    Pop-Location
    Write-Host $nodeResult
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: 数据抓取失败，退出" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: 数据抓取失败: $_" -ForegroundColor Red
    exit 1
}

# === 第2步：生成文章 ===
Write-Host "`n[2/5] 正在生成文章..." -ForegroundColor Cyan
try {
    node "$root\generate_article.mjs"
} catch {
    Write-Host "ERROR: 文章生成失败: $_" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $mdPath)) {
    Write-Host "ERROR: 文章文件未生成: $mdPath" -ForegroundColor Red
    exit 1
}
Write-Host "文章已生成: $mdPath" -ForegroundColor Green

# === 第3步：合规审查 ===
Write-Host "`n[3/5] 正在运行合规审查..." -ForegroundColor Cyan
$complianceScript = "D:\Codex\技术析金公众号运营方案\自动化工作流\compliance_agent.py"
try {
    $complianceResult = python $complianceScript $mdPath 2>&1
    Write-Host $complianceResult

    # 检查是否有 FAIL 标记
    if ($complianceResult -match "FAIL|致命|违规|不通过") {
        Write-Host "`n*** 合规审查发现风险项，请人工复核！ ***" -ForegroundColor Red
    } else {
        Write-Host "合规审查通过" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING: 合规审查执行异常: $_ — 继续后续步骤" -ForegroundColor Yellow
}

# === 第4步：数据核验 ===
Write-Host "`n[4/5] 正在核验数据准确性..." -ForegroundColor Cyan
$dataFile = "$root\latest_data.json"
if (Test-Path $dataFile) {
    $data = Get-Content $dataFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $article = Get-Content $mdPath -Raw -Encoding UTF8

    Write-Host "  数据核验报告:" -ForegroundColor Yellow
    $checks = @()

    $checkItems = @{
        "SPOT_PRICE" = "国际现货金价"
        "COMEX_PRICE" = "COMEX期货价格"
        "DAY_LOW" = "日内最低价"
        "DAY_HIGH" = "日内最高价"
        "USDCNY" = "美元兑人民币"
        "JEWELRY_PRICE" = "金饰零售价"
        "RECOVERY_PRICE" = "黄金回收价"
    }

    foreach ($key in $checkItems.Keys) {
        $val = $data.$key
        if ($val -and $article -match [regex]::Escape($val)) {
            Write-Host "    [PASS] $($checkItems[$key]) = $val" -ForegroundColor Green
            $checks += @{item=$checkItems[$key]; status="PASS"; value=$val}
        } elseif ($val) {
            Write-Host "    [WARN] $($checkItems[$key]) = $val (文章中未找到)" -ForegroundColor Yellow
            $checks += @{item=$checkItems[$key]; status="WARN"; value=$val}
        } else {
            Write-Host "    [SKIP] $($checkItems[$key]) (源数据缺失)" -ForegroundColor DarkGray
            $checks += @{item=$checkItems[$key]; status="SKIP"; value="N/A"}
        }
    }

    # 生成核验报告
    $reportDate = Get-Date -Format "yyyyMMdd"
    $reportPath = "D:\Codex\黄金文章\数据核查报告_$reportDate.md"
    $reportLines = @()
    $reportLines += "# 数据准确性核查报告"
    $reportLines += "## $(Get-Date -Format 'yyyy年M月d日')"
    $reportLines += ""
    $reportLines += "| 数据项 | 取值 | 状态 |"
    $reportLines += "|--------|------|------|"
    foreach ($c in $checks) {
        $icon = if ($c.status -eq "PASS") { "PASS" } elseif ($c.status -eq "WARN") { "WARN" } else { "N/A" }
        $reportLines += "| $($c.item) | $($c.value) | $icon |"
    }
    $reportLines += ""
    $reportLines += "核验时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    $reportLines += "文章文件: $mdPath"
    $reportLines -join "`n" | Out-File $reportPath -Encoding UTF8
    Write-Host "  核验报告: $reportPath" -ForegroundColor Gray
} else {
    Write-Host "WARNING: 数据文件不存在，跳过核验" -ForegroundColor Yellow
}

# === 第5步：打开预览 ===
Write-Host "`n[5/5] 正在打开预览..." -ForegroundColor Cyan
$htmlFile = "D:\Codex\黄金文章\daily_output\黄金文章_$today.html"
if (Test-Path $htmlFile) {
    Start-Process $htmlFile
    Write-Host "预览已在浏览器中打开" -ForegroundColor Green
}


# === 第6步：推送到公众号草稿箱 ===
Write-Host "`n[6/6] 正在推送到公众号草稿箱..." -ForegroundColor Cyan
$pushScript = "D:\Codex\黄金文章\auto_daily\push_to_wechat.ps1"
if (Test-Path $pushScript) {
    try {
        $pushResult = & $pushScript -articlePath $htmlFile 2>&1
        Write-Host $pushResult
        if ($pushResult -match "推送成功") {
            Write-Host "✅ 草稿推送成功" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 推送未成功，请检查 AppID/AppSecret 配置" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "WARNING: 推送失败: $_ — 文章已生成，可手动推送" -ForegroundColor Yellow
    }
} else {
    Write-Host "WARNING: 推送脚本不存在，跳过" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  全流程完成！" -ForegroundColor Green
Write-Host "  文章: daily_output\黄金文章_$today.md" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

