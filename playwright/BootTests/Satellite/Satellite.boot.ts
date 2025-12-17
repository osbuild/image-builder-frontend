import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

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
} from '../../helpers/wizardHelpers';
import {
  buildImage,
  constructFilePath,
  downloadImage,
} from '../helpers/imageBuilding';
import { OpenStackWrapper } from '../helpers/OpenStackWrapper';

test('Satellite registration boot integration test', async ({
  page,
  cleanup,
}) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'satellite-test-' + uuidv4();
  const filePath = constructFilePath(blueprintName, 'qcow2');

  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => OpenStackWrapper.deleteImage(blueprintName));
  cleanup.add(() => OpenStackWrapper.deleteInstance(blueprintName));

  await ensureAuthenticated(page);
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame, 'qcow2', 'rhel10', 'x86_64');
    await page.getByRole('button', { name: 'Register' }).click();
  });

  await test.step('Select and fill Satellite on Registration step', async () => {
    await frame
      .getByRole('radio', { name: /Register to a Satellite or Capsule/i })
      .click();
    await frame
      .getByRole('textbox', { name: 'registration command' })
      .fill(validRegistrationCommand);
    await frame
      .getByRole('textbox', { name: 'File upload' })
      .fill(validCertificate);
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
