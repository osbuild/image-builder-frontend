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

if (process.env.CI) {
  reporters.push(['json', { outputFile: 'test-results.json' }]);
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
    // Specs assert on rendered dates. Without this the browser follows the
    // host clock, so a date the wizard stores as UTC midnight renders as the
    // previous day anywhere west of Greenwich - passing in CI and failing on
    // a developer's machine.
    timezoneId: 'UTC',
    baseURL: process.env.BASE_URL
      ? process.env.BASE_URL
      : 'http://127.0.0.1:9090',
    video: 'retain-on-failure',
    // 'on' kept a trace for every passing test too, which is hundreds of
    // megabytes of artifacts nobody opens. 'on-first-retry' would record
    // nothing locally, where retries are 0, so match the video setting and
    // keep a trace whenever there is a failure to look at.
    trace: 'retain-on-failure',

    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'Setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'UI tests',
      // The slowest attempt observed is under 3m. This is only a ceiling on
      // how long a hung test can burn before it is killed, and at 29.5m one
      // could take a third of globalTimeout with it.
      timeout: 5 * 60 * 1000, // 5m
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
    },
  ],
});
