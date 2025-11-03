import { chromium } from 'playwright';

const url = process.argv[2] || 'https://cpl-pstu-webapp.vercel.app/';

export async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', err => {
    consoleMessages.push({ type: 'pageerror', text: err.message, stack: err.stack });
  });

  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('HTTP status:', resp.status());
    // wait a little for any runtime errors
    await page.waitForTimeout(3000);
  } catch (e) {
    console.error('Navigation/timeout error:', e.message);
  }

  if (consoleMessages.length === 0) console.log('No console messages captured');
  else console.log('Console messages:');
  consoleMessages.forEach((m) => console.log(m.type, '-', m.text, m.stack ? '\n' + m.stack : ''));

  await browser.close();
}

run();