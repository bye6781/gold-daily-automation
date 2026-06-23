const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const html = fs.readFileSync(path.resolve(__dirname, 'cover.html'), 'utf-8');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 900, height: 500 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const outPath = path.resolve(__dirname, 'cover.png');
  await page.screenshot({ path: outPath, type: 'png' });
  console.log('Cover:', outPath);
  await browser.close();
})();