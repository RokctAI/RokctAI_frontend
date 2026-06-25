const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.route('**/*', route => {
    if (['image', 'stylesheet', 'font'].includes(route.request().resourceType())) {
      route.abort();
    } else {
      route.continue();
    }
  });

  const url = process.argv[2] || 'http://web.archive.org/web/20260405182426/https://www.getmerlin.in/';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  const data = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('wayback_all.html', data);
  console.log('Saved DOM to wayback_all.html');
  await browser.close();
})();
