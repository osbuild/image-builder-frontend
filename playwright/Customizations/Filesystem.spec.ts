import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { FILE_SYSTEM_CUSTOMIZATION_URL } from '../../src/constants';
import { test } from '../fixtures/cleanup';
import { isHosted } from '../helpers/helpers';
import {
  navigateToOptionalSteps,
  ibFrame,
  navigateToLandingPage,
} from '../helpers/navHelpers';
import {
  registerLater,
  fillInDetails,
  createBlueprint,
  fillInImageOutputGuest,
  deleteBlueprint,
  exportBlueprint,
  importBlueprint,
} from '../helpers/wizardHelpers';

test('Create a blueprint with Filesystem customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  // Login, navigate to IB and get the frame
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await navigateToOptionalSteps(frame);
    await registerLater(frame);
  });

  await test.step('Check URLs for documentation', async () => {
    await frame
      .getByRole('button', { name: 'File system configuration' })
      .click();
    await frame
      .getByRole('radio', { name: 'Use automatic partitioning' })
      .click();
    const [newPageAutomatic] = await Promise.all([
      page.context().waitForEvent('page'),
      frame
        .getByRole('link', {
          name: 'Customizing file systems during the image creation',
        })
        .click(),
    ]);
    await newPageAutomatic.waitForLoadState();
    const finalUrlAutomatic = newPageAutomatic.url();
    expect(finalUrlAutomatic).toContain(FILE_SYSTEM_CUSTOMIZATION_URL);
    await newPageAutomatic.close();

    await frame
      .getByRole('radio', { name: 'Manually configure partitions' })
      .click();
    const [newPageManual] = await Promise.all([
      page.context().waitForEvent('page'),
      frame
        .getByRole('link', {
          name: 'Read more about manual configuration here',
        })
        .click(),
    ]);
    await newPageManual.waitForLoadState();
    const finalUrlManual = newPageManual.url();
    expect(finalUrlManual).toContain(FILE_SYSTEM_CUSTOMIZATION_URL);
    await newPageManual.close();
  });

  await test.step('Fill manually selected partitions', async () => {
    await expect(frame.getByRole('button', { name: '/' })).toBeDisabled();
    const closeRootButton = frame
      .getByRole('row', {
        name: 'Draggable row draggable button / xfs 10 GiB',
      })
      .getByRole('button')
      .nth(3);
    await expect(closeRootButton).toBeDisabled();

    await frame.getByRole('button', { name: 'Add partition' }).click();
    await frame.getByRole('button', { name: '/home' }).click();
    await frame.getByRole('option', { name: '/tmp' }).click();

    await frame
      .getByRole('textbox', { name: 'mountpoint suffix' })
      .fill('/usb');
    await frame
      .getByRole('gridcell', { name: '1', exact: true })
      .getByPlaceholder('File system')
      .fill('1000');
    await frame.getByRole('button', { name: 'GiB' }).nth(1).click();
    await frame.getByRole('option', { name: 'KiB' }).click();

    const closeTmpButton = frame
      .getByRole('row', {
        name: 'Draggable row draggable button /tmp /usb xfs 1000 KiB',
      })
      .getByRole('button')
      .nth(3);

    await expect(closeTmpButton).toBeEnabled();
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
    await frame.getByLabel('Revisit File system configuration step').click();

    const closeRootButton = frame
      .getByRole('row', {
        name: 'Draggable row draggable button / xfs 10 GiB',
      })
      .getByRole('button')
      .nth(3);
    await expect(closeRootButton).toBeDisabled();

    const closeTmpButton = frame
      .getByRole('row', {
        name: 'Draggable row draggable button /tmp /usb xfs 1000 KiB',
      })
      .getByRole('button')
      .nth(3);
    await expect(closeTmpButton).toBeEnabled();

    const usbTextbox = frame.getByRole('textbox', {
      name: 'mountpoint suffix',
    });
    await expect(usbTextbox).toHaveValue('/usb');

    await frame
      .getByRole('gridcell', { name: '1000', exact: true })
      .getByPlaceholder('File system')
      .click();
    await frame
      .getByRole('gridcell', { name: '1000', exact: true })
      .getByPlaceholder('File system')
      .fill('1024');

    await frame.getByRole('button', { name: '/tmp' }).click();
    await frame.getByRole('option', { name: '/usr' }).click();
    await expect(
      frame.getByText(
        'Sub-directories for the /usr mount point are no longer supported'
      )
    ).toBeVisible();

    await frame.getByRole('button', { name: '/usr' }).click();
    await frame.getByRole('option', { name: '/srv' }).click();

    await frame
      .getByRole('textbox', { name: 'mountpoint suffix' })
      .fill('/data');

    await frame.getByRole('button', { name: 'KiB' }).click();
    await frame.getByRole('option', { name: 'MiB' }).click();

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  // This is for hosted service only as these features are not available in cockpit plugin
  await test.step('Export BP', async (step) => {
    step.skip(!isHosted(), 'Exporting is not available in the plugin');
    await exportBlueprint(page, blueprintName);
  });

  await test.step('Import BP', async (step) => {
    step.skip(!isHosted(), 'Importing is not available in the plugin');
    await importBlueprint(page, blueprintName);
  });

  await test.step('Review imported BP', async (step) => {
    step.skip(!isHosted(), 'Importing is not available in the plugin');
    await fillInImageOutputGuest(page);
    await frame
      .getByRole('button', { name: 'File system configuration' })
      .click();

    const closeRootButton = frame
      .getByRole('row', {
        name: 'Draggable row draggable button / xfs 10 GiB',
      })
      .getByRole('button')
      .nth(3);
    await expect(closeRootButton).toBeDisabled();

    const closeTmpButton = frame
      .getByRole('row', {
        name: 'Draggable row draggable button /srv /data xfs 1 GiB',
      })
      .getByRole('button')
      .nth(3);
    await expect(closeTmpButton).toBeEnabled();

    const dataTextbox = frame.getByRole('textbox', {
      name: 'mountpoint suffix',
    });
    await expect(dataTextbox).toHaveValue('/data');

    const size = frame
      .getByRole('gridcell', { name: '1', exact: true })
      .getByPlaceholder('File system');
    await expect(size).toHaveValue('1');

    const unitButton = frame.getByRole('button', { name: 'GiB' }).nth(1);
    await expect(unitButton).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
