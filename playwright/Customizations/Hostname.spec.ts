import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/cleanup';
import { isHosted } from '../helpers/helpers';
import { login } from '../helpers/login';
import { navigateToOptionalSteps, ibFrame } from '../helpers/navHelpers';
import {
  registerLater,
  fillInDetails,
  createBlueprint,
  fillInImageOutputGuest,
  deleteBlueprint,
  exportBlueprint,
  importBlueprint,
} from '../helpers/wizardHelpers';

test('Create a blueprint with Hostname customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();
  const hostname = 'testsystem';

  // Delete the blueprint after the run fixture
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  // Login, navigate to IB and get the frame
  await login(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await navigateToOptionalSteps(frame);
    await registerLater(frame);
  });

  await test.step('Select and fill the Hostname step', async () => {
    await frame.getByRole('button', { name: 'Hostname' }).click();
    await frame.getByRole('textbox', { name: 'hostname input' }).fill(hostname);
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByLabel('Revisit Hostname step').click();
    await frame.getByRole('textbox', { name: 'hostname input' }).click();
    await frame
      .getByRole('textbox', { name: 'hostname input' })
      .fill(hostname + 'edited');
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  // This is for hosted service only as these features are not available in cockpit plugin
  await test.step('Export BP', async (step) => {
    step.skip(!isHosted(), 'Exporting is not available in the plugin');
    await exportBlueprint(page, blueprintName);
  });

  await test.step('Import BP', async (step) => {
    step.skip(!isHosted(), 'Importing is not available in the plugin');
    await importBlueprint(page, blueprintName);
  });

  await test.step('Review imported BP', async (step) => {
    step.skip(!isHosted(), 'Importing is not available in the plugin');
    await fillInImageOutputGuest(page);
    await page.getByRole('button', { name: 'Hostname' }).click();
    await expect(
      page.getByRole('textbox', { name: 'hostname input' })
    ).toHaveValue(hostname + 'edited');
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
