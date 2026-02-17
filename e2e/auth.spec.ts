import { test, expect } from '@playwright/test';

test.describe('Auth (critical flow 1)', () => {
  test('sign-in page loads and shows OAuth buttons', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Continue with GitHub/i })).toBeVisible();
  });

  test('terms and privacy links exist on sign-in page', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: /Terms of Service/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /Privacy Policy/i })).toBeVisible();
  });
});
