import { expect, Page, test } from '@playwright/test';

import { closePopupsIfExist } from '../../helpers/helpers';

/**
 * Navigate to compliance policies page and search for a policy
 * @param page - the page object
 * @param policyName - the name of the compliance policy to find
 */
const searchCompliancePolicy = async (page: Page, policyName: string) => {
  await page.goto('/insights/compliance/scappolicies');
  await page.getByRole('textbox', { name: 'text input' }).fill(policyName);
  await expect(page.getByRole('row', { name: policyName })).toBeVisible();
};

/**
 * Navigate to compliance policies page, search for a policy, and optionally click on it
 * @param page - the page object
 * @param policyName - the name of the compliance policy to find
 * @param clickLink - whether to click on the policy link after finding it (default: false)
 */
export const navigateToCompliancePolicy = async (
  page: Page,
  policyName: string,
  clickLink: boolean = false,
) => {
  await searchCompliancePolicy(page, policyName);
  if (clickLink) {
    await page.getByRole('link', { name: policyName }).click();
  }
};

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
      try {
        await searchCompliancePolicy(page, policyName);
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

/**
 * Edit compliance policy to remove a specific rule
 * @param page - the page object
 * @param policyName - the name of the compliance policy to edit
 * @param ruleDisplayName - the display name pattern to look for (e.g., 'Install firewalld Package')
 */

export const removeCompliancePolicyRule = async (
  page: Page,
  policyName: string,
  ruleDisplayName: string,
) => {
  await closePopupsIfExist(page);

  await test.step(`Edit compliance policy '${policyName}' to remove rule`, async () => {
    await navigateToCompliancePolicy(page, policyName, true);

    const rulesTab = page.getByRole('tab', {
      name: 'Rules',
    });
    await expect(rulesTab.first()).toBeVisible();
    await rulesTab.first().click();
    const editRulesButton = page.getByRole('button', {
      name: 'Edit',
    });
    await expect(editRulesButton.first()).toBeVisible();
    await editRulesButton.first().click();

    const searchInput = page.getByPlaceholder('filter by name');
    await expect(searchInput.first()).toBeVisible();
    await expect(searchInput.first()).toBeEnabled();

    await searchInput.first().clear();
    await searchInput.first().fill(ruleDisplayName);

    await expect(searchInput.first()).toHaveValue(ruleDisplayName, {
      timeout: 2000,
    });

    await expect(page.getByRole('row').first()).toBeVisible();
    const ruleRow = page
      .getByRole('row')
      .filter({ hasText: ruleDisplayName })
      .first();

    await expect(ruleRow).toBeVisible();

    const checkbox = ruleRow.getByRole('checkbox').first();
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();

    const saveButton = page.getByRole('button', {
      name: 'Save',
    });
    await expect(saveButton.first()).toBeVisible();
    await expect(saveButton.first()).toBeEnabled();
    await saveButton.first().click();

    await expect(saveButton.first()).toBeHidden();
    await expect(rulesTab.first()).toBeVisible();
  });
};

/**
 * Create a compliance policy with the given name and type
 * Note: Filter doesn't work on compliance side, so we search through pages manually
 * @param page - the page object
 * @param policyName - the name of the compliance policy to create
 * @param policyType - the type/profile of the compliance policy to select
 * @param distro - the distribution to select (e.g., 'RHEL 9', 'RHEL 10')
 */
export const createCompliancePolicy = async (
  page: Page,
  policyName: string,
  policyType: string,
  distro: string = 'RHEL 9',
) => {
  await closePopupsIfExist(page);

  await test.step(`Create compliance policy: ${policyName}`, async () => {
    await page.goto('/insights/compliance/scappolicies');
    const createButton = page.getByRole('button', {
      name: 'Create new policy',
    });
    await expect(createButton).toBeVisible();
    await createButton.click();
    await page.getByRole('option', { name: distro }).click();

    // Wait for the policy type list to load before searching
    await expect(page.getByRole('gridcell').first()).toBeVisible({
      timeout: 10000,
    });

    // Check if policy exists on current page
    let policyRow = page
      .getByRole('row')
      .filter({ hasText: policyType })
      .first();

    try {
      await expect(policyRow).toBeVisible();
    } catch {
      // Policy not found on current page, try next page
      await page
        .getByRole('button', { name: 'Go to next page' })
        .nth(1)
        .click();
      // Wait for the table to load after clicking next
      await expect(page.getByRole('gridcell').first()).toBeVisible({
        timeout: 10000,
      });
      policyRow = page.getByRole('row').filter({ hasText: policyType }).first();
      await expect(policyRow).toBeVisible();
    }

    const radioButton = policyRow.getByRole('radio').first();
    await expect(radioButton).toBeVisible();
    await radioButton.click();

    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('textbox', { name: 'Policy name' }).fill(policyName);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    // Skip Systems step
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    // Skip Rules step
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
    await page
      .getByRole('button', { name: 'Return to application' })
      .click({ timeout: 2 * 60 * 1000 }); // Policy creation can take up to 2 minutes
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
