import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { test as base } from '@playwright/test';

const NYC_OUTPUT_DIR = path.join(process.cwd(), '.nyc_output');

export const test = base.extend({
  page: async ({ page }, runTest) => {
    await runTest(page);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coverage = await page.evaluate(() => (window as any).__coverage__);
    if (coverage) {
      fs.mkdirSync(NYC_OUTPUT_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(NYC_OUTPUT_DIR, `playwright-${crypto.randomUUID()}.json`),
        JSON.stringify(coverage),
      );
    }
  },
});
