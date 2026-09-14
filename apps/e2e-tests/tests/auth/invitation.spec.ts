import { test, expect } from '@playwright/test';
import { getRecentEmailLinks } from '../helpers/mailpit';

test.describe('Invitation Flow', () => {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const adminEmail = `admin+${randomSuffix}@example.com`;
  const inviteeEmail = `invitee+${randomSuffix}@example.com`;
  const password = 'StrongPass123!';

  test('should invite a user and accept the invitation', async ({ page, context }) => {
    // 1. Register Admin
    await page.goto('/register');
    await page.click('button:has-text("Cadastrar com E-mail")');
    await page.fill('input[id="register-name"]', 'Admin User');
    await page.fill('input[id="register-company"]', 'Test Company');
    await page.fill('input[id="register-email"]', adminEmail);
    await page.fill('input[id="register-password"]', password);
    await page.click('button[type="submit"]:has-text("Criar conta")');
    // Wait for either the dashboard or onboarding
    await expect(page).toHaveURL(/.*\/onboarding|.*\/$/, { timeout: 15000 });
    
    // Complete onboarding
    await page.waitForURL(/.*\/onboarding/, { timeout: 3000 });
    await page.fill('input[id="onboarding-company"]', 'Test Workspace');
    await page.fill('input[id="onboarding-slug"]', `test-workspace-${randomSuffix}`);
    await page.click('button[type="submit"]:has-text("Concluir")');
    await expect(page).toHaveURL(/.*\/$/, { timeout: 15000 });

    // 2. Invite Member
    await page.goto('/settings/team');
    
    // Wait for the email input to be visible
    await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 });
    
    // Assuming there's a button "Convidar Membro"
    await page.fill('input[type="email"]', inviteeEmail);
    // Role selection
    await page.selectOption('select', 'admin');
    await page.click('button[type="submit"]:has-text("Enviar Convite")');
    await expect(page.locator('text="Convite enviado com sucesso!"')).toBeVisible({ timeout: 10000 });

    // 3. Check Mailpit for the link
    // Wait a bit for the email to arrive
    await page.waitForTimeout(2000);
    const links = await getRecentEmailLinks(inviteeEmail);
    expect(links.length).toBeGreaterThan(0);
    
    const inviteLink = links.find(l => l.includes('/invite?token='));
    expect(inviteLink).toBeTruthy();

    // 4. Accept Invitation (New session — not logged in)
    await context.clearCookies();
    await page.goto(inviteLink as string);
    
    // The invite page shows "Criar Conta" for non-logged-in users
    await expect(page.locator('text="Convite para Workspace"')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Criar Conta")');
    
    // Now on the register page with pre-filled email & callbackUrl
    await expect(page).toHaveURL(/.*\/register/, { timeout: 10000 });
    await page.click('button:has-text("Cadastrar com E-mail")');
    await page.fill('input[id="register-name"]', 'Invitee User');
    await page.fill('input[id="register-email"]', inviteeEmail);
    await page.fill('input[id="register-password"]', password);
    await page.click('button[type="submit"]:has-text("Criar conta")');

    // After registration, we should eventually land on the invite page or onboarding
    // The callbackUrl should redirect us back to the invite page
    await expect(page).toHaveURL(/.*\/invite\?token=|.*\/onboarding/, { timeout: 15000 });

    // If we ended up on onboarding, skip it (invitee doesn't need a workspace)
    const currentUrl = page.url();
    if (currentUrl.includes('/onboarding')) {
      // The invitee shouldn't need onboarding since they'll join via invite
      // Navigate directly to the invite link
      await page.goto(inviteLink as string);
    }

    // Now logged in — we should see the "Aceitar Convite" button
    await expect(page.locator('button:has-text("Aceitar Convite")')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Aceitar Convite")');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/$/, { timeout: 15000 });
    
    // Check if Tenant Switcher or header has "Test Workspace"
    await expect(page.locator('text="Test Workspace"')).toBeVisible({ timeout: 10000 });
  });
});
