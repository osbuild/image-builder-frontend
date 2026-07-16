import { execSync } from 'child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'path';

import {
  expect,
  type FrameLocator,
  type Locator,
  type Page,
} from '@playwright/test';

import { FEDORA_ELN, ON_PREM_RELEASES } from '@/constants';

export const disablePreview = async (page: Page) => {
  const toggleSwitch = page.locator('#preview-toggle');

  if (await toggleSwitch.isChecked()) {
    await toggleSwitch.click();
  }

  await expect(toggleSwitch).not.toBeChecked();
  await expect(
    page.getByText(/To see new pre-production features, turn on Preview mode/i),
  ).toBeVisible();
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
    page.getByRole('button', { name: 'Agree and proceed with' }), // closes the EU cookies popup
    page.getByRole('button', { name: 'Accept default' }), // closes the SSO login cookies popup
  ];

  for (const locator of locatorsToCheck) {
    await page.addLocatorHandler(locator, async () => {
      await locator.first().click({ timeout: 10_000, noWaitAfter: true }); // There can be multiple toast pop-ups
    });
  }
};

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

  const id = (osRel as any)['ID'];
  const versionId = (osRel as any)['VERSION_ID'];
  const key = id === 'eln' ? FEDORA_ELN : `${id}-${versionId.split('.')[0]}`;
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

export const getDefaultTimezone = (): string => {
  if (isHosted()) {
    return 'Etc/UTC';
  }
  const distroKey = getHostDistroKey();
  return distroKey === 'rhel-10' ? 'Etc/UTC' : 'America/New_York';
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
