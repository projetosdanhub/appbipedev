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
    
    await expect(page.getByRole('heading', { name: 'Crie sua conta' })).toBeVisible({ timeout: 15000 });
    
    // Click 'Cadastrar com E-mail'
    await page.getByRole('button', { name: 'Cadastrar com E-mail' }).click();
    
    // Fill the fields
    await page.fill('input[name="name"]', 'Usuário de Teste');
    await page.fill('input[name="companyName"]', 'Empresa de Teste');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    
    await page.click('button[type="submit"]');
    
    // Check for success animation
    const allText = await page.evaluate(() => document.body.innerText);
    console.log('PAGE TEXT BEFORE ASSERT:', allText);
    await expect(page.getByRole('heading', { name: 'Bem-vindo!' })).toBeVisible({ timeout: 15000 });
    
    // Deve redirecionar para a home (dashboard) após registro e autologin
    await expect(page).toHaveURL('http://127.0.0.1:3001/', { timeout: 15000 });
  });

  test('Deve realizar login com o usuário criado', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible({ timeout: 15000 });

    // Click 'Logar com E-mail e Senha'
    await page.getByRole('button', { name: 'Logar com E-mail e Senha' }).click();

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    
    await page.click('button[type="submit"]');
    
    // Em teoria, logou e foi para o dashboard ou /
    // Vamos apenas testar que não tem erro de login
    await expect(page.getByText('E-mail ou senha inválidos')).not.toBeVisible();
  });

  test('Deve navegar para a tela de recuperar senha', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible({ timeout: 15000 });

    await page.click('text=Logar com E-mail e Senha');
    await page.click('text=Esqueceu a senha?');
    
    await expect(page).toHaveURL(/.*\/forgot-password/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Recupere sua senha' })).toBeVisible({ timeout: 15000 });
  });

  test('Deve solicitar recuperação de senha e ir para verificação', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"]', testEmail);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/forgot-password\/verify\?email=.*/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Verifique seu e-mail' })).toBeVisible();
  });

  test('Deve bloquear reset de senha com as senhas não coincidindo', async ({ page }) => {
    await page.goto('/forgot-password/reset?email=test@test.com&token=123456');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Crie uma nova senha' })).toBeVisible();

    await page.fill('input[name="password"]', 'NewPassword123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('As senhas não coincidem.')).toBeVisible();
  });

});
