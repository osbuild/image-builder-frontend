import { test as base } from '@playwright/test';

import { login, storeStorageStateAndToken } from './helpers/login';

const setup = base;

setup.describe('Setup', () => {
  setup.describe.configure({ retries: 3 });

  setup('Authenticate', async ({ page }) => {
    await login(page);
    await storeStorageStateAndToken(page);
  });
});
