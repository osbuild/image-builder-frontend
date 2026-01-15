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
  });

  await test.step('Select and fill the Kernel step', async () => {
    await frame.getByRole('button', { name: 'Kernel' }).click();
    await frame.getByRole('button', { name: 'Menu toggle' }).click();
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
    await frame.getByPlaceholder('Select kernel package').fill('new-package');
    await frame
      .getByRole('option', { name: 'Custom kernel package "new-' })
      .click();
    await expect(
      frame.getByRole('heading', { name: 'Warning alert: Custom kernel' }),
    ).toBeVisible();
    await frame.getByPlaceholder('Select kernel package').fill('');
    await frame.getByRole('button', { name: 'Menu toggle' }).click();
    await expect(
      frame.getByRole('option', { name: 'new-package' }),
    ).toBeVisible();
    await frame.getByPlaceholder('Select kernel package').fill('f');
    await expect(
      frame.getByRole('option', {
        name: '"f" is not a valid kernel package name',
      }),
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
    await frame.getByLabel('Revisit Kernel step').click();
    await frame.getByRole('button', { name: 'Menu toggle' }).click();
    await frame.getByRole('option', { name: 'kernel', exact: true }).click();
    await frame.getByPlaceholder('Add kernel argument').fill('new=argument');
    await frame.getByPlaceholder('Add kernel argument').press('Enter');
    await frame.getByRole('button', { name: 'Close xxnosmp' }).click();
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
    await expect(frame.getByPlaceholder('Select kernel package')).toHaveValue(
      'kernel',
    );
    await expect(frame.getByText('rootwait')).toBeVisible();
    await expect(frame.getByText('console=tty0')).toBeVisible();
    await expect(frame.getByText('console=ttyS0,115200...')).toBeVisible();
    await expect(frame.getByText('new=argument')).toBeVisible();
    await expect(frame.getByText('xxnosmp')).toBeHidden();
    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
