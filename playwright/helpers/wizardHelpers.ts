import { expect, FrameLocator, type Page, test } from '@playwright/test';

import { ibFrame } from '../lib/lib';

/**
 * Clicks the create button, handles the modal, clicks the button again and selecets the BP in the list
 * @param page - the page object
 * @param blueprintName - the name of the created blueprint
 */
export const createBlueprint = async (
  page: Page | FrameLocator,
  blueprintName: string
) => {
  await page.getByRole('button', { name: 'Create blueprint' }).click();
  await page.getByTestId('close-button-saveandbuild-modal').click();
  await page.getByRole('button', { name: 'Create blueprint' }).click();
  await page.getByRole('textbox', { name: 'Search input' }).fill(blueprintName);
  await page
    .locator('.pf-v5-c-card__title-text')
    .getByText(blueprintName)
    .click();
};

/**
 * Fill in the "Details" step in the wizard
 * This method assumes that the "Details" step is ENABLED!
 * After filling the step, it will click the "Next" button
 * Description defaults to "Testing blueprint"
 * @param page - the page object
 * @param blueprintName - the name of the blueprint to create
 */
export const fillInDetails = async (
  page: Page | FrameLocator,
  blueprintName: string
) => {
  await page.getByRole('listitem').filter({ hasText: 'Details' }).click();
  await page.getByTestId('blueprint').click();
  await page.getByTestId('blueprint').fill(blueprintName);
  await expect(page.getByTestId('blueprint')).toHaveValue(blueprintName);
  await page.getByTestId('blueprint description').fill('Testing blueprint');
  await page.getByRole('button', { name: 'Next' }).click();
};

/**
 * Select "Register later" option in the wizard
 * @param page - the page object
 */
export const registerLater = async (page: Page | FrameLocator) => {
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByTestId('register-later-radio').click();
};

/**
 * Fill in the image output step in the wizard by selecting the Guest Image
 * @param page - the page object
 */
export const fillInImageOutputGuest = async (page: Page | FrameLocator) => {
  await page.getByTestId('checkbox-guest-image').click();
  await page.getByRole('button', { name: 'Next' }).click();
};

/**
 * Delete the blueprint with the given name
 * Will locate to the Image Builder page and search for the blueprint first
 * @param page - the page object
 * @param blueprintName - the name of the blueprint to delete
 */
export const deleteBlueprint = async (page: Page, blueprintName: string) => {
  await test.step(
    'Delete the blueprint with name: ' + blueprintName,
    async () => {
      // Locate back to the Image Builder page every time becuase the test can fail at any stage
      const frame = await ibFrame(page);
      await frame
        .getByRole('textbox', { name: 'Search input' })
        .fill(blueprintName);
      await frame
        .locator('.pf-v5-c-card__title-text')
        .getByText(blueprintName)
        .click();
      await frame.getByTestId('blueprint-action-menu-toggle').click();
      await frame.getByRole('menuitem', { name: 'Delete blueprint' }).click();
      await frame.getByRole('button', { name: 'Delete' }).click();
    },
    { box: true }
  );
};

/**
 * Export the blueprint
 * @param page - the page object
 */
export const exportBlueprint = async (page: Page | FrameLocator) => {
  await page.getByTestId('blueprint-action-menu-toggle').click();
  const downloadPromise = page.waitForEvent('download');
  await page
    .getByRole('menuitem', { name: 'Download blueprint (.json)' })
    .click();
  const download = await downloadPromise;
  await download.saveAs('../../downloads/testing.json');
};

/**
 * Import the blueprint
 * @param page - the page object
 */
export const importBlueprint = async (page: Page | FrameLocator) => {
  await page.getByTestId('import-blueprint-button').click();
  const dragBoxSelector = page.locator('.pf-v5-c-file-upload');
  await dragBoxSelector
    .locator('input[type=file]')
    .setInputFiles('../../downloads/testing.json');
  await expect(
    page.getByRole('textbox', { name: 'File upload' })
  ).not.toBeEmpty();
  await page.getByTestId('import-blueprint-finish').click();
};
