import type { Page } from '@playwright/test';

export const navigateToOptionalSteps = async (page: Page) => {
  await page.getByTestId('blueprints-create-button').click();
  await page.getByTestId('checkbox-guest-image').click();
  await page.getByRole('button', { name: 'Next' }).click();
};
