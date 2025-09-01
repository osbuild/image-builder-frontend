import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import {
  buildImage,
  constructFilePath,
  downloadImage,
} from './helpers/imageBuilding';
import { OpenStackWrapper } from './helpers/OpenStackWrapper';
import { selectTarget } from './helpers/targetChooser';

import { test } from '../fixtures/customizations';
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
  fillInDetails,
  registerLater,
} from '../helpers/wizardHelpers';

test('Boot qcow2 image and test hostname', async ({ page, cleanup }) => {
  test.setTimeout(120 * 60 * 1000); // 2 hours
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'boot-test-qcow-' + uuidv4();
  const filePath = constructFilePath(blueprintName, 'qcow2');

  // Delete the blueprint and Openstack resources after the run
  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => OpenStackWrapper.deleteImage(blueprintName));
  await cleanup.add(() => OpenStackWrapper.deleteInstance(blueprintName));

  await ensureAuthenticated(page);

  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Select target', async () => {
    await fillInImageOutput(frame);
    await selectTarget(frame, 'qcow2');
  });

  await test.step('Register later', async () => {
    await registerLater(frame);
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

  await test.step('Test if the image booted', async () => {
    const [exitCode, output] = await image.exec('echo "Hello World"');
    expect(exitCode).toBe(0);
    expect(output).toContain('Hello World');
  });
});
