import {
  defineConfig,
  devices,
  type ReporterDescription,
} from '@playwright/test';
import 'dotenv/config';

const reporters: ReporterDescription[] = [['html'], ['list']];

if (process.env.CURRENTS_PROJECT_ID && process.env.CURRENTS_RECORD_KEY) {
  reporters.push(['@currents/playwright']);
}

export default defineConfig({
  testDir: 'playwright',
  fullyParallel: true,
  workers: 4,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: reporters,
  globalTimeout: 29.5 * 60 * 1000, // 29.5m, Set because of codebuild, we want PW to timeout before CB to get the results.
  timeout: 3 * 60 * 1000, // 3m
  expect: { timeout: 30_000 }, // 30s
  use: {
    actionTimeout: 30_000, // 30s
    navigationTimeout: 30_000, // 30s
    headless: true,
    baseURL: process.env.BASE_URL
      ? process.env.BASE_URL
      : 'http://127.0.0.1:9090',
    video: 'retain-on-failure',
    trace: 'on-first-retry',

    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
