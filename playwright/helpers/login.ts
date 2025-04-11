import { type Page, expect } from '@playwright/test';

import { closePopupsIfExist, isHosted, togglePreview } from './helpers';

/**
 * Logs in to either Cockpit or Console, will distinguish between them based on the environment
 * @param page - the page object
 */
export const login = async (page: Page) => {
  if (!process.env.PLAYWRIGHT_USER || !process.env.PLAYWRIGHT_PASSWORD) {
    throw new Error('user or password not set in environment');
  }

  const user = process.env.PLAYWRIGHT_USER;
  const password = process.env.PLAYWRIGHT_PASSWORD;

  if (isHosted()) {
    return loginConsole(page, user, password);
  }
  return loginCockpit(page, user, password);
};

const loginCockpit = async (page: Page, user: string, password: string) => {
  await page.goto('/cockpit-image-builder');

  await page.getByRole('textbox', { name: 'User name' }).fill(user);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);

  // cockpit-image-builder needs superuser
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('button', { name: 'Limited access' }).click();

  // different popup opens based on type of account (can be passwordless)
  const authenticateButton = page.getByRole('button', { name: 'Authenticate' });
  const closeButton = page.getByText('Close');
  await expect(authenticateButton.or(closeButton)).toBeVisible();

  if (await authenticateButton.isVisible()) {
    // with password
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await authenticateButton.click();
  }
  if (await closeButton.isVisible()) {
    // passwordless
    await closeButton.click();
  }

  // expect to have administrative access
  await expect(
    page.getByRole('button', { name: 'Administrative access' })
  ).toBeVisible();
};

const loginConsole = async (page: Page, user: string, password: string) => {
  await page.goto('/insights/image-builder/landing');
  await page
    .getByRole('textbox', { name: 'Red Hat login or email' })
    .fill(user);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await closePopupsIfExist(page);
  await togglePreview(page);
  await expect(page.getByRole('heading', { name: 'All images' })).toBeVisible();
};
