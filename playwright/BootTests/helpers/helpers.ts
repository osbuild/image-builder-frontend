import { expect, Page, test } from '@playwright/test';

import { closePopupsIfExist } from '../../helpers/helpers';

/**
 * Delete the compliance policy with the given name
 * Will locate to the Compliance service and search for the policy first
 * If the policy is not found, it will fail gracefully
 * @param page - the page object
 * @param policyName - the name of the compliance policy to delete
 */
export const deleteCompliancePolicy = async (
  page: Page,
  policyName: string,
) => {
  // Since new browser is opened during the Compliance policy cleanup, we need to call the popup closer again
  await closePopupsIfExist(page);
  await test.step(
    'Delete the compliance policy with name: ' + policyName,
    async () => {
      await page.goto('/insights/compliance/scappolicies');
      // Check if no policies found -> that means no policy was created -> fail gracefully and do not raise error
      try {
        await page
          .getByRole('textbox', { name: 'text input' })
          .fill(policyName);
        await expect(page.getByRole('row', { name: policyName })).toBeVisible();
        await page
          .getByRole('row', { name: policyName })
          .getByLabel('Kebab toggle')
          .click({ timeout: 5_000 }); // Shorter timeout to avoid hanging uncessarily
      } catch {
        // No policy of given name was found -> fail gracefully and do not raise error
        return;
      }

      await page.getByRole('menuitem', { name: 'Delete policy' }).click();
      await page
        .getByRole('checkbox', { name: 'I understand this will delete' })
        .click();
      await page.getByRole('button', { name: 'delete' }).click();
    },
    { box: true },
  );
};

/**
 * Delete the repository with the given name
 * @param page - the page object
 * @param repositoryName - the name/URL of the repository to delete
 */
