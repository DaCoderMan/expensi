const { Builder, By, until } = require('selenium-webdriver');
const { strict: assert } = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function run(driver) {
  await driver.get(`${BASE_URL}/auth/signin`);
  await driver.sleep(500);
  await driver.get(`${BASE_URL}/pricing`);
  await driver.wait(until.elementLocated(By.tagName('body')), 10000);
  const body = await driver.findElement(By.tagName('body')).getText();
  assert(body.includes('Choose Your Plan'), 'Pricing should show Choose Your Plan');
  assert(body.includes('Free'), 'Pricing should show Free');
  assert(body.includes('PRO'), 'Pricing should show PRO');
}

module.exports = { run };
