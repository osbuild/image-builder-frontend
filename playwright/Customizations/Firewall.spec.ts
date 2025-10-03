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

test('Create a blueprint with Firewall customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
  });

  await test.step('Select and correctly fill the ports in Firewall step', async () => {
    await frame.getByRole('button', { name: 'Firewall' }).click();
    await frame.getByPlaceholder('Add ports').fill('80:tcp');
    await frame.getByRole('button', { name: 'Add ports' }).click();
    await expect(frame.getByText('80:tcp')).toBeVisible();
  });

  await test.step('Select and correctly fill the disabled services in Firewall step', async () => {
    await frame
      .getByPlaceholder('Add disabled service')
      .fill('disabled_service');
    await frame.getByRole('button', { name: 'Add disabled service' }).click();
    await expect(frame.getByText('disabled_service')).toBeVisible();
  });

  await test.step('Select and correctly fill the enabled services in Firewall step', async () => {
    await frame.getByPlaceholder('Add enabled service').fill('enabled_service');
    await frame.getByRole('button', { name: 'Add enabled service' }).click();
    await expect(frame.getByText('enabled_service')).toBeVisible();
  });

  await test.step('Select and incorrectly fill the ports in Firewall step', async () => {
    await frame.getByPlaceholder('Add ports').fill('x');
    await frame.getByRole('button', { name: 'Add ports' }).click();
    await expect(
      frame
        .getByText(
          'Expected format: <port/port-name>:<protocol>. Example: 8080:tcp, ssh:tcp',
        )
        .nth(0),
    ).toBeVisible();
  });

  await test.step('Select and incorrectly fill the disabled services in Firewall step', async () => {
    await frame.getByPlaceholder('Add disabled service').fill('1');
    await frame.getByRole('button', { name: 'Add disabled service' }).click();
    await expect(
      frame.getByText('Expected format: <service-name>. Example: sshd').nth(0),
    ).toBeVisible();
  });

  await test.step('Select and incorrectly fill the enabled services in Firewall step', async () => {
    await frame.getByPlaceholder('Add enabled service').fill('ťčš');
    await frame.getByRole('button', { name: 'Add enabled service' }).click();
    await expect(
      frame.getByText('Expected format: <service-name>. Example: sshd').nth(1),
    ).toBeVisible();
  });

  await test.step('Fill the BP details', async () => {
    const reviewButton = frame.getByRole('button', {
      name: 'Review and finish',
    });
    await expect(reviewButton).toBeVisible();
    await reviewButton.click();
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByLabel('Revisit Firewall step').click();

    await frame.getByPlaceholder('Add ports').fill('90:tcp');
    await frame.getByRole('button', { name: 'Add ports' }).click();
    await frame.getByPlaceholder('Add disabled service').fill('x');
    await frame.getByRole('button', { name: 'Add disabled service' }).click();
    await frame.getByPlaceholder('Add enabled service').fill('y');
    await frame.getByRole('button', { name: 'Add enabled service' }).click();

    await frame.getByRole('button', { name: 'Close 80:tcp' }).click();
    await frame.getByRole('button', { name: 'Close enabled_service' }).click();
    await frame.getByRole('button', { name: 'Close disabled_service' }).click();

    await expect(frame.getByText('90:tcp')).toBeVisible();
    await expect(frame.getByText('x').nth(0)).toBeVisible();
    await expect(frame.getByText('y').nth(0)).toBeVisible();

    await expect(frame.getByText('80:tcp')).toBeHidden();
    await expect(frame.getByText('disabled_service')).toBeHidden();
    await expect(frame.getByText('enabled_service')).toBeHidden();

    const reviewButton = frame.getByRole('button', {
      name: 'Review and finish',
    });
    await expect(reviewButton).toBeVisible();
    await reviewButton.click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  // This is for hosted service only as these features are not available in cockpit plugin
  await test.step('Export BP', async (step) => {
    step.skip(!isHosted(), 'Exporting is not available in the plugin');
    await exportBlueprint(page, blueprintName);
  });

  await test.step('Import BP', async (step) => {
    step.skip(!isHosted(), 'Importing is not available in the plugin');
    await importBlueprint(page, blueprintName);
  });

  await test.step('Review imported BP', async (step) => {
    step.skip(!isHosted(), 'Importing is not available in the plugin');
    await fillInImageOutputGuest(page);
    await page.getByRole('button', { name: 'Firewall' }).click();

    await expect(frame.getByText('90:tcp')).toBeVisible();
    await expect(frame.getByText('x').nth(0)).toBeVisible();
    await expect(frame.getByText('y').nth(0)).toBeVisible();

    await expect(frame.getByText('80:tcp')).toBeHidden();
    await expect(frame.getByText('disabled_service')).toBeHidden();
    await expect(frame.getByText('enabled_service')).toBeHidden();

    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
