import { expect } from '@playwright/test';

import { test } from '../fixtures/customizations';
import { isHosted } from '../helpers/helpers';
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
    const region = 'us-east-100';
    const profile = 'duck';
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
      await frame
        .getByPlaceholder('AWS profile in credentials file')
        .fill(profile);
      await frame.getByPlaceholder('AWS region').fill(region);
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
    await expect(frame.getByPlaceholder('AWS region')).toHaveValue(region);
    await expect(
      frame.getByPlaceholder('AWS profile in credentials file'),
    ).toHaveValue(profile);
    await frame.getByRole('button', { name: 'Cancel' }).click();
  });

  const blueprintName = crypto.randomUUID();
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await test.step('Cockpit cloud upload', async () => {
    await frame.getByTestId('blueprints-create-button').click();
    await expect(
      frame.getByRole('heading', { name: 'Base settings' }),
    ).toBeVisible();
    await frame.getByRole('checkbox', { name: /amazon web services/i }).click();
    await registerLater(frame);
    await frame.getByRole('button', { name: 'Review image' }).click();
    await frame.getByRole('button', { name: 'Back', exact: true }).click();

    await frame.getByRole('button', { name: 'Base settings' }).click();
    await expect(frame.getByRole('heading', { name: 'Details' })).toBeVisible();
    await frame
      .getByRole('textbox', { name: 'blueprint name' })
      .fill(blueprintName);
    await expect(
      frame.getByRole('textbox', { name: 'blueprint name' }),
    ).toHaveValue(blueprintName);
    await frame.getByRole('button', { name: 'Review image' }).click();

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
