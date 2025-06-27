import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { isHosted } from '../helpers/helpers';
import { ensureAuthenticated } from '../helpers/login';
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

test('Create a blueprint with Timezone customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await navigateToOptionalSteps(frame);
    await registerLater(frame);
  });

  await test.step('Select and fill the Timezone step', async () => {
    await frame.getByRole('button', { name: 'Timezone' }).click();
    await frame.getByPlaceholder('Select a timezone').fill('Canada');
    await frame.getByRole('option', { name: 'Canada/Saskatchewan' }).click();
    await frame.getByRole('button', { name: 'Clear input' }).first().click();
    await frame.getByPlaceholder('Select a timezone').fill('Europe');
    await frame.getByRole('option', { name: 'Europe/Stockholm' }).click();

    await frame.getByPlaceholder('Add NTP servers').fill('0.nl.pool.ntp.org');
    await frame.getByRole('button', { name: 'Add NTP server' }).click();
    await expect(frame.getByText('0.nl.pool.ntp.org')).toBeVisible();
    await frame.getByPlaceholder('Add NTP servers').fill('0.nl.pool.ntp.org');
    await frame.getByRole('button', { name: 'Add NTP server' }).click();
    await expect(frame.getByText('NTP server already exists.')).toBeVisible();
    await frame.getByPlaceholder('Add NTP servers').fill('xxxx');
    await frame.getByRole('button', { name: 'Add NTP server' }).click();
    await expect(frame.getByText('Invalid format.')).toBeVisible();
    await frame.getByPlaceholder('Add NTP servers').fill('0.cz.pool.ntp.org');
    await frame.getByRole('button', { name: 'Add NTP server' }).click();
    await expect(frame.getByText('0.cz.pool.ntp.org')).toBeVisible();
    await frame.getByPlaceholder('Add NTP servers').fill('0.de.pool.ntp.org');
    await frame.getByRole('button', { name: 'Add NTP server' }).click();
    await expect(frame.getByText('0.de.pool.ntp.org')).toBeVisible();
    await frame
      .getByRole('button', { name: 'Close 0.cz.pool.ntp.org' })
      .click();
    await expect(frame.getByText('0.cz.pool.ntp.org')).toBeHidden();
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
    await frame.getByLabel('Revisit Timezone step').click();
    await expect(frame.getByText('Canada/Saskatchewan')).toBeHidden();
    await expect(frame.getByPlaceholder('Select a timezone')).toHaveValue(
      'Europe/Stockholm'
    );
    await frame.getByPlaceholder('Select a timezone').fill('Europe');
    await frame.getByRole('option', { name: 'Europe/Oslo' }).click();
    await expect(frame.getByPlaceholder('Select a timezone')).toHaveValue(
      'Europe/Oslo'
    );
    await expect(frame.getByText('0.nl.pool.ntp.org')).toBeVisible();
    await expect(frame.getByText('0.de.pool.ntp.org')).toBeVisible();
    await expect(frame.getByText('0.cz.pool.ntp.org')).toBeHidden();
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
    await frame.getByRole('button', { name: 'Timezone' }).click();
    await expect(frame.getByPlaceholder('Select a timezone')).toHaveValue(
      'Europe/Oslo'
    );
    await expect(frame.getByText('0.nl.pool.ntp.org')).toBeVisible();
    await expect(frame.getByText('0.de.pool.ntp.org')).toBeVisible();
    await expect(frame.getByText('0.cz.pool.ntp.org')).toBeHidden();
    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
