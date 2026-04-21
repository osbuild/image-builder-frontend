import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/cleanup';
import { exportedFilesystemBP } from '../fixtures/data/exportBlueprintContents';
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

test('Create a blueprint with Filesystem customization', async ({
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

  await test.step('Select filesystem configuration mode', async () => {
    await frame.getByRole('button', { name: 'Advanced settings' }).click();
    await frame.getByRole('button', { name: 'Automatic partitioning' }).click();
    await frame
      .getByRole('option', { name: 'Basic filesystem partitioning' })
      .click();
  });

  await test.step('Select partitioning mode', async () => {
    const partitioningModeSelect = frame.getByRole('button', {
      name: 'Select partitioning mode',
    });
    await expect(partitioningModeSelect).toBeVisible();

    await partitioningModeSelect.click();

    await expect(
      frame.getByRole('option', {
        name: 'Default',
      }),
    ).toBeVisible();
    await expect(
      frame.getByRole('option', {
        name: 'Auto-LVM partitioning',
      }),
    ).toBeVisible();
    await expect(
      frame.getByRole('option', {
        name: 'Raw partitioning',
      }),
    ).toBeVisible();
    await expect(
      frame.getByRole('option', { name: /^LVM partitioning/ }),
    ).toBeVisible();

    await frame
      .getByRole('option', {
        name: 'Raw partitioning',
      })
      .click();
  });

  await test.step('Fill manually selected partitions', async () => {
    await expect(
      frame.getByRole('textbox', { name: 'Mount point input' }).first(),
    ).toBeDisabled();
    const closeRootButton = frame
      .getByRole('button', { name: 'Remove partition' })
      .first();
    await expect(closeRootButton).toBeDisabled();

    await frame.getByRole('button', { name: 'Add partition' }).click();
    await frame
      .getByRole('textbox', { name: 'Mount point input' })
      .last()
      .fill('/tmp/usb');
    await frame.getByPlaceholder('Define minimum size').last().fill('15');
    await frame.getByRole('button', { name: 'GiB' }).last().click();
    await frame.getByRole('option', { name: 'MiB' }).click();

    const closeTmpButton = frame
      .getByRole('button', { name: 'Remove partition' })
      .last();

    await expect(closeTmpButton).toBeEnabled();
  });

  await test.step('Review image', async () => {
    await frame.getByRole('button', { name: 'Review image' }).click();
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Advanced settings' }).click();

    await expect(
      frame.getByRole('button', {
        name: 'Basic filesystem partitioning',
      }),
    ).toBeVisible();

    await expect(
      frame.getByRole('button', {
        name: 'Raw partitioning',
      }),
    ).toBeVisible();

    await frame
      .getByRole('button', {
        name: 'Raw partitioning',
      })
      .click();
    await frame
      .getByRole('option', {
        name: 'Auto-LVM partitioning',
      })
      .click();

    const closeRootButton = frame
      .getByRole('button', { name: 'Remove partition' })
      .first();
    await expect(closeRootButton).toBeDisabled();

    const closeTmpButton = frame
      .getByRole('button', { name: 'Remove partition' })
      .last();
    await expect(closeTmpButton).toBeEnabled();

    await frame.getByPlaceholder('Define minimum size').last().fill('20');

    await frame
      .getByRole('textbox', { name: 'Mount point input' })
      .last()
      .fill('/usr/test');

    await frame
      .getByRole('textbox', { name: 'Mount point input' })
      .nth(1)
      .fill('/srv/data');

    await frame.getByRole('button', { name: 'MiB' }).click();
    await frame.getByRole('option', { name: 'GiB' }).click();

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

  await test.step('Review exported BP', async (step) => {
    step.skip(
      isHosted(),
      'Only verify the contents of the exported blueprint in cockpit',
    );
    verifyExportedBlueprint(exportedBP, exportedFilesystemBP(blueprintName));
  });

  await test.step('Import BP', async () => {
    await importBlueprint(frame, exportedBP);
  });

  await test.step('Review imported BP', async () => {
    await fillInImageOutput(frame);
    if (!isHosted()) {
      await registerLater(frame);
    }
    await frame.getByRole('textbox', { name: 'Blueprint name' }).fill('tmp');
    await frame.getByRole('button', { name: 'Advanced settings' }).click();

    await expect(
      frame.getByRole('button', {
        name: 'Basic filesystem partitioning',
      }),
    ).toBeVisible();

    await expect(
      frame.getByRole('button', {
        name: 'Auto-LVM partitioning',
      }),
    ).toBeVisible();

    const closeRootButton = frame
      .getByRole('button', { name: 'Remove partition' })
      .first();
    await expect(closeRootButton).toBeDisabled();

    const closeTmpButton = frame
      .getByRole('button', { name: 'Remove partition' })
      .last();
    await expect(closeTmpButton).toBeEnabled();

    const size = frame.getByPlaceholder('Define minimum size').last();
    await expect(size).toHaveValue('20');

    const unitButton = frame.getByRole('button', { name: 'GiB' }).last();
    await expect(unitButton).toBeVisible();

    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
