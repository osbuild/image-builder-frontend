import type { FrameLocator, Page } from '@playwright/test';

import { isHosted } from './helpers';

/**
 * Opens the wizard, fills out the "Image Output" step, and navigates to the optional steps
 * @param page - the page object
 */
export const navigateToOptionalSteps = async (page: Page | FrameLocator) => {
  await page.getByRole('button', { name: 'Create blueprint' }).click();
  await page.getByRole('checkbox', { name: 'Virtualization' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
};

/**
 * Returns the FrameLocator object in case we are using cockpit plugin, else it returns the page object
 * @param page - the page object
 */
export const ibFrame = (page: Page): FrameLocator | Page => {
  if (isHosted()) {
    return page;
  }
  return page
    .locator('iframe[name="cockpit1\\:localhost\\/cockpit-image-builder"]')
    .contentFrame();
};
