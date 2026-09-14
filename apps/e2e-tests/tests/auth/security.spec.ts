import { test, expect } from '@playwright/test';
import { prisma } from '@bipesend/db';
import { authenticator } from 'otplib';

test.describe.serial('Security & MFA Flow', () => {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const email = `test.security+${randomSuffix}@example.com`;
  const password = 'StrongPassword123!';
  let userId: string;

  test.beforeAll(async () => {
    // Note: in a real environment we might clean up the DB before running.
  });

  test('Deve bloquear o login quando MFA é exigido e verificar fluxo OTP', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    // 1. Cadastrar usuário
    await page.goto('/register');
    await page.waitForLoadState("networkidle");
    await page.click('button:has-text("Cadastrar com E-mail")');
    await page.fill('input[id="register-name"]', 'Security User');
    await page.fill('input[id="register-company"]', 'Security Company');
    await page.fill('input[id="register-email"]', email);
    await page.fill('input[id="register-password"]', password);
    await page.click('button[type="submit"]:has-text("Criar conta")');
    await expect(page.locator('text="Criando ambiente..."').or(page.locator('text="Bem-vindo!"'))).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*\/onboarding|.*\/$/, { timeout: 15000 });
    
    // 2. Fetch user ID from DB and enable MFA
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");
    userId = user.id;

    const secret = authenticator.generateSecret();
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      }
    });

    // 3. Logout clearing cookies (simulate session expiry / logout)
    await page.context().clearCookies();

    // 4. Try to login
    await page.goto('/login');
    await page.waitForLoadState("networkidle");
    await page.click('button:has-text("Logar com E-mail e Senha")');
    await page.fill('input[id="login-email"]', email);
    await page.fill('input[id="login-password"]', password);
    await page.click('button[type="submit"]:has-text("Entrar")');

    // 5. Expect 2FA screen
    await expect(page.getByText('Verificação em Duas Etapas').or(page.getByText('Verificação em 2 Passos'))).toBeVisible({ timeout: 10000 });

    // 6. Provide wrong code
    await page.fill('input[id="login-code"]', '000000');
    await page.click('button[type="submit"]:has-text("Verificar código")');
    // Em nosso código, ao errar o 2FA, a mensagem é genérica ou específica.
    await expect(page.locator('text="Confira os dados"').or(page.locator('text="Código 2FA inválido."')).first()).toBeVisible({ timeout: 10000 });

    // 7. Provide right code
    const validCode = authenticator.generate(secret);
    await page.fill('input[id="login-code"]', validCode);
    await page.click('button[type="submit"]:has-text("Verificar código")');
    
    // 8. Expect to login
    await expect(page).toHaveURL(/.*\/onboarding|.*\/$/, { timeout: 15000 });
  });

  test('Deve rejeitar requisições de uma sessão revogada (física)', async ({ page }) => {
    // 1. Fetch user ID and secret from DB
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.twoFactorSecret) throw new Error("User not found or MFA not enabled");

    // 2. Login to get a fresh session
    await page.goto('/login');
    await page.waitForLoadState("networkidle");
    await page.click('button:has-text("Logar com E-mail e Senha")');
    await page.fill('input[id="login-email"]', email);
    await page.fill('input[id="login-password"]', password);
    await page.click('button[type="submit"]:has-text("Entrar")');

    // MFA step
    await expect(page.getByText('Verificação em Duas Etapas').or(page.getByText('Verificação em 2 Passos'))).toBeVisible({ timeout: 10000 });
    const validCode = authenticator.generate(user.twoFactorSecret);
    await page.fill('input[id="login-code"]', validCode);
    await page.click('button[type="submit"]:has-text("Verificar código")');
    await expect(page).toHaveURL(/.*\/onboarding|.*\/$/, { timeout: 15000 });

    // The user is logged in, and we can verify they are on a protected route (e.g. /onboarding)
    await expect(page).toHaveURL(/.*\/onboarding|.*\/$/);


    // Revoke all sessions from DB for this user
    const sessions = await prisma.session.findMany({ where: { userId: user.id } });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    
    // Clear Redis cache if it exists, since NextAuth will cache the valid session
    if (process.env.REDIS_URL) {
      const Redis = (await import('ioredis')).default;
      const redis = new Redis(process.env.REDIS_URL);
      for (const s of sessions) {
        await redis.del(`auth-session:tenant:${s.id}`);
        await redis.del(`auth-session:platform:${s.id}`);
      }
      redis.disconnect();
    }
    
    // Attempt to navigate to another protected route
    await page.goto('/');
    
    // NextAuth middleware / session check should redirect to /login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Deve barrar tentativa de CSRF em Server Actions/API sem Token ou Origem', async ({ request }) => {
    // Tentar fazer um POST direto para a API ou action sem CSRF token e fora da origem correta.
    // O Next.js com Next-Auth e Server Actions bloqueia requests POST cross-origin ou sem tokens CSRF.
    const response = await request.post('/api/auth/callback/credentials', {
      data: {
        email: email,
        password: password
      },
      headers: {
        'Origin': 'http://malicious-site.com',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // CSRF/CORS deve rejeitar com 403 ou similar, não 200 OK.
    // NextAuth usually redirects or throws an error for CSRF.
    const url = response.url();
    // It should either fail or redirect to a page with an error. 
    // Status can be 403, 500, or a redirect (3xx) to /login?error=Configuration.
    // So let's check if we get a cookie or are blocked.
    const headers = response.headers();
    const setCookie = headers['set-cookie'] || '';
    expect(setCookie).not.toContain('authjs.session-token');
  });
});
