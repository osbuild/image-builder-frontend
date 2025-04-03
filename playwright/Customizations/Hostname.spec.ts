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
import { ibFrame, isHosted } from '../lib/lib';

test.describe.serial('Test Hostname', () => {
  test('Create a blueprint with Hostname customization', async ({
    page,
    cleanup,
  }) => {
    const blueprintName = 'test-' + uuidv4();

    // Delete the blueprint after the run
    await cleanup.add(() => deleteBlueprint(page, blueprintName));

    await login(page);
    const frame = await ibFrame(page);

    await test.step('Navigate to optional steps in Wizard', async () => {
      await navigateToOptionalSteps(frame);
      if (isHosted()) {
        await registerLater(frame);
      }
    });

    await test.step('Select and fill the Hostname step', async () => {
      if (isHosted()) {
        await frame.getByRole('button', { name: 'Hostname' }).click();
      } else {
        await frame
          .getByRole('listitem')
          .filter({ hasText: /^Hostname$/ })
          .click();
      }
      await frame.getByRole('textbox', { name: 'hostname input' }).click();
      await frame
        .getByRole('textbox', { name: 'hostname input' })
        .fill('testsystem');
      await frame.getByRole('button', { name: 'Review and finish' }).click();
    });

    await test.step('Fill the BP details', async () => {
      await fillInDetails(frame, blueprintName);
    });

    await test.step('Create BP', async () => {
      await createBlueprint(frame, blueprintName);
    });

    if (isHosted()) {
      await test.step('Export BP', async () => {
        await exportBlueprint(frame);
      });

      await test.step('Import BP', async () => {
        await importBlueprint(frame);
      });

      await test.step('Review imported BP', async () => {
        await fillInImageOutputGuest(frame);
        await frame.getByRole('button', { name: 'Hostname' }).click();
        await expect(
          frame.getByRole('textbox', { name: 'hostname input' })
        ).toHaveValue('testsystem');
        await frame.getByRole('button', { name: 'Cancel' }).click();
      });
    }
  });
});
