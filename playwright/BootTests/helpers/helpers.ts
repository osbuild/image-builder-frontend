import { Page, test } from '@playwright/test';

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
 * @param repositoryName - the name of the repository to delete
 */
export const deleteRepository = async (page: Page, repositoryName: string) => {
  await closePopupsIfExist(page);
  await test.step(
    'Delete the repository with name: ' + repositoryName,
    async () => {
      // Check if no repository found -> that means no repository was created -> fail gracefully and do not raise error
      try {
        await navigateToRepositories(page);
        await page
          .getByRole('textbox', { name: 'Name/URL filter' })
          .fill(repositoryName);
        await expect(
          page.getByRole('gridcell', { name: repositoryName }),
        ).toBeVisible();
        await page
          .getByRole('button', { name: 'Kebab toggle' })
          .click({ timeout: 5_000 }); // Shorter timeout to avoid hanging uncessarily
      } catch {
        // No repository of given name was found -> fail gracefully and do not raise error
        return;
      }

      await page.getByRole('menuitem', { name: 'Delete' }).click();
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
