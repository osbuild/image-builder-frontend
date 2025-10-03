import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { isHosted } from '../helpers/helpers';
import { ensureAuthenticated } from '../helpers/login';
import {
  fillInImageOutput,
  ibFrame,
  navigateToLandingPage,
} from '../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  exportBlueprint,
  fillInDetails,
  fillInImageOutputGuest,
  importBlueprint,
  registerLater,
} from '../helpers/wizardHelpers';

test('Create a blueprint with Locale customization', async ({
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
    await fillInImageOutput(frame);
    await registerLater(frame);
  });

  await test.step('Select and fill the Locale step', async () => {
    const localeButton = frame.getByRole('button', { name: 'Locale' });
    await expect(localeButton).toBeVisible();
    await localeButton.click();

    const languageInput = frame.getByPlaceholder('Select a language');
    const westernFrisianName = 'Western Frisian - Germany (fy_DE.UTF-8)';
    const westernFrisian = frame.getByRole('option', {
      name: westernFrisianName,
    });
    const closeWesternFrisianBtn = frame.getByRole('button', {
      name: `Close ${westernFrisianName}`,
    });

    await expect(languageInput).toBeVisible();
    await languageInput.fill('fy');

    await expect(westernFrisian).toBeVisible();
    await westernFrisian.click();

    await expect(closeWesternFrisianBtn).toBeEnabled();

    await closeWesternFrisianBtn.click();
    await expect(closeWesternFrisianBtn).toBeHidden();

    await expect(languageInput).toBeVisible();
    await languageInput.fill('fy');

    await expect(westernFrisian).toBeVisible();
    await westernFrisian.click();

    await expect(closeWesternFrisianBtn).toBeEnabled();

    await expect(languageInput).toBeVisible();
    await languageInput.fill('aa');

    const aaDjiboutiName = 'aa - Djibouti (aa_DJ.UTF-8)';
    const aaDjibouti = frame.getByRole('option', {
      name: aaDjiboutiName,
    });
    const closeAaDjiboutiBtn = frame.getByRole('button', {
      name: `Close ${aaDjiboutiName}`,
    });

    await expect(aaDjibouti).toBeVisible();
    await aaDjibouti.click();

    await expect(closeAaDjiboutiBtn).toBeEnabled();

    await expect(languageInput).toBeVisible();
    await languageInput.fill('aa');

    const expectedLanguageListText =
      'aa - Djibouti (aa_DJ.UTF-8)Language already addedaa - Eritrea (aa_ER.UTF-8)aa - Ethiopia (aa_ET.UTF-8)';
    await expect(
      frame.getByText(expectedLanguageListText, { exact: false }),
    ).toBeVisible();

    await expect(languageInput).toBeVisible();
    await languageInput.fill('xxx');
    await expect(
      frame.getByText('No results found for', { exact: false }),
    ).toBeVisible();

    const menuToggleButton = frame
      .getByRole('button', { name: 'Menu toggle' })
      .nth(1);
    const keyboardInput = frame.getByPlaceholder('Select a keyboard');
    const amigaOption = frame.getByRole('option', { name: 'amiga-de' });
    const reviewFinishButton = frame.getByRole('button', {
      name: 'Review and finish',
    });

    await expect(menuToggleButton).toBeVisible();
    await menuToggleButton.click();

    await expect(keyboardInput).toBeVisible();
    await keyboardInput.fill('ami');

    await expect(amigaOption).toBeVisible();
    await amigaOption.click();

    // Finish the process
    await expect(reviewFinishButton).toBeVisible();
    await reviewFinishButton.click();
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
      frame.getByRole('button', {
        name: 'Close Western Frisian - Germany (fy_DE.UTF-8)',
      }),
    ).toBeEnabled();
    await expect(
      frame.getByRole('button', { name: 'Close aa - Djibouti (aa_DJ.UTF-8)' }),
    ).toBeEnabled();
    await frame.getByPlaceholder('Select a language').fill('aa');
    await frame
      .getByRole('option', { name: 'aa - Eritrea (aa_ER.UTF-8)' })
      .click();
    await expect(
      frame.getByRole('button', { name: 'Close aa - Eritrea (aa_ER.UTF-8)' }),
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
      frame.getByRole('button', {
        name: 'Close Western Frisian - Germany (fy_DE.UTF-8)',
      }),
    ).toBeEnabled();
    await expect(
      frame.getByRole('button', { name: 'Close aa - Djibouti (aa_DJ.UTF-8)' }),
    ).toBeEnabled();
    await expect(
      frame.getByRole('button', { name: 'Close aa - Eritrea (aa_ER.UTF-8)' }),
    ).toBeEnabled();
    await expect(frame.getByPlaceholder('Select a keyboard')).toHaveValue(
      'ANSI-dvorak',
    );
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
