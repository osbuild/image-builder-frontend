// import * as fsPromises from 'fs/promises';
// import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import {
  deleteRepository,
  deleteTemplate,
  navigateToRepositories,
  navigateToTemplates,
} from '../BootTests/Content/helpers';
import { test } from '../fixtures/customizations';
// import { exportedLocaleBP } from '../fixtures/data/exportBlueprintContents';
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
  // exportBlueprint,
  fillInDetails,
  // fillInImageOutputGuest,
  //importBlueprint,
  registerLater,
  // verifyExportedBlueprint,
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
  const templateName = 'content-template-test-' + uuidv4().slice(0, 8);

  // Delete the blueprint after the run fixture
  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => deleteRepository(page, repositoryName));
  cleanup.add(() => deleteTemplate(page, templateName));

  await ensureAuthenticated(page);

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

  await test.step('Create a Content Template', async () => {
    await navigateToTemplates(page);
    await page.getByRole('button', { name: 'Create template' }).click();

    await page.getByRole('button', { name: 'filter OS version' }).click();
    await page.getByRole('menuitem', { name: 'RHEL 10' }).click();

    await page.getByRole('button', { name: 'filter architecture' }).click();
    await page.getByRole('menuitem', { name: 'x86_64' }).click();

    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click(); // skip additional repositories
    await page.getByRole('button', { name: 'Next', exact: true }).click(); // skip other repositories

    await expect(
      page.getByRole('heading', { name: 'Set up date', exact: true }),
    ).toBeVisible();
    await page.getByRole('radio', { name: 'Use the latest content' }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await expect(
      page.getByRole('heading', { name: 'Enter template details' }),
    ).toBeVisible();
    await page.getByPlaceholder('Enter name').fill(templateName);
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await page.getByRole('button', { name: 'Create other options' }).click();
    await page.getByRole('menuitem', { name: 'Create template only' }).click();

    // Wait for template to be created and valid
    await page
      .getByRole('searchbox', { name: 'Filter by name' })
      .fill(templateName);
    await expect(
      page
        .getByRole('row')
        .filter({ hasText: templateName })
        .getByText('Valid', { exact: true }),
    ).toBeVisible({ timeout: 180000 });
  });

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
  });

  await test.step('Check non-snapshot repository is disabled', async () => {
    await frame.getByRole('button', { name: 'Repeatable build' }).click();
    await frame
      .getByRole('radio', { name: /Enable repeatable build/i })
      .click();
    await frame.getByRole('button', { name: /clear date/i }).click();
    await frame
      .getByRole('textbox', { name: /date picker/i })
      .fill('2025-12-24');
    await frame.getByRole('button', { name: /Repositories/i }).click();
    await expect(frame.getByText(/Loading/i)).toBeHidden();
    await frame.getByRole('textbox').fill(repositoryName);
    await expect(frame.getByRole('row')).toHaveCount(3); // two base distro repos + header
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
    await frame.getByRole('button', { name: /Review and finish/i }).click();
    await expect(
      frame.getByTestId('content-expandable').getByText(/Repeatable build/i),
    ).toBeVisible();
    await expect(frame.getByText(/State as of 2025-12-24/i)).toBeVisible();
    await expect(frame.getByText(/State as of 2025-12-24/i)).toBeDisabled();
  });

  await test.step('Check Repeatable build step behaviour with 1 repo', async () => {
    await frame.getByTestId('revisit-custom-repositories').click();
    await expect(
      frame.getByRole('columnheader', { name: 'Snapshot date' }),
    ).toBeVisible();
    await frame.getByRole('textbox').fill('EPEL 10 Everything x86_64');
    await frame
      .getByRole('option', { name: 'EPEL 10 Everything x86_64' })
      .click();
    await frame.getByRole('button', { name: /Review and finish/i }).click();
    await expect(
      frame.getByTestId('content-expandable').getByText(/Repeatable build/i),
    ).toBeVisible();
    await expect(frame.getByText(/State as of 2025-12-24/i)).toBeVisible();
    await frame.getByRole('button', { name: 'Snapshot method' }).click();
    await expect(
      frame.getByText(/Repositories as of 2025-12-24/i),
    ).toBeVisible();
    await expect(frame.getByText(/Loading/i)).toBeHidden();
    await expect(
      frame.getByRole('gridcell', { name: 'EPEL 10 Everything x86_64' }),
    ).toBeVisible();
  });

  await test.step('Check Repeatable build with content template', async () => {
    await frame.getByRole('button', { name: 'Repeatable build' }).click();
    await frame.getByRole('radio', { name: /Use a content template/i }).click();
    await frame
      .getByRole('button', { name: /Select content template/i })
      .click();
    await expect(frame.getByText(/Loading/i)).toBeHidden();
    await frame.getByRole('menuitem').first().click();
    await frame.getByRole('button', { name: /Review and finish/i }).click();
    await expect(
      frame.getByTestId('content-expandable').getByText(/Repeatable build/i),
    ).toBeVisible();
    await expect(frame.getByText(/Use a content template/i)).toBeVisible();
  });

  await test.step('Select and fill the Repeatable build step', async () => {
    await frame.getByRole('button', { name: 'Repeatable build' }).click();
    await frame
      .getByRole('radio', { name: /Enable repeatable build/i })
      .click();
    await frame.getByRole('button', { name: /clear date/i }).click();
    await frame
      .getByRole('textbox', { name: /date picker/i })
      .fill('2026-01-01');
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Repeatable build' }).click(); // there is no revisit button specific to repeatable build
    await expect(
      frame.getByRole('textbox', { name: /date picker/i }),
    ).toHaveValue('2026-01-01');
    await frame.getByRole('button', { name: /today's date/i }).click();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  //  let exportedBP = '';
  //
  //  await test.step('Export BP', async () => {
  //    exportedBP = await exportBlueprint(page);
  //    cleanup.add(async () => {
  //      await fsPromises.rm(path.dirname(exportedBP), { recursive: true });
  //    });
  //  });
  //
  //  await test.step('Review exported BP', async (step) => {
  //    step.skip(
  //      isHosted(),
  //      'Only verify the contents of the exported blueprint in cockpit',
  //    );
  //    verifyExportedBlueprint(exportedBP, exportedRepeatableBuildBP(blueprintName));
  //  });
  //
  //  await test.step('Import BP', async () => {
  //    await importBlueprint(frame, exportedBP);
  //  });
  //
  // TO DO: Importing needs to be fixed first
  // await test.step('Review imported BP', async () => {
  //   await fillInImageOutputGuest(frame);
  //   await frame.getByRole('button', { name: 'Repeatable build' }).click();
  //   await expect(
  //     frame.getByRole('radio', { name: /Enable repeatable build/i }),
  //   ).toBeEnabled();
  //   await expect(
  //     frame.getByRole('textbox', { name: /date picker/i }),
  //   ).toHaveValue('2026-01-01');
  //   await frame.getByRole('button', { name: 'Cancel' }).click();
  // });
});
