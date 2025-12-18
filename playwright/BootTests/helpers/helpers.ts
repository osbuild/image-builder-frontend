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
      `Neither repositories list nor zero state appeared: ${(error as Error).message}`,
    );
  }

  if (await zeroState.isVisible()) {
    await page.getByRole('button', { name: 'Add repositories now' }).click();
  }
};

/**
 * Navigate to the templates page in Content Sources
 * @param page - the page object
 */
export const navigateToTemplates = async (page: Page) => {
  await page.goto('/insights/content/templates');

  const templateText = page.getByText(
    'View all content templates within your organization.',
  );

  await templateText.waitFor({ state: 'visible', timeout: 30000 });
};

/**
 * Delete a template by name
 * Will navigate to the Templates page and search for the template first
 * If the template is not found, it will fail gracefully
 * @param page - the page object
 * @param templateName - the name of the template to delete
 */
export const deleteTemplate = async (page: Page, templateName: string) => {
  await closePopupsIfExist(page);
  await test.step(
    'Delete the template with name: ' + templateName,
    async () => {
      await navigateToTemplates(page);
      await page
        .getByRole('searchbox', { name: 'Filter by name' })
        .fill(templateName);

      const templateRow = page
        .getByRole('row')
        .filter({ hasText: templateName });

      try {
        await templateRow.waitFor({ state: 'visible', timeout: 10000 });
      } catch {
        // Template not found - exit gracefully (cleanup for non-existent resource)
        return;
      }

      await templateRow.getByLabel('Kebab toggle').click();
      await page.getByRole('menuitem', { name: 'Delete' }).click();
      await expect(page.getByText('Delete template?')).toBeVisible();
      await page.getByRole('button', { name: 'Delete' }).click();
    },
    { box: true },
  );
};

/**
 * Helper function for sleeping
 * @param ms - milliseconds to sleep
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract Authorization header from browser cookies
 * @param page - Playwright Page object
 * @returns Headers object with Authorization if cs_jwt cookie is found
 */
const getAuthHeaders = async (page: Page): Promise<Record<string, string>> => {
  const cookies = await page.context().cookies();
  const jwtCookie = cookies.find((c) => c.name === 'cs_jwt');
  if (jwtCookie) {
    return { Authorization: `Bearer ${jwtCookie.value}` };
  }
  return {};
};

/**
 * Poll the API to check if a system with the given hostname is attached to a template.
 * @param page - Playwright Page object
 * @param hostname - The display name of the system to check
 * @param expectedTemplateName - The expected template name (optional, if provided will verify it matches)
 * @param delayMs - Delay between polling attempts in milliseconds (default: 10000ms / 10s)
 * @param maxAttempts - Number of times to poll (default: 30)
 * @returns Promise<boolean> - true if system is attached to template, false otherwise
 */
interface PatchSystemAttributes {
  display_name: string;
  template_uuid?: string;
  template_name?: string;
}

interface PatchSystem {
  id: string;
  attributes: PatchSystemAttributes;
}

