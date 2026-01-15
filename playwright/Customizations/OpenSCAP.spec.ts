import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { selectDistro } from '../BootTests/helpers/targetChooser';
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
  test.skip(!isHosted(), 'OpenSCAP is not available in the plugin');

  const blueprintName = 'test-' + uuidv4();
  // Delete the blueprint after the run fixture
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('WSL only disables selector', async () => {
    await frame.getByRole('button', { name: 'Create image blueprint' }).click();
    await selectDistro(frame, 'rhel9');
    await frame
      .getByRole('checkbox', { name: 'Windows Subsystem for Linux' })
      .click();
    await frame.getByRole('button', { name: 'Next' }).click();
    await registerLater(frame);

    await frame.getByRole('button', { name: 'Security' }).nth(1).click();
    await expect(
      frame.getByText('OpenSCAP profiles are not compatible with WSL images.'),
    ).toBeVisible();
    await expect(frame.getByRole('button', { name: 'None' })).toBeDisabled();
  });

  await test.step('WSL + Installer shows alert but keeps selector enabled', async () => {
    // Back to Image output and add Installer
    await frame.getByRole('button', { name: 'Image output' }).click();
    await selectDistro(frame, 'rhel9');
    await frame.getByRole('checkbox', { name: 'Bare metal installer' }).click();
    await frame.getByRole('button', { name: 'Next' }).click();
    await registerLater(frame);

    await frame.getByRole('button', { name: 'Security' }).nth(1).click();
    await expect(
      frame.getByText('OpenSCAP profiles are not compatible with WSL images.'),
    ).toBeVisible();
    await expect(
      frame.getByRole('textbox', { name: 'Type to filter' }),
    ).toBeEnabled();
  });

  await test.step('Select a CIS profile then switch to None', async () => {
    await frame
      .getByRole('radio', { name: 'Use a default OpenSCAP profile' })
      .check();
    await frame.getByRole('textbox', { name: 'Type to filter' }).fill('cis');
    await frame
      .getByRole('option', {
        name: 'CIS Red Hat Enterprise Linux 9 Benchmark for Level 1 - Server',
      })
      .click();

    await frame.getByRole('textbox', { name: 'Type to filter' }).click();
    await frame.getByRole('option', { name: /^None$/ }).click();
  });

  await test.step('Verify FSC and Packages show no OpenSCAP additions', async () => {
    await frame
      .getByRole('button', { name: 'File system configuration' })
      .click();
    await expect(frame.getByText('/tmp')).toHaveCount(0);

    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await expect(frame.getByRole('button', { name: /Selected/ })).toBeVisible();
  });

  await test.step('Select OpenSCAP profile, and check if dependencies are preselected', async () => {
    await frame.getByRole('button', { name: 'Security' }).nth(1).click();
    await frame
      .getByRole('radio', { name: 'Use a default OpenSCAP profile' })
      .check();

    await frame.getByRole('textbox', { name: 'Type to filter' }).fill('cis');
    await frame
      .getByRole('option', {
        name: 'CIS Red Hat Enterprise Linux 9 Benchmark for Level 1 - Server',
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
        .nth(3),
    ).toBeVisible();
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await frame.getByRole('button', { name: 'Selected (9)' }).click();
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
    await frame.getByRole('button', { name: 'Systemd services' }).click();
    await expect(
      frame.getByText('Required by OpenSCAPcrondfirewalldsystemd-journald'),
    ).toBeVisible();
    await frame.getByPlaceholder('Add masked service').fill('nftables');
    await frame.getByPlaceholder('Add masked service').press('Enter');
    await expect(
      frame.getByText('Masked service already exists'),
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
    await frame.getByRole('button', { name: 'Security' }).nth(1).click();
    await frame.getByRole('textbox', { name: 'Type to filter' }).click();
    await expect(
      frame.getByText(
        'CIS Red Hat Enterprise Linux 9 Benchmark for Level 1 - Server',
      ),
    ).toBeVisible();
    await frame.getByRole('textbox', { name: 'Type to filter' }).clear();
    await frame.getByRole('textbox', { name: 'Type to filter' }).fill('cis');
    await frame
      .getByRole('option', {
        name: 'CIS Red Hat Enterprise Linux 9 Benchmark for Level 2 - Server',
      })
      .click();

    await frame.getByRole('button', { name: 'Kernel' }).click();

    await expect(
      frame.getByText('Required by OpenSCAPaudit_backlog_limit=8192audit='),
    ).toBeVisible();
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await frame.getByRole('button', { name: 'Selected (11)' }).click();
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
    await frame.getByRole('button', { name: 'Systemd services' }).click();
    await expect(
      frame.getByText(
        'Required by OpenSCAPauditdcrondfirewalldsystemd-journald',
      ),
    ).toBeVisible();
    await frame.getByPlaceholder('Add masked service').fill('nftables');
    await frame.getByPlaceholder('Add masked service').press('Enter');
    await expect(
      frame.getByText('Masked service already exists'),
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

  let exportedBP = '';

  await test.step('Export BP', async () => {
    exportedBP = await exportBlueprint(page);
    cleanup.add(async () => {
      await fsPromises.rm(path.dirname(exportedBP), { recursive: true });
    });
  });

  await test.step('Import BP', async () => {
    await importBlueprint(page, exportedBP);
  });

  await test.step('Review imported BP', async () => {
    await fillInImageOutputGuest(page);
    await page.getByRole('button', { name: 'Security' }).nth(1).click();
    await frame.getByRole('textbox', { name: 'Type to filter' }).click();
    await expect(
      frame.getByText(
        'CIS Red Hat Enterprise Linux 9 Benchmark for Level 2 - Server',
      ),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
