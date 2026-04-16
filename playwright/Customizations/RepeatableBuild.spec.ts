import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import {
  deleteRepository,
  navigateToRepositories,
} from '../BootTests/Content/helpers';
import { test } from '../fixtures/customizations';
import { enablePreview, isHosted } from '../helpers/helpers';
import { ensureAuthenticated } from '../helpers/login';
import {
  fillInImageOutput,
  ibFrame,
  navigateToLandingPage,
} from '../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  exportBlueprint,
  importBlueprint,
} from '../helpers/wizardHelpers';

test('Create a blueprint with Repeatable build customization', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'Repeatable build is not available in the plugin');

  const blueprintName = 'test-' + uuidv4();
  const repositoryName =
    'repeatable-test-with-no-snapshot-' + uuidv4().slice(0, 8);
  const repositoryUrl =
    'https://jlsherrill.fedorapeople.org/fake-repos/really-empty/';

  // Delete the blueprint after the run fixture
  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => deleteRepository(page, repositoryName));

  await ensureAuthenticated(page);

  await enablePreview(page);
  await expect(page.getByRole('heading', { name: 'All images' })).toBeVisible({
    timeout: 30000,
  });

  // Here we want to be sure that the repository is deleted due to URL exclusivity per repository
  await deleteRepository(page, repositoryUrl);

  await test.step('Create a custom repository', async () => {
    await navigateToRepositories(page);
    await page.getByRole('button', { name: 'Add repositories' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(repositoryName);
    await page.getByRole('radio', { name: 'Introspect only' }).click();
    await page.getByRole('textbox', { name: 'URL' }).fill(repositoryUrl);
    await page.getByRole('button', { name: 'Save' }).click();
    await page
      .getByRole('textbox', { name: 'Name/URL filter' })
      .fill(repositoryName);
    await expect(
      page.getByRole('gridcell', { name: repositoryName }),
    ).toBeVisible();
  });

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  await enablePreview(page);
  const frame = ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame);
    await frame.getByRole('button', { name: 'Back' }).click();
    await frame.getByRole('radio', { name: 'Register later' }).click();
  });

  await test.step('Check non-snapshot repository is disabled', async () => {
    await frame
      .getByRole('radio', { name: /Enable repeatable build/i })
      .click();
    await frame.getByRole('button', { name: /clear date/i }).click();
    await frame
      .getByRole('textbox', { name: /date picker/i })
      .fill('2025-12-24');
    await frame.getByRole('button', { name: /Repositories/i }).click();
    await expect(frame.getByText(/Loading/i)).toBeHidden();
    await frame
      .getByRole('textbox', { name: 'Filter repositories' })
      .fill(repositoryName);
    await expect(frame.getByRole('grid').first().getByRole('row')).toHaveCount(
      3,
    ); // one base distro repo + header
    await expect(
      frame.getByRole('option', { name: repositoryName }),
    ).toBeVisible();
    await expect(
      frame.getByRole('option', { name: repositoryName }),
    ).toBeDisabled();
    await expect(
      frame.getByText(
        /This repository doesn't have snapshots enabled, so it cannot be selected./i,
      ),
    ).toBeVisible();
  });

  await test.step('Check Repeatable build step behaviour with no repos', async () => {
    await frame.getByRole('button', { name: 'Review image' }).click();
    await expect(
      frame.getByRole('heading', { name: 'Enable repeatable build' }),
    ).toBeVisible();
    await expect(frame.getByText('Dec 24, 2025')).toBeVisible();
  });

  await test.step('Check Repeatable build step behaviour with 1 repo', async () => {
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();
    await expect(
      frame.getByRole('columnheader', { name: 'Snapshot date' }),
    ).toBeVisible();
    await frame
      .getByRole('textbox', { name: 'Filter repositories' })
      .fill('EPEL 10 Everything x86_64');
    await frame
      .getByRole('option', { name: 'EPEL 10 Everything x86_64' })
      .click();
    await frame.getByRole('button', { name: 'Review image' }).click();
    await expect(
      frame.getByRole('heading', { name: 'Enable repeatable build' }),
    ).toBeVisible();
    await expect(frame.getByText('Dec 24, 2025')).toBeVisible();
    await expect(frame.getByText('EPEL 10 Everything x86_64')).toBeVisible();
  });

  await test.step('Check Repeatable build with content template', async () => {
    await frame.getByRole('button', { name: 'Base settings' }).click();
    await frame.getByRole('radio', { name: /Use a content template/i }).click();
    await frame
      .getByRole('button', { name: /Select content template/i })
      .click();
    // Wait for menu to appear (any item, including the loading spinner item),
    // then wait for the spinner to disappear before clicking.
    await expect(frame.getByRole('menuitem').first()).toBeVisible();
    await expect(frame.getByRole('progressbar')).toBeHidden();
    await frame.getByRole('menuitem').first().click();
    await frame.getByRole('button', { name: 'Review image' }).click();
    await expect(
      frame.getByRole('heading', { name: 'Enable repeatable build' }),
    ).toBeVisible();
  });

  await test.step('Select and fill the Repeatable build step', async () => {
    await frame.getByRole('button', { name: 'Base settings' }).click();
    await frame
      .getByRole('radio', { name: /Enable repeatable build/i })
      .click();
    await frame.getByRole('button', { name: /clear date/i }).click();
    await frame
      .getByRole('textbox', { name: /date picker/i })
      .fill('2026-01-01');
  });

  await test.step('Fill the BP details', async () => {
    await frame
      .getByRole('textbox', { name: 'Blueprint name' })
      .fill(blueprintName);
    await frame.getByRole('button', { name: 'Review image' }).click();
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Base settings' }).click();
    await expect(
      frame.getByRole('textbox', { name: /date picker/i }),
    ).toHaveValue('2026-01-01');
    await frame.getByRole('button', { name: /today's date/i }).click();
    await frame.getByRole('button', { name: 'Review image' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  let exportedBP = '';

  await test.step('Export BP', async () => {
    exportedBP = await exportBlueprint(page);
    cleanup.add(async () => {
      await fsPromises.rm(path.dirname(exportedBP), { recursive: true });
    });
  });

  // TODO: verify exported blueprint contents when running in cockpit
  await test.step('Import BP', async () => {
    await importBlueprint(frame, exportedBP);
  });

  await test.step('Review imported BP', async () => {
    await expect(
      frame.getByRole('radio', { name: /Enable repeatable build/i }),
    ).toBeChecked();
    const today = new Date().toISOString().split('T')[0];
    await expect(
      frame.getByRole('textbox', { name: /date picker/i }),
    ).toHaveValue(today);
    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
