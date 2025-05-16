import { expect } from '@playwright/test';
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
const validJobTemplateId = '123456789';
const validHostConfigKey = 'hostconfigkey';
const validCertificate =
  '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAOEzx5ezZ9EIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV\nBAYTAklOMQswCQYDVQQIDAJLUjEMMAoGA1UEBwwDS1JHMRAwDgYDVQQKDAdUZXN0\nIENBMB4XDTI1MDUxNTEyMDAwMFoXDTI2MDUxNTEyMDAwMFowRTELMAkGA1UEBhMC\nSU4xCzAJBgNVBAgMAktSMQwwCgYDVQQHDANSR0sxEDAOBgNVBAoMB1Rlc3QgQ0Ew\nggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC+R4gfN5pyJQo5qBTTtN+7\neE9CSXZJ8SVVaE3U54IgqQoqsSoBY5QtExy7v5C6l6mW4E6dzK/JecmvTTO/BvlG\nA5k2hxB6bOQxtxYwfgElH+RFWN9P4xxhtEiQgHoG1rDfnXuDJk1U3YEkCQELUebz\nfF3EIDU1yR0Sz2bA+Sl2VXe8og1MEZfytq8VZUVltxtn2PfW7zI5gOllBR2sKeUc\nK6h8HXN7qMgfEvsLIXxTw7fU/zA3ibcxfRCl3m6QhF8hwRh6F9Wtz2s8hCzGegV5\nz0M39nY7X8C3GZQ4Ly8v8DdY+FbEix7K3SSBRbWtdPfAHRFlX9Er2Wf8DAr7O2hH\nAgMBAAGjUDBOMB0GA1UdDgQWBBTXXz2eIDgK+BhzDUAGzptn0OMcpDAfBgNVHSME\nGDAWgBTXXz2eIDgK+BhzDUAGzptn0OMcpDAMBgNVHRMEBTADAQH/MA0GCSqGSIb3\nDQEBCwUAA4IBAQAoUgY4jsuBMB3el9cc7JS2rcOvEJzn47Hj2UANfJq52g5lbjo7\nXDc7Wb3VDcV+1LzjdzayT1qO1WzHb6FDPW9L9f6h4s8lj6MvJ+xhOWgD11srdIt3\nvbQaQW4zDfeVRcKXzqbcUX8BLXAdzJPqVwZ+Z4EDjYrJ7lF9k+IqfZm0MsYX7el9\nkvdRHbLuF4Q0sZ05CXMFkhM0Ulhu4MZ+1FcsQa7nWfZzTmbjHOuWJPB4z5WwrB7z\nU8YYvWJ3qxToWGbATqJxkRKGGqLrNrmwcfzgPqkpuCRYi0Kky6gJ1RvL+DRopY9x\nuD+ckf3oH2wYAB6RpPRMkfVxe7lGMvq/yEZ6\n-----END CERTIFICATE-----';

test('Create a blueprint with AAP registration customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  // Login, navigate to IB and get the frame
  await login(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await navigateToOptionalSteps(frame);
  });

  await test.step('Fill the Registration step', async () => {
    await page.getByText('Register with Ansible').click();
    await page.getByRole('textbox', { name: 'ansible controller url' }).click();
    await page
      .getByRole('textbox', { name: 'ansible controller url' })
      .fill(validControllerUrl);
    await page.getByRole('textbox', { name: 'job template id' }).click();
    await page
      .getByRole('textbox', { name: 'job template id' })
      .fill(validJobTemplateId);
    await page.getByRole('textbox', { name: 'host config key' }).click();
    await page
      .getByRole('textbox', { name: 'host config key' })
      .fill(validHostConfigKey);
    await page.getByRole('textbox', { name: 'File upload' }).click();
    await page
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

  await test.step('Edit BP', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByLabel('Revisit Registration step').click();

    await expect(
      page.getByRole('textbox', { name: 'ansible controller url' })
    ).toHaveValue(validControllerUrl);
    await expect(
      page.getByRole('textbox', { name: 'job template id' })
    ).toHaveValue(validJobTemplateId);
    await expect(
      page.getByRole('textbox', { name: 'host config key' })
    ).toHaveValue(validHostConfigKey);
    await expect(
      page.getByRole('textbox', { name: 'File upload' })
    ).toHaveValue(validCertificate);
  });

  await frame.getByRole('button', { name: 'Review and finish' }).click();
  await frame
    .getByRole('button', { name: 'Save changes to blueprint' })
    .click();

  // TODO Test export and Import the BP
});

// TODO Tests for validation