export const pollForSystemTemplateAttachment = async (
  page: Page,
  hostname: string,
  expectedTemplateName?: string,
  delayMs: number = 10_000,
  maxAttempts: number = 30,
): Promise<boolean> => {
  /* eslint-disable no-console */

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Query the systems API with search filter for the hostname
      const headers = await getAuthHeaders(page);
      const response = await page.request.get(
        `/api/patch/v3/systems?search=${encodeURIComponent(hostname)}&limit=100`,
        { headers },
      );

      if (response.status() !== 200) {
        console.log(
          `API request failed with status ${response.status()}, attempt ${attempt}/${maxAttempts}`,
        );
      } else {
        const body = await response.json();

        if (!body.data || !Array.isArray(body.data)) {
          console.log(
            `Invalid response format, attempt ${attempt}/${maxAttempts}`,
          );
        } else {
          const systems: PatchSystem[] = body.data;

          // Log all returned systems for debugging
          if (systems.length > 0) {
            console.log(
              `Patch API returned ${systems.length} system(s):`,
              systems.map((s) => ({
                id: s.id,
                display_name: s.attributes.display_name,
              })),
            );
          }

          // Find the system with matching hostname (exact match or starts with)
          const system = systems.find(
            (sys) =>
              sys.attributes.display_name === hostname ||
              sys.attributes.display_name.startsWith(hostname),
          );

          if (!system) {
            console.log(
              `System '${hostname}' not found in Patch results, attempt ${attempt}/${maxAttempts}`,
            );
          } else if (!system.attributes.template_uuid) {
            console.log(
              `System '${hostname}' is not attached to any template, attempt ${attempt}/${maxAttempts}`,
            );
          } else if (
            expectedTemplateName &&
            system.attributes.template_name !== expectedTemplateName
          ) {
            console.log(
              `System '${hostname}' is attached to template '${system.attributes.template_name}' but expected '${expectedTemplateName}', attempt ${attempt}/${maxAttempts}`,
            );
          } else {
            console.log(
              `System '${hostname}' is attached to template: ${system.attributes.template_name}`,
            );
            return true;
          }
        }
      }
    } catch (error) {
      console.log(
        `Error checking system template attachment: ${error}, attempt ${attempt}/${maxAttempts}`,
      );
    }

    // Wait before next attempt (unless this is the last attempt)
    if (attempt < maxAttempts) {
      await sleep(delayMs);
    }
  }
  /* eslint-enable no-console */

  return false;
};

/**
 * Poll the Inventory API to check if a system with the given hostname exists.
 * @param page - Playwright Page object
 * @param hostname - The hostname of the system to check
 * @param delayMs - Delay between polling attempts in milliseconds (default: 10000ms / 10s)
 * @param maxAttempts - Number of times to poll (default: 30)
 * @returns Promise<{ found: boolean; inventoryId?: string }> - found status and inventory ID if found
 */
export const pollForSystemInInventory = async (
  page: Page,
  hostname: string,
  delayMs: number = 20_000,
  maxAttempts: number = 30,
): Promise<{ found: boolean; inventoryId?: string }> => {
  /* eslint-disable no-console */
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      // Query the Inventory API with display_name parameter
      // Extract auth token from cookies for API authentication
      const headers = await getAuthHeaders(page);
      const response = await page.request.get(
        `/api/inventory/v1/hosts?display_name=${encodeURIComponent(hostname)}`,
        { headers },
      );

      if (response.status() !== 200) {
        console.log(
          `Inventory API request failed with status ${response.status()}, attempt ${attempts}/${maxAttempts}`,
        );
      } else {
        const body = await response.json();

        if (!body.results || !Array.isArray(body.results)) {
          console.log(
            `Invalid Inventory response format, attempt ${attempts}/${maxAttempts}`,
          );
        } else if (body.results.length === 0) {
          console.log(
            `System '${hostname}' not found in Inventory, attempt ${attempts}/${maxAttempts}`,
          );
        } else {
          // Log all returned systems for debugging
          console.log(
            `Inventory API returned ${body.results.length} system(s):`,
            body.results.map(
              (s: { id: string; display_name?: string; fqdn?: string }) => ({
                id: s.id,
                display_name: s.display_name,
                fqdn: s.fqdn,
              }),
            ),
          );

          // Find the system with matching hostname (exact match or starts with)
          const system = body.results.find(
            (sys: { display_name?: string; fqdn?: string }) =>
              sys.display_name === hostname ||
              sys.fqdn === hostname ||
              sys.display_name?.startsWith(hostname) ||
              sys.fqdn?.startsWith(hostname),
          );

          if (system) {
            console.log(
              `System '${hostname}' found in Inventory with ID: ${system.id}`,
            );
            return { found: true, inventoryId: system.id };
          } else {
            console.log(
              `System '${hostname}' not found in Inventory results, attempt ${attempts}/${maxAttempts}`,
            );
          }
        }
      }
    } catch (error) {
      console.log(
        `Error checking system in Inventory: ${error}, attempt ${attempts}/${maxAttempts}`,
      );
    }

    // Wait before next attempt
    if (attempts < maxAttempts) {
      await sleep(delayMs);
    }
  }
  /* eslint-enable no-console */

  return { found: false };
};
