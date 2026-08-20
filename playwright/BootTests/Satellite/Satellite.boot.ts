import { expect } from '@playwright/test';

import {
  registrationCurlCommand,
  validCertificate,
  validRegistrationCommand,
} from '../../BootTests/fixtures/satelliteFixtures';
import { test } from '../../fixtures/customizations';
import { isHosted } from '../../helpers/helpers';
import { ensureAuthenticated } from '../../helpers/login';
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

test('Satellite registration boot integration test', async ({
  page,
  cleanup,
}) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'satellite-test-' + crypto.randomUUID();

  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);
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

  await test.step('Select and fill Satellite on Registration step', async () => {
    await frame
      .getByRole('radio', {
        name: /Register for a Satellite or Capsule server/i,
      })
      .click();
    await frame
      .getByRole('textbox', { name: 'registration command' })
      .fill(validRegistrationCommand);
    await frame
      .getByRole('textbox', { name: 'File upload' })
      .fill(validCertificate);
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

  await test.step('Verify Satellite registration was run', async () => {
    const [exitCode, output] = await image.exec(
      'journalctl | grep "curl.*localhost.*register"',
    );
    expect(exitCode).toBe(0);
    expect(output).toContain(registrationCurlCommand);
  });

  await test.step('Verify the certificate file was correctly uploaded', async () => {
    const [exitCode, output] = await image.exec(
      'ls /etc/pki/ca-trust/source/anchors/',
    );
    expect(exitCode).toBe(0);
    expect(output).toMatch(/\b1\.pem\b/);
  });
});
