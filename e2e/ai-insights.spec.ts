import { test, expect } from '@playwright/test';

test.describe('AI Insights (critical flow 4 - protected route)', () => {
  test('redirects to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/recommendations', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 10000 });
  });
});
