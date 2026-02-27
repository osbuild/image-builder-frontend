import { expect, Page, test } from '@playwright/test';

import { closePopupsIfExist } from '../../helpers/helpers';
import { retry } from '../../helpers/navHelpers';

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
 * Navigate to compliance policies page and search for a policy
 * @param page - the page object
 * @param policyName - the name of the compliance policy to find
 */
export const searchCompliancePolicy = async (
  page: Page,
  policyName: string,
) => {
  await navigateToCompliance(page);
  await page.getByRole('textbox', { name: 'text input' }).fill(policyName);
  await expect(page.getByRole('row', { name: policyName })).toBeVisible();
};

/**
 * Navigate to the Compliance page
 * @param page - the page object
 */
export const navigateToCompliance = async (page: Page) => {
  try {
    await navigateToComplianceFunc(page);
  } catch {
    await retry(page, navigateToComplianceFunc, 5);
  }
};

export const navigateToComplianceFunc = async (page: Page) => {
  await page.goto('/insights/compliance/scappolicies');
  await expect(
    page.getByRole('heading', { name: 'SCAP policies' }),
  ).toBeVisible({ timeout: 30000 });
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
      await navigateToCompliance(page);
      // Check if policy is already on the landing page
      if (
        !(await page
          .getByRole('row', { name: policyName })
          .getByLabel('Kebab toggle')
          .isVisible())
      ) {
        await page
          .getByRole('textbox', { name: 'text input' })
          .fill(policyName);

        await page
          .getByRole('row', { name: policyName })
          .getByLabel('Kebab toggle')
          .or(page.getByText('No matching policies found'))
          .first()
          .waitFor({ state: 'visible', timeout: 10000 });

        if (await page.getByText('No matching policies found').isVisible()) {
          // No policy found -> fail gracefully
          return;
        }
      }
      await page
        .getByRole('row', { name: policyName })
        .getByLabel('Kebab toggle')
        .click();
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
    await navigateToCompliance(page);
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
