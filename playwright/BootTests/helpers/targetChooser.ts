import { FrameLocator, Page } from '@playwright/test';

export const selectTarget = async (
  page: Page | FrameLocator,
  target: 'qcow2' | 'iso' | 'wsl' | 'ova' | 'vmdk',
) => {
  /**
   * Select the target.
   * @param page - the page object
   * @param target - the target to select (qcow2, iso, wsl, ova, vmdk)
   */
  switch (target) {
    case 'qcow2':
      await page.getByRole('checkbox', { name: 'Virtualization' }).click();
      break;
    case 'iso':
      await page.getByRole('checkbox', { name: 'Bare metal' }).click();
      break;
    case 'wsl':
      await page.getByRole('checkbox', { name: 'WSL' }).click();
      break;
    case 'ova':
      await page
        .getByRole('checkbox', {
          name: 'VMware vSphere - Open virtualization format',
        })
        .click();
      break;
    case 'vmdk':
      await page
        .getByRole('checkbox', { name: 'VMware vSphere - Virtual disk' })
        .click();
      break;
  }
  await page.getByRole('button', { name: 'Next' }).click();
};

export const selectDistro = async (
  page: Page | FrameLocator,
  distro: 'rhel10' | 'rhel9' | 'rhel8',
) => {
  /**
   * Select the distribution.
   * @param page - the page object
   * @param distro - the distro to select (rhel10, rhel9, rhel8)
   */
  await page.getByRole('button', { name: 'Red Hat Enterprise Linux' }).click();
  switch (distro) {
    case 'rhel10':
      await page
        .getByRole('option', { name: 'Red Hat Enterprise Linux (RHEL) 10' })
        .click();
      break;
    case 'rhel9':
      await page
        .getByRole('option', { name: 'Red Hat Enterprise Linux (RHEL) 9' })
        .click();
      break;
    case 'rhel8':
      await page
        .getByRole('option', { name: 'Red Hat Enterprise Linux (RHEL) 8' })
        .click();
      break;
  }
};

export const selectArch = async (
  page: Page | FrameLocator,
  arch: 'x86_64' | 'aarch64',
) => {
  /**
   * Select the architecture.
   * @param page - the page object
   * @param arch - the architecture to select (x86_64, aarch64)
   */
  await page.getByRole('button', { name: 'x86_64' }).click();
  switch (arch) {
    case 'x86_64':
      await page.getByRole('option', { name: 'x86_64' }).click();
      break;
    case 'aarch64':
      await page.getByRole('option', { name: 'aarch64' }).click();
      break;
  }
};
