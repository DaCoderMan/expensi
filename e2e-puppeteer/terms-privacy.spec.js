const { strict: assert } = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function run(page) {
  await page.goto(`${BASE_URL}/terms`, { waitUntil: 'networkidle0', timeout: 15000 });
  const h1 = await page.waitForSelector('h1', { timeout: 10000 });
  const termsText = await page.evaluate((el) => el.textContent, h1);
  assert(termsText.includes('Terms of Service'), 'Terms heading should be visible');
  const body = await page.evaluate(() => document.body.innerText);
  assert(body.includes('not a professional device') || body.includes('not a professional'), 'Terms should show disclaimer');

  await page.goto(`${BASE_URL}/privacy`, { waitUntil: 'networkidle0', timeout: 15000 });
  const privacyH1 = await page.waitForSelector('h1', { timeout: 10000 });
  const privacyText = await page.evaluate((el) => el.textContent, privacyH1);
  assert(privacyText.includes('Privacy Policy'), 'Privacy heading should be visible');
}

module.exports = { run };
