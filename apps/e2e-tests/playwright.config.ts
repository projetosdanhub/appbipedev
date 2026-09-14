import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm --dir ../../ run dev',
    url: 'http://127.0.0.1:3001',
    env: {
      RESEND_API_KEY: '', // Disable Resend during tests to use Mailpit
      NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3001',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});
