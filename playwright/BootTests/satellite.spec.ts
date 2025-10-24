import { expect, FrameLocator, Page } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import {
  buildImage,
  constructFilePath,
  downloadImage,
} from './helpers/imageBuilding';
import { OpenStackWrapper } from './helpers/OpenStackWrapper';
import { navigateToWizard, selectTarget } from './helpers/targetChooser';

import { test } from '../fixtures/customizations';
import { isHosted } from '../helpers/helpers';
import { ensureAuthenticated } from '../helpers/login';
import { ibFrame, navigateToLandingPage } from '../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  fillInDetails,
} from '../helpers/wizardHelpers';

//TODO where should this function live?
const registerSatellite = async (page: Page | FrameLocator) => {

const registrationCommand = "set -o pipefail && curl --silent --show-error   'https://satellite.redhat.com/register?activation_keys=my-key&download_utility=curl&location_id=2&organization_id=1&update_packages=false' --header 'Authorization: Bearer fake.eyJleHAiOjk5OTk5OTk5OTl9.fake' | bash"

const certificate = '-----BEGIN CERTIFICATE-----asdfjkl;-----END CERTIFICATE-----'

await page.getByText('Register with Satellite').click();
await page.getByRole('textbox', { name: 'registration command' }).click();
await page.getByRole('textbox', { name: 'registration command' }).fill(registrationCommand);
await page.getByRole('textbox', { name: 'File upload' }).click();
await page.getByRole('textbox', { name: 'File upload' }).fill(certificate);

}

//TODO Is it worth trying to DRY out these tests yet?
test('Boot qcow2 image and test satellite registration', async ({ page, cleanup }) => {
  test.setTimeout(120 * 60 * 1000); // 2 hours
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'boot-test-satellite-' + uuidv4();
  const filePath = constructFilePath(blueprintName, 'qcow2');

  // Delete the blueprint and Openstack resources after the run
  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => OpenStackWrapper.deleteImage(blueprintName));
  await cleanup.add(() => OpenStackWrapper.deleteInstance(blueprintName));

  await ensureAuthenticated(page);

  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Select target', async () => {
    await navigateToWizard(frame);
    await selectTarget(frame, 'qcow2');
  });

  await test.step('Register Satellite', async () => {
    await registerSatellite(frame);
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

  await test.step('Test that the registration command was run', async () => {
    const [exitCode, output] = await image.exec('journalctl | grep "curl.*satellite.*register"');
    expect(exitCode).toBe(0);
    expect(output).toContain('curl');
    // TODO check for full curl command
  });

  // await test.step('Test that the certificate is on the host', async () => {
  // TODO
  // Certificate will be located in /etc/pki/ca-trust/source/anchors
  // });
});
