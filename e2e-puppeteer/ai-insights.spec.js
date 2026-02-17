const { strict: assert } = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function run(page) {
  await page.goto(`${BASE_URL}/recommendations`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => document.readyState === 'complete', { timeout: 5000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1000));
  const url = page.url();
  assert(url.includes('/auth/signin'), 'Should redirect to sign-in when not authenticated');
}

module.exports = { run };
