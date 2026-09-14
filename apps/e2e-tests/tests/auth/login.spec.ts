import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const email = `test.login+${randomSuffix}@example.com`;
  const password = 'StrongPass123!';

  test.beforeAll(async ({ request }) => {
    // We register the user first using the API or directly if possible.
    // For simplicity, we just register them via the UI in a quick test or assume we do it here.
    // Actually, Playwright beforeAll doesn't have `page`. We can just run it in a before hook.
  });

  test('should login with valid credentials', async ({ page }) => {
    // Register first
    await page.goto('/register');
    await page.click('button:has-text("Cadastrar com E-mail")');
    await page.fill('input[id="register-name"]', 'Login User');
    await page.fill('input[id="register-email"]', email);
    await page.fill('input[id="register-password"]', password);
    await page.click('button[type="submit"]:has-text("Criar conta")');
    await expect(page).toHaveURL(/.*\/onboarding|.*\/$/, { timeout: 15000 });
    
    // Logout (since register auto-logs in)
    // We can clear cookies
    await page.context().clearCookies();

    // Login
    await page.goto('/login');
    await page.click('button:has-text("Logar com E-mail e Senha")');
    await page.fill('input[id="login-email"]', email);
    await page.fill('input[id="login-password"]', password);
    await page.click('button[type="submit"]:has-text("Entrar")');

    await expect(page).toHaveURL(/.*\/onboarding|.*\/$/, { timeout: 15000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Logar com E-mail e Senha")');
    await page.fill('input[id="login-email"]', 'nonexistent@example.com');
    await page.fill('input[id="login-password"]', 'WrongPass!');
    await page.click('button[type="submit"]:has-text("Entrar")');

    await expect(page.locator('.text-red-600').first()).toBeVisible({ timeout: 10000 });
  });
});
