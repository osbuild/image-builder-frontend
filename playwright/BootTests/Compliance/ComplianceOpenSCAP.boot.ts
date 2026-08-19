import { expect } from '@playwright/test';

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
  openWizard,
} from '../../helpers/wizardHelpers';
import { buildImage } from '../helpers/imageBuilding';
import { AwsWrapper } from '../helpers/AwsWrapper';

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
  const blueprintName = 'compliance-oscap-test-' + crypto.randomUUID();

  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await login(page, true);

  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Open Wizard', async () => {
    await openWizard(frame);
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Fill Image Output', async () => {
    await fillInImageOutput(frame, 'aws', 'rhel10', 'x86_64');
    await frame.getByRole('textbox', { name: 'aws account id' }).fill(process.env.AWS_ACCOUNT_ID!);
  });

  await test.step('Register system', async () => {
    await frame
      .getByRole('radio', { name: 'Automatically register to Red Hat' })
      .click();
  });

  const oscapProfileName =
    'CIS Red Hat Enterprise Linux 10 Benchmark for Level 2 - Workstation';

  const oscapProfileId =
    'xccdf_org.ssgproject.content_profile_cis_workstation_l2';
  const baselineOscapScorePercent = 90;

  await test.step('Select OpenSCAP profile', async () => {
    await frame.getByRole('button', { name: 'Base settings' }).click();
    await frame
      .getByRole('radio', { name: 'Use a default OpenSCAP profile' })
      .click();
    const profileDropdown = frame.getByTestId('profileSelect');
    await expect(profileDropdown).toBeEnabled({ timeout: 30000 });
    await profileDropdown.click();
    await expect(frame.getByRole('option').first()).toBeVisible({
      timeout: 15000,
    });
    await frame
      .getByRole('option', { name: new RegExp(oscapProfileName, 'i') })
      .click();
    await expect(profileDropdown).toHaveText(
      'CIS Red Hat Enterprise Linux 10 Benchmark for Level 2 - Workstation',
    );
  });

  await test.step('Add perl-XML-XPath package for OSCAP results parsing', async () => {
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();
    await frame
      .getByRole('textbox', { name: 'Search packages' })
      .fill('perl-XML-XPath');
    await expect(
      frame.getByRole('option', { name: 'perl-XML-XPath' }),
    ).toBeVisible({ timeout: 60000 });
    await frame.getByRole('option', { name: 'perl-XML-XPath' }).click();
    await frame.getByRole('button', { name: 'Review image' }).click();
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  let amiId: string = '';

  await test.step('Build image and get AMI info', async () => {
    await buildImage(page);
    await frame.getByText('Launch').click();
    amiId = await frame.locator('span.pf-v6-u-font-weight-bold').filter({ hasText: /^ami-/ }).textContent() ?? '';
  });

  const image = new AwsWrapper(amiId);
  cleanup.add(() => image.terminateInstance());

  await test.step('Prepare AWS instance', async () => {
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

  await test.step('Run OSCAP evaluation and verify compliance score', async () => {
    const [listExitCode, profilesPathOutput] = await image.exec(
      'ls /usr/share/xml/scap/ssg/content/ssg-rhel10-ds*.xml 2>/dev/null | head -1',
    );
    expect(listExitCode).toBe(0);
    const profilesPath = profilesPathOutput.trim();
    expect(profilesPath).toBeTruthy();

    const [oscapExitCode, oscapOutput] = await image.exec(
      `cd /tmp && sudo oscap xccdf eval --profile ${oscapProfileId} --results results.xml "${profilesPath}"`,
    );
    // oscap returns 0 for full compliance, 2 when some rules fail
    expect(
      [0, 2],
      `oscap eval failed with exit code ${oscapExitCode}. Output:\n${oscapOutput}`,
    ).toContain(oscapExitCode);

    const [xpathExitCode, scoreOutput] = await image.exec(
      'sudo xpath -q -e "//score/text()" /tmp/results.xml',
    );
    expect(xpathExitCode).toBe(0);
    expect(scoreOutput).toBeTruthy();

    const scoreMatch = scoreOutput.trim().match(/[\d.]+/);
    expect(scoreMatch).toBeTruthy();
    const scorePercent = parseFloat(scoreMatch![0]);
    expect(scorePercent).toBeGreaterThanOrEqual(baselineOscapScorePercent);
  });
});
