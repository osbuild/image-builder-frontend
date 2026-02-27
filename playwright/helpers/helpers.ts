import { execSync } from 'child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'path';

import {
  expect,
  type FrameLocator,
  type Locator,
  type Page,
} from '@playwright/test';

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
    page.locator(`button[id^="pendo-close-guide-"]`), // This closes the pendo guide pop-up
    page.locator(`button[id="truste-consent-button"]`), // This closes the trusted consent pop-up
    page
      .locator('iframe[name="intercom-modal-frame"]')
      .contentFrame()
      .getByRole('button', { name: 'Close' }), // This closes the intercom pop-up
    page
      .locator('iframe[name="intercom-notifications-frame"]')
      .contentFrame()
      .getByRole('button', { name: 'Profile image for Rob Rob' })
      .last(), // This closes the intercom pop-up notification at the bottom of the screen, the last notification is displayed first if stacked (different from the modal popup handled above)
    page
      .locator('iframe[name="trustarc_cm"]')
      .contentFrame()
      .getByRole('button', { name: 'Agree and proceed with' }), // closes the EU cookies popup
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
  ['fedora-43', 'Fedora Linux 43'],
  ['fedora-44', 'Fedora Linux 44'],
  ['fedora-45', 'Fedora Linux 45'],
  ['rhel-10', 'Red Hat Enterprise Linux (RHEL) 10'],
]);

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getHostDistroKey = (): string => {
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

  const key = `${(osRel as any)['ID']}-${(osRel as any)['VERSION_ID'].split('.')[0]}`;
  if (!ON_PREM_RELEASES.has(key)) {
    /* eslint-disable no-console */
    console.error('getHostDistroKey failed, os-release config:', osRel);
    throw new Error('getHostDistroKey failed, distro not in ON_PREM_RELEASES');
  }
  return key;
};

export const getHostDistroName = (): string => {
  const key = getHostDistroKey();
  const distro = ON_PREM_RELEASES.get(key);
  if (distro === undefined) {
    throw new Error('getHostDistroName failed, distro undefined');
  }
  return distro;
};

export const getHostArch = (): string => {
  return execSync('uname -m').toString('utf-8').replace(/\s/g, '');
};

export const uploadCertificateFile = async (
  scope: Page | FrameLocator,
  uploadButton: Locator,
  certificateContent: string,
  fileName: string = 'certificate.pem',
): Promise<void> => {
  // Create a temporary certificate file with the provided content
  const tempCertPath = path.join(__dirname, `temp_${fileName}`);

  try {
    // Write certificate content to temporary file
    writeFileSync(tempCertPath, certificateContent);

    // Find the file input in the same scope as the button (page or iframe)
    const fileInput = scope.locator('input[type="file"]');

    // Set the file directly on the input element
    await fileInput.setInputFiles(tempCertPath);

    // Verify the certificate was uploaded successfully
    await expect(scope.getByText('Certificate was uploaded')).toBeVisible();
  } finally {
    // Clean up temporary file
    if (existsSync(tempCertPath)) {
      unlinkSync(tempCertPath);
    }
  }
};
/**
 * Helper function for sleeping
 * @param ms - milliseconds to sleep
 */

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
