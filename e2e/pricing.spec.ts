import { test, expect } from '@playwright/test';

test.describe('Pricing page (critical flow 3)', () => {
  test('pricing page loads and shows plans', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Choose Your Plan/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Free/i).first()).toBeVisible();
    await expect(page.getByText(/PRO/i).first()).toBeVisible();
  });
});
