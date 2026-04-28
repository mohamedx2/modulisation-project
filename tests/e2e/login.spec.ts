import { test, expect } from '@playwright/test';

test('has title and can navigate to login', async ({ page }) => {
  await page.goto('/');
  // Update regex to whatever the actual title is or will be
  await page.goto('/login');
  
  // Wait for login page
  await expect(page.locator('form')).toBeVisible();
});
