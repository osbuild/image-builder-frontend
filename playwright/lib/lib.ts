import { type Page, type FrameLocator, expect } from '@playwright/test';

export const ibFrame = (page: Page): FrameLocator | Page => {
  if (isHosted()) {
    return page;
  }
  return page
    .locator('iframe[name="cockpit1\\:localhost\\/cockpit-image-builder"]')
    .contentFrame();
};

export const togglePreview = async (page: Page) => {
  const toggleSwitch = page.locator('#preview-toggle');

  if (!(await toggleSwitch.isChecked())) {
    await toggleSwitch.click();
  }

  const turnOnButton = page.getByRole('button', { name: 'Turn on' });
  if (await turnOnButton.isVisible()) {
    await turnOnButton.click();
  }

  await expect(toggleSwitch).toBeChecked();
};

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

export const isHosted = (): boolean => {
  return process.env.BASE_URL?.includes('redhat.com') || false;
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
  await page.getByRole('button', { name: 'Administrative access' });
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
  await page.getByRole('heading', { name: 'All images' });
};

const closePopupsIfExist = async (page: Page) => {
  const locatorsToCheck = [
    page.locator('.pf-v5-c-alert.notification-item button'), // This closes all toast pop-ups
    page.locator(`button[id^="pendo-close-guide-"]`), // This closes the pendo guide pop-up
    page.locator(`button[id="truste-consent-button"]`), // This closes the trusted consent pop-up
    page.getByLabel('close-notification'), // This closes a one off info notification (May be covered by the toast above, needs recheck.)
  ];

  for (const locator of locatorsToCheck) {
    await page.addLocatorHandler(locator, async () => {
      await locator.first().click(); // There can be multiple toast pop-ups
    });
  }
};
