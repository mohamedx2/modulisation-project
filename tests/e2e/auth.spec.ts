import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('Signup flow UI navigation', async ({ page }) => {
    // 1. Visit signup page
    await page.goto('/signup');

    // Step 1: User Info
    await expect(page.getByText(/compte/i).first()).toBeVisible();
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('John'); // Prenom
    await textInputs.nth(1).fill('Doe');  // Nom
    await page.getByRole('button', { name: /Continuer/ }).click();

    // Step 2: Credentials
    await expect(page.getByText(/S.*curiser le compte/i)).toBeVisible();
    await page.locator('input[type="email"]').fill('john.doe@example.com');
    await page.locator('input[type="password"]').fill('password1234');
    await page.getByRole('button', { name: /Valider l'inscription/i }).click();

    // Step 3: Success
    await expect(page.getByRole('heading', { name: /Compte.*/i })).toBeVisible();
    await page.getByRole('button', { name: /connexion/i }).click();

    // Verify it navigated to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('Login flow UI', async ({ page }) => {
    await page.goto('/login');

    // Fill credentials
    await page.locator('input[type="text"]').fill('realuser');
    await page.locator('input[type="password"]').fill('Realpassword1!');

    // Submit
    const loginButton = page.getByRole('button', { name: /Se connecter/i });
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    // Log in should be successful, so we should land in /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

  });
});
