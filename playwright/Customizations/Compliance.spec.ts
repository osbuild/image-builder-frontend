import { expect, type Locator, type Page } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { deleteCompliancePolicy } from '../BootTests/helpers/helpers';
import {
  selectArch,
  selectDistro,
  selectTarget,
} from '../BootTests/helpers/targetChooser';
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

// Helper to create a Compliance policy in Compliance app so that IB can select it
const createCompliancePolicy = async (
  page: import('@playwright/test').Page,
  policyName: string,
) => {
  await page.goto('/insights/compliance/scappolicies');
  await page.getByRole('button', { name: 'Create new policy' }).click();
  // Prefer RHEL 9 to align with most tests; fall back to RHEL 10 if needed
  try {
    await page.getByRole('option', { name: 'RHEL 9' }).click({ timeout: 5000 });
  } catch {
    await page.getByRole('option', { name: 'RHEL 10' }).click();
  }
  // Wait for policy type list and select first row
  await expect(page.getByRole('gridcell').first()).toBeVisible();
  await page.getByRole('radio', { name: 'Select row 0' }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('textbox', { name: 'Policy name' }).fill(policyName);
  await page.getByRole('button', { name: 'Next', exact: true }).click(); // Details
  await page.getByRole('button', { name: 'Next', exact: true }).click(); // Systems
  await page.getByRole('button', { name: 'Next', exact: true }).click(); // Rules
  await page.getByRole('button', { name: 'Finish' }).click();
  await page.getByRole('button', { name: 'Return to application' }).click();
};

// Helper to reliably select the created Compliance policy; reloads and re-enters wizard if needed (hosted only)
const selectPolicyWithRefresh = async (page: Page, policyName: string) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const frame = await ibFrame(page);
    await frame.getByRole('button', { name: 'Security' }).nth(1).click();
    await frame
      .getByRole('radio', { name: /Use a custom compliance policy/i })
      .check();
    const noneButton = frame.getByRole('button', { name: 'None' });
    if (await noneButton.isVisible().catch(() => false)) {
      await noneButton.click();
    } else {
      const toggle = frame.locator(
        '[data-ouia-component-id="compliancePolicySelect"]',
      );
      await expect(toggle).toBeVisible();
      await toggle.click();
    }
    const option = frame.getByRole('option', { name: policyName });
    try {
      await expect(option).toBeVisible({ timeout: 5000 });
      await option.click();
      return;
    } catch {
      // Close and refresh, then re-enter wizard steps to repopulate list
      try {
        await frame.getByRole('button', { name: 'Security' }).first().click();
      } catch {
        /* ignore */
      }
      if (isHosted()) {
        await page.reload();
        const newFrame = await ibFrame(page);
        await fillInImageOutput(newFrame);
        await registerLater(newFrame);
      } else {
        await page.waitForTimeout(1000);
      }
    }
  }
  throw new Error('Compliance policy not found after refresh attempts');
};

test('Create a blueprint with Compliance policy selected', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'Compliance is not available in the plugin');
  const blueprintName = 'test-' + uuidv4();
  const policyName = 'test-policy-' + uuidv4();

  // Delete the blueprint after the run fixture
  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => deleteCompliancePolicy(page, policyName));

  await ensureAuthenticated(page);

  // Ensure there is at least one Compliance policy to pick in IB
  await test.step('Create a Compliance policy', async () => {
    await createCompliancePolicy(page, policyName);
  });

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
  });

  await test.step('Select Compliance and choose created policy', async () => {
    await selectPolicyWithRefresh(page, policyName);
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
      frame.getByRole('radio', { name: /Use a custom compliance policy/i }),
    ).toBeChecked();

    // The selected policy should be shown as a button with its name
    await expect(frame.getByRole('button', { name: policyName })).toBeVisible();
  });
});

