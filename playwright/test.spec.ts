import { readFileSync } from 'node:fs';

import TOML from '@ltd/j-toml';
import { expect, test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { closePopupsIfExist, isHosted } from './helpers/helpers';
import { ensureAuthenticated } from './helpers/login';
import { ibFrame, navigateToLandingPage } from './helpers/navHelpers';

test.describe.serial('test', () => {
  const blueprintName = uuidv4();
  test('create blueprint', async ({ page }) => {
    await ensureAuthenticated(page);
    await closePopupsIfExist(page);
    // Navigate to IB landing page and get the frame
    await navigateToLandingPage(page);
    const frame = await ibFrame(page);

    frame.getByRole('heading', { name: 'Images About image builder' });
    frame.getByRole('heading', { name: 'Blueprints' });
    await frame.getByTestId('blueprints-create-button').click();

    frame.getByRole('heading', { name: 'Image output' });
    await frame
      .getByRole('checkbox', { name: /Virtualization guest image/i })
      .click();
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    if (isHosted()) {
      frame.getByRole('heading', {
        name: 'Register systems using this image',
      });
      await page.getByRole('radio', { name: /Register later/i }).click();
      await frame.getByRole('button', { name: 'Next', exact: true }).click();
    }

    frame.getByRole('heading', { name: 'Compliance' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    frame.getByRole('heading', { name: 'File system configuration' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    if (isHosted()) {
      frame.getByRole('heading', { name: 'Repository snapshot' });
      await frame.getByRole('button', { name: 'Next', exact: true }).click();
      frame.getByRole('heading', { name: 'Custom repositories' });
      await frame.getByRole('button', { name: 'Next', exact: true }).click();
    }

    frame.getByRole('heading', { name: 'Additional packages' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    frame.getByRole('heading', { name: 'Users' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    frame.getByRole('heading', { name: 'Timezone' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    frame.getByRole('heading', { name: 'Locale' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    frame.getByRole('heading', { name: 'Hostname' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    frame.getByRole('heading', { name: 'Kernel' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    frame.getByRole('heading', { name: 'Firewall' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    frame.getByRole('heading', { name: 'Systemd services' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    if (isHosted()) {
      frame.getByRole('heading', { name: 'First boot configuration' });
      await frame.getByRole('button', { name: 'Next', exact: true }).click();
    }

    frame.getByRole('heading', { name: 'Details' });
    await frame.getByTestId('blueprint').fill(blueprintName);
    await expect(frame.getByTestId('blueprint')).toHaveValue(blueprintName);
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('button', { name: 'Create blueprint' }).click();
    await frame.getByTestId('close-button-saveandbuild-modal').click();
    await frame.getByRole('button', { name: 'Create blueprint' }).click();

    await expect(
      frame.locator('.pf-v6-c-card__title-text').getByText(blueprintName),
    ).toBeVisible();
  });

  test('edit blueprint', async ({ page }) => {
    await ensureAuthenticated(page);
    await closePopupsIfExist(page);
    // package searching is really slow the first time in cockpit
    if (!isHosted()) {
      test.setTimeout(300000);
    }

    // Navigate to IB landing page and get the frame
    await navigateToLandingPage(page);
    const frame = await ibFrame(page);
    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    // the clickable blueprint cards are a bit awkward, so use the
    // button's id instead
    await frame.locator(`button[id="${blueprintName}"]`).click();

    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await frame
      .getByTestId('packages-search-input')
      .locator('input')
      .fill('osbuild-composer');
    frame.getByTestId('packages-table').getByText('Searching');
    frame.getByRole('gridcell', { name: 'osbuild-composer' }).first();
    await frame.getByRole('checkbox', { name: 'Select row 0' }).check();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame.getByRole('button', { name: 'About packages' }).click();
    frame.getByRole('gridcell', { name: 'osbuild-composer' });
    await frame.getByRole('button', { name: 'Close', exact: true }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();

    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'About packages' }).click();
    frame.getByRole('gridcell', { name: 'osbuild-composer' });
    await frame.getByRole('button', { name: 'Close', exact: true }).click();
    await frame.getByRole('button', { name: 'Cancel', exact: true }).click();
    frame.getByRole('heading', { name: 'All images' });
  });

  test('build blueprint', async ({ page }) => {
    await ensureAuthenticated(page);
    await closePopupsIfExist(page);
    // Navigate to IB landing page and get the frame
    await navigateToLandingPage(page);
    const frame = await ibFrame(page);
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
    frame.getByText('Build Information');
  });

  test('delete blueprint', async ({ page }) => {
    await ensureAuthenticated(page);
    await closePopupsIfExist(page);
    // Navigate to IB landing page and get the frame
    await navigateToLandingPage(page);
    const frame = await ibFrame(page);
    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    // the clickable blueprint cards are a bit awkward, so use the
    // button's id instead
    await frame.locator(`button[id="${blueprintName}"]`).click();
    await frame.getByRole('button', { name: /blueprint menu toggle/i }).click();
    await frame.getByRole('menuitem', { name: 'Delete blueprint' }).click();
    await frame.getByRole('button', { name: 'Delete' }).click();
  });

  test('cockpit worker config', async ({ page }) => {
    if (isHosted()) {
      return;
    }

    await ensureAuthenticated(page);
    await closePopupsIfExist(page);
    // Navigate to IB landing page and get the frame
    await navigateToLandingPage(page);
    await page.goto('/cockpit-image-builder');
    const frame = ibFrame(page);

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
    const parsed = TOML.parse(config) as any;
    expect(parsed.aws?.bucket).toBe(bucket);
    expect(parsed.aws?.credentials).toBe(credentials);
  });

  const cockpitBlueprintname = uuidv4();
  test('cockpit cloud upload', async ({ page }) => {
    if (isHosted()) {
      return;
    }

    await ensureAuthenticated(page);
    await closePopupsIfExist(page);
    // Navigate to IB landing page and get the frame
    await navigateToLandingPage(page);
    await page.goto('/cockpit-image-builder');
    const frame = ibFrame(page);

    frame.getByRole('heading', { name: 'Images About image builder' });
    frame.getByRole('heading', { name: 'Blueprints' });
    await frame.getByTestId('blueprints-create-button').click();

    frame.getByRole('heading', { name: 'Image output' });
    // the first card should be the AWS card
    await frame.locator('.pf-v6-c-card').first().click();
    await frame.getByRole('button', { name: 'Next', exact: true }).click();
    await frame.getByRole('button', { name: 'Next', exact: true }).click();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame.getByRole('button', { name: 'Back', exact: true }).click();

    frame.getByRole('heading', { name: 'Details' });
    await frame.getByTestId('blueprint').fill(cockpitBlueprintname);
    await expect(frame.getByTestId('blueprint')).toHaveValue(
      cockpitBlueprintname,
    );
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('button', { name: 'Create blueprint' }).click();
    await frame.getByTestId('close-button-saveandbuild-modal').click();
    await frame.getByRole('button', { name: 'Create blueprint' }).click();

    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(cockpitBlueprintname);
    // the clickable blueprint cards are a bit awkward, so use the
    // button's id instead
    await frame.locator(`button[id="${cockpitBlueprintname}"]`).click();
    await frame.getByTestId('blueprint-build-image-menu-option').click();

    // make sure the image is present
    await frame
      .getByTestId('images-table')
      .getByRole('button', { name: 'Details' })
      .click();
    frame.getByText('Build Information');
  });
});
