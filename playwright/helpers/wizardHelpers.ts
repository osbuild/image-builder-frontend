import * as fs from 'fs';
import * as path from 'path';

import { expect, FrameLocator, type Page, test } from '@playwright/test';

import { closePopupsIfExist, isHosted } from './helpers';
import { ibFrame, navigateToLandingPage } from './navHelpers';

/**
 * Clicks the create button, handles the modal, clicks the button again and selecets the BP in the list
 * @param page - the page object
 * @param blueprintName - the name of the created blueprint
 */
export const createBlueprint = async (
  page: Page | FrameLocator,
  blueprintName: string,
) => {
  await page.getByRole('button', { name: 'Create blueprint' }).click();

  // Primary success path: we should land on the blueprint details page where "Edit blueprint" is visible
  const editBtn = page.getByRole('button', { name: 'Edit blueprint' });
  try {
    await expect(editBtn).toBeVisible({ timeout: 15_000 });
    return;
  } catch {
    // Not on details yet – try to close any completion modal if present
    const closeBtn = page.getByRole('button', { name: 'Close' }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
      // Wait a bit for navigation after closing modal
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(1000);
    }

    // Give the UI another chance to render the details view
    try {
      await expect(editBtn).toBeVisible({ timeout: 10_000 });
      return;
    } catch {
      // Fallback: navigate via list – filter and open the created blueprint
      // Wait for page to settle first
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(2000);

      const search = page.getByRole('textbox', { name: 'Search input' });
      // Wait for search input to be available
      await expect(search).toBeVisible({ timeout: 10_000 });
      await search.clear();
      await search.fill(blueprintName);

      // Wait for search results to appear
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(1000);

      // Try multiple selectors for the card/button
      const bpButton = page.locator(`button[id="${blueprintName}"]`).first();
      // Wait for the card button to be visible and retry click in case of re-renders
      await expect(bpButton).toBeVisible({ timeout: 30000 });
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          await bpButton.scrollIntoViewIfNeeded();
          // eslint-disable-next-line playwright/no-wait-for-timeout
          await page.waitForTimeout(200);
          await bpButton.click();
          break;
        } catch {
          // eslint-disable-next-line playwright/no-wait-for-timeout
          await page.waitForTimeout(200);
          await expect(bpButton).toBeVisible({ timeout: 5000 });
          if (attempt === 4)
            throw new Error('Failed to click blueprint card after retries');
        }
      }

      await expect(editBtn).toBeVisible({ timeout: 10_000 });
    }
  }
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
  blueprintName: string,
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
 * If the blueprint is not found, it will fail gracefully
 * @param page - the page object
 * @param blueprintName - the name of the blueprint to delete
 */
export const deleteBlueprint = async (page: Page, blueprintName: string) => {
  // Since new browser is opened during the BP cleanup, we need to call the popup closer again
  await closePopupsIfExist(page);
  await test.step(
    'Delete the blueprint with name: ' + blueprintName,
    async () => {
      // Locate back to the Image Builder page every time because the test can fail at any stage
      await navigateToLandingPage(page);
      const frame = await ibFrame(page);
      await frame
        .getByRole('textbox', { name: 'Search input' })
        .fill(blueprintName);
      // Check if no blueprints found -> that means no blueprint was created -> fail gracefully and do not raise error
      try {
        await expect(
          frame.getByRole('heading', { name: 'No blueprints found' }),
        ).toBeVisible({ timeout: 5_000 }); // Shorter timeout to avoid hanging uncessarily
        return; // Fail gracefully, no blueprint to delete
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // If the No BP heading was not found, it means the blueprint (possibly) was created -> continue with deletion
      }

      // the clickable blueprint cards are a bit awkward, so use the
      // button's id instead
      await frame.locator(`button[id="${blueprintName}"]`).click();
      await frame.getByRole('button', { name: 'Menu toggle' }).click();
      await frame.getByRole('menuitem', { name: 'Delete blueprint' }).click();
      await frame.getByRole('button', { name: 'Delete' }).click();
    },
    { box: true },
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
  blueprintName: string,
) => {
  if (isHosted()) {
    await page.getByRole('button', { name: 'Import' }).click();
    const dragBoxSelector = page.getByRole('presentation').first();
    await dragBoxSelector
      .locator('input[type=file]')
      .setInputFiles('../../downloads/' + blueprintName + '.json');
    await expect(
      page.getByRole('textbox', { name: 'File upload' }),
    ).not.toBeEmpty();
    await page.getByRole('button', { name: 'Review and Finish' }).click();
  }
};

export const saveBlueprintFileWithContents = async (
  blueprintName: string,
  content: string,
) => {
  const fixturesDir = path.join(__dirname, '../../../..', 'downloads');
  const tmpFilePath = path.join(fixturesDir, blueprintName + '.json');

  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  fs.writeFileSync(tmpFilePath, content);
};
