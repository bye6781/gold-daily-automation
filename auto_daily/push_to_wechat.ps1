# ============================================
# 微信公众平台草稿箱推送脚本
# 使用前需填写 APPID 和 APPSECRET
# ============================================

param(
    [string]$articlePath = "",
    [string]$appId = "",
    [string]$appSecret = ""
)

# ===== 配置区（填入你的公众号开发者信息）=====
if (-not $appId) { $appId = "YOUR_APPID_HERE" }
if (-not $appSecret) { $appSecret = "YOUR_APPSECRET_HERE" }
# ================================================

if ($appId -eq "YOUR_APPID_HERE") {
    Write-Host "请先填写微信公众号的 AppID 和 AppSecret" -ForegroundColor Yellow
    Write-Host "获取路径: 微信公众平台 → 开发 → 基本配置" -ForegroundColor Yellow
    exit 1
}

# 确定文章路径
if (-not $articlePath) {
    $today = Get-Date -Format "yyyyMMdd"
    $articlePath = "D:\Codex\黄金文章\daily_output\黄金文章_$today.html"
}

if (-not (Test-Path $articlePath)) {
    Write-Host "文章文件不存在: $articlePath" -ForegroundColor Red
    exit 1
}

Write-Host "文章路径: $articlePath"

# 1. 获取 access_token
Write-Host "正在获取 access_token..."
try {
    $tokenUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$appId&secret=$appSecret"
    $tokenResp = Invoke-RestMethod -Uri $tokenUrl -Method Get
    $accessToken = $tokenResp.access_token
    if (-not $accessToken) {
        Write-Host "获取 access_token 失败: $($tokenResp | ConvertTo-Json)" -ForegroundColor Red
        exit 1
    }
    Write-Host "access_token 获取成功" -ForegroundColor Green
} catch {
    Write-Host "access_token 请求失败: $_" -ForegroundColor Red
    exit 1
}

# 2. 读取文章 HTML 内容
$content = Get-Content $articlePath -Raw -Encoding UTF8

# 3. 提取标题
$titleMatch = [regex]::Match($content, '<title>(.+?)</title>')
$title = if ($titleMatch.Success) { $titleMatch.Groups[1].Value } else { "黄金价格今日金价深度分析" }

# 4. 构建草稿
$draftBody = @{
    articles = @(
        @{
            title = $title
            content = $content
            content_source_url = ""
            need_open_comment = 0
            only_fans_can_comment = 0
        }
    )
} | ConvertTo-Json -Depth 5 -Compress

# 5. 推送到草稿箱
Write-Host "正在推送到草稿箱..."
try {
    $draftUrl = "https://api.weixin.qq.com/cgi-bin/draft/add?access_token=$accessToken"
    $draftResp = Invoke-RestMethod -Uri $draftUrl -Method Post -Body $draftBody -ContentType "application/json; charset=utf-8"
    if ($draftResp.errcode -eq 0) {
        Write-Host "✅ 草稿推送成功！media_id: $($draftResp.media_id)" -ForegroundColor Green
        Write-Host "请在微信公众平台 → 草稿箱 中查看" -ForegroundColor Green
    } else {
        Write-Host "❌ 草稿推送失败: errcode=$($draftResp.errcode) errmsg=$($draftResp.errmsg)" -ForegroundColor Red
    }
} catch {
    Write-Host "草稿推送请求失败: $_" -ForegroundColor Red
}
