import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import 'dotenv/config';

const reporters: ReporterDescription[] = [
  ['html'],
  ['list'],
];

if (process.env.CURRENTS_PROJECT_ID && process.env.CURRENTS_RECORD_KEY) {
  reporters.push(['@currents/playwright']);
}

export default defineConfig({
  testDir: 'playwright',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: reporters,
  use: {
    headless: true,
    baseURL: process.env.BASE_URL ? process.env.BASE_URL : 'http://127.0.0.1:9090',
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
