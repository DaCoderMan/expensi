const { Builder, until } = require('selenium-webdriver');
const { strict: assert } = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function run(driver) {
  await driver.get(`${BASE_URL}/recommendations`);
  await driver.wait(until.urlContains('/auth/signin'), 10000);
  const url = await driver.getCurrentUrl();
  assert(url.includes('/auth/signin'), 'Should redirect to sign-in when not authenticated');
}

module.exports = { run };
