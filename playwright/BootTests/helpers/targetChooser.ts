import { FrameLocator, Page } from '@playwright/test';

export const navigateToWizard = async (page: Page | FrameLocator) => {
  /**
   * Open the wizard.
   * @param page - the page object
   */
  await page.getByRole('button', { name: 'Create image blueprint' }).click();
};

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
