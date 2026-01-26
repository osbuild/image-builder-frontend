import { readFileSync } from 'node:fs';

import { expect } from '@playwright/test';
import TOML from 'smol-toml';
import { v4 as uuidv4 } from 'uuid';

import isRhel from '../../src/Utilities/isRhel';
import { test } from '../fixtures/customizations';
import { getHostDistroName, isHosted } from '../helpers/helpers';
import { ensureAuthenticated } from '../helpers/login';
import { ibFrame, navigateToLandingPage } from '../helpers/navHelpers';
import { deleteBlueprint, registerLater } from '../helpers/wizardHelpers';

test('Cockpit AWS cloud upload', async ({ page, cleanup }) => {
  test.skip(isHosted(), 'Skip cockpit specific tests on hosted');

  await ensureAuthenticated(page);
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Cockpit worker config', async () => {
    const header = frame.getByText('Configure AWS Uploads');
    if (!(await header.isVisible())) {
      await frame
        .getByRole('button', { name: 'Configure Cloud Providers' })
        .click();
      await expect(header).toBeVisible();
    }

    const bucket = 'cockpit-ib-playwright-bucket';
    const credentials = '/test/credentials';
    const switchInput = frame.locator('#aws-config-switch');
    await expect(switchInput).toBeVisible();

    // introduce a wait time, since it takes some time to load the
    // worker config file.
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(1000);

    // If this test fails for any reason, the config should already be loaded
    // and visible on the retury. If it is go back to the landing page
    if (await switchInput.isChecked()) {
      await frame.getByRole('button', { name: 'Cancel' }).click();
      await expect(
        frame.getByRole('heading', { name: 'All images' }),
      ).toBeVisible();
    } else {
      const switchToggle = frame.locator('.pf-v6-c-switch');
      await switchToggle.click();

      await frame
        .getByPlaceholder('AWS bucket')
        // this doesn't need to exist, we're just testing that
        // the form works as expected
        .fill(bucket);
      await frame.getByPlaceholder('Path to AWS credentials').fill(credentials);
      await frame.getByRole('button', { name: 'Submit' }).click();
      await expect(
        frame.getByRole('heading', { name: 'All images' }),
      ).toBeVisible();
    }

    await frame
      .getByRole('button', { name: 'Configure Cloud Providers' })
      .click();
    await expect(header).toBeVisible();

    // introduce a wait time, since it takes some time to load the
    // worker config file.
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(1500);

    await expect(frame.locator('#aws-config-switch')).toBeChecked();

    await expect(frame.getByPlaceholder('AWS bucket')).toHaveValue(bucket);
    await expect(frame.getByPlaceholder('Path to AWS credentials')).toHaveValue(
      credentials,
    );
    await frame.getByRole('button', { name: 'Cancel' }).click();

    const config = readFileSync('/etc/osbuild-worker/osbuild-worker.toml');
    // this is for testing, the field `aws` should exist
    // eslint-disable-next-line
    const parsed = TOML.parse(config.toString()) as any;
    expect(parsed.aws?.bucket).toBe(bucket);
    expect(parsed.aws?.credentials).toBe(credentials);
  });

  const blueprintName = uuidv4();
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await test.step('Cockpit cloud upload', async () => {
    await frame.getByTestId('blueprints-create-button').click();
    await expect(
      frame.getByRole('heading', { name: 'Image output' }),
    ).toBeVisible();
    await frame.getByRole('checkbox', { name: /amazon web services/i }).click();
    await frame.getByRole('button', { name: 'Next', exact: true }).click();
    await frame.getByRole('button', { name: 'Next', exact: true }).click();
    await registerLater(frame);
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame.getByRole('button', { name: 'Back', exact: true }).click();

    await expect(frame.getByRole('heading', { name: 'Details' })).toBeVisible();
    await frame.getByTestId('blueprint').fill(blueprintName);
    await expect(frame.getByTestId('blueprint')).toHaveValue(blueprintName);
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('button', { name: 'Create blueprint' }).click();
    await frame.getByTestId('close-button-saveandbuild-modal').click();
    await frame.getByRole('button', { name: 'Create blueprint' }).click();

    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    // the clickable blueprint cards are a bit awkward, so use the
    // button's id instead
    await frame.locator(`button[id="${blueprintName}"]`).click();
    await frame.getByTestId('blueprint-build-image-menu-option').click();

    // make sure the image is present
    await frame
      .getByTestId('images-table')
      .getByRole('button', { name: 'Details' })
      .click();
    await expect(frame.getByText('Build Information')).toBeVisible();
  });
});
