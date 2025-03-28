import { test } from '@playwright/test';

import {
  login,
  ibFrame,
  navigateToOptionalSteps,
  createBlueprint,
} from '../lib/lib';

test.describe.serial('Test Hostname', () => {
  test('Create a blueprint with Hostname customization', async ({ page }) => {
    await test.step('Navigate to optional steps in Wizard', async () => {
      await login(page);
      await ibFrame(page);
      await navigateToOptionalSteps(page);
    });

    await test.step('Select and fill the Hostname step', async () => {
      await page.getByRole('button', { name: 'Hostname' }).click();
      await page.getByRole('textbox', { name: 'hostname input' }).click();
      await page
        .getByRole('textbox', { name: 'hostname input' })
        .fill('testsystem');
      await page.getByRole('button', { name: 'Review and finish' }).click();
    });

    await test.step('Review and create BP', async () => {
      await createBlueprint(page);
    });
  });
});
