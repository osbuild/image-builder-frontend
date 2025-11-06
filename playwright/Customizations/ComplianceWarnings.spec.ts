import { expect, type FrameLocator, type Page } from '@playwright/test';
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

// Clear the login from global setup so we can use static user
test.use({ storageState: { cookies: [], origins: [] } });

// Helper to create a simple Compliance policy (simplified version like the working test)
const createCompliancePolicy = async (page: Page, policyName: string) => {
  await page.goto('/insights/compliance/scappolicies');
  await page.getByRole('button', { name: 'Create new policy' }).click();
  await page.getByRole('option', { name: 'RHEL 10' }).click();
  await expect(page.getByRole('gridcell').first()).toBeVisible();
  await page.getByRole('radio', { name: 'Select row 0' }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('textbox', { name: 'Policy name' }).fill(policyName);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
  await page.getByRole('button', { name: 'Return to application' }).click();
};

// Simple helper to select compliance policy (like the working test)
const selectCompliancePolicy = async (
  frame: Page | FrameLocator,
  policyName: string,
) => {
  await frame.getByRole('button', { name: 'Security' }).nth(1).click();
  await frame
    .getByRole('radio', { name: 'Use a custom Compliance policy' })
    .click();
  await frame.getByRole('button', { name: 'None' }).click();
  await frame.getByRole('option', { name: policyName }).click();
  await expect(frame.getByRole('button', { name: policyName })).toBeVisible();
};

// Helper to (re-)open the blueprint view from landing page (simplified)
const openBlueprintFromLanding = async (page: Page, blueprintName: string) => {
  await navigateToLandingPage(page);
  const frame = (await ibFrame(page)) as Page | FrameLocator;
  const searchInput = frame.getByRole('textbox', { name: 'Search input' });
  await expect(searchInput).toBeVisible({ timeout: 10000 });
  await searchInput.fill(blueprintName);
  const blueprintButton = frame.locator(`button[id="${blueprintName}"]`);
  await expect(blueprintButton).toBeVisible({ timeout: 10000 });
  await blueprintButton.click();
  return frame;
};

test('Shows new warning when new package is missing after ignoring previous ones', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'Compliance is not available in the plugin');

  const blueprintName = 'hms9652-' + uuidv4();
  const policyName = 'policy-' + uuidv4();

  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => deleteCompliancePolicy(page, policyName));

  // Ensure we are authenticated like in the stable tests
  await ensureAuthenticated(page);
  await createCompliancePolicy(page, policyName);

  await navigateToLandingPage(page);
  const frame = (await ibFrame(page)) as Page | FrameLocator;

  await test.step('Create blueprint with policy and trigger initial warning (remove aide)', async () => {
    await fillInImageOutput(frame, 'qcow2', 'rhel10', 'x86_64');
    await registerLater(frame);
    await selectCompliancePolicy(frame, policyName);
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);

    const editBtn = frame.getByRole('button', { name: 'Edit blueprint' });
    await expect(editBtn).toBeVisible({ timeout: 30000 });
    await editBtn.click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();

    const packageSearch = frame.getByRole('textbox', {
      name: 'Search packages',
    });
    await packageSearch.fill('aide');
    await packageSearch.press('Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(500);
    try {
      await frame
        .getByRole('button', { name: 'Add package' })
        .first()
        .click({ timeout: 2000 });
    } catch {
      // Best-effort: package is already present or no search results
    }
    await packageSearch.clear();
    const aideRow = frame.getByRole('row').filter({ hasText: 'aide' });
    await expect(aideRow).toBeVisible({ timeout: 10000 });
    await aideRow.getByRole('button', { name: 'Remove package' }).click();

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    const saveButton = frame.getByRole('button', { name: 'Save blueprint' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await saveButton.click();
  });

  await test.step('Ignore all warnings from toolbar, then introduce a new warning (remove audit)', async () => {
    const f = await openBlueprintFromLanding(page, blueprintName);
    await expect(
      f.getByText('The selected blueprint has warnings.'),
    ).toBeVisible();
    await f.locator('#blueprint_ignore_warnings').click();
    await expect(
      f.getByText('The selected blueprint has warnings.'),
    ).toBeHidden({ timeout: 10000 });

    // Introduce a different missing package to simulate new requirement
    await f.getByRole('button', { name: 'Edit blueprint' }).click();
    await f.getByRole('button', { name: 'Additional packages' }).click();
    const packageSearch = f.getByRole('textbox', { name: 'Search packages' });
    await packageSearch.fill('audit');
    await packageSearch.press('Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(500);
    // Ensure audit present then remove
    try {
      await f
        .getByRole('button', { name: 'Add package' })
        .first()
        .click({ timeout: 2000 });
    } catch {
      // Best-effort: package is already present or no search results
    }
    await packageSearch.clear();
    const auditRow = f.getByRole('row').filter({ hasText: 'audit' });
    if (await auditRow.count()) {
      await auditRow.getByRole('button', { name: 'Remove package' }).click();
    }
    await f.getByRole('button', { name: 'Review and finish' }).click();
    const saveButton = f.getByRole('button', { name: 'Save blueprint' });
    await expect(saveButton).toBeVisible({ timeout: 30000 });
    await expect(saveButton).toBeEnabled({ timeout: 10000 });
    await saveButton.click();
  });

  await test.step('Verify new warning is shown after ignore', async () => {
    const f = await openBlueprintFromLanding(page, blueprintName);
    await expect(
      f.getByText('The selected blueprint has warnings.'),
    ).toBeVisible();
  });
});

test('Shows ignored warning again after re-adding and removing package', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'Compliance is not available in the plugin');

  const blueprintName = 'hms9653-' + uuidv4();
  const policyName = 'policy-' + uuidv4();

  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => deleteCompliancePolicy(page, policyName));

  // Ensure we are authenticated like in the stable tests
  await ensureAuthenticated(page);
  await createCompliancePolicy(page, policyName);

  await navigateToLandingPage(page);
  const frame = (await ibFrame(page)) as Page | FrameLocator;

  await test.step('Create blueprint with policy and trigger initial audit warning', async () => {
    await fillInImageOutput(frame, 'qcow2', 'rhel10', 'x86_64');
    await registerLater(frame);
    await selectCompliancePolicy(frame, policyName);
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);

    const editBtn = frame.getByRole('button', { name: 'Edit blueprint' });
    await expect(editBtn).toBeVisible({ timeout: 30000 });
    await editBtn.click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    const packageSearch = frame.getByRole('textbox', {
      name: 'Search packages',
    });
    await packageSearch.fill('audit');
    await packageSearch.press('Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(500);
    try {
      await frame
        .getByRole('button', { name: 'Add package' })
        .first()
        .click({ timeout: 2000 });
    } catch {
      // Best-effort: package is already present or no search results
    }
    await packageSearch.clear();
    const auditRow = frame.getByRole('row').filter({ hasText: 'audit' });
    await expect(auditRow).toBeVisible({ timeout: 10000 });
    await auditRow.getByRole('button', { name: 'Remove package' }).click();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    const saveButton = frame.getByRole('button', { name: 'Save blueprint' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await saveButton.click();
  });

  await test.step('Ignore warnings, add audit to clear them, then remove audit again', async () => {
    let f = await openBlueprintFromLanding(page, blueprintName);
    await expect(
      f.getByText('The selected blueprint has warnings.'),
    ).toBeVisible();
    await f.locator('#blueprint_ignore_warnings').click();
    await expect(
      f.getByText('The selected blueprint has warnings.'),
    ).toBeHidden({ timeout: 10000 });

    // Add audit -> no warning
    await f.getByRole('button', { name: 'Edit blueprint' }).click();
    await f.getByRole('button', { name: 'Additional packages' }).click();
    const packageSearch = f.getByRole('textbox', { name: 'Search packages' });
    await packageSearch.fill('audit');
    await packageSearch.press('Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(500);
    const addButton = f.getByRole('button', { name: 'Add package' }).first();
    await addButton.click();
    await f.getByRole('button', { name: 'Review and finish' }).click();
    const saveButton = f.getByRole('button', { name: 'Save blueprint' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await saveButton.click();

    // Verify no warning now
    f = await openBlueprintFromLanding(page, blueprintName);
    await expect(
      f.getByText('The selected blueprint has warnings.'),
    ).toBeHidden({ timeout: 10000 });

    // Remove audit again -> warning should reappear
    await f.getByRole('button', { name: 'Edit blueprint' }).click();
    await f.getByRole('button', { name: 'Additional packages' }).click();
    await packageSearch.clear();
    const auditRow2 = f.getByRole('row').filter({ hasText: 'audit' });
    await expect(auditRow2).toBeVisible({ timeout: 10000 });
    await auditRow2.getByRole('button', { name: 'Remove package' }).click();
    await f.getByRole('button', { name: 'Review and finish' }).click();
    const saveButton2 = f.getByRole('button', { name: 'Save blueprint' });
    await expect(saveButton2).toBeVisible({ timeout: 10000 });
    await expect(saveButton2).toBeEnabled({ timeout: 5000 });
    await saveButton2.click();
  });

  await test.step('Verify warning reappears after add → remove cycle', async () => {
    const f = await openBlueprintFromLanding(page, blueprintName);
    await expect(
      f.getByText('The selected blueprint has warnings.'),
    ).toBeVisible();
  });
});

test('Ignoring warning does not auto-fix removed package (package remains missing)', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'Compliance is not available in the plugin');

  const blueprintName = `compl-ignore-no-autofix-${uuidv4()}`;
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  // Ensure we are authenticated like in the stable tests
  await ensureAuthenticated(page);
  await navigateToLandingPage(page);
  const frame = (await ibFrame(page)) as Page | FrameLocator;

  await fillInImageOutput(frame, 'qcow2', 'rhel10', 'x86_64');
  await registerLater(frame);

  // Select any available compliance policy (simplified approach)
  await frame.getByRole('button', { name: 'Security' }).nth(1).click();
  await frame
    .getByRole('radio', { name: 'Use a custom Compliance policy' })
    .click();
  await frame.getByRole('button', { name: 'None' }).click();
  const firstOption = frame.getByRole('option').first();
  await expect(firstOption).toBeVisible();
  await firstOption.click();
  await frame.getByRole('button', { name: 'Review and finish' }).click();
  await fillInDetails(frame, blueprintName);
  await createBlueprint(frame, blueprintName);

  // Remove audit package to trigger a warning
  const editBtn = frame.getByRole('button', { name: 'Edit blueprint' });
  await expect(editBtn).toBeVisible({ timeout: 30000 });
  await editBtn.click();
  await frame.getByRole('button', { name: 'Additional packages' }).click();
  const auditRow = frame.getByRole('row').filter({ hasText: 'audit' });
  if (await auditRow.count()) {
    await auditRow.getByRole('button', { name: 'Remove package' }).click();
  }
  await frame.getByRole('button', { name: 'Review and finish' }).click();
  const saveButton = frame.getByRole('button', { name: 'Save blueprint' });
  await expect(saveButton).toBeVisible({ timeout: 10000 });
  await expect(saveButton).toBeEnabled({ timeout: 5000 });
  await saveButton.click();

  // Open the blueprint and verify warning appears
  const f = await openBlueprintFromLanding(page, blueprintName);
  await expect(
    f.getByText('audit required by policy is not present'),
  ).toBeVisible();

  // Ignore all warnings
  await f.locator('#blueprint_ignore_warnings').click();

  // Verify the package did NOT get auto-added back (still missing)
  const editBlueprintBtn = f.getByRole('button', { name: 'Edit blueprint' });
  await expect(editBlueprintBtn).toBeVisible({ timeout: 30000 });
  await editBlueprintBtn.click();
  await f.getByRole('button', { name: 'Additional packages' }).click();
  await expect(f.getByRole('row').filter({ hasText: 'audit' })).toBeHidden();
});
