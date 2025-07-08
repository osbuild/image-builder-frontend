import { expect, FrameLocator, Page } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/cleanup';
import { login } from '../helpers/login';
import { navigateToOptionalSteps, ibFrame } from '../helpers/navHelpers';
import {
  fillInDetails,
  createBlueprint,
  deleteBlueprint,
} from '../helpers/wizardHelpers';

const validControllerUrl = 'https://controller.url';
const validHttpControllerUrl = 'http://controller.url';
const validHostConfigKey = 'hostconfigkey';
const validCertificate =
  '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAOEzx5ezZ9EIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV\nBAYTAklOMQswCQYDVQQIDAJLUjEMMAoGA1UEBwwDS1JHMRAwDgYDVQQKDAdUZXN0\nIENBMB4XDTI1MDUxNTEyMDAwMFoXDTI2MDUxNTEyMDAwMFowRTELMAkGA1UEBhMC\nSU4xCzAJBgNVBAgMAktSMQwwCgYDVQQHDANSR0sxEDAOBgNVBAoMB1Rlc3QgQ0Ew\nggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC+R4gfN5pyJQo5qBTTtN+7\neE9CSXZJ8SVVaE3U54IgqQoqsSoBY5QtExy7v5C6l6mW4E6dzK/JecmvTTO/BvlG\nA5k2hxB6bOQxtxYwfgElH+RFWN9P4xxhtEiQgHoG1rDfnXuDJk1U3YEkCQELUebz\nfF3EIDU1yR0Sz2bA+Sl2VXe8og1MEZfytq8VZUVltxtn2PfW7zI5gOllBR2sKeUc\nK6h8HXN7qMgfEvsLIXxTw7fU/zA3ibcxfRCl3m6QhF8hwRh6F9Wtz2s8hCzGegV5\nz0M39nY7X8C3GZQ4Ly8v8DdY+FbEix7K3SSBRbWtdPfAHRFlX9Er2Wf8DAr7O2hH\nAgMBAAGjUDBOMB0GA1UdDgQWBBTXXz2eIDgK+BhzDUAGzptn0OMcpDAfBgNVHSME\nGDAWgBTXXz2eIDgK+BhzDUAGzptn0OMcpDAMBgNVHRMEBTADAQH/MA0GCSqGSIb3\nDQEBCwUAA4IBAQAoUgY4jsuBMB3el9cc7JS2rcOvEJzn47Hj2UANfJq52g5lbjo7\nXDc7Wb3VDcV+1LzjdzayT1qO1WzHb6FDPW9L9f6h4s8lj6MvJ+xhOWgD11srdIt3\nvbQaQW4zDfeVRcKXzqbcUX8BLXAdzJPqVwZ+Z4EDjYrJ7lF9k+IqfZm0MsYX7el9\nkvdRHbLuF4Q0sZ05CXMFkhM0Ulhu4MZ+1FcsQa7nWfZzTmbjHOuWJPB4z5WwrB7z\nU8YYvWJ3qxToWGbATqJxkRKGGqLrNrmwcfzgPqkpuCRYi0Kky6gJ1RvL+DRopY9x\nuD+ckf3oH2wYAB6RpPRMkfVxe7lGMvq/yEZ6\n-----END CERTIFICATE-----';

const invalidCertificate =
  '-----BEGIN CERTIFICATE-----\nINVALID\n-----END CERTIFICATE-----';
const malformedCertificate =
  '-----BEGIN CERTIFICATE-----\nSomeContent\n-----END';

const navigateToAAPStep = async (frame: Page | FrameLocator) => {
  await test.step('Navigate to AAP step', async () => {
    await navigateToOptionalSteps(frame);
    await frame
      .getByRole('button', { name: 'Ansible Automation Platform' })
      .click();
  });
};

test('Create a blueprint with AAP registration customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-aap-complete-' + uuidv4();

  // Delete the blueprint after the run fixture
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  // Login, navigate to IB and get the frame
  await login(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await navigateToOptionalSteps(frame);
  });

  await test.step('Fill all AAP fields', async () => {
    await frame
      .getByRole('textbox', { name: 'ansible callback url' })
      .fill(validControllerUrl);
    await frame
      .getByRole('textbox', { name: 'host config key' })
      .fill(validHostConfigKey);
    await frame
      .getByRole('textbox', { name: 'File upload' })
      .fill(validCertificate);
  });

  await test.step('Fill the BP details', async () => {
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Verify AAP configuration persists in edit mode', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame
      .getByRole('button', { name: 'Ansible Automation Platform' })
      .click();

    await expect(
      frame.getByRole('textbox', { name: 'ansible callback url' })
    ).toHaveValue(validControllerUrl);
    await expect(
      frame.getByRole('textbox', { name: 'host config key' })
    ).toHaveValue(validHostConfigKey);
    await expect(
      frame.getByRole('textbox', { name: 'File upload' })
    ).toHaveValue(validCertificate);
  });
});

test('HTTPS URL with TLS confirmation checkbox', async ({ page, cleanup }) => {
  const blueprintName = 'test-aap-tls-confirm-' + uuidv4();

  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  await login(page);
  const frame = await ibFrame(page);

  await navigateToAAPStep(frame);

  await test.step('Fill HTTPS URL and verify TLS confirmation appears', async () => {
    await frame
      .getByRole('textbox', { name: 'ansible callback url' })
      .fill(validControllerUrl);

    // TLS confirmation checkbox should appear for HTTPS URLs
    await expect(
      frame.getByRole('checkbox', {
        name: 'This HTTPS URL does not require a custom TLS certificate',
      })
    ).toBeVisible();

    // CA input should be visible initially
    await expect(
      frame.getByRole('textbox', { name: 'File upload' })
    ).toBeVisible();
  });

  await test.step('Check TLS confirmation and verify CA input is hidden', async () => {
    await frame
      .getByRole('checkbox', {
        name: 'This HTTPS URL does not require a custom TLS certificate',
      })
      .check();

    // CA input should be hidden when confirmation is checked
    await expect(
      frame.getByRole('textbox', { name: 'File upload' })
    ).toBeHidden();
  });

  await test.step('Complete configuration with TLS confirmation', async () => {
    await frame
      .getByRole('textbox', { name: 'host config key' })
      .fill(validHostConfigKey);

    // Should be able to proceed without certificate when confirmation is checked
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);
  });
});

