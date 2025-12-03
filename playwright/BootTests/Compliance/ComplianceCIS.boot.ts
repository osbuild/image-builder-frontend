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
import {
  createCompliancePolicy,
  deleteCompliancePolicy,
  navigateToCompliancePolicy,
  removeCompliancePolicyRule,
} from '../helpers/helpers';
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
    'CIS Red Hat Enterprise Linux 10 Benchmark for Level 2 - Workstation';
  const filePath = constructFilePath(blueprintName, 'qcow2');

  // Delete the blueprint compliance policy and Openstack resources after the run
  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => deleteCompliancePolicy(page, policyName));
  await cleanup.add(() => OpenStackWrapper.deleteImage(blueprintName));
  await cleanup.add(() => OpenStackWrapper.deleteInstance(blueprintName));

  // TODO: This test requires a static user for now,
  // TODO: because of the empty state in Compliance service when new user has not registered a system yet
  await login(page, true);

  await createCompliancePolicy(page, policyName, policyType, 'RHEL 10');

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

test('Compliance alerts - lint warnings display', async ({ page, cleanup }) => {
  test.skip(!isHosted(), 'Compliance alerts are not available in the plugin');
  const blueprintName = 'test-compliance-' + uuidv4();
  const policyName = 'test-policy-' + uuidv4();
  const policyType =
    'Centro Criptológico Nacional (CCN) - STIC for Red Hat Enterprise Linux 9 - Intermediate';

  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => deleteCompliancePolicy(page, policyName));

  await login(page, true);

  await createCompliancePolicy(page, policyName, policyType);

  await test.step('Wait for policy to be available', async () => {
    await navigateToCompliancePolicy(page, policyName);
    // Wait a bit longer for the policy to be fully available after creation
    await expect(page.getByRole('row', { name: policyName })).toBeVisible({
      timeout: 60000,
    });
  });

  await page.goto('/insights/image-builder/imagewizard?release=rhel9');
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await expect(frame.getByTestId('release_select')).toHaveText(
      'Red Hat Enterprise Linux (RHEL) 9',
    );
    await frame.getByRole('checkbox', { name: 'Virtualization' }).click();
    await frame.getByRole('button', { name: 'Next' }).click();
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
    await expect(frame.getByRole('option').first()).toBeVisible();
    const searchInput = frame.getByRole('textbox', { name: /filter/i });
    await expect(searchInput).toBeVisible();
    await searchInput.fill(policyName);
    await expect(frame.getByRole('option', { name: policyName })).toBeVisible();
    await frame.getByRole('option', { name: policyName }).click();
    await expect(frame.getByRole('button', { name: policyName })).toBeVisible();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await removeCompliancePolicyRule(
    page,
    policyName,
    'Install firewalld Package',
  );

  await test.step('Verify compliance warning appears in blueprint', async () => {
    await navigateToLandingPage(page);
    const updatedFrame = await ibFrame(page);

    const searchInput = updatedFrame.getByRole('textbox', {
      name: 'Search input',
    });
    await expect(searchInput).toBeVisible();
    await searchInput.fill(blueprintName);
    await expect(searchInput).toHaveValue(blueprintName);

    const blueprintButton = updatedFrame.getByRole('button', {
      name: blueprintName,
    });
    await expect(blueprintButton).toBeVisible();
    await expect(blueprintButton).toBeEnabled();

    await blueprintButton.click();

    await expect(
      updatedFrame.getByRole('button', { name: 'Edit blueprint' }),
    ).toBeVisible({ timeout: 15000 });

    const firewalldMessage = updatedFrame.getByText(
      /Compliance: package firewalld is no longer required by policy/i,
    );
    // After rule removal, warning generation can lag; use polling with longer timeout
    await expect
      .poll(async () => await firewalldMessage.isVisible(), { timeout: 60000 })
      .toBeTruthy();
    await expect(firewalldMessage).toBeVisible();
  });
});
