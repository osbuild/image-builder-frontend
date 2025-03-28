import { expect, type Page } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

export const createBlueprint = async (page: Page) => {
  await page.getByRole('button', { name: 'Create blueprint' }).click();
  await page.getByTestId('close-button-saveandbuild-modal').click();
  await page.getByRole('button', { name: 'Create blueprint' }).click();
};
export const fillInDetails = async (page: Page) => {
  const blueprintName = 'test-' + uuidv4();
  await page.getByRole('listitem').filter({ hasText: 'Details' }).click();
  await page.getByTestId('blueprint').click();
  await page.getByTestId('blueprint').fill(blueprintName);
  await expect(page.getByTestId('blueprint')).toHaveValue(blueprintName);
  await page.getByTestId('blueprint description').fill('Testing blueprint');
  await page.getByRole('button', { name: 'Next' }).click();
};
export const registerLater = async (page: Page) => {
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByTestId('automatically-register-checkbox').click();
};
