$ErrorActionPreference = "Stop"

# === 1. Get access_token ===
Write-Host "正在获取 access_token..."
$tokenUri = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={0}&secret={1}" -f $env:WX_APPID, $env:WX_APPSECRET
$tokenResp = Invoke-RestMethod -Uri $tokenUri
Write-Host "WeChat token response: $($tokenResp | ConvertTo-Json -Compress)"
if (-not $tokenResp.access_token) {
  Write-Host "获取 access_token 失败: $($tokenResp.errmsg)"
  exit 0
}
Write-Host "access_token 获取成功"

# === 2. Find article HTML ===
$article = Get-ChildItem ../daily_output/*.html | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Host "Found article: $($article.FullName)"
$content = Get-Content $article.FullName -Raw -Encoding UTF8

# === 3. Generate cover image ===
Write-Host "正在生成封面图..."
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(900, 500)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = "HighQuality"
# Gold gradient background
$brush1 = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point(0, 0)),
  (New-Object System.Drawing.Point(900, 500)),
  [System.Drawing.Color]::FromArgb(15, 25, 35),
  [System.Drawing.Color]::FromArgb(26, 39, 64)
)
$g.FillRectangle($brush1, 0, 0, 900, 500)
# Accent line
$accentPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 150, 62), 2)
$g.DrawLine($accentPen, 0, 490, 900, 490)
# Title text
$font = New-Object System.Drawing.Font("Microsoft YaHei", 36, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(226, 176, 74))
$textRect = New-Object System.Drawing.RectangleF(40, 140, 820, 120)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = "Center"
$sf.LineAlignment = "Center"
$g.DrawString("技术析金", $font, $textBrush, $textRect, $sf)
# Subtitle
$font2 = New-Object System.Drawing.Font("Microsoft YaHei", 18, [System.Drawing.FontStyle]::Regular)
$textBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 190, 200))
$textRect2 = New-Object System.Drawing.RectangleF(40, 260, 820, 60)
$g.DrawString("黄金价格今日金价深度分析", $font2, $textBrush2, $textRect2, $sf)
# Date
$dateStr = Get-Date -Format "yyyy年M月d日"
$font3 = New-Object System.Drawing.Font("Microsoft YaHei", 14, [System.Drawing.FontStyle]::Regular)
$textBrush3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 130, 140))
$textRect3 = New-Object System.Drawing.RectangleF(40, 320, 820, 40)
$g.DrawString($dateStr, $font3, $textBrush3, $textRect3, $sf)

$coverPath = "cover.png"
$bmp.Save($coverPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "封面图已生成: $coverPath"

# === 4. Upload cover as permanent material ===
Write-Host "正在上传封面图..."
$uploadUri = "https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=$($tokenResp.access_token)&type=image"
$fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $coverPath))
$boundary = [System.Guid]::NewGuid().ToString()
$lf = "`r`n"
$bodyLines = @(
  "--$boundary",
  "Content-Disposition: form-data; name=`"media`"; filename=`"cover.png`"",
  "Content-Type: image/png$lf",
  [System.Text.Encoding]::UTF8.GetString($fileBytes),
  "--$boundary--$lf"
)
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes(($bodyLines -join $lf))
$uploadResp = Invoke-RestMethod -Uri $uploadUri -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyBytes
Write-Host "Upload response: $($uploadResp | ConvertTo-Json -Compress)"
$thumbMediaId = $uploadResp.media_id

# === 5. Push draft ===
Write-Host "正在推送草稿..."
$title = "【技术析金】黄金价格今日金价深度分析"
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
$draftUri = "https://api.weixin.qq.com/cgi-bin/draft/add?access_token=" + $tokenResp.access_token
$draftResp = Invoke-RestMethod -Uri $draftUri -Method Post -ContentType "application/json" -Body $body
Write-Host "Draft push response: $($draftResp | ConvertTo-Json -Compress)"

if ($draftResp.errcode -eq 0) {
  Write-Host "? 公众号草稿推送成功！media_id: $($draftResp.media_id)"
  Write-Host "请登录微信公众平台 → 草稿箱 查看。"
} else {
  Write-Host "?? 草稿推送失败: errcode=$($draftResp.errcode) errmsg=$($draftResp.errmsg)"
}