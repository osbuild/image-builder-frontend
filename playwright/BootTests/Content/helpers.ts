import test, { expect, Page } from '@playwright/test';

import { getAuthHeaders } from '../../helpers/apiHelpers';
import { closePopupsIfExist, sleep } from '../../helpers/helpers';
import { retry } from '../../helpers/navHelpers';

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
      await navigateToRepositories(page);

      // Check if the repository is already on the repositories page
      if (
        !(await page
          .getByRole('row', { name: repositoryNameOrUrl })
          .isVisible())
      ) {
        await page
          .getByRole('textbox', { name: 'Name/URL filter' })
          .fill(repositoryNameOrUrl);

        await page
          .getByRole('row', { name: repositoryNameOrUrl })
          .or(page.getByText('No repositories match the filter criteria'))
          .first()
          .waitFor({ state: 'visible', timeout: 10000 });

        if (
          await page
            .getByText('No repositories match the filter criteria')
            .isVisible()
        ) {
          // No repository found -> fail gracefully
          return;
        }
      }

      await page
        .getByRole('row', { name: repositoryNameOrUrl })
        .getByLabel('Kebab toggle')
        .click();
      await page.getByRole('menuitem', { name: 'Delete' }).click();
      // Wait until the repo is loaded in the delete modal
      await expect(page.getByRole('gridcell').first()).not.toBeEmpty();
      await page.getByRole('button', { name: 'Delete' }).click();
    },
    { box: true },
  );
};

/**
 * Navigate to the repositories page
 * @param page - the page object
 */
export const navigateToRepositories = async (page: Page) => {
  try {
    await navigateToRepositoriesFunc(page);
  } catch {
    await retry(page, navigateToRepositoriesFunc, 5);
  }
};

export const navigateToRepositoriesFunc = async (page: Page) => {
  await page.goto('/insights/content/repositories');

  const zeroState = page.getByText('Start using Content management now');

  const repositoriesListPage = page.getByText(
    'View all repositories within your organization.',
  );

  // Wait for either list page or zerostate
  try {
    await Promise.race([
      repositoriesListPage.waitFor({ state: 'visible', timeout: 15000 }),
      zeroState.waitFor({ state: 'visible', timeout: 15000 }),
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
  try {
    await navigateToTemplatesFunc(page);
  } catch {
    await retry(page, navigateToTemplatesFunc, 5);
  }
};

export const navigateToTemplatesFunc = async (page: Page) => {
  await page.goto('/insights/content/templates');

  const templateText = page.getByText(
    'View all content templates within your organization.',
  );

  await expect(templateText).toBeVisible({ timeout: 15000 });
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
      if (!(await page.getByRole('row', { name: templateName }).isVisible())) {
        await page
          .getByRole('searchbox', { name: 'Filter by name' })
          .fill(templateName);

        await page
          .getByRole('row', { name: templateName })
          .or(page.getByText('No templates match the filter criteria'))
          .first()
          .waitFor({ state: 'visible', timeout: 10000 });

        if (
          await page
            .getByText('No templates match the filter criteria')
            .isVisible()
        ) {
          // No template found -> fail gracefully
          return;
        }
      }

      await page
        .getByRole('row', { name: templateName })
        .getByLabel('Kebab toggle')
        .click();
      await page.getByRole('menuitem', { name: 'Delete' }).click();
      await expect(page.getByText('Delete template?')).toBeVisible();
      await page.getByRole('button', { name: 'Delete' }).click();
    },
    { box: true },
  );
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
  delayMs: number = 10000,
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
  delayMs: number = 20000,
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
