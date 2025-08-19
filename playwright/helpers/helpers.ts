import { execSync } from 'child_process';
import { readFileSync } from 'node:fs';

import { expect, type Page } from '@playwright/test';

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

export const isHosted = (): boolean => {
  return process.env.BASE_URL?.includes('redhat.com') || false;
};

export const closePopupsIfExist = async (page: Page) => {
  const locatorsToCheck = [
    page.locator('.pf-v6-c-alert.notification-item button'), // This closes all toast pop-ups
    page.locator(`button[id^="pendo-close-guide-"]`), // This closes the pendo guide pop-up
    page.locator(`button[id="truste-consent-button"]`), // This closes the trusted consent pop-up
    page.getByLabel('close-notification'), // This closes a one off info notification (May be covered by the toast above, needs recheck.)
    page
      .locator('iframe[name="intercom-modal-frame"]')
      .contentFrame()
      .getByRole('button', { name: 'Close' }), // This closes the intercom pop-up
    page
      .locator('iframe[name="intercom-notifications-frame"]')
      .contentFrame()
      .getByRole('button', { name: 'Profile image for Rob Rob' })
      .last(), // This closes the intercom pop-up notification at the bottom of the screen, the last notification is displayed first if stacked (different from the modal popup handled above)
  ];

  for (const locator of locatorsToCheck) {
    await page.addLocatorHandler(locator, async () => {
      await locator.first().click({ timeout: 10_000, noWaitAfter: true }); // There can be multiple toast pop-ups
    });
  }
};

// copied over from constants
const ON_PREM_RELEASES = new Map([
  ['centos-10', 'CentOS Stream 10'],
  ['fedora-41', 'Fedora Linux 41'],
  ['fedora-42', 'Fedora Linux 42'],
  ['rhel-10', 'Red Hat Enterprise Linux (RHEL) 10'],
]);

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getHostDistroName = (): string => {
  const osRelData = readFileSync('/etc/os-release');
  const lines = osRelData
    .toString('utf-8')
    .split('\n')
    .filter((l) => l !== '');
  const osRel = {};

  for (const l of lines) {
    const lineData = l.split('=');
    (osRel as any)[lineData[0]] = lineData[1].replace(/"/g, '');
  }

  // strip minor version from rhel
  const distro = ON_PREM_RELEASES.get(
    `${(osRel as any)['ID']}-${(osRel as any)['VERSION_ID'].split('.')[0]}`,
  );

  if (distro === undefined) {
    /* eslint-disable no-console */
    console.error('getHostDistroName failed, os-release config:', osRel);
    throw new Error('getHostDistroName failed, distro undefined');
  }

  return distro;
};

export const getHostArch = (): string => {
  return execSync('uname -m').toString('utf-8').replace(/\s/g, '');
};
