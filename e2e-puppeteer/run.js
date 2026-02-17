const puppeteer = require('puppeteer');

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
  const browser = await puppeteer.launch({
    headless: process.env.CI ? true : 'new',
    args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(15000);
  let failed = 0;
  try {
    for (const { name, run } of specs) {
      try {
        await run(page);
        console.log(`  ✓ ${name}`);
      } catch (err) {
        console.error(`  ✗ ${name}:`, err.message);
        failed++;
      }
    }
  } finally {
    await browser.close();
  }
  if (failed > 0) {
    process.exit(1);
  }
  console.log('All Puppeteer E2E tests passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
