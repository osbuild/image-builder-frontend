import { expect, FrameLocator, type Page, test } from '@playwright/test';

import { isHosted } from './helpers';
import { ibFrame } from './navHelpers';

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
  await page.getByRole('button', { name: 'Close' }).first().click();
  await page.getByRole('button', { name: 'Create blueprint' }).click();
  await page.getByRole('textbox', { name: 'Search input' }).fill(blueprintName);
  await page.getByTestId('blueprint-card').getByText(blueprintName).click();
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
  await page
    .getByRole('textbox', { name: 'Blueprint name' })
    .fill(blueprintName);
  await page
    .getByRole('textbox', { name: 'Blueprint description' })
    .fill('Testing blueprint');
  await page.getByRole('button', { name: 'Next' }).click();
};

/**
 * Select "Register later" option in the wizard
 * This function executes only on the hosted service
 * @param page - the page object
 */
export const registerLater = async (page: Page | FrameLocator) => {
  if (isHosted()) {
    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByRole('radio', { name: 'Register later' }).click();
  }
};

/**
 * Fill in the image output step in the wizard by selecting the Guest Image
 * @param page - the page object
 */
export const fillInImageOutputGuest = async (page: Page | FrameLocator) => {
  await page.getByRole('checkbox', { name: 'Virtualization' }).click();
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
      // Locate back to the Image Builder page every time because the test can fail at any stage
      const frame = await ibFrame(page);
      await frame
        .getByRole('textbox', { name: 'Search input' })
        .fill(blueprintName);
      await frame
        .getByTestId('blueprint-card')
        .getByText(blueprintName)
        .click();
      await frame.getByRole('button', { name: 'Menu toggle' }).click();
      await frame.getByRole('menuitem', { name: 'Delete blueprint' }).click();
      await frame.getByRole('button', { name: 'Delete' }).click();
    },
    { box: true }
  );
};

/**
 * Export the blueprint
 * This function executes only on the hosted service
 * @param page - the page object
 */
export const exportBlueprint = async (page: Page, blueprintName: string) => {
  if (isHosted()) {
    await page.getByRole('button', { name: 'Menu toggle' }).click();
    const downloadPromise = page.waitForEvent('download');
    await page
      .getByRole('menuitem', { name: 'Download blueprint (.json)' })
      .click();
    const download = await downloadPromise;
    await download.saveAs('../../downloads/' + blueprintName + '.json');
  }
};

/**
 * Import the blueprint
 * This function executes only on the hosted service
 * @param page - the page object
 */
export const importBlueprint = async (
  page: Page | FrameLocator,
  blueprintName: string
) => {
  if (isHosted()) {
    await page.getByRole('button', { name: 'Import' }).click();
    const dragBoxSelector = page.getByRole('presentation').first();
    await dragBoxSelector
      .locator('input[type=file]')
      .setInputFiles('../../downloads/' + blueprintName + '.json');
    await expect(
      page.getByRole('textbox', { name: 'File upload' })
    ).not.toBeEmpty();
    await page.getByRole('button', { name: 'Review and Finish' }).click();
  }
};
