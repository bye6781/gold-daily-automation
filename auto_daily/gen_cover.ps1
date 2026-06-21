Add-Type -AssemblyName System.Drawing

$w = 900; $h = 500
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = "HighQuality"
$g.TextRenderingHint = "AntiAlias"

# Deep navy background
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(10, 15, 25))
$g.FillRectangle($bgBrush, 0, 0, $w, $h)

# Gold glow circle (top right)
$glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush(
  (New-Object System.Drawing.Drawing2D.GraphicsPath) -as [System.Drawing.Drawing2D.GraphicsPath]
)
# Simpler: use a radial gradient via multiple concentric filled ellipses
for ($i = 0; $i -lt 8; $i++) {
  $alpha = 15 - $i * 2
  $radius = 120 + $i * 40
  $x = $w - 100 - $radius/2
  $y = 60 - $radius/2
  $c = [System.Drawing.Color]::FromArgb([Math]::Max(0, $alpha), 200, 150, 62)
  $pen = New-Object System.Drawing.Pen($c, 1)
  $g.DrawEllipse($pen, $x, $y, $radius, $radius)
  $pen.Dispose()
}

# Horizontal accent line (gold gradient)
$gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($w, 0)),
  [System.Drawing.Color]::FromArgb(200, 150, 62),
  [System.Drawing.Color]::FromArgb(30, 40, 55)
)
$accentPen = New-Object System.Drawing.Pen($gradBrush, 3)
$g.DrawLine($accentPen, 50, 60, $w - 50, 60)

# Bottom accent
$gradBrush2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($w, 0)),
  [System.Drawing.Color]::FromArgb(30, 40, 55),
  [System.Drawing.Color]::FromArgb(200, 150, 62)
)
$accentPen2 = New-Object System.Drawing.Pen($gradBrush2, 2)
$g.DrawLine($accentPen2, 50, $h - 60, $w - 50, $h - 60)

# Main Title: 技术析金
$font1 = New-Object System.Drawing.Font("Microsoft YaHei", 48, [System.Drawing.FontStyle]::Bold)
$goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(226, 176, 74))
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = "Center"
$sf.LineAlignment = "Center"
$r1 = New-Object System.Drawing.RectangleF(0, 110, $w, 100)
$g.DrawString("技术析金", $font1, $goldBrush, $r1, $sf)

# Gold icon (diamond/star shapes to suggest gold/precious)
$iconPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 226, 176, 74), 3)
# Small diamond left of title
$cx = 200; $cy = 160
$pts = @(
  (New-Object System.Drawing.Point($cx, $cy - 12)),
  (New-Object System.Drawing.Point($cx + 10, $cy)),
  (New-Object System.Drawing.Point($cx, $cy + 12)),
  (New-Object System.Drawing.Point($cx - 10, $cy))
)
$g.DrawPolygon($iconPen, $pts)
$pts2 = @(
  (New-Object System.Drawing.Point($w - $cx, $cy - 12)),
  (New-Object System.Drawing.Point($w - $cx + 10, $cy)),
  (New-Object System.Drawing.Point($w - $cx, $cy + 12)),
  (New-Object System.Drawing.Point($w - $cx - 10, $cy))
)
$g.DrawPolygon($iconPen, $pts2)

# Subtitle
$font2 = New-Object System.Drawing.Font("Microsoft YaHei", 20, [System.Drawing.FontStyle]::Regular)
$silverBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 190, 200))
$r2 = New-Object System.Drawing.RectangleF(0, 220, $w, 60)
$g.DrawString("黄金价格今日金价 · 每日深度分析", $font2, $silverBrush, $r2, $sf)

# Keywords line
$font3 = New-Object System.Drawing.Font("Microsoft YaHei", 14, [System.Drawing.FontStyle]::Regular)
$dimBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 130, 140))
$r3 = New-Object System.Drawing.RectangleF(0, 290, $w, 40)
$g.DrawString("实时报价 · 技术面解析 · 基本面研判 · 实物金消费指南", $font3, $dimBrush, $r3, $sf)

# Date
$font4 = New-Object System.Drawing.Font("Microsoft YaHei", 16, [System.Drawing.FontStyle]::Regular)
$dateStr = Get-Date -Format "yyyy年M月d日"
$r4 = New-Object System.Drawing.RectangleF(0, 340, $w, 50)
$g.DrawString($dateStr, $font4, $silverBrush, $r4, $sf)

# Bottom bar with data sources
$font5 = New-Object System.Drawing.Font("Microsoft YaHei", 12)
$sourceBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(90, 100, 110))
$r5 = New-Object System.Drawing.RectangleF(0, $h - 45, $w, 30)
$g.DrawString("数据来源：金十数据 (jin10.com)  |  COMEX (cmegroup.com)  |  上海黄金交易所", $font5, $sourceBrush, $r5, $sf)

# Cleanup
$g.Dispose()
$bmp.Save("cover.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "封面图已生成 (900x500)"