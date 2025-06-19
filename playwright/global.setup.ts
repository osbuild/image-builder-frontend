import { test as setup } from '@playwright/test';

import { login, storeStorageStateAndToken } from './helpers/login';

setup.describe('Setup', () => {
  setup.describe.configure({ retries: 3 });

  setup('Authenticate', async ({ page }) => {
    await login(page);
    await storeStorageStateAndToken(page);
  });
});
