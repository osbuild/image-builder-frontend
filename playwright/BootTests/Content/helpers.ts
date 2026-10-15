import test, { expect, Page } from '@playwright/test';
import { getAuthHeaders } from '@pw/helpers/apiHelpers';
import { closePopupsIfExist, sleep } from '@pw/helpers/helpers';
import { retry } from '@pw/helpers/navHelpers';

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

      // Wait for the repository list to be loaded
      await expect(page.getByText('Architecture')).toBeVisible();

      // Check if the repository is already on the repositories page
      if (
        !(await page
          .getByRole('row', { name: repositoryNameOrUrl })
          .isVisible())
      ) {
        await page
          .getByRole('textbox', { name: 'filter search' })
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
      // Wait until the delete confirmation modal is fully rendered
      await expect(page.getByRole('dialog')).toBeVisible();
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
    'Control content stability of your systems by combining repositories into templates.',
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

      // Wait for the template list to be loaded
      await expect(page.getByText('Description')).toBeVisible();

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
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.url().includes('/api/content-sources/v1/templates/') &&
            resp.request().method() === 'DELETE',
        ),
        page.getByRole('button', { name: 'Delete' }).click(),
      ]);
      expect(response.ok()).toBeTruthy();
    },
    { box: true },
  );
};

type PatchSystem = {
  id: string;
  attributes: {
    template_uuid?: string;
    template_name?: string;
  };
};

export const pollForSystemTemplateAttachment = async (
  page: Page,
  inventoryId: string,
  expectedTemplateName?: string,
  delayMs: number = 10000,
  maxAttempts: number = 30,
): Promise<boolean> => {
  /* eslint-disable no-console */
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const headers = await getAuthHeaders(page);
      const response = await page.request.get(
        `/api/patch/v3/systems/${encodeURIComponent(inventoryId)}`,
        { headers },
      );

      if (response.status() !== 200) {
        const responseBody = (await response.text()).slice(0, 1000);
        console.log(
          `Patch attachment attempt=${attempt}/${maxAttempts}: ` +
            `status=${response.status()}, inventoryId=${inventoryId}, ` +
            `outcome=request-failed, body=${responseBody}`,
        );
      } else {
        const body = await response.json();

        if (
          !body.data ||
          !body.data.attributes ||
          body.data.id !== inventoryId
        ) {
          console.log(
            `Patch attachment attempt=${attempt}/${maxAttempts}: ` +
              `status=200, inventoryId=${inventoryId}, ` +
              `responseId=${body.data?.id}, outcome=invalid-response, ` +
              `body=${JSON.stringify(body).slice(0, 2000)}`,
          );
        } else {
          const system: PatchSystem = body.data;
          if (!system.attributes.template_uuid) {
            console.log(
              `Patch attachment attempt=${attempt}/${maxAttempts}: ` +
                `status=200, inventoryId=${inventoryId}, ` +
                `templateUuid=missing, templateName=${system.attributes.template_name}, ` +
                `expectedTemplateName=${expectedTemplateName}, ` +
                `outcome=not-attached`,
            );
          } else if (
            expectedTemplateName &&
            system.attributes.template_name !== expectedTemplateName
          ) {
            console.log(
              `Patch attachment attempt=${attempt}/${maxAttempts}: ` +
                `status=200, inventoryId=${inventoryId}, ` +
                `templateUuid=${system.attributes.template_uuid}, ` +
                `templateName=${system.attributes.template_name}, ` +
                `expectedTemplateName=${expectedTemplateName}, ` +
                `outcome=wrong-template`,
            );
          } else {
            console.log(
              `Patch attachment attempt=${attempt}/${maxAttempts}: ` +
                `status=200, inventoryId=${inventoryId}, ` +
                `templateUuid=${system.attributes.template_uuid}, ` +
                `templateName=${system.attributes.template_name}, ` +
                `outcome=attached`,
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

type InventorySystem = {
  id: string;
  provider_id?: string | null;
  provider_type?: string | null;
};

export const pollForSystemInInventory = async (
  page: Page,
  instanceId: string,
  delayMs: number = 20000,
  maxAttempts: number = 30,
): Promise<{ found: boolean; inventoryId?: string }> => {
  /* eslint-disable no-console */
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      // EC2 instance IDs distinguish guests even when AWS reuses an IP and hostname.
      const headers = await getAuthHeaders(page);
      const response = await page.request.get('/api/inventory/v1/hosts', {
        headers,
        params: { provider_type: 'aws', provider_id: instanceId },
      });

      if (response.status() !== 200) {
        const responseBody = (await response.text()).slice(0, 1000);
        console.log(
          `Inventory attempt=${attempts}/${maxAttempts}: ` +
            `status=${response.status()}, instanceId=${instanceId}, ` +
            `outcome=request-failed, body=${responseBody}`,
        );
      } else {
        const body = await response.json();

        if (!body.results || !Array.isArray(body.results)) {
          console.log(
            `Inventory attempt=${attempts}/${maxAttempts}: ` +
              `status=200, instanceId=${instanceId}, ` +
              `outcome=invalid-response, body=${JSON.stringify(body).slice(0, 2000)}`,
          );
        } else if (body.results.length === 0) {
          console.log(
            `Inventory attempt=${attempts}/${maxAttempts}: ` +
              `status=200, instanceId=${instanceId}, resultCount=0, ` +
              `outcome=not-found`,
          );
        } else {
          const system = body.results.find(
            (sys: InventorySystem) =>
              sys.provider_type === 'aws' && sys.provider_id === instanceId,
          );

          if (system) {
            console.log(
              `Inventory attempt=${attempts}/${maxAttempts}: ` +
                `status=200, instanceId=${instanceId}, inventoryId=${system.id}, ` +
                `resultCount=${body.results.length}, outcome=found`,
            );
            return { found: true, inventoryId: system.id };
          } else {
            console.log(
              `Inventory attempt=${attempts}/${maxAttempts}: ` +
                `status=200, instanceId=${instanceId}, ` +
                `resultCount=${body.results.length}, ` +
                `resultIds=${body.results
                  .map(
                    (result: InventorySystem) =>
                      `${result.id}(${result.provider_type}:${result.provider_id})`,
                  )
                  .join(',')}, outcome=not-found`,
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
