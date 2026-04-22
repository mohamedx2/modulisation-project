import { test, expect } from '@playwright/test';

test('has title and can navigate to login', async ({ page }) => {
  await page.goto('/');
  // Update regex to whatever the actual title is or will be
  await expect(page).toHaveTitle(/Create Next App/);
  
  // Example flow: click login, redirect to keycloak
  // await page.click('text=Login');
  // await expect(page.url()).toContain('keycloak');
});
