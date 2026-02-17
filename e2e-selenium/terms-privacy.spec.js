const { Builder, By, until } = require('selenium-webdriver');
const { strict: assert } = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function run(driver) {
  await driver.get(`${BASE_URL}/terms`);
  await driver.wait(until.elementLocated(By.tagName('h1')), 10000);
  const heading = await driver.findElement(By.xpath("//h1[contains(., 'Terms of Service')]"));
  assert(await heading.isDisplayed(), 'Terms heading should be visible');
  const body = await driver.findElement(By.tagName('body')).getText();
  assert(body.includes('not a professional device') || body.includes('not a professional'), 'Terms should show disclaimer');

  await driver.get(`${BASE_URL}/privacy`);
  await driver.wait(until.elementLocated(By.tagName('h1')), 10000);
  const privacyHeading = await driver.findElement(By.xpath("//h1[contains(., 'Privacy Policy')]"));
  assert(await privacyHeading.isDisplayed(), 'Privacy heading should be visible');
}

module.exports = { run };
