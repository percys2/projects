import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Should either show login or redirect to login
    await expect(page).toHaveURL(/login|\/$/);
  });

  test('should have working navigation links on login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check for register link if exists
    const registerLink = page.locator('a[href*="register"]');
    if (await registerLink.count() > 0) {
      await expect(registerLink).toBeVisible();
    }
  });
});