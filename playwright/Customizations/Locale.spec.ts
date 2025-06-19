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

test('Create a blueprint with Locale customization', async ({
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

  await test.step('Select and fill the Locale step', async () => {
    await frame.getByRole('button', { name: 'Locale' }).click();
    await frame.getByPlaceholder('Select a language').fill('fy');
    await frame.getByRole('option', { name: 'fy_DE.UTF-' }).click();
    await expect(
      frame.getByRole('button', { name: 'Close fy_DE.UTF-' })
    ).toBeEnabled();
    await frame.getByRole('button', { name: 'Close fy_DE.UTF-' }).click();
    await expect(
      frame.getByRole('button', { name: 'Close fy_DE.UTF-' })
    ).toBeHidden();
    await frame.getByPlaceholder('Select a language').fill('fy');
    await frame.getByRole('option', { name: 'fy_DE.UTF-' }).click();
    await expect(
      frame.getByRole('button', { name: 'Close fy_DE.UTF-' })
    ).toBeEnabled();
    await frame.getByPlaceholder('Select a language').fill('aa');
    await frame.getByRole('option', { name: 'aa_DJ.UTF-' }).click();
    await expect(
      frame.getByRole('button', { name: 'Close aa_DJ.UTF-' })
    ).toBeEnabled();
    await frame.getByPlaceholder('Select a language').fill('aa');
    await expect(
      frame.getByText('aa_DJ.UTF-8Language already addedaa_ER.UTF-8aa_ET.UTF-')
    ).toBeAttached();
    await frame.getByPlaceholder('Select a language').fill('xxx');
    await expect(frame.getByText('No results found for')).toBeAttached();
    await frame.getByRole('button', { name: 'Menu toggle' }).nth(1).click();
    await frame.getByPlaceholder('Select a keyboard').fill('ami');
    await frame.getByRole('option', { name: 'amiga-de' }).click();
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
    await frame.getByLabel('Revisit Locale step').click();
    await expect(
      frame.getByRole('button', { name: 'Close fy_DE.UTF-' })
    ).toBeEnabled();
    await expect(
      frame.getByRole('button', { name: 'Close aa_DJ.UTF-' })
    ).toBeEnabled();
    await frame.getByPlaceholder('Select a language').fill('aa');
    await frame.getByRole('option', { name: 'aa_ER.UTF-' }).click();
    await expect(
      frame.getByRole('button', { name: 'Close aa_ER.UTF-' })
    ).toBeEnabled();
    await frame.getByRole('button', { name: 'Clear input' }).click();
    await frame.getByRole('button', { name: 'Menu toggle' }).nth(1).click();
    await frame.getByRole('option', { name: 'ANSI-dvorak' }).click();
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
    await page.getByRole('button', { name: 'Locale' }).click();
    await expect(
      frame.getByRole('button', { name: 'Close fy_DE.UTF-' })
    ).toBeEnabled();
    await expect(
      frame.getByRole('button', { name: 'Close aa_DJ.UTF-' })
    ).toBeEnabled();
    await expect(
      frame.getByRole('button', { name: 'Close aa_ER.UTF-' })
    ).toBeEnabled();
    await expect(frame.getByPlaceholder('Select a keyboard')).toHaveValue(
      'ANSI-dvorak'
    );
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
