import { expect } from '@playwright/test';
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
  registerLater,
} from '../helpers/wizardHelpers';

test('Boot qcow2 image and test hostname', async ({ page, cleanup }) => {
  test.setTimeout(120 * 60 * 1000); // 2 hours
  test.skip(!isHosted(), 'Boot test run only on the hosted service.');
  const blueprintName = 'boot-test-qcow-' + uuidv4();
  const hostname = 'testsystem';
  const filePath = constructFilePath(blueprintName, 'qcow2');

  // Delete the blueprint and Openstack resources after the run
  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => OpenStackWrapper.deleteImage(blueprintName));
  await cleanup.add(() => OpenStackWrapper.deleteInstance(blueprintName));

  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Select target', async () => {
    await navigateToWizard(frame);
    await selectTarget(frame, 'qcow2');
  });

  await test.step('Register later and navigate to optional steps in Wizard', async () => {
    await registerLater(frame);
  });

  await test.step('Select and fill the Hostname step', async () => {
    await frame.getByRole('button', { name: 'Hostname' }).click();
    await frame.getByRole('textbox', { name: 'hostname input' }).fill(hostname);
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

  await test.step('Test hostname', async () => {
    const [exitCode, output] = await image.exec('hostname');
    expect(exitCode).toBe(0);
    // TODO: Fix this, hostname should be what is set in the BP, not the instance name
    expect(output).toContain(blueprintName);
  });
});
