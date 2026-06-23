const { chromium } = require("playwright");
const path = require("path");

const today = new Date();
const dateStr = today.getFullYear() + "\u5E74" + (today.getMonth() + 1) + "\u6708" + today.getDate() + "\u65E5";

const html = \<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:900px;height:500px;overflow:hidden;font-family:"Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif;background:#121621;color:#e8ecf1}
.accent-top{position:absolute;top:0;left:0;width:100%;height:4px;background:#c89b3c}
.accent-bot{position:absolute;bottom:0;left:0;width:100%;height:4px;background:#c89b3c}
.content{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:40px}
.brand{font-size:52px;font-weight:800;color:#e2b04a;letter-spacing:6px;margin-bottom:8px}
.divider{width:120px;height:1px;background:rgba(200,155,60,.5);margin:16px auto}
.subtitle{font-size:20px;color:#bec3cd;letter-spacing:2px;margin-bottom:20px}
.keywords{font-size:14px;color:#8a909e;margin-bottom:28px}
.date{font-size:16px;color:#bec3cd;margin-bottom:0}
.footer{position:absolute;bottom:20px;left:0;width:100%;text-align:center;font-size:11px;color:#5a606e}
.dots{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}
.dot{position:absolute;width:6px;height:6px;border-radius:50%;background:rgba(200,155,60,.15)}
</style></head><body>
<div class="accent-top"></div><div class="accent-bot"></div>
<div class="dots">
  <div class="dot" style="top:60px;left:70px"></div><div class="dot" style="top:140px;left:70px"></div>
  <div class="dot" style="top:60px;right:70px"></div><div class="dot" style="top:140px;right:70px"></div>
  <div class="dot" style="bottom:140px;left:70px"></div><div class="dot" style="bottom:60px;left:70px"></div>
  <div class="dot" style="bottom:140px;right:70px"></div><div class="dot" style="bottom:60px;right:70px"></div>
</div>
<div class="content">
  <div class="brand">\u6280\u672F\u6790\u91D1</div>
  <div class="divider"></div>
  <div class="subtitle">\u9EC4\u91D1 \u00B7 \u6BCF\u65E5\u6DF1\u5EA6\u5206\u6790\u62A5\u544A</div>
  <div class="keywords">\u5B9E\u65F6\u91D1\u4EF7 | \u6280\u672F\u9762\u89E3\u6790 | \u57FA\u672C\u9762\u7814\u5224 | \u5B9E\u7269\u6D88\u8D39\u6307\u5357</div>
  <div class="date">\ \u66F4\u65B0</div>
</div>
<div class="footer">\u6570\u636E\u6765\u6E90\uFF1A\u91D1\u5341\u6570\u636E | COMEX | \u4E0A\u6D77\u9EC4\u91D1\u4EA4\u6613\u6240</div>
</body></html>\;

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 900, height: 500 });
  await page.setContent(html, { waitUntil: "networkidle" });
  const outPath = path.resolve(__dirname, "cover.png");
  await page.screenshot({ path: outPath, type: "png" });
  console.log("Cover generated:", outPath);
  await browser.close();
})();
