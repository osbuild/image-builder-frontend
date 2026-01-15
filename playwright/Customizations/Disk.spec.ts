import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/cleanup';
import { exportedDiskBP } from '../fixtures/data/exportBlueprintContents';
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
  fillInImageOutputGuest,
  importBlueprint,
  registerLater,
  verifyExportedBlueprint,
} from '../helpers/wizardHelpers';

test('Create a blueprint with Disk customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  // Login, navigate to IB and get the frame
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
  });

  await test.step('Check basic structure of advanced partitioning', async () => {
    await frame
      .getByRole('button', { name: 'File system configuration' })
      .click();
    await frame
      .getByRole('radio', { name: 'Advanced disk partitioning' })
      .click();

    await expect(
      frame.getByRole('checkbox', {
        name: /Select partitioning mode/i,
      }),
    ).toBeHidden();

    await expect(
      frame.getByRole('button', {
        name: /add plain partition/i,
      }),
    ).toBeVisible();
    await expect(
      frame.getByRole('button', {
        name: /add lvm volume group/i,
      }),
    ).toBeVisible();
  });

  await test.step('Fill in some partitions and add a volume group', async () => {
    await frame.getByRole('button', { name: 'Add plain partition' }).click();
    await frame
      .getByRole('gridcell', { name: '/home' })
      .getByPlaceholder('Define mount point')
      .fill('/var/usb');

    await frame.getByPlaceholder('Define minimum size').nth(1).fill('10');
    await frame.getByRole('button', { name: 'GiB' }).nth(1).click();
    await frame.getByRole('option', { name: 'KiB' }).click();

    await frame.getByRole('button', { name: 'Add LVM volume group' }).click();
    await expect(
      frame.getByRole('row').nth(1).getByRole('button').nth(3),
    ).toBeEnabled();

    await frame
      .getByRole('textbox', { name: 'Volume group name input' })
      .fill('vg-name');
    await frame
      .getByRole('textbox', { name: 'minimum partition size' })
      .nth(1)
      .fill('10');
    await frame.getByRole('button', { name: 'GiB' }).nth(1).click();
    await frame.getByRole('option', { name: 'KiB' }).click();

    await frame
      .getByRole('textbox', { name: 'Partition name input' })
      .fill('lv1');
    await frame.getByRole('button', { name: 'Add logical volume' }).click();
    await frame
      .getByRole('gridcell', { name: /\/home/ })
      .getByPlaceholder('Define mount point')
      .nth(1)
      .fill('/tmp/usb');

    await frame
      .getByRole('row', {
        name: 'Draggable row draggable button /tmp/usb xfs 1 GiB',
      })
      .getByLabel('Partition name input')
      .fill('lv2');
    await frame
      .getByRole('row', {
        name: 'Draggable row draggable button lv2 /tmp/usb xfs 1 GiB',
      })
      .getByPlaceholder('Define minimum size')
      .fill('10');
    await frame.getByRole('button', { name: 'GiB' }).nth(2).click();
    await frame.getByRole('option', { name: 'KiB' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByLabel('Revisit File system configuration step').click();

    const removeRootButton = frame
      .getByRole('row')
      .nth(1)
      .getByRole('button')
      .nth(3);
    await expect(removeRootButton).toBeEnabled();

    const secondRow = frame.getByRole('row').nth(2);

    const removeTmpButton = secondRow.getByRole('button').nth(3);
    await expect(removeTmpButton).toBeEnabled();

    await expect(
      secondRow
        .getByRole('gridcell', { name: '/var/usb' })
        .getByPlaceholder('Define mount point'),
    ).toBeVisible();

    await secondRow
      .getByRole('gridcell', { name: '10', exact: true })
      .getByPlaceholder('Define minimum size')
      .fill('5');

    await secondRow
      .getByRole('gridcell', { name: '/var/usb' })
      .getByPlaceholder('Define mount point')
      .fill('/srv/data');

    await secondRow.getByRole('button', { name: 'KiB' }).click();
    await frame.getByRole('option', { name: 'MiB' }).click();

    await frame
      .getByRole('textbox', { name: 'Volume group name input' })
      .fill('vg-edited-name');
    await frame
      .getByRole('textbox', { name: 'Partition name input' })
      .nth(1)
      .fill('lv2-edited');

    await frame.getByRole('button', { name: 'xfs' }).nth(1).click();
    await frame.getByRole('option', { name: 'ext4' }).click();

    await frame.getByRole('button', { name: 'Review and finish' }).click();
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
    verifyExportedBlueprint(exportedBP, exportedDiskBP(blueprintName));
  });

  await test.step('Import BP', async () => {
    await importBlueprint(frame, exportedBP);
  });

  await test.step('Review imported BP', async () => {
    await fillInImageOutputGuest(frame);
    await frame
      .getByRole('button', { name: 'File system configuration' })
      .click();

    const removeRootButton = frame
      .getByRole('row')
      .nth(1)
      .getByRole('button')
      .nth(3);

    await expect(removeRootButton).toBeEnabled();

    const secondRow = frame.getByRole('row').nth(2);

    const removeTmpButton = secondRow.getByRole('button').nth(3);
    await expect(removeTmpButton).toBeEnabled();

    await expect(
      secondRow
        .getByRole('gridcell', { name: '/srv/data' })
        .getByPlaceholder('Define mount point'),
    ).toBeVisible();

    const size = secondRow.getByPlaceholder('Define minimum size');
    await expect(size).toHaveValue('5');

    const typeButton = secondRow.getByRole('button', { name: 'ext4' });
    await expect(typeButton).toBeVisible();

    const unitButton = secondRow.getByRole('button', { name: 'MiB' });
    await expect(unitButton).toBeVisible();

    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
