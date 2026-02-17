const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriverPath = require('chromedriver').path;

const auth = require('./auth.spec.js');
const termsPrivacy = require('./terms-privacy.spec.js');
const pricing = require('./pricing.spec.js');
const aiInsights = require('./ai-insights.spec.js');

const specs = [
  { name: 'Auth', run: auth.run },
  { name: 'Terms & Privacy', run: termsPrivacy.run },
  { name: 'Pricing', run: pricing.run },
  { name: 'AI Insights redirect', run: aiInsights.run },
];

async function main() {
  const serviceBuilder = new chrome.ServiceBuilder(chromedriverPath);
  const options = new chrome.Options();
  if (process.env.CI) {
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');
  }
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeService(serviceBuilder)
    .setChromeOptions(options)
    .build();
  let failed = 0;
  try {
    for (const { name, run } of specs) {
      try {
        await run(driver);
        console.log(`  ✓ ${name}`);
      } catch (err) {
        console.error(`  ✗ ${name}:`, err.message);
        failed++;
      }
    }
  } finally {
    await driver.quit();
  }
  if (failed > 0) {
    process.exit(1);
  }
  console.log('All Selenium E2E tests passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
