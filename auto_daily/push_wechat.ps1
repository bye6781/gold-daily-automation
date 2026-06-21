$ErrorActionPreference = "Stop"

# === 1. Get access_token ===
Write-Host "正在获取 access_token..."
$tokenUri = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={0}&secret={1}" -f $env:WX_APPID, $env:WX_APPSECRET
$tokenResp = Invoke-RestMethod -Uri $tokenUri
if (-not $tokenResp.access_token) {
  Write-Host "获取 access_token 失败: $($tokenResp.errmsg)"
  exit 0
}
Write-Host "access_token 获取成功"
$token = $tokenResp.access_token

# === 2. Find article HTML ===
$article = Get-ChildItem ../daily_output/*.html | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Host "Found article: $($article.FullName)"
$contentPath = $article.FullName

# === 3. Generate cover image ===
Write-Host "正在生成封面图..."
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(900, 500)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = "HighQuality"
$brush1 = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point(0, 0)),
  (New-Object System.Drawing.Point(900, 500)),
  [System.Drawing.Color]::FromArgb(15, 25, 35),
  [System.Drawing.Color]::FromArgb(26, 39, 64)
)
$g.FillRectangle($brush1, 0, 0, 900, 500)
$g.DrawLine((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 150, 62), 2)), 0, 490, 900, 490)
$font = New-Object System.Drawing.Font("Microsoft YaHei", 36, [System.Drawing.FontStyle]::Bold)
$tb = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(226, 176, 74))
$sf = New-Object System.Drawing.StringFormat; $sf.Alignment = "Center"; $sf.LineAlignment = "Center"
$g.DrawString("技术析金", $font, $tb, (New-Object System.Drawing.RectangleF(40, 140, 820, 120)), $sf)
$font2 = New-Object System.Drawing.Font("Microsoft YaHei", 18)
$tb2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 190, 200))
$g.DrawString("黄金价格今日金价深度分析", $font2, $tb2, (New-Object System.Drawing.RectangleF(40, 260, 820, 60)), $sf)
$font3 = New-Object System.Drawing.Font("Microsoft YaHei", 14)
$tb3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 130, 140))
$g.DrawString((Get-Date -Format "yyyy年M月d日"), $font3, $tb3, (New-Object System.Drawing.RectangleF(40, 320, 820, 40)), $sf)
$coverPath = [System.IO.Path]::GetFullPath("cover.png")
$bmp.Save($coverPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "封面图已生成: $coverPath ($((Get-Item $coverPath).Length) bytes)"

# === 4. Upload cover using curl.exe ===
Write-Host "正在上传封面图..."
$uploadUri = "https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=$token&type=image"
$uploadResult = & curl.exe -s -X POST $uploadUri -F "media=@$coverPath" 2>&1
Write-Host "Upload response: $uploadResult"
$uploadJson = $uploadResult | ConvertFrom-Json
$thumbMediaId = $uploadJson.media_id

if (-not $thumbMediaId) {
  Write-Host "封面上传失败: $($uploadJson.errmsg)"
  exit 0
}
Write-Host "封面上传成功, media_id: $thumbMediaId"

# === 5. Push draft ===
Write-Host "正在推送草稿..."
$title = "【技术析金】黄金价格今日金价深度分析"
$content = Get-Content $contentPath -Raw -Encoding UTF8
$bodyObj = @{
  articles = @(
    @{
      title                = $title
      thumb_media_id       = $thumbMediaId
      author               = "技术析金"
      digest               = "今日黄金实时价格、技术面分析、均线系统及基本面深度解读。数据来源：金十数据 & COMEX"
      content              = $content
      content_source_url   = ""
      need_open_comment    = 0
      only_fans_can_comment = 0
    }
  )
}
$body = $bodyObj | ConvertTo-Json -Depth 5 -Compress

# Save body to temp file to avoid PowerShell encoding issues
$bodyFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($bodyFile, $body, [System.Text.UTF8Encoding]::new($false))

$draftUri = "https://api.weixin.qq.com/cgi-bin/draft/add?access_token=$token"
$draftResult = & curl.exe -s -X POST $draftUri -H "Content-Type: application/json; charset=utf-8" -d "@$bodyFile" 2>&1
Write-Host "Draft push response: $draftResult"
$draftJson = $draftResult | ConvertFrom-Json

Remove-Item $bodyFile -Force

if ($draftJson.errcode -eq 0) {
  Write-Host "? 公众号草稿推送成功！media_id: $($draftJson.media_id)"
  Write-Host "请登录微信公众平台 → 草稿箱 查看。"
} else {
  Write-Host "?? 草稿推送失败: errcode=$($draftJson.errcode) errmsg=$($draftJson.errmsg)"
}