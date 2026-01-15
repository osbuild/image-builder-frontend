import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { exportedSystemdBP } from '../fixtures/data/exportBlueprintContents';
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

test('Create a blueprint with Systemd customization', async ({
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

  await test.step('Select and correctly fill all of the service fields', async () => {
    await frame.getByRole('button', { name: 'Systemd services' }).click();

    await frame
      .getByPlaceholder('Add disabled service')
      .fill('systemd-dis.service');
    await frame.getByPlaceholder('Add disabled service').press('Enter');
    await expect(frame.getByText('systemd-dis.service')).toBeVisible();

    await frame
      .getByPlaceholder('Add enabled service')
      .fill('systemd-en.service');
    await frame.getByPlaceholder('Add enabled service').press('Enter');
    await expect(frame.getByText('systemd-en.service')).toBeVisible();

    await frame
      .getByPlaceholder('Add masked service')
      .fill('systemd-m.service');
    await frame.getByPlaceholder('Add masked service').press('Enter');
    await expect(frame.getByText('systemd-m.service')).toBeVisible();
  });

  await test.step('Select and incorrectly fill all of the service fields', async () => {
    await frame.getByPlaceholder('Add disabled service').fill('&&');
    await frame.getByPlaceholder('Add disabled service').press('Enter');
    await expect(
      frame.getByText('Expected format: <service-name>. Example: sshd').nth(0),
    ).toBeVisible();

    await frame.getByPlaceholder('Add enabled service').fill('áá');
    await frame.getByPlaceholder('Add enabled service').press('Enter');
    await expect(
      frame.getByText('Expected format: <service-name>. Example: sshd').nth(1),
    ).toBeVisible();

    await frame.getByPlaceholder('Add masked service').fill('78');
    await frame.getByPlaceholder('Add masked service').press('Enter');
    await expect(
      frame.getByText('Expected format: <service-name>. Example: sshd').nth(2),
    ).toBeVisible();
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
    await frame.getByLabel('Revisit Systemd services step').click();

    await frame
      .getByPlaceholder('Add disabled service')
      .fill('disabled-service');
    await frame.getByPlaceholder('Add disabled service').press('Enter');
    await frame.getByPlaceholder('Add enabled service').fill('enabled-service');
    await frame.getByPlaceholder('Add enabled service').press('Enter');
    await frame.getByPlaceholder('Add masked service').fill('masked-service');
    await frame.getByPlaceholder('Add masked service').press('Enter');

    await frame
      .getByRole('button', { name: 'Close systemd-m.service' })
      .click();
    await frame
      .getByRole('button', { name: 'Close systemd-en.service' })
      .click();
    await frame
      .getByRole('button', { name: 'Close systemd-dis.service' })
      .click();

    await expect(frame.getByText('enabled-service')).toBeVisible();
    await expect(frame.getByText('disabled-service')).toBeVisible();
    await expect(frame.getByText('masked-service')).toBeVisible();

    await expect(frame.getByText('systemd-en.service')).toBeHidden();
    await expect(frame.getByText('systemd-dis.service')).toBeHidden();
    await expect(frame.getByText('systemd-m.service')).toBeHidden();

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
    verifyExportedBlueprint(exportedBP, exportedSystemdBP(blueprintName));
  });

  await test.step('Import BP', async () => {
    await importBlueprint(frame, exportedBP);
  });

  await test.step('Review imported BP', async () => {
    await fillInImageOutputGuest(frame);
    await frame.getByRole('button', { name: 'Systemd services' }).click();

    await expect(frame.getByText('enabled-service')).toBeVisible();
    await expect(frame.getByText('disabled-service')).toBeVisible();
    await expect(frame.getByText('masked-service')).toBeVisible();

    await expect(frame.getByText('systemd-en.service')).toBeHidden();
    await expect(frame.getByText('systemd-dis.service')).toBeHidden();
    await expect(frame.getByText('systemd-m.service')).toBeHidden();

    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
