const { Builder, By, until } = require('selenium-webdriver');
const { strict: assert } = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function run(driver) {
  await driver.get(`${BASE_URL}/auth/signin`);
  await driver.wait(until.elementLocated(By.css('button')), 10000);
  const googleBtn = await driver.findElement(By.xpath("//button[contains(., 'Continue with Google')]"));
  const githubBtn = await driver.findElement(By.xpath("//button[contains(., 'Continue with GitHub')]"));
  assert(await googleBtn.isDisplayed(), 'Google button should be visible');
  assert(await githubBtn.isDisplayed(), 'GitHub button should be visible');

  const termsLink = await driver.findElement(By.linkText('Terms of Service'));
  const privacyLink = await driver.findElement(By.linkText('Privacy Policy'));
  assert(await termsLink.isDisplayed(), 'Terms link should be visible');
  assert(await privacyLink.isDisplayed(), 'Privacy link should be visible');
}

module.exports = { run };
