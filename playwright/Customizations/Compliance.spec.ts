import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

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

  await test.step('Select Compliance and choose a policy if available', async () => {
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
      frame.getByRole('radio', { name: 'Use a custom Compliance policy' }),
    ).toBeChecked();

    const toggle = frame.locator(
      '[data-ouia-component-id="compliancePolicySelect"]',
    );
    await toggle.click();
    const policyOption = frame.getByRole('option', {
      name: /placehollder/i,
    });
    await expect(policyOption).toBeVisible();
  });
});

test('Shows new warning when new package is missing after ignoring previous ones', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'Compliance is not available in the plugin');

  const blueprintName = 'test-compliance-' + uuidv4();
  // Delete the blueprint after the run
  await cleanup.add(() => deleteBlueprint(page, blueprintName)); // Ensure authenticated (skip login if already signed in)
  await ensureAuthenticated(page);

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
    const toggle = frame.locator(
      '[data-ouia-component-id="compliancePolicySelect"]',
    );
    // Ensure custom policy is selected so the toggle becomes enabled
    await frame
      .getByRole('radio', { name: 'Use a custom Compliance policy' })
      .check();
    await expect(toggle).toBeVisible();
    await toggle.click();
    await frame.getByRole('option').first().click();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill blueprint details and create', async () => {
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Remove aide package to trigger compliance warning', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();

    const packageRow = frame.getByRole('row').filter({ hasText: 'aide' });
    await packageRow.getByRole('button', { name: 'Remove package' }).click();

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame.getByRole('button', { name: 'Save blueprint' }).click();
  });

  await test.step('Navigate back to blueprint and verify aide warning appears', async () => {
    await navigateToLandingPage(page);
    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    await frame.locator(`button[id="${blueprintName}"]`).click();

    await expect(
      frame.getByText('The selected blueprint has warnings.'),
    ).toBeVisible();
    await expect(
      frame.getByText('aide required by policy is not present'),
    ).toBeVisible();
  });

  await test.step('Ignore warnings', async () => {
    await frame.locator('#blueprint_ignore_warnings').click();
  });

  await test.step('Remove audit package to create additional warning', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();

    const auditPackageRow = frame.getByRole('row').filter({ hasText: 'audit' });
    if (await auditPackageRow.count()) {
      await auditPackageRow
        .getByRole('button', { name: 'Remove package' })
        .click();
    }

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame.getByRole('button', { name: 'Save blueprint' }).click();
  });

  await test.step('Verify new audit warning appears despite aide being ignored', async () => {
    await navigateToLandingPage(page);
    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    await frame.locator(`button[id="${blueprintName}"]`).click();

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
  // Delete the blueprint after the run
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  // Ensure authenticated (skip login if already signed in)
  await ensureAuthenticated(page);

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
    const toggle = frame.locator(
      '[data-ouia-component-id="compliancePolicySelect"]',
    );
    await frame
      .getByRole('radio', { name: 'Use a custom Compliance policy' })
      .check();
    await expect(toggle).toBeVisible();
    await toggle.click();
    await frame.getByRole('option').first().click();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill blueprint details and create', async () => {
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Remove audit package to trigger compliance warning', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();

    const packageRow = frame.getByRole('row').filter({ hasText: 'audit' });
    if (await packageRow.count()) {
      await packageRow.getByRole('button', { name: 'Remove package' }).click();
    }

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame.getByRole('button', { name: 'Save blueprint' }).click();
  });

  await test.step('Navigate back to blueprint and verify audit warning appears', async () => {
    await navigateToLandingPage(page);
    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    await frame.locator(`button[id="${blueprintName}"]`).click();

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
    await frame.getByRole('button', { name: 'Save blueprint' }).click();

    // Open the blueprint and verify warning appears
    await navigateToLandingPage(page);
    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    await frame.locator(`button[id="${blueprintName}"]`).click();
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

    await frame.getByRole('textbox', { name: 'Search packages' }).fill('audit');
    await frame.getByRole('button', { name: 'Add package audit' }).click();

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame.getByRole('button', { name: 'Save blueprint' }).click();
  });

  await test.step('Verify no warnings appear when audit package is present', async () => {
    await navigateToLandingPage(page);
    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    await frame.locator(`button[id="${blueprintName}"]`).click();

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
    await frame.getByRole('button', { name: 'Save blueprint' }).click();
  });

  await test.step('Verify warning reappears after removing package again', async () => {
    await navigateToLandingPage(page);
    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    await frame.locator(`button[id="${blueprintName}"]`).click();

    await expect(
      frame.getByText('audit required by policy is not present'),
    ).toBeVisible();
  });
});
