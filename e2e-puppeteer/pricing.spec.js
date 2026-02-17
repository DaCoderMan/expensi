const { strict: assert } = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function run(page) {
  await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 500));
  await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle0', timeout: 15000 });
  const body = await page.evaluate(() => document.body.innerText);
  assert(body.includes('Choose Your Plan'), 'Pricing should show Choose Your Plan');
  assert(body.includes('Free'), 'Pricing should show Free');
  assert(body.includes('PRO'), 'Pricing should show PRO');
}

module.exports = { run };
