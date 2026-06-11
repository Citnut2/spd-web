import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['**/*.e2e.ts'],
  timeout: 120000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:5174',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    port: 5174,
    reuseExistingServer: !process.env.CI,
    timeout: 15000
  }
});
