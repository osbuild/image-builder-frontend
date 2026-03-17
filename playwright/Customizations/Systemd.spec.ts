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
    await frame.getByRole('button', { name: 'Systemd services' }).click();
  });

  await test.step('Enabled services: shows all chips when 8 or fewer', async () => {
    const enabledInput = frame.getByPlaceholder('Add enabled service');
    for (const service of [
      'sshd.service',
      'httpd.service',
      'nginx.service',
      'crond.service',
      'rsyslog.service',
      'chronyd.service',
      'NetworkManager.service',
      'auditd.service',
    ]) {
      await enabledInput.fill(service);
      await page.keyboard.press('Enter');
    }

    await expect(frame.getByText('sshd.service')).toBeVisible();
    await expect(frame.getByText('httpd.service')).toBeVisible();
    await expect(frame.getByText('nginx.service')).toBeVisible();
    await expect(frame.getByText('crond.service')).toBeVisible();
    await expect(frame.getByText('rsyslog.service')).toBeVisible();
    await expect(frame.getByText('chronyd.service')).toBeVisible();
    await expect(frame.getByText('NetworkManager.servi...')).toBeVisible();
    await expect(frame.getByText('auditd.service')).toBeVisible();
    await expect(frame.getByText(/^\d+ more$/)).toBeHidden();
  });

  await test.step('Enabled services: collapses and shows "X more" when more than 8', async () => {
    const enabledInput = frame.getByPlaceholder('Add enabled service');
    for (const service of ['tuned.service', 'sssd.service']) {
      await enabledInput.fill(service);
      await page.keyboard.press('Enter');
    }

    await expect(frame.getByText('sshd.service')).toBeVisible();
    await expect(frame.getByText('tuned.service')).toBeHidden();
    await expect(frame.getByText('sssd.service')).toBeHidden();
    await expect(frame.getByText('2 more').first()).toBeVisible();
  });

  await test.step('Enabled services: expands and collapses', async () => {
    await frame.getByText('2 more').first().click();
    await expect(frame.getByText('tuned.service')).toBeVisible();
    await expect(frame.getByText('sssd.service')).toBeVisible();
    await expect(frame.getByText('Show less').first()).toBeVisible();

    await frame.getByText('Show less').first().click();
    await expect(frame.getByText('tuned.service')).toBeHidden();
    await expect(frame.getByText('sssd.service')).toBeHidden();
    await expect(frame.getByText('2 more').first()).toBeVisible();
  });

  await test.step('Disabled services: collapses and shows "X more" when more than 8', async () => {
    const disabledInput = frame.getByPlaceholder('Add disabled service');
    for (const service of [
      'cups.service',
      'avahi-daemon.service',
      'bluetooth.service',
      'ModemManager.service',
      'postfix.service',
      'rpcbind.service',
      'nfs-server.service',
      'telnet.service',
      'vsftpd.service',
    ]) {
      await disabledInput.fill(service);
      await page.keyboard.press('Enter');
    }

    await expect(frame.getByText('cups.service')).toBeVisible();
    await expect(frame.getByText('avahi-daemon.service')).toBeVisible();
    await expect(frame.getByText('bluetooth.service')).toBeVisible();
    await expect(frame.getByText('ModemManager.service')).toBeVisible();
    await expect(frame.getByText('postfix.service')).toBeVisible();
    await expect(frame.getByText('rpcbind.service')).toBeVisible();
    await expect(frame.getByText('nfs-server.service')).toBeVisible();
    await expect(frame.getByText('telnet.service')).toBeVisible();
    await expect(frame.getByText('vsftpd.service')).toBeHidden();
    await expect(frame.getByText('1 more').first()).toBeVisible();
  });

  await test.step('Masked services: collapses and shows "X more" when more than 8', async () => {
    const maskedInput = frame.getByPlaceholder('Add masked service');
    for (const service of [
      'firewalld.service',
      'iptables.service',
      'nftables.service',
      'ip6tables.service',
      'ebtables.service',
      'rsh.service',
      'tftp.service',
      'xinetd.service',
      'sendmail.service',
    ]) {
      await maskedInput.fill(service);
      await page.keyboard.press('Enter');
    }

    await expect(frame.getByText('firewalld.service')).toBeVisible();
    await expect(frame.getByText('iptables.service')).toBeVisible();
    await expect(frame.getByText('nftables.service')).toBeVisible();
    await expect(frame.getByText('ip6tables.service')).toBeVisible();
    await expect(frame.getByText('ebtables.service')).toBeVisible();
    await expect(frame.getByText('rsh.service')).toBeVisible();
    await expect(frame.getByText('tftp.service')).toBeVisible();
    await expect(frame.getByText('xinetd.service')).toBeVisible();
    await expect(frame.getByText('sendmail.service')).toBeHidden();
    await expect(frame.getByText('1 more').nth(1)).toBeVisible();
  });

  await test.step('Clean up chip collapse test chips', async () => {
    // Clean up enabled services
    await frame.getByText('2 more').first().click();
    for (const service of [
      'sssd.service',
      'tuned.service',
      'auditd.service',
      'NetworkManager.servi...',
      'chronyd.service',
      'rsyslog.service',
      'crond.service',
      'nginx.service',
      'httpd.service',
      'sshd.service',
    ]) {
      await frame.getByRole('button', { name: `Close ${service}` }).click();
    }

    // Clean up disabled services
    await frame.getByText('1 more').first().click();
    for (const service of [
      'vsftpd.service',
      'telnet.service',
      'nfs-server.service',
      'rpcbind.service',
      'postfix.service',
      'ModemManager.service',
      'bluetooth.service',
      'avahi-daemon.service',
      'cups.service',
    ]) {
      await frame.getByRole('button', { name: `Close ${service}` }).click();
    }

    // Clean up masked services
    await frame.getByText('1 more').first().click();
    for (const service of [
      'sendmail.service',
      'xinetd.service',
      'tftp.service',
      'rsh.service',
      'ebtables.service',
      'ip6tables.service',
      'nftables.service',
      'iptables.service',
      'firewalld.service',
    ]) {
      await frame.getByRole('button', { name: `Close ${service}` }).click();
    }
  });

  await test.step('Select and correctly fill all of the service fields', async () => {
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
