import { expect, FrameLocator, Page } from '@playwright/test';

import { getHostArch, getHostDistroName, isHosted } from './helpers';

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
  const createBlueprintButton = page.getByRole('button', {
    name: 'Create image blueprint',
  });
  await expect(createBlueprintButton).toBeVisible();
  await createBlueprintButton.click();

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
  if (isHosted()) {
    await page.goto('/insights/image-builder/landing');
  } else {
    await page.goto('/cockpit-image-builder');
  }
};
