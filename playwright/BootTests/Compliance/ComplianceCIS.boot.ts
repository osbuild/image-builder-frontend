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
  registerLater,
} from '../../helpers/wizardHelpers';
import { deleteCompliancePolicy } from '../helpers/helpers';
import {
  buildImage,
  constructFilePath,
  downloadImage,
} from '../helpers/imageBuilding';
import { OpenStackWrapper } from '../helpers/OpenStackWrapper';

// Clear the login from global setup so we can use static user
test.use({ storageState: { cookies: [], origins: [] } });

test('Compliance step integration test - CIS', async ({ page, cleanup }) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'compliance-cis-test-' + uuidv4();
  const policyName = 'test-policy-' + uuidv4();
  const policyType =
    'DRAFT - CIS Red Hat Enterprise Linux 10 Benchmark for Level 2 - Workstation';
  const filePath = constructFilePath(blueprintName, 'qcow2');

  // Delete the blueprint compliance policy and Openstack resources after the run
  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => deleteCompliancePolicy(page, policyName));
  await cleanup.add(() => OpenStackWrapper.deleteImage(blueprintName));
  await cleanup.add(() => OpenStackWrapper.deleteInstance(blueprintName));

  // TODO: This test requires a static user for now,
  // TODO: because of the empty state in Compliance service when new user has not registered a system yet
  await login(page, true);

  await test.step('Create a Compliance policy', async () => {
    await page.goto('/insights/compliance/scappolicies');
    await page.getByRole('button', { name: 'Create new policy' }).click();
    await page.getByRole('option', { name: 'RHEL 10' }).click();
    await expect(
      page.getByRole('gridcell', { name: 'ANSSI-BP-028 (enhanced)' }).first(),
    ).toBeVisible(); // Wait for the policy type list to load
    await page.getByRole('textbox', { name: 'text input' }).fill(policyType);
    await expect(
      page.getByRole('gridcell', { name: policyType }).first(),
    ).toBeVisible();
    await page.getByRole('radio', { name: 'Select row 0' }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('textbox', { name: 'Policy name' }).fill(policyName); // Get the policy name
    await page.getByRole('button', { name: 'Next', exact: true }).click(); // Skip "Details"
    await page.getByRole('button', { name: 'Next', exact: true }).click(); // Skip "Systems"
    /** TODO: Currently broken
    // Change rule to see if tailoring works correctly
    await page.getByRole('textbox', { name: 'text input' }).fill('bluetooth');
    await page.getByRole('checkbox', { name: 'Select row 0' }).click(); */
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
    await page
      .getByRole('button', { name: 'Return to application' })
      .click({ timeout: 2 * 60 * 1000 }); // Wait for the policy to be created
  });

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame, 'qcow2', 'rhel10', 'x86_64');
    await registerLater(frame);
  });

  await test.step('Select and fill the Compliance step', async () => {
    await frame
      .getByLabel('Wizard steps')
      .getByRole('button', { name: 'Security' })
      .click();
    await frame
      .getByRole('radio', { name: 'Use a custom compliance policy' })
      .click();
    await frame.getByRole('button', { name: 'None' }).click();
    await frame.getByRole('option', { name: policyName }).click();
    await expect(frame.getByRole('button', { name: policyName })).toBeVisible(); // Wait for the policy to get selected
    await page.waitForTimeout(3000); // Slow down execution to let the policy customizations load
    await frame
      .getByLabel('Wizard steps')
      .getByRole('button', { name: 'Additional packages' })
      .click();
    await expect(
      frame.getByRole('button', { name: /selected \(\d+\)/i }),
    ).toBeVisible();
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

  // Initialize Openstack wrapper
  const image = new OpenStackWrapper(blueprintName, 'qcow2', filePath);

  await test.step('Prepare Openstack instance', async () => {
    await image.createImage();
    await image.launchInstance();
  });

  await test.step('Test packages were installed', async () => {
    const [exitCode, output] = await image.exec(
      'rpm -q firewalld cronie audit audit-libs sudo libpwquality nftables systemd-journal-remote libselinux aide',
    );
    expect(exitCode).toBe(0);
    expect(output).toContain('firewalld');
    expect(output).toContain('cronie');
    expect(output).toContain('audit');
    expect(output).toContain('audit-libs');
    expect(output).toContain('sudo');
    expect(output).toContain('libpwquality');
    expect(output).toContain('nftables');
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
  });

  await test.step('Test disabled services', async () => {
    const [nftablesExitCode] = await image.exec(
      'systemctl is-enabled nftables',
    );
    expect(nftablesExitCode === 1 || nftablesExitCode === 4).toBeTruthy();

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
