Add-Type -AssemblyName System.Drawing
$w=900;$h=500
$bmp=New-Object System.Drawing.Bitmap($w,$h)
$g=[System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode="HighQuality"
$g.TextRenderingHint="AntiAlias"
$bg=[System.Drawing.Color]::FromArgb(18,22,33)
$g.FillRectangle((New-Object System.Drawing.SolidBrush($bg)),0,0,$w,$h)
$gold=[System.Drawing.Color]::FromArgb(200,155,60)
$gb=New-Object System.Drawing.SolidBrush($gold)
$g.FillRectangle($gb,0,0,$w,4)
$g.FillRectangle($gb,0,($h-4),$w,4)
$db=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30,200,155,60))
for($i=0;$i -lt 5;$i++){$y=80+$i*80;$g.FillEllipse($db,60,$y,8,8);$g.FillEllipse($db,($w-68),$y,8,8)}
$fn="Microsoft YaHei"
$f1=New-Object System.Drawing.Font($fn,52,[System.Drawing.FontStyle]::Bold)
$b1=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(226,176,74))
$sf=New-Object System.Drawing.StringFormat;$sf.Alignment="Center";$sf.LineAlignment="Center"
$g.DrawString([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("5oqA5pyv5p6Q6YeR")),$f1,$b1,(New-Object System.Drawing.RectangleF(0,100,$w,110)),$sf)
$dp=New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120,200,155,60),1)
$g.DrawLine($dp,($w/2-80),220,($w/2+80),220)
$f2=New-Object System.Drawing.Font($fn,20)
$b2=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190,195,205))
$g.DrawString([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("6buE6YeRIOOAg+avj+aXpeC3seW6puWIhuaekOaKpeWRig==")),$f2,$b2,(New-Object System.Drawing.RectangleF(0,235,$w,55)),$sf)
$f3=New-Object System.Drawing.Font($fn,14)
$b3=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(130,140,155))
$g.DrawString([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("5a6e5pe26YeR5Lu3ICB8ICDmioDmnK/pnaLop6PmnpAgIHwgIOWfuuacrOmdoueglOW+kSAgfCAg5a6e54mp5raI6LS55oyH5Y2X")),$f3,$b3,(New-Object System.Drawing.RectangleF(0,300,$w,40)),$sf)
$ds=(Get-Date).ToString("yyyy\u5E74M\u6708d\u65E5")+" \u66F4\u65B0"
$f4=New-Object System.Drawing.Font($fn,15)
$g.DrawString($ds,$f4,$b2,(New-Object System.Drawing.RectangleF(0,355,$w,40)),$sf)
$f5=New-Object System.Drawing.Font($fn,11)
$b5=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(85,90,100))
$g.DrawString([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("5pWw5o2u5p2l5rqQ77ya6YeR5Y2B5pWw5o2uICB8ICBDT01FWCAgfCAg5LiK5rW36buE6YeR5Lqk5piT5omA")),$f5,$b5,(New-Object System.Drawing.RectangleF(0,($h-50),$w,30)),$sf)
$g.Dispose()
$bmp.Save("cover.png",[System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Cover OK"
