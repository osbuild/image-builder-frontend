import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../../fixtures/customizations';
import { isHosted } from '../../helpers/helpers';
import { login } from '../../helpers/login';
import {
  fillInImageOutput,
  ibFrame,
  navigateToLandingPage,
} from '../../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  fillInDetails,
} from '../../helpers/wizardHelpers';
import {
  buildImage,
  constructFilePath,
  downloadImage,
} from '../helpers/imageBuilding';
import { OpenStackWrapper } from '../helpers/OpenStackWrapper';

// Clear the login from global setup so we can use static user
test.use({ storageState: { cookies: [], origins: [] } });

test('Compliance step integration test - OpenSCAP default profile', async ({
  page,
  cleanup,
}) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'compliance-oscap-test-' + uuidv4();
  const filePath = constructFilePath(blueprintName, 'qcow2');

  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => OpenStackWrapper.deleteImage(blueprintName));
  cleanup.add(() => OpenStackWrapper.deleteInstance(blueprintName));

  await login(page, true);

  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame, 'qcow2', 'rhel10', 'x86_64');
  });

  await test.step('Register system', async () => {
    await page.getByRole('button', { name: 'Register' }).click();
    await page
      .getByRole('radio', { name: 'Automatically register to Red Hat' })
      .click();
  });

  const oscapProfileName =
    'CIS Red Hat Enterprise Linux 10 Benchmark for Level 2 - Workstation';

  await test.step('Select OpenSCAP profile', async () => {
    await frame
      .getByLabel('Wizard steps')
      .getByRole('button', { name: 'Security' })
      .click();
    await frame
      .getByRole('radio', { name: 'Use a default OpenSCAP profile' })
      .click();
    const profileDropdown = frame.getByRole('textbox', {
      name: 'Type to filter',
    });
    await expect(profileDropdown).toBeEnabled({ timeout: 30000 });
    await profileDropdown.click();
    await expect(frame.getByRole('option').first()).toBeVisible({
      timeout: 15000,
    });
    await frame
      .getByRole('option', { name: new RegExp(oscapProfileName, 'i') })
      .click();
    await expect(profileDropdown).toHaveValue(
      'CIS Red Hat Enterprise Linux 10 Benchmark for Level 2 - Workstation',
    );
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Build the image', async () => {
    await buildImage(page);
  });

  await test.step('Download the image', async () => {
    await downloadImage(page, filePath);
  });

  const image = new OpenStackWrapper(blueprintName, 'qcow2', filePath);

  await test.step('Prepare Openstack instance', async () => {
    await image.createImage();
    await image.launchInstance();
  });

  await test.step('Test packages were installed)', async () => {
    const [exitCode, output] = await image.exec(
      'rpm -q firewalld cronie audit audit-libs sudo libpwquality systemd-journal-remote libselinux aide',
    );
    expect(exitCode).toBe(0);
    expect(output).toContain('firewalld');
    expect(output).toContain('cronie');
    expect(output).toContain('audit');
    expect(output).toContain('audit-libs');
    expect(output).toContain('sudo');
    expect(output).toContain('libpwquality');
    expect(output).toContain('systemd-journal-remote');
    expect(output).toContain('libselinux');
    expect(output).toContain('aide');
  });

  await test.step('Test kernel arguments', async () => {
    const [exitCode, output] = await image.exec('cat /proc/cmdline');
    expect(exitCode).toBe(0);
    expect(output).toContain('audit_backlog_limit=8192');
  });

  await test.step('Test enabled services', async () => {
    const [auditdExitCode] = await image.exec('systemctl is-enabled auditd');
    expect(auditdExitCode).toBe(0);

    const [crondExitCode] = await image.exec('systemctl is-enabled crond');
    expect(crondExitCode).toBe(0);

    const [firewalldExitCode] = await image.exec(
      'systemctl is-enabled firewalld',
    );
    expect(firewalldExitCode).toBe(0);

    const [systemdJournaldExitCode] = await image.exec(
      'systemctl is-enabled systemd-journald',
    );
    expect(systemdJournaldExitCode).toBe(0);

    const [systemdJournalUploadExitCode] = await image.exec(
      'systemctl is-enabled systemd-journal-upload',
    );
    expect(systemdJournalUploadExitCode).toBe(0);
  });

  await test.step('Test masked services', async () => {
    const [autofsExitCode] = await image.exec('systemctl is-enabled autofs');
    expect(autofsExitCode === 1 || autofsExitCode === 4).toBeTruthy();

    const [avahiDaemonExitCode] = await image.exec(
      'systemctl is-enabled avahi-daemon',
    );
    expect(avahiDaemonExitCode === 1 || avahiDaemonExitCode === 4).toBeTruthy();

    const [nfsServerExitCode] = await image.exec(
      'systemctl is-enabled nfs-server',
    );
    expect(nfsServerExitCode === 1 || nfsServerExitCode === 4).toBeTruthy();

    const [bluetoothExitCode] = await image.exec(
      'systemctl is-enabled bluetooth',
    );
    expect(bluetoothExitCode === 1 || bluetoothExitCode === 4).toBeTruthy();

    const [rpcbindExitCode] = await image.exec('systemctl is-enabled rpcbind');
    expect(rpcbindExitCode === 1 || rpcbindExitCode === 4).toBeTruthy();
  });

  await test.step('Test FIPS mode is disabled', async () => {
    const [exitCode, output] = await image.exec(
      'cat /proc/sys/crypto/fips_enabled',
    );
    expect(exitCode).toBe(0);
    expect(output).toContain('0');
  });
});
