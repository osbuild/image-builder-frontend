import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { IMPORT_WITH_DUPLICATE_VALUES } from '../fixtures/data/importFileContents';
import { ensureAuthenticated } from '../helpers/login';
import { ibFrame, navigateToLandingPage } from '../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  fillInDetails,
  importBlueprint,
  registerLater,
  saveBlueprintFileWithContents,
} from '../helpers/wizardHelpers';

test('Import a blueprint with invalid customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Import BP', async () => {
    const blueprintFile = await saveBlueprintFileWithContents(
      IMPORT_WITH_DUPLICATE_VALUES,
    );
    await cleanup.add(async () => {
      await fsPromises.rm(path.dirname(blueprintFile), { recursive: true });
    });
    await importBlueprint(frame, blueprintFile);
  });

  await test.step('Navigate to optional steps in Wizard', async () => {
    await frame.getByRole('checkbox', { name: 'Virtualization' }).click();
    await frame.getByRole('button', { name: 'Next' }).click();
    await registerLater(frame);
  });

  await test.step('Select the File System Configuration step', async () => {
    await frame
      .getByLabel('Wizard steps')
      .getByRole('button', { name: 'File system configuration' })
      .click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
    await frame
      .getByRole('heading', { name: 'Danger alert: Duplicate mount' })
      .first()
      .click();
    const closeRootButton = frame
      .locator('td:nth-child(7) > .pf-v6-c-button')
      .first();
    await expect(closeRootButton).toBeEnabled();
    await closeRootButton.click();
    const closeRootButton2 = frame
      .getByRole('row', {
        name: 'Draggable row draggable button / xfs 10 GiB',
      })
      .getByRole('button')
      .nth(3);
    await expect(closeRootButton2).toBeDisabled();
  });

  await test.step('Select the Timezone step', async () => {
    await frame.getByRole('button', { name: 'error Timezone' }).click();
    await expect(frame.getByText('Includes duplicate NTP')).toBeVisible();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
    await frame.getByRole('button', { name: 'Close ntp/' }).first().click();
    await frame.getByRole('button', { name: 'Next' }).click();

    await expect(frame.getByText('Unknown languages: random:')).toBeVisible();
    await expect(frame.getByText('Duplicated languages: af_ZA.')).toBeVisible();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
    await frame.getByRole('button', { name: 'Close random' }).click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
    await frame
      .getByRole('button', { name: 'Close Afrikaans - South' })
      .nth(1)
      .click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  await test.step('Select the Firewall step', async () => {
    await frame.getByRole('button', { name: 'error Firewall' }).click();
    await expect(frame.getByText('Includes duplicate ports:')).toBeVisible();
    await expect(frame.getByText('Includes duplicate enabled')).toBeVisible();
    await expect(frame.getByText('Includes duplicate disabled')).toBeVisible();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
    await frame
      .getByRole('button', { name: 'Close 2020:port' })
      .first()
      .click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
    await frame.getByRole('button', { name: 'Close service1' }).first().click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
    await frame.getByRole('button', { name: 'Close service2' }).first().click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  await test.step('Select the Systemd step', async () => {
    await frame.getByRole('button', { name: 'error Systemd services' }).click();
    await expect(frame.getByText('Includes duplicate enabled')).toBeVisible();
    await expect(frame.getByText('Includes duplicate disabled')).toBeVisible();
    await expect(frame.getByText('Includes duplicate masked')).toBeVisible();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
    await frame.getByRole('button', { name: 'Close auditd' }).first().click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
    await frame.getByRole('button', { name: 'Close sssd' }).first().click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeDisabled();
    await frame.getByRole('button', { name: 'Close masked' }).first().click();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });
});
