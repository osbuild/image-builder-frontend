import type { FrameLocator, Page } from '@playwright/test';

/**
 * Opens the wizard, fills out the "Image Output" step, and navigates to the optional steps
 * @param page - the page object
 */
export const navigateToOptionalSteps = async (page: Page | FrameLocator) => {
  await page.getByTestId('blueprints-create-button').click();
  await page.getByTestId('checkbox-guest-image').click();
  await page.getByRole('button', { name: 'Next' }).click();
};
