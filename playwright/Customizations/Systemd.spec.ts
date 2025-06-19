import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { isHosted } from '../helpers/helpers';
import {
  navigateToOptionalSteps,
  ibFrame,
  navigateToLandingPage,
} from '../helpers/navHelpers';
import {
  registerLater,
  fillInDetails,
  createBlueprint,
  fillInImageOutputGuest,
  deleteBlueprint,
  exportBlueprint,
  importBlueprint,
} from '../helpers/wizardHelpers';

test('Create a blueprint with Systemd customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await navigateToOptionalSteps(frame);
    await registerLater(frame);
  });

  await test.step('Select and correctly fill all of the service fields', async () => {
    await frame.getByRole('button', { name: 'Systemd services' }).click();

    await frame
      .getByPlaceholder('Add disabled service')
      .fill('systemd-dis.service');
    await frame.getByRole('button', { name: 'Add disabled service' }).click();
    await expect(frame.getByText('systemd-dis.service')).toBeVisible();

    await frame
      .getByPlaceholder('Add enabled service')
      .fill('systemd-en.service');
    await frame.getByRole('button', { name: 'Add enabled service' }).click();
    await expect(frame.getByText('systemd-en.service')).toBeVisible();

    await frame
      .getByPlaceholder('Add masked service')
      .fill('systemd-m.service');
    await frame.getByRole('button', { name: 'Add masked service' }).click();
    await expect(frame.getByText('systemd-m.service')).toBeVisible();
  });

  await test.step('Select and incorrectly fill all of the service fields', async () => {
    await frame.getByPlaceholder('Add disabled service').fill('&&');
    await frame.getByRole('button', { name: 'Add disabled service' }).click();
    await expect(frame.getByText('Invalid format.').nth(0)).toBeVisible();

    await frame.getByPlaceholder('Add enabled service').fill('áá');
    await frame.getByRole('button', { name: 'Add enabled service' }).click();
    await expect(frame.getByText('Invalid format.').nth(1)).toBeVisible();

    await frame.getByPlaceholder('Add masked service').fill('78');
    await frame.getByRole('button', { name: 'Add masked service' }).click();
    await expect(frame.getByText('Invalid format.').nth(2)).toBeVisible();
  });

  await test.step('Fill the BP details', async () => {
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByLabel('Revisit Systemd services step').click();

    await frame
      .getByPlaceholder('Add disabled service')
      .fill('disabled-service');
    await frame.getByRole('button', { name: 'Add disabled service' }).click();
    await frame.getByPlaceholder('Add enabled service').fill('enabled-service');
    await frame.getByRole('button', { name: 'Add enabled service' }).click();
    await frame.getByPlaceholder('Add masked service').fill('masked-service');
    await frame.getByRole('button', { name: 'Add masked service' }).click();

    await frame
      .getByRole('button', { name: 'Close systemd-m.service' })
      .click();
    await frame
      .getByRole('button', { name: 'Close systemd-en.service' })
      .click();
    await frame
      .getByRole('button', { name: 'Close systemd-dis.service' })
      .click();

    await expect(frame.getByText('enabled-service')).toBeVisible();
    await expect(frame.getByText('disabled-service')).toBeVisible();
    await expect(frame.getByText('masked-service')).toBeVisible();

    await expect(frame.getByText('systemd-en.service')).toBeHidden();
    await expect(frame.getByText('systemd-dis.service')).toBeHidden();
    await expect(frame.getByText('systemd-m.service')).toBeHidden();

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
    await page.getByRole('button', { name: 'Systemd services' }).click();

    await expect(frame.getByText('enabled-service')).toBeVisible();
    await expect(frame.getByText('disabled-service')).toBeVisible();
    await expect(frame.getByText('masked-service')).toBeVisible();

    await expect(frame.getByText('systemd-en.service')).toBeHidden();
    await expect(frame.getByText('systemd-dis.service')).toBeHidden();
    await expect(frame.getByText('systemd-m.service')).toBeHidden();

    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
