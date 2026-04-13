import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { exportedKernelBP } from '../fixtures/data/exportBlueprintContents';
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

test('Create a blueprint with Kernel customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
    await frame.getByRole('button', { name: 'Kernel' }).click();
  });

  await test.step('Shows all chips when 4 or fewer', async () => {
    const argInput = frame.getByPlaceholder('Add kernel argument');
    for (const arg of ['nosmp', 'rootwait', 'quiet', 'splash']) {
      await argInput.fill(arg);
      await page.keyboard.press('Enter');
    }

    await expect(frame.getByText('nosmp')).toBeVisible();
    await expect(frame.getByText('rootwait')).toBeVisible();
    await expect(frame.getByText('quiet')).toBeVisible();
    await expect(frame.getByText('splash')).toBeVisible();
    await expect(frame.getByText(/^\d+ more$/)).toBeHidden();
  });

  await test.step('Collapses and shows "X more" when more than 4', async () => {
    const argInput = frame.getByPlaceholder('Add kernel argument');
    for (const arg of ['console=tty0', 'debug']) {
      await argInput.fill(arg);
      await page.keyboard.press('Enter');
    }

    await expect(frame.getByText('nosmp')).toBeVisible();
    await expect(frame.getByText('console=tty0')).toBeHidden();
    await expect(frame.getByText('debug')).toBeHidden();
    await expect(frame.getByText('2 more')).toBeVisible();
  });

  await test.step('Expands when clicking "X more" and collapses with "Show less"', async () => {
    await frame.getByText('2 more').click();
    await expect(frame.getByText('console=tty0')).toBeVisible();
    await expect(frame.getByText('debug')).toBeVisible();
    await expect(frame.getByText('Show less')).toBeVisible();

    await frame.getByText('Show less').click();
    await expect(frame.getByText('console=tty0')).toBeHidden();
    await expect(frame.getByText('debug')).toBeHidden();
    await expect(frame.getByText('2 more')).toBeVisible();
  });

  await test.step('Collapse controls disappear when items drop below threshold', async () => {
    await frame.getByText('2 more').click();

    await frame.getByRole('button', { name: 'Remove debug' }).click();
    await frame.getByRole('button', { name: 'Remove console=tty0' }).click();

    await expect(frame.getByText(/^\d+ more$/)).toBeHidden();
    await expect(frame.getByText('Show less')).toBeHidden();
    await expect(frame.getByText('nosmp')).toBeVisible();
    await expect(frame.getByText('rootwait')).toBeVisible();
    await expect(frame.getByText('quiet')).toBeVisible();
    await expect(frame.getByText('splash')).toBeVisible();
  });

  await test.step('Clean up chip collapse test chips', async () => {
    await frame.getByRole('button', { name: 'Remove splash' }).click();
    await frame.getByRole('button', { name: 'Remove quiet' }).click();
    await frame.getByRole('button', { name: 'Remove nosmp' }).click();
    await frame.getByRole('button', { name: 'Remove rootwait' }).click();
  });

  await test.step('Select and fill the Kernel step', async () => {
    await frame.getByRole('button', { name: 'Select default kernel' }).click();
    await frame.getByRole('option', { name: 'kernel', exact: true }).click();
    await frame.getByPlaceholder('Add kernel argument').fill('rootwait');
    await frame.getByPlaceholder('Add kernel argument').press('Enter');
    await frame
      .getByPlaceholder('Add kernel argument')
      .fill('invalid$argument');
    await frame.getByPlaceholder('Add kernel argument').press('Enter');
    await expect(
      frame.getByText(
        'Expected format: <kernel-argument>. Example: console=tty0',
      ),
    ).toBeVisible();
    await frame.getByPlaceholder('Add kernel argument').fill('console=tty0');
    await frame.getByPlaceholder('Add kernel argument').press('Enter');
    await frame.getByPlaceholder('Add kernel argument').fill('xxnosmp');
    await frame.getByPlaceholder('Add kernel argument').press('Enter');
    await frame
      .getByPlaceholder('Add kernel argument')
      .fill('console=ttyS0,115200n8');
    await frame.getByPlaceholder('Add kernel argument').press('Enter');
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
    await frame.getByRole('button', { name: 'Kernel' }).click();
    await frame.getByRole('button', { name: 'kernel', exact: true }).click();
    await frame.getByRole('option', { name: 'kernel-debug' }).click();
    await frame.getByPlaceholder('Add kernel argument').fill('new=argument');
    await frame.getByPlaceholder('Add kernel argument').press('Enter');
    await frame.getByRole('button', { name: 'Remove xxnosmp' }).click();
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
    verifyExportedBlueprint(exportedBP, exportedKernelBP(blueprintName));
  });

  await test.step('Import BP', async () => {
    await importBlueprint(frame, exportedBP);
  });

  await test.step('Review imported BP', async () => {
    await fillInImageOutputGuest(frame);
    await frame.getByRole('button', { name: 'Kernel' }).click();
    await expect(
      frame.getByRole('button', { name: 'kernel-debug' }),
    ).toBeVisible();
    await expect(frame.getByText('rootwait')).toBeVisible();
    await expect(frame.getByText('console=tty0')).toBeVisible();
    await expect(frame.getByText('console=ttyS0,115200')).toBeVisible(); //truncated
    await expect(frame.getByText('new=argument')).toBeVisible();
    await expect(frame.getByText('xxnosmp')).toBeHidden();
    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
