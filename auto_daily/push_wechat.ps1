$ErrorActionPreference = "Stop"

Write-Host "正在获取 access_token..."
$tokenUri = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={0}&secret={1}" -f $env:WX_APPID, $env:WX_APPSECRET
$tokenResp = Invoke-RestMethod -Uri $tokenUri
Write-Host "WeChat token response: $($tokenResp | ConvertTo-Json -Compress)"

if (-not $tokenResp.access_token) {
  Write-Host "获取 access_token 失败: $($tokenResp.errmsg)"
  exit 0
}
Write-Host "access_token 获取成功"

$article = Get-ChildItem ../daily_output/*.html | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Host "Found article: $($article.FullName)"

$title = "【技术析金】黄金价格今日金价深度分析"
$content = Get-Content $article.FullName -Raw -Encoding UTF8

$bodyObj = @{
  articles = @(
    @{
      title                = $title
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
  Write-Host "? 公众号草稿推送成功！请登录微信公众平台查看草稿箱。"
} else {
  Write-Host "?? 草稿推送失败: $($draftResp.errmsg)"
}