test('Shows new warning when new package is missing after ignoring previous ones', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'Compliance is not available in the plugin');

  const blueprintName = 'test-compliance-' + uuidv4();
  const policyName = 'test-policy-' + uuidv4();

  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => deleteCompliancePolicy(page, policyName));

  await ensureAuthenticated(page);

  await test.step('Create a Compliance policy', async () => {
    await createCompliancePolicy(page, policyName);
  });

  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to wizard steps', async () => {
    await frame.getByRole('button', { name: 'Create image blueprint' }).click();
    await selectDistro(frame, 'rhel9');
    await selectArch(frame, 'x86_64');
    await selectTarget(frame, 'qcow2');
    await registerLater(frame);
  });

  await test.step('Select compliance policy', async () => {
    await selectPolicyWithRefresh(page, policyName);
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill blueprint details and create', async () => {
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);
  });

  async function safeFill(locator: Locator, text: string) {
    await expect(locator).toBeVisible({ timeout: 15000 });
    for (let i = 0; i < 3; i++) {
      try {
        await locator.fill(text);
        break;
      } catch {
        await page.waitForTimeout(500);
      }
    }
  }

  async function safeClick(locator: Locator) {
    await expect(locator).toBeVisible({ timeout: 15000 });
    await locator.waitFor({ state: 'attached' });
    await locator.click();
  }

  await test.step('Remove aide package to trigger compliance warning', async () => {
    await safeClick(frame.getByRole('button', { name: 'Edit blueprint' }));
    await safeClick(frame.getByRole('button', { name: 'Additional packages' }));

    await expect(frame.locator('table')).toBeVisible({ timeout: 10000 });

    const packageSearch = frame.getByRole('textbox', {
      name: 'Search packages',
    });
    await safeFill(packageSearch, 'aide');
    await packageSearch.press('Enter');
    await page.waitForTimeout(1000);

    const addButton = frame
      .getByRole('button', { name: 'Add package' })
      .first();
    try {
      await safeClick(addButton);
      await page.waitForTimeout(500);
    } catch {
      /* empty */
    }

    await packageSearch.clear();

    const packageRow = frame.getByRole('row').filter({ hasText: 'aide' });
    await expect(packageRow).toBeVisible({ timeout: 10000 });
    await safeClick(packageRow.getByRole('button', { name: 'Remove package' }));

    await safeClick(frame.getByRole('button', { name: 'Review and finish' }));

    const saveButton = frame.getByRole('button', { name: 'Save blueprint' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await safeClick(saveButton);
  });

  await test.step('Navigate back to blueprint and verify aide warning appears', async () => {
    await navigateToLandingPage(page);

    const searchInput = frame.getByRole('textbox', { name: 'Search input' });
    await safeFill(searchInput, blueprintName);

    const blueprintButton = frame.locator(`button[id="${blueprintName}"]`);
    await safeClick(blueprintButton);

    await expect(
      frame.getByText('The selected blueprint has warnings.'),
    ).toBeVisible();
    await expect(
      frame.getByText('aide required by policy is not present'),
    ).toBeVisible();
  });

  await test.step('Ignore warnings', async () => {
    await safeClick(frame.locator('#blueprint_ignore_warnings'));
  });

  // Remove audit package for second warning
  await test.step('Remove audit package to create additional warning', async () => {
    await safeClick(frame.getByRole('button', { name: 'Edit blueprint' }));
    await safeClick(frame.getByRole('button', { name: 'Additional packages' }));

    await expect(frame.locator('table')).toBeVisible({ timeout: 10000 });

    const packageSearch = frame.getByRole('textbox', {
      name: 'Search packages',
    });
    await safeFill(packageSearch, 'audit');
    await packageSearch.press('Enter');
    await page.waitForTimeout(1000);

    const addButton = frame
      .getByRole('button', { name: 'Add package' })
      .first();
    try {
      await safeClick(addButton);
      await page.waitForTimeout(500);
    } catch {
      /* empty */
    }

    await packageSearch.clear();

    const auditPackageRow = frame.getByRole('row').filter({ hasText: 'audit' });
    if (await auditPackageRow.count()) {
      await safeClick(
        auditPackageRow.getByRole('button', { name: 'Remove package' }),
      );
    }

    await safeClick(frame.getByRole('button', { name: 'Review and finish' }));
    const saveButton = frame.getByRole('button', { name: 'Save blueprint' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await safeClick(saveButton);
  });

  await test.step('Verify new audit warning appears despite aide being ignored', async () => {
    await navigateToLandingPage(page);

    const searchInput = frame.getByRole('textbox', { name: 'Search input' });
    await safeFill(searchInput, blueprintName);

    const blueprintButton = frame.locator(`button[id="${blueprintName}"]`);
    await safeClick(blueprintButton);

    await expect(
      frame.getByText('audit required by policy is not present'),
    ).toBeVisible();
    await expect(
      frame.getByText('aide required by policy is not present'),
    ).toBeHidden();
  });
});

test('Shows ignored warning again after re-adding and removing package', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'Compliance is not available in the plugin');

  const blueprintName = 'test-compliance-cycle-' + uuidv4();
  const policyName = 'test-policy-' + uuidv4();
  // Delete the blueprint after the run
  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => deleteCompliancePolicy(page, policyName));

  // Ensure authenticated (skip login if already signed in)
  await ensureAuthenticated(page);

  await test.step('Create a Compliance policy', async () => {
    await createCompliancePolicy(page, policyName);
  });

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to wizard steps', async () => {
    await frame.getByRole('button', { name: 'Create image blueprint' }).click();
    await selectDistro(frame, 'rhel9');
    await selectArch(frame, 'x86_64');
    await selectTarget(frame, 'qcow2');
    await registerLater(frame);
  });

  await test.step('Select compliance policy', async () => {
    await expect(
      frame.getByRole('button', { name: 'Security' }).nth(1),
    ).toBeVisible();
    await frame.getByRole('button', { name: 'Security' }).nth(1).click();
    await frame
      .getByRole('radio', { name: /Use a custom compliance policy/i })
      .check();
    const noneButton = frame.getByRole('button', { name: 'None' });
    if (await noneButton.isVisible()) {
      await noneButton.click();
    } else {
      const toggle = frame.locator(
        '[data-ouia-component-id="compliancePolicySelect"]',
      );
      await expect(toggle).toBeVisible();
      await toggle.click();
    }
    await frame.getByRole('option', { name: policyName }).click();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill blueprint details and create', async () => {
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Remove audit package to trigger compliance warning', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();

    // Wait for packages table to load
    await expect(frame.locator('table')).toBeVisible({ timeout: 10000 });

    // Ensure audit package exists by adding it first
    const packageSearch = frame.getByRole('textbox', {
      name: 'Search packages',
    });
    await packageSearch.fill('audit');
    await packageSearch.press('Enter');
    await page.waitForTimeout(2000);

    // Try to add audit package if search results appear
    const addButton = frame
      .getByRole('button', { name: 'Add package' })
      .first();
    try {
      await addButton.click({ timeout: 5000 });
      await page.waitForTimeout(1000);
    } catch {
      // Package might already be added
    }

    // Clear search to see added packages
    await packageSearch.clear();

    // Now try to remove audit package
    const packageRow = frame.getByRole('row').filter({ hasText: 'audit' });
    if (await packageRow.count()) {
      await packageRow.getByRole('button', { name: 'Remove package' }).click();
    }

    await frame.getByRole('button', { name: 'Review and finish' }).click();

    // Wait for Save button to be available and enabled
    const saveButton = frame.getByRole('button', { name: 'Save blueprint' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await saveButton.click();

    // Wait for save to complete and navigation back to blueprint list
    await page.waitForTimeout(2000);
  });

  await test.step('Navigate back to blueprint and verify audit warning appears', async () => {
    await navigateToLandingPage(page);

    // Wait for landing page to load completely
    await page.waitForTimeout(2000);

    const searchInput = frame.getByRole('textbox', { name: 'Search input' });
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill(blueprintName);

    const blueprintButton = frame.locator(`button[id="${blueprintName}"]`);
    await expect(blueprintButton).toBeVisible({ timeout: 10000 });
    await blueprintButton.click();

    await expect(
      frame.getByText('The selected blueprint has warnings.'),
    ).toBeVisible();
    await expect(
      frame.getByText('audit required by policy is not present'),
    ).toBeVisible();
  });

  test('Ignoring warning does not auto-fix removed package (package remains missing)', async ({
    page,
    cleanup,
  }) => {
    test.skip(!isHosted(), 'Compliance is not available in the plugin');

    const blueprintName = `compl-ignore-no-autofix-${uuidv4()}`;
    await cleanup.add(() => deleteBlueprint(page, blueprintName));

    await ensureAuthenticated(page);
    await navigateToLandingPage(page);
    const frame = await ibFrame(page);

    await fillInImageOutput(frame);
    await registerLater(frame);

    // Select any available compliance policy
    await frame.getByRole('button', { name: 'Security' }).nth(1).click();
    await frame
      .getByRole('radio', { name: 'Use a custom Compliance policy' })
      .check();
    const toggle = frame.locator(
      '[data-ouia-component-id="compliancePolicySelect"]',
    );
    await expect(toggle).toBeVisible();
    await toggle.click();
    const firstOption = frame.getByRole('option').first();
    await expect(firstOption).toBeVisible();
    await firstOption.click();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);

    // Remove audit package to trigger a warning
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    const auditRow = frame.getByRole('row').filter({ hasText: 'audit' });
    if (await auditRow.count()) {
      await auditRow.getByRole('button', { name: 'Remove package' }).click();
    }
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    // Wait for Save button to be available and enabled
    const saveButton = frame.getByRole('button', { name: 'Save blueprint' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await saveButton.click();

    // Wait for save to complete and navigation back to blueprint list
    await page.waitForTimeout(2000);

    // Open the blueprint and verify warning appears
    await navigateToLandingPage(page);

    // Wait for landing page to load completely
    await page.waitForTimeout(2000);

    const searchInput = frame.getByRole('textbox', { name: 'Search input' });
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill(blueprintName);

    const blueprintButton = frame.locator(`button[id="${blueprintName}"]`);
    await expect(blueprintButton).toBeVisible({ timeout: 10000 });
    await blueprintButton.click();
    await expect(
      frame.getByText('audit required by policy is not present'),
    ).toBeVisible();

    // Ignore all warnings
    await frame.locator('#blueprint_ignore_warnings').click();

    // Verify the package did NOT get auto-added back (still missing)
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await expect(
      frame.getByRole('row').filter({ hasText: 'audit' }),
    ).toBeHidden();
  });

  await test.step('Ignore warnings', async () => {
    await frame.locator('#blueprint_ignore_warnings').click();
  });

  await test.step('Add audit package back to fix compliance', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();

    const packageSearch = frame.getByRole('textbox', {
      name: 'Search packages',
    });
    await packageSearch.fill('audit');
    await packageSearch.press('Enter');
    await page.waitForTimeout(2000);

    const addButton = frame
      .getByRole('button', { name: 'Add package' })
      .first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    // Wait for Save button to be available and enabled
    const saveButton = frame.getByRole('button', { name: 'Save blueprint' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await saveButton.click();

    // Wait for save to complete and navigation back to blueprint list
    await page.waitForTimeout(2000);
  });

  await test.step('Verify no warnings appear when audit package is present', async () => {
    await navigateToLandingPage(page);

    // Wait for landing page to load completely
    await page.waitForTimeout(2000);

    const searchInput = frame.getByRole('textbox', { name: 'Search input' });
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill(blueprintName);

    const blueprintButton = frame.locator(`button[id="${blueprintName}"]`);
    await expect(blueprintButton).toBeVisible({ timeout: 10000 });
    await blueprintButton.click();

    await expect(
      frame.getByText('audit required by policy is not present'),
    ).toBeHidden();
  });

  await test.step('Remove audit package again', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();

    const packageRow = frame.getByRole('row').filter({ hasText: 'audit' });
    if (await packageRow.count()) {
      await packageRow.getByRole('button', { name: 'Remove package' }).click();
    }

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    // Wait for Save button to be available and enabled
    const saveButton = frame.getByRole('button', { name: 'Save blueprint' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await saveButton.click();

    // Wait for save to complete and navigation back to blueprint list
    await page.waitForTimeout(2000);
  });

  await test.step('Verify warning reappears after removing package again', async () => {
    await navigateToLandingPage(page);

    // Wait for landing page to load completely
    await page.waitForTimeout(2000);

    const searchInput = frame.getByRole('textbox', { name: 'Search input' });
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill(blueprintName);

    const blueprintButton = frame.locator(`button[id="${blueprintName}"]`);
    await expect(blueprintButton).toBeVisible({ timeout: 10000 });
    await blueprintButton.click();

    await expect(
      frame.getByText('audit required by policy is not present'),
    ).toBeVisible();
  });
});
