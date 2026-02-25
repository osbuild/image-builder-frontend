import {
  defineConfig,
  devices,
  type ReporterDescription,
} from '@playwright/test';
import 'dotenv/config';

const reporters: ReporterDescription[] = [['html']];

if (!process.env.CI) {
  reporters.push(['list']);
}

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
  globalTimeout: 89.5 * 60 * 1000, // 1h29.5m, Set because of codebuild, we want PW to timeout before CB to get the results.
  timeout: 3 * 60 * 1000, // 3m
  expect: { timeout: 50_000 }, // 50s
  use: {
    actionTimeout: 30_000, // 30s
    navigationTimeout: 30_000, // 30s
    headless: true,
    baseURL: process.env.BASE_URL
      ? process.env.BASE_URL
      : 'http://127.0.0.1:9090',
    video: 'retain-on-failure',
    trace: 'on',

    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'Setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'UI tests',
      timeout: 29.5 * 60 * 1000, // 29.5m
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['Setup'],
    },
    {
      name: 'Boot tests',
      testMatch: /.*\.boot\.ts/, 
      // Retry 2 times because it's still cheaper than
      // rerunning the whole job
      retries: process.env.CI ? 2 : 0,
      timeout: 89.5 * 60 * 1000, // 1h29.5m
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['Setup'],
    }
  ],
});
