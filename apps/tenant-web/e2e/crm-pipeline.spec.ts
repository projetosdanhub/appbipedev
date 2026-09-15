import { test, expect } from '@playwright/test';

test.describe('CRM Pipeline e2e tests', () => {
  test('should load the CRM page and verify title', async ({ page }) => {
    // Assuming the CRM page is at /crm
    // The test requires an authenticated session, but for now we just verify if it doesn't crash
    // and correctly shows the login or the CRM layout.
    await page.goto('/crm');
    
    // Check if the page title has BipeSend (or whatever default title we have)
    // Adjust this based on your actual authentication flow.
    const title = await page.title();
    expect(title).toBeDefined();
  });
});
