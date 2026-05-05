import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
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
} from '../helpers/wizardHelpers';

test('Create a blueprint with OpenSCAP customization', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'OpenSCAP is not available in the plugin');

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

  await test.step('WSL + Installer shows WSL is not supported', async () => {
    await fillInImageOutput(frame, 'wsl', 'rhel9');
    await frame.getByRole('checkbox', { name: 'Bare metal installer' }).click();
    await registerLater(frame);

    await expect(
      frame.getByText('WSL: customization is not supported'),
    ).toBeVisible();
  });

  await test.step('Select a CIS profile then switch to None', async () => {
    await frame
      .getByRole('radio', { name: 'Use a default OpenSCAP profile' })
      .click();
    await expect(frame.getByTestId('profileSelect')).toBeEnabled();
    await frame.getByTestId('profileSelect').click();
    await frame
      .getByRole('option', {
        name: 'CIS Red Hat Enterprise Linux 9 Benchmark for Level 1 - Server',
      })
      .click();

    await frame
      .getByRole('radio', { name: 'No additional policy or profile' })
      .click();
  });

  await test.step('Verify Packages show no OpenSCAP additions', async () => {
    // NOTE: fsc check was removed since we now hide steps when
    // none of the image types support the customization
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();
  });

  await test.step('Select OpenSCAP profile, and check if dependencies are preselected', async () => {
    await frame.getByRole('button', { name: 'Base settings' }).click();
    await frame
      .getByRole('radio', { name: 'Use a default OpenSCAP profile' })
      .click();

    await frame.getByTestId('profileSelect').click();
    await frame
      .getByRole('option', {
        name: 'CIS Red Hat Enterprise Linux 9 Benchmark for Level 1 - Server',
      })
      .click();
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();
    await expect(frame.getByRole('gridcell', { name: 'aide' })).toBeVisible();
    await expect(frame.getByRole('gridcell', { name: 'chrony' })).toBeVisible();
    await expect(frame.getByRole('gridcell', { name: 'cronie' })).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'firewalld' }),
    ).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'libpwquality' }),
    ).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'libselinux' }),
    ).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'nftables' }),
    ).toBeVisible();
    await expect(frame.getByRole('gridcell', { name: 'sudo' })).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'systemd-journal-remote' }),
    ).toBeVisible();
    await frame.getByRole('button', { name: 'Advanced settings' }).click();
    await expect(frame.getByText('11 Added by OpenSCAP')).toBeVisible();
    await frame.getByPlaceholder('Add masked service').fill('nftables');
    await frame.getByPlaceholder('Add masked service').press('Enter');
    await expect(
      frame.getByText('Masked service already exists'),
    ).toBeVisible();
    await expect(frame.getByText('cups')).toBeVisible();
    await expect(frame.getByText('nfs-server')).toBeVisible();
    await expect(frame.getByText('rpcbind')).toBeVisible();
    await expect(frame.getByText('avahi-daemon')).toBeVisible();
    await expect(frame.getByText('autofs')).toBeVisible();
    await expect(frame.getByText('bluetooth')).toBeVisible();
    await expect(frame.getByText('nftables')).toBeVisible();
    await frame.getByRole('button', { name: 'Review image' }).click();
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Base settings' }).click();
    await expect(frame.getByTestId('profileSelect')).toContainText(
      'CIS Red Hat Enterprise Linux 9 Benchmark for Level 1 - Server',
      { timeout: 60000 },
    );
    await frame.getByTestId('profileSelect').click();
    await frame
      .getByRole('option', {
        name: 'CIS Red Hat Enterprise Linux 9 Benchmark for Level 2 - Server',
      })
      .click();

    await frame.getByRole('button', { name: 'Advanced settings' }).click();

    await expect(
      frame.getByText('2 Added by OpenSCAP', { exact: true }),
    ).toBeVisible();
    await expect(frame.getByText('audit_backlog_limit=8192')).toBeVisible();
    await expect(frame.getByText('audit=1')).toBeVisible();
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();
    await expect(frame.getByRole('gridcell', { name: 'aide' })).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'audit-libs' }),
    ).toBeVisible();
    await expect(frame.getByRole('gridcell', { name: 'chrony' })).toBeVisible();
    await expect(frame.getByRole('gridcell', { name: 'cronie' })).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'firewalld' }),
    ).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'libpwquality' }),
    ).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'libselinux' }),
    ).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'nftables' }),
    ).toBeVisible();
    await expect(frame.getByRole('gridcell', { name: 'sudo' })).toBeVisible();
    await frame.getByRole('button', { name: 'Advanced settings' }).click();
    await expect(frame.getByText('12 Added by OpenSCAP')).toBeVisible();
    await frame.getByPlaceholder('Add masked service').fill('nftables');
    await frame.getByPlaceholder('Add masked service').press('Enter');
    await expect(
      frame.getByText('Masked service already exists'),
    ).toBeVisible();
    await expect(frame.getByText('cups')).toBeVisible();
    await expect(frame.getByText('nfs-server')).toBeVisible();
    await expect(frame.getByText('rpcbind')).toBeVisible();
    await expect(frame.getByText('avahi-daemon')).toBeVisible();
    await expect(frame.getByText('autofs')).toBeVisible();
    await expect(frame.getByText('bluetooth')).toBeVisible();
    await expect(frame.getByText('nftables')).toBeVisible();
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

  await test.step('Import BP', async () => {
    await importBlueprint(frame, exportedBP);
  });

  await test.step('Review imported BP', async () => {
    await fillInImageOutput(frame);
    await frame.getByRole('textbox', { name: 'Blueprint name' }).fill('tmp');
    await frame.getByRole('button', { name: 'Base settings' }).click();
    await frame.getByRole('button', { name: 'View details' }).nth(2).click();
    await expect(
      frame.getByText('Red Hat Enterprise Linux 9 CIS'),
    ).toBeVisible();

    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