export const deleteRepository = async (
  page: Page,
  repositoryNameOrUrl: string,
) => {
  await closePopupsIfExist(page);
  await test.step(
    'Delete the repository with name: ' + repositoryNameOrUrl,
    async () => {
      try {
        await navigateToRepositories(page);
        await page
          .getByRole('textbox', { name: 'Name/URL filter' })
          .fill(repositoryNameOrUrl);
        // Wait for the repository to be filtered by checking theres only one item in the list
        // We check for list size due to the need of deleting by the name OR url and there is no better selector for that
        await expect(
          page.getByRole('button', { name: '- 1 of 1' }).first(),
        ).toBeVisible();
      } catch {
        // No repository of given name was found -> fail gracefully and do not raise error
        return;
      }

      await page.getByRole('button', { name: 'Kebab toggle' }).click();
      await page.getByRole('menuitem', { name: 'Delete' }).click();
      // Wait until the repo is loaded in the delete modal
      await expect(page.getByRole('gridcell').first()).not.toBeEmpty();
      await page.getByRole('button', { name: 'Delete' }).click();
    },
    { box: true },
  );
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Edit compliance policy to remove a specific rule
 * @param page - the page object
 * @param policyName - the name of the compliance policy to edit
 * @param ruleName - the name of the rule to remove (e.g., 'firewalld')
 * @param ruleDisplayName - the display name pattern to look for (e.g., 'Install firewalld Package')
 */
export const removeCompliancePolicyRule = async (
  page: Page,
  policyName: string,
  ruleName: string,
  ruleDisplayName: string,
) => {
  await closePopupsIfExist(page);

  await test.step(`Edit compliance policy '${policyName}' to remove ${ruleName} rule`, async () => {
    // Navigate to compliance policies
    await page.goto('/insights/compliance/scappolicies');
    await page.getByRole('textbox', { name: 'text input' }).fill(policyName);
    await expect(page.getByRole('row', { name: policyName })).toBeVisible();
    await page.getByRole('link', { name: policyName }).click();

    // Navigate to rules tab
    const rulesTab = page.getByRole('tab', {
      name: /rules|Rules|tailoring|Tailoring/i,
    });
    await expect(rulesTab.first()).toBeVisible();
    await rulesTab.first().click();

    // Enter edit mode
    const editRulesButton = page.getByRole('button', {
      name: /edit.*rules|Edit.*rules/i,
    });
    await expect(editRulesButton.first()).toBeVisible();
    await editRulesButton.first().click();

    // Wait for the rules table to load and search for the specific rule
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

    // Find and uncheck the rule
    const ruleDisplayPattern = new RegExp(escapeRegExp(ruleDisplayName), 'i');

    // Search for the rule
    await searchInput.first().clear();
    await expect(searchInput.first()).toHaveValue('', { timeout: 5000 });
    await searchInput.first().fill(ruleName);
    await expect(searchInput.first()).toHaveValue(ruleName, { timeout: 5000 });

    // Wait for table to reload after search
    await expect(tableRows.first()).toBeVisible();
    await expect(tableRows.nth(1)).toBeVisible();

    // Keep the search term in the field and wait for table to fully load
    // The search term stays in the field until the table loads
    await expect(
      page.getByText(new RegExp(escapeRegExp(ruleName), 'i')).first(),
    ).toBeVisible({
      timeout: 15000,
    });

    // Wait for the specific rule to appear
    await expect(page.getByText(ruleDisplayPattern).first()).toBeVisible({
      timeout: 15000,
    });
    const ruleRow = page
      .getByRole('row')
      .filter({ hasText: ruleDisplayPattern })
      .first();
    await expect(ruleRow).toBeVisible();

    const checkbox = ruleRow.getByRole('checkbox').first();
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked({ timeout: 5000 });

    // Save changes
    const saveButton = page.getByRole('button', {
      name: /save|Save|finish|Finish/i,
    });
    await expect(saveButton.first()).toBeVisible();
    await expect(saveButton.first()).toBeEnabled();
    await saveButton.first().click();

    // Wait for save to complete
    await expect(saveButton.first()).not.toBeVisible({ timeout: 10000 });
    await expect(
      page
        .getByRole('tab', { name: /rules|Rules|tailoring|Tailoring/i })
        .first(),
    ).toBeVisible({ timeout: 20000 });
  });
};

/**
 * Create compliance policy via UI
 * @param page - the page object
 * @param policyName - the name of the compliance policy to create
 * @param policyType - the policy type to select (e.g., 'DRAFT - CIS Red Hat Enterprise Linux 9 Benchmark for Level 2 - Workstation')
 * @param osVersion - the OS version to select (e.g., 'RHEL 9', 'RHEL 10')
 */
export const createCompliancePolicy = async (
  page: Page,
  policyName: string,
  policyType: string,
  osVersion: string = 'RHEL 9',
) => {
  await closePopupsIfExist(page);

  await test.step(`Create compliance policy '${policyName}' of type '${policyType}'`, async () => {
    // Navigate to compliance policies
    await page.goto('/insights/compliance/scappolicies');

    // Start policy creation
    await page.getByRole('button', { name: 'Create new policy' }).click();

    // Select OS version
    await expect(page.getByRole('option', { name: osVersion })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('option', { name: osVersion }).click();

    // Wait for policy types to load
    await expect(page.getByRole('gridcell').first()).toBeVisible({
      timeout: 10000,
    });

    // Search for the specific policy type
    const searchInput = page.getByRole('textbox', { name: 'text input' });
    await expect(searchInput).toBeVisible();
    await searchInput.fill(policyType);

    // Wait for and select the policy type
    await expect(
      page.getByRole('gridcell', { name: policyType }).first(),
    ).toBeVisible({ timeout: 15000 });
    await page.getByRole('radio', { name: 'Select row 0' }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Enter policy name
    await page.getByRole('textbox', { name: 'Policy name' }).fill(policyName);
    await page.getByRole('button', { name: 'Next', exact: true }).click(); // Skip "Details"
    await page.getByRole('button', { name: 'Next', exact: true }).click(); // Skip "Systems"
    await page.getByRole('button', { name: 'Next', exact: true }).click(); // Skip "Rules" for now

    // Finish policy creation
    await page.getByRole('button', { name: 'Finish' }).click();

    // Wait for policy to be created and return to compliance page
    await page
      .getByRole('button', { name: 'Return to application' })
      .click({ timeout: 2 * 60 * 1000 });

    // Verify policy was created
    await page.goto('/insights/compliance/scappolicies');
    await page.getByRole('textbox', { name: 'text input' }).fill(policyName);
    await expect(page.getByRole('row', { name: policyName })).toBeVisible({
      timeout: 10000,
    });
  });
};

/**
 * Navigate to the repositories page
 * @param page - the page object
 */
export const navigateToRepositories = async (page: Page) => {
  await page.goto('/insights/content/repositories');

  const zeroState = page.getByText('Start using Content management now');

  const repositoriesListPage = page.getByText(
    'View all repositories within your organization.',
  );

  // Wait for either list page or zerostate
  try {
    await Promise.race([
      repositoriesListPage.waitFor({ state: 'visible', timeout: 30000 }),
      zeroState.waitFor({ state: 'visible', timeout: 30000 }),
    ]);
  } catch (error) {
    throw new Error(
      `Neither repositories list nor zero state appeared: ${(error as Error)?.message}`,
    );
  }

  if (await zeroState.isVisible()) {
    await page.getByRole('button', { name: 'Add repositories now' }).click();
  }
};
