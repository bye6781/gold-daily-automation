Add-Type -AssemblyName System.Drawing
$w = 900; $h = 500
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = "HighQuality"
$c1 = [System.Drawing.Color]::FromArgb(15, 25, 35)
$c2 = [System.Drawing.Color]::FromArgb(26, 39, 64)
$b1 = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Point(0,0)), (New-Object System.Drawing.Point($w,$h)), $c1, $c2)
$g.FillRectangle($b1, 0, 0, $w, $h)
$gold = [System.Drawing.Color]::FromArgb(200, 150, 62)
$g.DrawLine((New-Object System.Drawing.Pen($gold, 2)), 0, ($h-10), $w, ($h-10))
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = "Center"
$sf.LineAlignment = "Center"
$font1 = New-Object System.Drawing.Font("Microsoft YaHei", 36, [System.Drawing.FontStyle]::Bold)
$c3 = [System.Drawing.Color]::FromArgb(226, 176, 74)
$tb1 = New-Object System.Drawing.SolidBrush($c3)
$r1 = New-Object System.Drawing.RectangleF(40, 140, ($w-80), 120)
$g.DrawString("技术析金", $font1, $tb1, $r1, $sf)
$font2 = New-Object System.Drawing.Font("Microsoft YaHei", 18)
$c4 = [System.Drawing.Color]::FromArgb(180, 190, 200)
$tb2 = New-Object System.Drawing.SolidBrush($c4)
$r2 = New-Object System.Drawing.RectangleF(40, 260, ($w-80), 60)
$g.DrawString("黄金价格今日金价深度分析", $font2, $tb2, $r2, $sf)
$font3 = New-Object System.Drawing.Font("Microsoft YaHei", 14)
$c5 = [System.Drawing.Color]::FromArgb(120, 130, 140)
$tb3 = New-Object System.Drawing.SolidBrush($c5)
$r3 = New-Object System.Drawing.RectangleF(40, 320, ($w-80), 40)
$dateStr = Get-Date -Format "yyyy年M月d日"
$g.DrawString($dateStr, $font3, $tb3, $r3, $sf)
$bmp.Save("cover.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Host "封面图已生成"