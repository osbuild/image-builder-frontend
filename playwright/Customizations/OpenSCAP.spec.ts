import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/cleanup';
import { isHosted } from '../helpers/helpers';
import { ensureAuthenticated } from '../helpers/login';
import { ibFrame, navigateToLandingPage } from '../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  exportBlueprint,
  fillInDetails,
  fillInImageOutputGuest,
  importBlueprint,
  registerLater,
} from '../helpers/wizardHelpers';

test('Create a blueprint with OpenSCAP customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();
  test.skip(!isHosted(), 'Exporting is not available in the plugin');
  // Delete the blueprint after the run fixture
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Select RHEL 9 and go to optional steps in Wizard', async () => {
    await frame.getByRole('button', { name: 'Create image blueprint' }).click();
    await frame.getByTestId('release_select').click();
    await frame
      .getByRole('option', {
        name: 'Red Hat Enterprise Linux (RHEL) 9 Full support ends: May 2027 | Maintenance',
      })
      .click();
    await frame.getByRole('checkbox', { name: 'Virtualization' }).click();
    await frame.getByRole('button', { name: 'Next' }).click();
    await registerLater(frame);
  });

  await test.step('Select only OpenSCAP, and check if dependencies are preselected', async () => {
    await frame.getByRole('button', { name: 'Compliance' }).click();
    await frame.getByRole('textbox', { name: 'Type to filter' }).fill('cis');
    await frame
      .getByRole('option', {
        name: 'CIS Red Hat Enterprise Linux 9 Benchmark for Level 1 - Server This profile',
      })
      .click();
    await frame
      .getByRole('button', { name: 'File system configuration' })
      .click();
    await expect(
      frame
        .getByRole('row', {
          name: 'Draggable row draggable button /tmp xfs 1 GiB',
        })
        .getByRole('button')
        .nth(3)
    ).toBeVisible();
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await frame.getByRole('button', { name: 'Selected (8)' }).click();
    await expect(frame.getByRole('gridcell', { name: 'aide' })).toBeVisible();
    await expect(frame.getByRole('gridcell', { name: 'chrony' })).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'firewalld' })
    ).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'libpwquality' })
    ).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'libselinux' })
    ).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'nftables' })
    ).toBeVisible();
    await expect(frame.getByRole('gridcell', { name: 'sudo' })).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'systemd-journal-remote' })
    ).toBeVisible();
    await frame.getByRole('button', { name: 'Systemd services' }).click();
    await expect(
      frame.getByText('Required by OpenSCAPcrondfirewalldsystemd-journald')
    ).toBeVisible();
    await frame.getByPlaceholder('Add masked service').fill('nftables');
    await frame.getByPlaceholder('Add masked service').press('Enter');
    await expect(
      frame.getByText('Masked service already exists')
    ).toBeVisible();
    await expect(frame.getByText('Required by OpenSCAPcupsnfs-')).toBeVisible();
    await expect(frame.getByText('nfs-server')).toBeVisible();
    await expect(frame.getByText('rpcbind')).toBeVisible();
    await expect(frame.getByText('avahi-daemon')).toBeVisible();
    await expect(frame.getByText('autofs')).toBeVisible();
    await expect(frame.getByText('bluetooth')).toBeVisible();
    await expect(frame.getByText('nftables')).toBeVisible();
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
    await frame.getByRole('button', { name: 'Compliance' }).click();
    await expect(frame.getByText('Level 1 - Server')).toBeVisible();
    await frame.getByRole('textbox', { name: 'Type to filter' }).fill('cis');
    await frame
      .getByRole('option', {
        name: 'CIS Red Hat Enterprise Linux 9 Benchmark for Level 2 - Server This profile',
      })
      .click();

    await frame.getByRole('button', { name: 'Kernel' }).click();

    await expect(
      frame.getByText('Required by OpenSCAPaudit_backlog_limit=8192audit=')
    ).toBeVisible();
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await frame.getByRole('button', { name: 'Selected (10)' }).click();
    await expect(frame.getByRole('gridcell', { name: 'aide' })).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'audit-libs' })
    ).toBeVisible();
    await expect(frame.getByRole('gridcell', { name: 'chrony' })).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'firewalld' })
    ).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'libpwquality' })
    ).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'libselinux' })
    ).toBeVisible();
    await expect(
      frame.getByRole('gridcell', { name: 'nftables' })
    ).toBeVisible();
    await expect(frame.getByRole('gridcell', { name: 'sudo' })).toBeVisible();
    await frame.getByRole('button', { name: 'Systemd services' }).click();
    await expect(
      frame.getByText(
        'Required by OpenSCAPauditdcrondfirewalldsystemd-journald'
      )
    ).toBeVisible();
    await frame.getByPlaceholder('Add masked service').fill('nftables');
    await frame.getByPlaceholder('Add masked service').press('Enter');
    await expect(
      frame.getByText('Masked service already exists')
    ).toBeVisible();
    await expect(frame.getByText('Required by OpenSCAPcupsnfs-')).toBeVisible();
    await expect(frame.getByText('nfs-server')).toBeVisible();
    await expect(frame.getByText('rpcbind')).toBeVisible();
    await expect(frame.getByText('avahi-daemon')).toBeVisible();
    await expect(frame.getByText('autofs')).toBeVisible();
    await expect(frame.getByText('bluetooth')).toBeVisible();
    await expect(frame.getByText('nftables')).toBeVisible();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  // This is for hosted service only as these features are not available in cockpit plugin
  await test.step('Export BP', async () => {
    await exportBlueprint(page, blueprintName);
  });

  await test.step('Import BP', async () => {
    await importBlueprint(page, blueprintName);
  });

  await test.step('Review imported BP', async () => {
    await fillInImageOutputGuest(page);
    await page.getByRole('button', { name: 'Compliance' }).click();

    await expect(frame.getByText('Level 2 - Server')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
