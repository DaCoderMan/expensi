const { strict: assert } = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function run(page) {
  await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle0', timeout: 15000 });
  await page.waitForSelector('button', { timeout: 10000 });
  const body = await page.evaluate(() => document.body.innerText);
  assert(body.includes('Continue with Google'), 'Google button should be visible');
  assert(body.includes('Continue with GitHub'), 'GitHub button should be visible');
  assert(body.includes('Terms of Service'), 'Terms link should be visible');
  assert(body.includes('Privacy Policy'), 'Privacy link should be visible');
}

module.exports = { run };
