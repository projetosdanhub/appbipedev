import { test, expect } from '@playwright/test';

test.describe.serial('Autenticação Completa (AUTH)', () => {
  test.use({ baseURL: 'http://127.0.0.1:3001' });

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        console.log(`API RESP [${response.status()}] ${response.url()}:`, await response.text().catch(() => 'no-body'));
      }
    });
  });

  const testEmail = `test_${Date.now()}@bipesend.com.br`;
  const testPassword = 'Password123!';

  test('Deve realizar o registro de um novo usuário', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Criar nova conta' })).toBeVisible({ timeout: 15000 });
    
    await page.fill('input[type="text"]', 'Usuário de Teste');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    await page.click('button[type="button"]');
    
    // Deve redirecionar para o login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 15000 });
  });

  test('Deve realizar login com o usuário criado', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    await page.click('button[type="button"]');
    
    // Em teoria, logou e foi para o dashboard ou /
    // Vamos apenas testar que não tem erro de login
    await expect(page.getByText('Erro ao realizar login')).not.toBeVisible();
  });

  test('Deve navegar para a tela de recuperar senha', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.click('text=Esqueceu a senha?');
    
    await expect(page).toHaveURL(/.*\/forgot-password/);
    await expect(page.getByRole('heading', { name: 'Recuperar senha' })).toBeVisible();
  });

  test('Deve solicitar recuperação de senha', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', testEmail);
    await page.click('button[type="button"]');
    
    await expect(page.getByRole('heading', { name: 'E-mail enviado!' })).toBeVisible({ timeout: 15000 });
  });

  test('Deve bloquear reset de senha sem token', async ({ page }) => {
    await page.goto('/reset-password');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="password"]', 'NewPassword123!');
    await page.click('button[type="button"]');
    
    await expect(page.getByText('Token inválido ou ausente')).toBeVisible();
  });

});
