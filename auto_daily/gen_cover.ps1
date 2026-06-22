Add-Type -AssemblyName System.Drawing

$w = 900; $h = 500
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = "HighQuality"
$g.TextRenderingHint = "AntiAlias"

# Solid background
$bg = [System.Drawing.Color]::FromArgb(18, 22, 33)
$bgBrush = New-Object System.Drawing.SolidBrush($bg)
$g.FillRectangle($bgBrush, 0, 0, $w, $h)

# Top accent bar
$goldAccent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 155, 60))
$g.FillRectangle($goldAccent, 0, 0, $w, 4)

# Bottom accent bar
$g.FillRectangle($goldAccent, 0, $h-4, $w, 4)

# Gold coin/dot pattern on sides
$dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 200, 155, 60))
for ($i = 0; $i -lt 5; $i++) {
  $y = 80 + $i * 80
  $g.FillEllipse($dotBrush, 60, $y, 8, 8)
  $g.FillEllipse($dotBrush, $w-68, $y, 8, 8)
}

# Brand name
$fontBrand = New-Object System.Drawing.Font("Microsoft YaHei", 52, [System.Drawing.FontStyle]::Bold)
$brandBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(226, 176, 74))
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = "Center"
$sf.LineAlignment = "Center"
$g.DrawString("技术析金", $fontBrand, $brandBrush, (New-Object System.Drawing.RectangleF(0, 100, $w, 110)), $sf)

# Divider line
$divPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 200, 155, 60), 1)
$g.DrawLine($divPen, $w/2 - 80, 220, $w/2 + 80, 220)

# Subtitle
$fontSub = New-Object System.Drawing.Font("Microsoft YaHei", 20, [System.Drawing.FontStyle]::Regular)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190, 195, 205))
$g.DrawString("黄金 · 每日深度分析报告", $fontSub, $subBrush, (New-Object System.Drawing.RectangleF(0, 235, $w, 55)), $sf)

# Keywords
$fontKw = New-Object System.Drawing.Font("Microsoft YaHei", 14)
$kwBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(130, 140, 155))
$g.DrawString("实时金价  |  技术面解析  |  基本面研判  |  实物消费指南", $fontKw, $kwBrush, (New-Object System.Drawing.RectangleF(0, 300, $w, 40)), $sf)

# Date
$dateStr = (Get-Date).ToString("yyyy年M月d日") + " 更新"
$fontDate = New-Object System.Drawing.Font("Microsoft YaHei", 15)
$g.DrawString($dateStr, $fontDate, $subBrush, (New-Object System.Drawing.RectangleF(0, 355, $w, 40)), $sf)

# Footer - data source
$fontSrc = New-Object System.Drawing.Font("Microsoft YaHei", 11)
$srcBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(85, 90, 100))
$g.DrawString("数据来源：金十数据  |  COMEX  |  上海黄金交易所", $fontSrc, $srcBrush, (New-Object System.Drawing.RectangleF(0, $h-50, $w, 30)), $sf)

$g.Dispose()
$bmp.Save("cover.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Cover OK"