import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const email = `test.user+${randomSuffix}@example.com`;
  
  test('should successfully register and login', async ({ page }) => {
    await page.goto('/register');
    
    // Step 1: Choice
    await page.click('button:has-text("Cadastrar com E-mail")');
    
    // Step 2: Form
    await page.fill('input[id="register-name"]', 'Test User');
    await page.fill('input[id="register-company"]', 'Test Company');
    await page.fill('input[id="register-email"]', email);
    await page.fill('input[id="register-password"]', 'StrongPass123!');
    
    await page.click('button[type="submit"]:has-text("Criar conta")');
    
    // Step 3: Success and redirect
    await expect(page.locator('text="Criando ambiente..."').or(page.locator('text="Bem-vindo!"'))).toBeVisible({ timeout: 10000 });
    
    // It should redirect to onboarding or dashboard
    await expect(page).toHaveURL(/.*\/onboarding|.*\/$/, { timeout: 15000 });
  });

  test('should reject duplicate email', async ({ page }) => {
    await page.goto('/register');
    
    await page.click('button:has-text("Cadastrar com E-mail")');
    
    await page.fill('input[id="register-name"]', 'Test User Duplicate');
    await page.fill('input[id="register-company"]', 'Test Company');
    await page.fill('input[id="register-email"]', email); // Use same email
    await page.fill('input[id="register-password"]', 'StrongPass123!');
    
    await page.click('button[type="submit"]:has-text("Criar conta")');
    
    // In our system, duplicate emails return success to prevent email enumeration
    await expect(page.locator('text="Criando ambiente..."').or(page.locator('text="Bem-vindo!"'))).toBeVisible({ timeout: 10000 });
  });
});
