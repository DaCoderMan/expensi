import { test, expect } from '@playwright/test';

test.describe('Legal pages (critical flows 2 & 5 - public routes)', () => {
  test('Terms page loads and shows disclaimer', async ({ page }) => {
    await page.goto('/terms', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/terms/);
    await expect(page.getByRole('heading', { name: /Terms of Service/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/not a professional device/i).first()).toBeVisible();
  });

  test('Privacy page loads', async ({ page }) => {
    await page.goto('/privacy', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.getByRole('heading', { name: /Privacy Policy/i })).toBeVisible({ timeout: 10000 });
  });
});
