import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { exportedPackagesBP } from 'playwright/fixtures/data/exportBlueprintContents';
import { v4 as uuidv4 } from 'uuid';

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
  exportBlueprint,
  fillInDetails,
  importBlueprint,
  openWizard,
  registerLater,
  verifyExportedBlueprint,
} from '../helpers/wizardHelpers';

test('Create a blueprint with Packages customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  await test.step('Navigate to IB landing page', async () => {
    await navigateToLandingPage(page);
  });

  const frame = ibFrame(page);

  await test.step('Open Wizard', async () => {
    await openWizard(frame);
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Fill Image Output and Registration', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
  });

  await test.step('Navigate to packages step', async () => {
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();
  });

  if (!isHosted()) {
    await test.step('Verify on-premise wildcard search instructions', async () => {
      await expect(
        frame.getByRole('textbox', { name: /Search packages/i }),
      ).toBeVisible();
      await expect(
        frame.getByText(/glob using asterisk wildcards \(\*\)/i),
      ).toBeVisible();
      await expect(
        frame.getByText(
          /Search for package groups by starting your search with the '@' character/i,
        ),
      ).toBeHidden();
    });
  }

  await test.step('Add packages', async () => {
    await frame
      .getByRole('textbox', { name: 'Search packages' })
      .fill('vim-minimal');
    await frame.getByRole('option', { name: /vim-minimal/i }).click();
    await frame.getByRole('textbox', { name: 'Search packages' }).fill('bash');
    await frame.getByRole('option', { name: /bash/i }).first().click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  await test.step('Verify packages persist when navigating forward and back', async () => {
    await frame.getByRole('button', { name: 'Review image' }).click();
    await expect(
      frame.getByRole('heading', { name: /review image configuration/i }),
    ).toBeVisible();

    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();

    // Verify selected packages are still visible
    await expect(frame.getByRole('gridcell', { name: 'bash' })).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'vim-minimal' }),
    ).toBeVisible();
  });

  await test.step('Review and create blueprint', async () => {
    await frame.getByRole('button', { name: 'Review image' }).click();
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit blueprint and verify packages are displayed', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();

    await expect(frame.getByRole('gridcell', { name: 'bash' })).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'vim-minimal' }),
    ).toBeVisible();

    await frame.getByRole('textbox', { name: 'Search packages' }).fill('tmux');
    await frame.getByRole('option', { name: /tmux/i }).first().click();

    await frame.getByRole('button', { name: 'Review image' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  let exportedBP = '';

  await test.step('Export blueprint', async () => {
    exportedBP = await exportBlueprint(page);
    cleanup.add(async () => {
      await fsPromises.rm(path.dirname(exportedBP), { recursive: true });
    });
  });

  if (!isHosted()) {
    await test.step('Review exported BP', async () => {
      verifyExportedBlueprint(exportedBP, exportedPackagesBP(blueprintName));
    });
  }

  await test.step('Import blueprint', async () => {
    await importBlueprint(frame, exportedBP);
  });

  await test.step('Review imported blueprint', async () => {
    await fillInImageOutput(frame);
    if (!isHosted()) {
      await registerLater(frame);
    }
    await frame.getByRole('textbox', { name: 'Blueprint name' }).fill('tmp');
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();
    await expect(frame.getByRole('gridcell', { name: 'bash' })).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'vim-minimal' }),
    ).toBeVisible();
    await expect(frame.getByRole('gridcell', { name: 'tmux' })).toBeVisible();
    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
