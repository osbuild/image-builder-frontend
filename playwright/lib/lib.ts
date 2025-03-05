import { expect, type Page, type FrameLocator } from '@playwright/test';

export const ibFrame = (page: Page): FrameLocator => {
  return page.locator('iframe[name="cockpit1\\:localhost\\/cockpit-image-builder"]').contentFrame();
}

export const loginCockpit = async (
  page: Page,
  username?: string,
  password?: string
) => {
  if (!username || !password) {
    throw new Error('Username or password not found');
  }

  await page.goto('/cockpit-image-builder');

  await page.getByRole('textbox', { name: 'User name' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);

  // cockpit-image-builder needs superuser
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('button', { name: 'Limited access' }).click();
  await page.getByText('Close').click();
  await page.getByRole('button', { name: 'Administrative access' });
};
