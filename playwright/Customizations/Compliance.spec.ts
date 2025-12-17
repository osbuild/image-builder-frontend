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
  fillInDetails,
  registerLater,
} from '../helpers/wizardHelpers';

test('Create a blueprint with Compliance policy selected', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'Compliance is not available in the plugin');
  const blueprintName = 'test-' + uuidv4();

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

  await test.step('Select Compliance and choose a mock policy', async () => {
    await frame.getByRole('button', { name: 'Security' }).nth(1).click();

    await frame
      .getByRole('radio', { name: 'Use a custom Compliance policy' })
      .check();

    const toggle = frame.locator(
      '[data-ouia-component-id="compliancePolicySelect"]',
    );
    await expect(toggle).toBeEnabled();
    await toggle.click();

    const policyOption = frame.getByRole('option', {
      name: /placehollder/i,
    });
    await policyOption.click();

    await expect(
      frame.getByRole('button', { name: 'placehollder' }),
    ).toBeVisible();

    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP and verify Compliance selection persisted', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Security' }).nth(1).click();

    await expect(
      frame.getByRole('radio', { name: 'Use a custom compliance policy' }),
    ).toBeChecked();

    await expect(
      frame.getByRole('button', { name: 'placehollder' }),
    ).toBeVisible();
  });
});
