import { test, expect } from '@playwright/test';

test.describe('Pricing page (critical flow 3)', () => {
  test('pricing page loads and shows plans', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Choose Your Plan/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Free/i).first()).toBeVisible();
    await expect(page.getByText(/PRO/i).first()).toBeVisible();
  });

  test('shows Sandbox badge and Buy Now form points to sandbox when NEXT_PUBLIC_PAYPAL_PAYMENT_URL is sandbox', async ({
    page,
  }) => {
    test.skip(
      !process.env.NEXT_PUBLIC_PAYPAL_PAYMENT_URL?.includes('sandbox.paypal.com'),
      'NEXT_PUBLIC_PAYPAL_PAYMENT_URL must point to sandbox'
    );
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Choose Your Plan/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Sandbox — no real charges/i)).toBeVisible({ timeout: 5000 });
    const form = page.locator('form[action*="paypal"]').first();
    await expect(form).toHaveAttribute('action', /sandbox\.paypal\.com/);
  });
});
