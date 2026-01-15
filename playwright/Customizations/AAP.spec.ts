import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { isHosted } from '../helpers/helpers';
import { ensureAuthenticated } from '../helpers/login';
import {
  fillInImageOutput,
  ibFrame,
  navigateToLandingPage,
} from '../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  exportBlueprint,
  fillInDetails,
  fillInImageOutputGuest,
  importBlueprint,
  registerLater,
} from '../helpers/wizardHelpers';

const validCallbackUrl =
  'https://controller.url/api/controller/v2/job_templates/9/callback/';
const validHttpCallbackUrl =
  'http://controller.url/api/controller/v2/job_templates/9/callback/';
const validHostConfigKey = 'hostconfigkey';
const validCertificate = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAOEzx5ezZ9EIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAklOMQswCQYDVQQIDAJLUjEMMAoGA1UEBwwDS1JHMRAwDgYDVQQKDAdUZXN0
IENBMB4XDTI1MDUxNTEyMDAwMFoXDTI2MDUxNTEyMDAwMFowRTELMAkGA1UEBhMC
SU4xCzAJBgNVBAgMAktSMQwwCgYDVQQHDANSR0sxEDAOBgNVBAoMB1Rlc3QgQ0Ew
ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC+R4gfN5pyJQo5qBTTtN+7
eE9CSXZJ8SVVaE3U54IgqQoqsSoBY5QtExy7v5C6l6mW4E6dzK/JecmvTTO/BvlG
A5k2hxB6bOQxtxYwfgElH+RFWN9P4xxhtEiQgHoG1rDfnXuDJk1U3YEkCQELUebz
fF3EIDU1yR0Sz2bA+Sl2VXe8og1MEZfytq8VZUVltxtn2PfW7zI5gOllBR2sKeUc
K6h8HXN7qMgfEvsLIXxTw7fU/zA3ibcxfRCl3m6QhF8hwRh6F9Wtz2s8hCzGegV5
z0M39nY7X8C3GZQ4Ly8v8DdY+FbEix7K3SSBRbWtdPfAHRFlX9Er2Wf8DAr7O2hH
AgMBAAGjUDBOMB0GA1UdDgQWBBTXXz2eIDgK+BhzDUAGzptn0OMcpDAfBgNVHSME
GDAWgBTXXz2eIDgK+BhzDUAGzptn0OMcpDAMBgNVHRMEBTADAQH/MA0GCSqGSIb3
DQEBCwUAA4IBAQAoUgY4jsuBMB3el9cc7JS2rcOhhJzn47Hj2UANfJq52g5lbjo7
XDc7Wb3VDcV+1LzjdzayT1qO1WzHb6FDPW9L9f6h4s8lj6MvJ+xhOWgD11srdIt3
vbQaQW4zDfeVRcKXzqbcUX8BLXAdzJPqVwZ+Z4EDjYrJ7lF9k+IqfZm0MsYX7el9
kvdRHbLuF4Q0sZ05CXMFkhM0Ulhu4MZ+1FcsQa7nWfZzTmbjHOuWJPB4z5WwrB7z
U8YYvWJ3qxToWGbATqJxkRKGGqLrNrmwcfzgPqkpuCRYi0Kky6gJ1RvL+DRopY9x
uD+ckf3oH2wYAB6RpPRMkfVxe7lGMvq/yEZ6
-----END CERTIFICATE-----`;
const invalidCertificate = `-----BEGIN CERTIFICATE-----
ThisIs*Not+Valid/Base64==
-----END CERTIFICATE-----`;

test('Create a blueprint with AAP registration customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Skip entirely in Cockpit/on-premise where AAP customization is unavailable
  test.skip(!isHosted(), 'AAP customization is not available in the plugin');

  // Delete the blueprint after the run fixture
  cleanup.add(() => deleteBlueprint(page, blueprintName));
  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
  });

  await test.step('Select and fill the AAP step with valid configuration', async () => {
    await frame
      .getByRole('button', { name: 'Ansible Automation Platform' })
      .click();
    await frame
      .getByRole('textbox', { name: 'ansible callback url' })
      .fill(validCallbackUrl);
    await frame
      .getByRole('textbox', { name: 'host config key' })
      .fill(validHostConfigKey);
    await frame
      .getByRole('textbox', { name: 'File upload' })
      .fill(validCertificate);
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  await test.step('Test TLS confirmation checkbox for HTTPS URLs', async () => {
    // TLS confirmation checkbox should appear for HTTPS URLs
    await expect(
      frame.getByRole('checkbox', {
        name: 'Insecure',
      }),
    ).toBeVisible();

    // Check TLS confirmation and verify CA input is hidden
    await frame
      .getByRole('checkbox', {
        name: 'Insecure',
      })
      .check();
    await expect(
      frame.getByRole('textbox', { name: 'File upload' }),
    ).toBeHidden();

    await frame
      .getByRole('checkbox', {
        name: 'Insecure',
      })
      .uncheck();

    await expect(
      frame.getByRole('textbox', { name: 'File upload' }),
    ).toBeVisible();
  });

  await test.step('Test certificate validation', async () => {
    await frame.getByRole('textbox', { name: 'File upload' }).clear();
    await frame
      .getByRole('textbox', { name: 'File upload' })
      .fill(invalidCertificate);
    await expect(frame.getByText(/Certificate.*is not valid/)).toBeVisible();

    await frame.getByRole('textbox', { name: 'File upload' }).clear();
    await frame
      .getByRole('textbox', { name: 'File upload' })
      .fill(validCertificate);

    await expect(frame.getByText('Certificate was uploaded')).toBeVisible();
  });

  await test.step('Test HTTP URL behavior', async () => {
    await frame.getByRole('textbox', { name: 'ansible callback url' }).clear();
    await frame
      .getByRole('textbox', { name: 'ansible callback url' })
      .fill(validHttpCallbackUrl);

    // TLS confirmation checkbox should NOT appear for HTTP URLs
    await expect(
      frame.getByRole('checkbox', {
        name: 'Insecure',
      }),
    ).toBeHidden();
    await expect(
      frame.getByRole('textbox', { name: 'File upload' }),
    ).toBeVisible();

    await frame.getByRole('textbox', { name: 'ansible callback url' }).clear();
    await frame
      .getByRole('textbox', { name: 'ansible callback url' })
      .fill(validCallbackUrl);
  });

  await test.step('Complete AAP configuration and proceed to review', async () => {
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP and verify AAP configuration persists', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByLabel('Revisit Ansible Automation Platform step').click();

    await expect(
      frame.getByRole('textbox', { name: 'ansible callback url' }),
    ).toHaveValue(validCallbackUrl);
    await expect(
      frame.getByRole('textbox', { name: 'host config key' }),
    ).toHaveValue(validHostConfigKey);
    await expect(
      frame.getByRole('textbox', { name: 'File upload' }),
    ).toHaveValue(validCertificate);

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  let exportedBP = '';

  // This is for hosted service only as these features are not available in cockpit plugin
  await test.step('Export BP', async (step) => {
    step.skip(!isHosted(), 'Exporting is not available in the plugin');
    exportedBP = await exportBlueprint(page);
    cleanup.add(async () => {
      await fsPromises.rm(path.dirname(exportedBP), { recursive: true });
    });
  });

  await test.step('Import BP', async (step) => {
    step.skip(!isHosted(), 'Importing is not available in the plugin');
    await importBlueprint(page, exportedBP);
  });

  await test.step('Review imported BP', async (step) => {
    step.skip(!isHosted(), 'Importing is not available in the plugin');
    await fillInImageOutputGuest(page);
    await page
      .getByRole('button', { name: 'Ansible Automation Platform' })
      .click();
    await expect(
      page.getByRole('textbox', { name: 'ansible callback url' }),
    ).toHaveValue(validCallbackUrl);
    await expect(
      page.getByRole('textbox', { name: 'host config key' }),
    ).toBeEmpty();
    await expect(
      page.getByRole('textbox', { name: 'File upload' }),
    ).toHaveValue(validCertificate);
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