test('HTTP URL always requires certificate', async ({ page, cleanup }) => {
  const blueprintName = 'test-aap-http-' + uuidv4();

  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  await login(page);
  const frame = await ibFrame(page);

  await navigateToAAPStep(frame);

  await test.step('Fill HTTP URL and verify no TLS confirmation', async () => {
    await frame
      .getByRole('textbox', { name: 'ansible callback url' })
      .fill(validHttpControllerUrl);

    // TLS confirmation checkbox should NOT appear for HTTP URLs
    await expect(
      frame.getByRole('checkbox', {
        name: 'This HTTPS URL does not require a custom TLS certificate',
      })
    ).toBeHidden();

    // CA input should always be visible for HTTP
    await expect(
      frame.getByRole('textbox', { name: 'File upload' })
    ).toBeVisible();
  });

  await test.step('Complete configuration with certificate', async () => {
    await frame
      .getByRole('textbox', { name: 'host config key' })
      .fill(validHostConfigKey);
    await frame
      .getByRole('textbox', { name: 'File upload' })
      .fill(validCertificate);

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);
  });
});

test('Validation errors for required fields', async ({ page }) => {
  await login(page);
  const frame = await ibFrame(page);

  await navigateToAAPStep(frame);

  await test.step('Try to proceed with empty fields', async () => {
    // Try to proceed without filling any fields
    await frame.getByRole('button', { name: 'Next' }).click();

    // Should stay on the same step (no navigation should occur)
    await expect(frame.getByText('Ansible Automation Platform')).toBeVisible();
  });

  await test.step('Fill partial fields and verify validation', async () => {
    await frame
      .getByRole('textbox', { name: 'ansible callback url' })
      .fill(validControllerUrl);

    // Next button should still be disabled due to missing required fields
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});

test('Certificate validation with invalid certificates', async ({ page }) => {
  await login(page);
  const frame = await ibFrame(page);

  await navigateToAAPStep(frame);

  await test.step('Test invalid certificate validation', async () => {
    await frame
      .getByRole('textbox', { name: 'ansible callback url' })
      .fill(validControllerUrl);
    await frame
      .getByRole('textbox', { name: 'host config key' })
      .fill(validHostConfigKey);

    // Add invalid certificate
    await frame
      .getByRole('textbox', { name: 'File upload' })
      .fill(invalidCertificate);

    // Should show error message for invalid certificate
    await expect(frame.getByText(/Certificate.*is not valid/)).toBeVisible();

    // Next button should be disabled
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  await test.step('Test malformed certificate validation', async () => {
    await frame.getByRole('textbox', { name: 'File upload' }).clear();
    await frame
      .getByRole('textbox', { name: 'File upload' })
      .fill(malformedCertificate);

    // Should show error message for malformed certificate
    await expect(frame.getByText(/Certificate.*is not valid/)).toBeVisible();
  });
});

test('Multiple certificates validation', async ({ page }) => {
  await login(page);
  const frame = await ibFrame(page);

  await navigateToAAPStep(frame);

  const multipleCertificates = validCertificate + '\n\n' + validCertificate;
  const mixedCertificates = validCertificate + '\n\n' + invalidCertificate;

  await test.step('Test multiple valid certificates', async () => {
    await frame
      .getByRole('textbox', { name: 'ansible callback url' })
      .fill(validControllerUrl);
    await frame
      .getByRole('textbox', { name: 'host config key' })
      .fill(validHostConfigKey);

    await frame
      .getByRole('textbox', { name: 'File upload' })
      .fill(multipleCertificates);

    // Should show success message for valid certificates
    await expect(frame.getByText('Certificate was uploaded')).toBeVisible();

    // Next button should be enabled
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  await test.step('Test mixed valid/invalid certificates', async () => {
    await frame.getByRole('textbox', { name: 'File upload' }).clear();
    await frame
      .getByRole('textbox', { name: 'File upload' })
      .fill(mixedCertificates);

    // Should show error message when any certificate is invalid
    await expect(frame.getByText(/Certificate.*is not valid/)).toBeVisible();

    // Next button should be disabled
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});

test('HTTPS URL validation without certificate or confirmation', async ({
  page,
}) => {
  await login(page);
  const frame = await ibFrame(page);

  await navigateToAAPStep(frame);

  await test.step('Fill HTTPS URL without certificate or confirmation', async () => {
    await frame
      .getByRole('textbox', { name: 'ansible callback url' })
      .fill(validControllerUrl);
    await frame
      .getByRole('textbox', { name: 'host config key' })
      .fill(validHostConfigKey);

    // Don't check TLS confirmation and don't provide certificate
    // Next button should be disabled
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});

test('Empty step should allow navigation', async ({ page }) => {
  await login(page);
  const frame = await ibFrame(page);

  await navigateToAAPStep(frame);

  await test.step('Navigate through empty AAP step', async () => {
    // Should be able to proceed when all fields are empty (optional step)
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();

    // Should be able to skip to review
    await expect(
      frame.getByRole('button', { name: 'Review and finish' })
    ).toBeEnabled();
  });
});
