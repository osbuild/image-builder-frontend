import path from 'path';

import { type Page, expect } from '@playwright/test';

import { closePopupsIfExist, isHosted, togglePreview } from './helpers';
import { ibFrame } from './navHelpers';

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
  await page.getByRole('button', { name: 'Log in' }).click();

  // image-builder lives inside an iframe
  const frame = ibFrame(page);

  // cockpit-image-builder needs superuser, expect an error message
  // when the user does not have admin priviliges
  await expect(
    frame.getByRole('heading', { name: 'Access is limited' })
  ).toBeVisible();
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
  await expect(
    frame.getByRole('heading', { name: 'All images' })
  ).toBeVisible();
};

const loginConsole = async (page: Page, user: string, password: string) => {
  await closePopupsIfExist(page);
  await page.goto('/insights/image-builder/landing');
  await page
    .getByRole('textbox', { name: 'Red Hat login or email' })
    .fill(user);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await togglePreview(page);
  await expect(page.getByRole('heading', { name: 'All images' })).toBeVisible();
};

export const storeStorageStateAndToken = async (page: Page) => {
  const { cookies } = await page
    .context()
    .storageState({ path: path.join(__dirname, '../../.auth/user.json') });
  process.env.TOKEN = `Bearer ${
    cookies.find((cookie) => cookie.name === 'cs_jwt')?.value
  }`;
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(100);
};
