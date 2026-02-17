const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('https://cppeurope.net', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.type('input[placeholder="Email"]', 'admin2026@cppeurope.net');
  await page.type('input[placeholder="Mot de passe"]', 'admin2026!');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {}),
    page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Se connecter'));
      if (btn) btn.click();
    })
  ]);
  await page.waitForSelector('.App__header', { timeout: 10000 });
  const header = await page.$('.App__header');
  const outPath = '/var/www/cppeurope/frontend/cypress/screenshots/header-snapshot.png';
  await header.screenshot({ path: outPath, padding: 10 });
  await browser.close();
  console.log('Screenshot saved to', outPath);
})().catch(err => { console.error(err); process.exit(1); });
