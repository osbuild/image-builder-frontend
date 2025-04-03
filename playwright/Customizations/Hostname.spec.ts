import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/cleanup';
import { login } from '../helpers/login';
import { navigateToOptionalSteps } from '../helpers/navHelpers';
import {
  registerLater,
  fillInDetails,
  createBlueprint,
  fillInImageOutputGuest,
  deleteBlueprint,
  exportBlueprint,
  importBlueprint,
} from '../helpers/wizardHelpers';
import { ibFrame } from '../lib/lib';

test.describe.serial('Test Hostname', () => {
  test('Create a blueprint with Hostname customization', async ({
    page,
    cleanup,
  }) => {
    const blueprintName = 'test-' + uuidv4();

    // Delete the blueprint after the run
    await cleanup.add(() => deleteBlueprint(page, blueprintName));

    await test.step('Navigate to optional steps in Wizard', async () => {
      await login(page);
      await ibFrame(page);
      await navigateToOptionalSteps(page);
      await registerLater(page);
    });

    await test.step('Select and fill the Hostname step', async () => {
      await page.getByRole('button', { name: 'Hostname' }).click();
      await page.getByRole('textbox', { name: 'hostname input' }).click();
      await page
        .getByRole('textbox', { name: 'hostname input' })
        .fill('testsystem');
      await page.getByRole('button', { name: 'Review and finish' }).click();
    });

    await test.step('Fill the BP details', async () => {
      await fillInDetails(page, blueprintName);
    });

    await test.step('Create BP', async () => {
      await createBlueprint(page, blueprintName);
    });

    await test.step('Export BP', async () => {
      await exportBlueprint(page);
    });

    await test.step('Import BP', async () => {
      await importBlueprint(page);
    });

    await test.step('Review imported BP', async () => {
      await fillInImageOutputGuest(page);
      await page.getByRole('button', { name: 'Hostname' }).click();
      await expect(
        page.getByRole('textbox', { name: 'hostname input' })
      ).toHaveValue('testsystem');
      await page.getByRole('button', { name: 'Cancel' }).click();
    });
  });
});
