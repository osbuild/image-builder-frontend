import { expect, FrameLocator, Page } from '@playwright/test';

import { getHostArch, getHostDistroName, isHosted, sleep } from './helpers';

import {
  selectArch,
  selectDistro,
  selectTarget,
} from '../BootTests/helpers/targetChooser';

/**
 * Opens the wizard, fills out the "Image Output" step according to the parameters, and navigates to the optional steps
 * @param page - the page object
 * @param target - the target to select (qcow2, iso, wsl, ova, vmdk)
 * @param distro - the distribution to select (rhel10, rhel9, rhel8)
 * @param arch - the architecture to select (x86_64, aarch64)
 */
export const fillInImageOutput = async (
  page: Page | FrameLocator,
  target?: 'qcow2' | 'iso' | 'wsl' | 'ova' | 'vmdk',
  distro?: 'rhel10' | 'rhel9' | 'rhel8',
  arch?: 'x86_64' | 'aarch64',
) => {
  await page.getByRole('button', { name: 'Create image blueprint' }).click();
  if (!isHosted()) {
    // wait until the distro and architecture aligns with the host
    await expect(page.getByTestId('release_select')).toHaveText(
      getHostDistroName(),
    );
    await expect(page.getByTestId('arch_select')).toHaveText(getHostArch());
  }
  if (distro) {
    await selectDistro(page, distro);
  }
  if (arch) {
    await selectArch(page, arch);
  }
  if (target) {
    await selectTarget(page, target);
  } else {
    await page.getByRole('checkbox', { name: 'Virtualization' }).click();
  }
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

/**
 * Navigates to the landing page of the Image Builder
 * @param page - the page object
 */
export const navigateToLandingPage = async (page: Page) => {
  try {
    await navigateToLandingPageFunc(page);
  } catch {
    await retry(page, navigateToLandingPageFunc, 3);
  }
};

export const navigateToLandingPageFunc = async (page: Page) => {
  if (isHosted()) {
    await page.goto('/insights/image-builder/landing');
    await expect(page.getByRole('heading', { name: 'All images' })).toBeVisible(
      { timeout: 30000 },
    );
  } else {
    await page.goto('/cockpit-image-builder');
    await expect(
      ibFrame(page).getByRole('heading', { name: 'All images' }),
    ).toBeVisible({ timeout: 30000 });
  }
};

/**
 * Retry a function a given number of times with a given delay between attempts
 * @param page - the page object
 * @param callback - the function to retry
 * @param tries - the number of times to retry
 * @param delay - the delay between attempts
 * @returns the result of the function
 */
export const retry = async (
  page: Page,
  callback: (page: Page) => Promise<void>,
  tries = 3,
  delay?: number,
) => {
  let rc = tries;
  while (rc >= 0) {
    if (delay) {
      await sleep(delay);
    }

    rc -= 1;
    if (rc === 0) {
      return await callback(page);
    } else {
      try {
        await callback(page);
      } catch {
        continue;
      }
      break;
    }
  }
};
