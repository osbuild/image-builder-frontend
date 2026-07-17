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
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Import BP', async () => {
    const blueprintFile = await saveBlueprintFileWithContents(
      IMPORT_WITH_DUPLICATE_VALUES,
    );
    cleanup.add(async () => {
      await fsPromises.rm(path.dirname(blueprintFile), { recursive: true });
    });
    await importBlueprint(frame, blueprintFile);
  });

  await test.step('Fill blueprint details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Select Virtualization and register later', async () => {
    await frame.getByRole('checkbox', { name: 'Virtualization' }).click();
    await registerLater(frame);
  });

  await test.step('Open Advanced settings and fix file system errors', async () => {
    await frame.getByRole('button', { name: 'Advanced settings' }).click();
    await expect(
      frame.getByText(/Duplicate mount points/i).first(),
    ).toBeVisible();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
    const closeRootButton = frame
      .getByRole('button', { name: 'Remove partition' })
      .first();
    await expect(closeRootButton).toBeEnabled();
    await closeRootButton.click();
    const closeRootButton2 = frame
      .getByRole('button', { name: 'Remove partition' })
      .first();
    await expect(closeRootButton2).toBeDisabled();
  });

  await test.step('Fix timezone and locale errors on Advanced settings', async () => {
    await expect(frame.getByText('Includes duplicate NTP')).toBeVisible();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
    await frame.getByRole('button', { name: 'Remove ntp/' }).first().click();

    await expect(frame.getByText('Unknown languages: random:')).toBeVisible();
    await expect(frame.getByText('Duplicated languages: af_ZA.')).toBeVisible();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
    await frame.getByRole('button', { name: 'Remove language' }).last().click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
    await frame.getByRole('button', { name: 'Remove language' }).last().click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  await test.step('Fix firewall errors on Advanced settings', async () => {
    await frame
      .getByRole('heading', { name: 'Firewall' })
      .scrollIntoViewIfNeeded();
    await expect(frame.getByText('Includes duplicate ports:')).toBeVisible();
    await expect(
      frame.getByText(
        'Includes duplicate enabled services: service1: error status',
      ),
    ).toBeVisible();
    await expect(
      frame.getByText('Includes duplicate disabled services: service2'),
    ).toBeVisible();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
    await frame
      .getByRole('button', { name: 'Remove 2020:port' })
      .first()
      .click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
    await frame
      .getByRole('button', { name: 'Remove service1' })
      .first()
      .click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
    await frame
      .getByRole('button', { name: 'Remove service2' })
      .first()
      .click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  await test.step('Fix systemd errors on Advanced settings', async () => {
    await frame
      .getByRole('heading', { name: 'Systemd services' })
      .scrollIntoViewIfNeeded();
    await expect(
      frame.getByText('Includes duplicate enabled services: auditd'),
    ).toBeVisible();
    await expect(
      frame.getByText('Includes duplicate disabled services: sssd'),
    ).toBeVisible();
    await expect(frame.getByText('Includes duplicate masked')).toBeVisible();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
    await frame.getByRole('button', { name: 'Remove auditd' }).first().click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
    await frame.getByRole('button', { name: 'Remove sssd' }).first().click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
    await frame.getByRole('button', { name: 'Remove masked' }).first().click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
    await frame.getByRole('button', { name: 'Review image' }).click();
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });
});
