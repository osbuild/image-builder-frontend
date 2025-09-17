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
      frame.getByRole('heading', { name: 'Ansible Automation Platform' });
      await frame.getByRole('button', { name: 'Next', exact: true }).click();
    }

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
      frame.locator('.pf-v6-c-card__title-text').getByText(
        // if the name is too long, the blueprint card will have a truncated name.
        blueprintName.length > 24
          ? blueprintName.slice(0, 24) + '...'
          : blueprintName,
      ),
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
    await frame
      .getByPlaceholder('AWS bucket')
      // this doesn't need to exist, we're just testing that
      // the form works as expected
      .fill('some-random-bucket');
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
