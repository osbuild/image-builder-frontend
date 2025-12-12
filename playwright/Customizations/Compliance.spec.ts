import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import {
  createCompliancePolicy,
  deleteCompliancePolicy,
  navigateToCompliancePolicy,
  removeCompliancePolicyRule,
} from '../BootTests/helpers/helpers';
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
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

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

test('Compliance alerts - lint warnings display', async ({ page, cleanup }) => {
  test.skip(!isHosted(), 'Compliance alerts are not available in the plugin');
  const blueprintName = 'test-compliance-' + uuidv4();
  const policyName = 'test-policy-' + uuidv4();
  const policyType =
    'Centro Criptológico Nacional (CCN) - STIC for Red Hat Enterprise Linux 9 - Intermediate';

  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => deleteCompliancePolicy(page, policyName));

  await ensureAuthenticated(page);

  await createCompliancePolicy(page, policyName, policyType);

  await test.step('Wait for policy to be available', async () => {
    await navigateToCompliancePolicy(page, policyName);
    // Wait a bit longer for the policy to be fully available after creation
    await expect(page.getByRole('row', { name: policyName })).toBeVisible({
      timeout: 60000,
    });
  });

  await page.goto('/insights/image-builder/imagewizard?release=rhel9');
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await expect(frame.getByTestId('release_select')).toHaveText(
      'Red Hat Enterprise Linux (RHEL) 9',
      { timeout: 10000 },
    );
    await frame.getByRole('checkbox', { name: 'Virtualization' }).click();
    await frame.getByRole('button', { name: 'Next' }).click();
    await registerLater(frame);
  });

  await test.step('Select and fill the Compliance step', async () => {
    await frame
      .getByLabel('Wizard steps')
      .getByRole('button', { name: 'Security' })
      .click();
    await frame
      .getByRole('radio', { name: 'Use a custom compliance policy' })
      .click();
    await frame.getByRole('button', { name: 'None' }).click();
    await expect(frame.getByRole('option').first()).toBeVisible();
    const searchInput = frame.getByRole('textbox', { name: /filter/i });
    await expect(searchInput).toBeVisible();
    await searchInput.fill(policyName);
    await expect(frame.getByRole('option', { name: policyName })).toBeVisible({
      timeout: 30000,
    });
    await frame.getByRole('option', { name: policyName }).click();
    await expect(frame.getByRole('button', { name: policyName })).toBeVisible();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await removeCompliancePolicyRule(
    page,
    policyName,
    'Install firewalld Package',
  );

  await test.step('Verify compliance warning appears in blueprint', async () => {
    await navigateToLandingPage(page);
    const updatedFrame = await ibFrame(page);

    const searchInput = updatedFrame.getByRole('textbox', {
      name: 'Search input',
    });
    await expect(searchInput).toBeVisible({ timeout: 60000 });
    await searchInput.fill(blueprintName);
    await expect(searchInput).toHaveValue(blueprintName);

    const blueprintButton = updatedFrame.locator(
      `button[id="${blueprintName}"]`,
    );
    await expect(blueprintButton).toBeVisible({ timeout: 60000 });
    await expect(blueprintButton).toBeEnabled();

    await blueprintButton.click();

    await expect(
      updatedFrame.getByRole('button', { name: 'Edit blueprint' }),
    ).toBeVisible({ timeout: 15000 });

    const firewalldMessage = updatedFrame.getByText(
      /Compliance: package firewalld is no longer required by policy/i,
    );
    await expect(firewalldMessage).toBeVisible({ timeout: 15000 });
  });
});
