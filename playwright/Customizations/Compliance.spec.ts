import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { deleteCompliancePolicy } from '../BootTests/helpers/helpers';
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

  await test.step('Create a Compliance policy', async () => {
    await page.goto('/insights/compliance/scappolicies');
    await page.getByRole('button', { name: 'Create new policy' }).click();
    await page.getByRole('option', { name: 'RHEL 9' }).click();
    await expect(
      page.getByRole('gridcell', { name: policyType }).first(),
    ).toBeVisible();
    await page.getByRole('textbox', { name: 'text input' }).fill(policyType);
    await page
      .getByRole('row')
      .filter({ hasText: policyType })
      .getByRole('radio')
      .first()
      .click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('textbox', { name: 'Policy name' }).fill(policyName);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
    await page
      .getByRole('button', { name: 'Return to application' })
      .click({ timeout: 2 * 60 * 1000 });
  });

  await test.step('Wait for policy to be available', async () => {
    await page.goto('/insights/compliance/scappolicies');
    await page.getByRole('textbox', { name: 'text input' }).fill(policyName);
    await expect(page.getByRole('row', { name: policyName })).toBeVisible({
      timeout: 60000,
    });
  });

  // Navigate directly to wizard with RHEL 9 query parameter (like renderCreateMode does)
  // This matches the pattern from unit tests: preparePathname({ release: 'rhel9' })
  if (isHosted()) {
    await page.goto('/insights/image-builder/imagewizard?release=rhel9');
  } else {
    await page.goto('/imageWizard?release=rhel9');
  }
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    // Wait for RHEL 9 to be selected (the wizard should open directly with RHEL 9)
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
    const searchInput = frame.getByRole('textbox', { name: /search|filter/i });
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

  await test.step('Edit compliance policy to remove firewall rule', async () => {
    await page.goto('/insights/compliance/scappolicies');
    await page.getByRole('textbox', { name: 'text input' }).fill(policyName);
    await expect(page.getByRole('row', { name: policyName })).toBeVisible();

    await page.getByRole('link', { name: policyName }).click();

    const rulesTab = page.getByRole('tab', {
      name: /rules|Rules|tailoring|Tailoring/i,
    });
    await expect(rulesTab.first()).toBeVisible();
    await rulesTab.first().click();

    const editRulesButton = page.getByRole('button', {
      name: /edit.*rules|Edit.*rules/i,
    });
    await expect(editRulesButton.first()).toBeVisible();
    await editRulesButton.first().click();

    const searchInput = page.getByPlaceholder(
      /search|filter|type to filter|filter by name/i,
    );
    await expect(searchInput.first()).toBeVisible();
    await expect(searchInput.first()).toBeEnabled();

    // Wait for table to be fully loaded and stable before searching
    const tableRows = page.getByRole('row');
    await expect(tableRows.first()).toBeVisible();
    await expect(tableRows.nth(1)).toBeVisible();
    // Wait for table to stabilize - ensure multiple rows are visible
    try {
      await expect(tableRows.nth(2)).toBeVisible({ timeout: 10000 });
    } catch {
      // If there are only 2 rows, that's fine
    }

    // Wait for the search input to be ready and clear any existing value
    await searchInput.first().clear();
    // Wait for the input to be empty (ensures clear operation completed)
    await expect(searchInput.first()).toHaveValue('', { timeout: 5000 });

    // Fill the search input and wait for it to be set
    await searchInput.first().fill('firewalld');
    // Wait for the input value to be set (may take a moment due to debouncing)
    await expect(searchInput.first()).toHaveValue('firewalld', {
      timeout: 5000,
    });

    await expect(page.getByRole('row').first()).toBeVisible();
    await expect(tableRows.nth(1)).toBeVisible();

    // Perform search again after table loads to ensure it's applied
    await searchInput.first().clear();
    await expect(searchInput.first()).toHaveValue('', { timeout: 5000 });
    await searchInput.first().fill('firewalld');
    await expect(searchInput.first()).toHaveValue('firewalld', {
      timeout: 5000,
    });

    // Wait for table to reload after second search
    await expect(page.getByRole('row').first()).toBeVisible();
    await expect(tableRows.nth(1)).toBeVisible();

    await expect(page.getByText(/firewalld/i).first()).toBeVisible({
      timeout: 15000,
    });

    await expect(
      page.getByText(/Install firewalld Package/i).first(),
    ).toBeVisible({ timeout: 15000 });

    const firewalldRow = page
      .getByRole('row')
      .filter({ hasText: /Install firewalld Package/i })
      .first();
    await expect(firewalldRow).toBeVisible();

    const checkbox = firewalldRow.getByRole('checkbox').first();
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toBeChecked();

    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked({ timeout: 5000 });

    const saveButton = page.getByRole('button', {
      name: /save|Save|finish|Finish/i,
    });
    await expect(saveButton.first()).toBeVisible();
    await expect(saveButton.first()).toBeEnabled();

    await saveButton.first().click();

    await expect(saveButton.first()).not.toBeVisible({ timeout: 10000 });

    await expect(
      page
        .getByRole('tab', { name: /rules|Rules|tailoring|Tailoring/i })
        .first(),
    ).toBeVisible({ timeout: 20000 });
  });

  await test.step('Verify compliance warning appears in blueprint', async () => {
    await navigateToLandingPage(page);
    const updatedFrame = await ibFrame(page);

    const searchInput = updatedFrame.getByRole('textbox', {
      name: 'Search input',
    });
    await expect(searchInput).toBeVisible();
    await searchInput.fill(blueprintName);
    await expect(searchInput).toHaveValue(blueprintName);

    const blueprintButton = updatedFrame.locator(
      `button[id="${blueprintName}"]`,
    );
    await expect(blueprintButton).toBeVisible({ timeout: 10000 });
    await expect(blueprintButton).toBeEnabled();

    const lintResponsePromise = page
      .waitForResponse(
        (response) =>
          response.url().includes('/api/image-builder/v1/blueprints/') &&
          response.url().includes('/lint'),
        { timeout: 20000 },
      )
      .catch(() => null);

    await blueprintButton.click();

    await expect(
      updatedFrame.getByRole('button', { name: 'Edit blueprint' }),
    ).toBeVisible({ timeout: 15000 });

    await lintResponsePromise;

    const firewalldMessage = updatedFrame.getByText(
      /Compliance: package firewalld is no longer required by policy/i,
    );
    await expect(firewalldMessage).toBeVisible({ timeout: 15000 });
  });

  await test.step('Delete blueprint', async () => {
    await deleteBlueprint(page, blueprintName);
  });
});
