import { expect, test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { isHosted } from './helpers/helpers';
import { login } from './helpers/login';
import { ibFrame } from './helpers/navHelpers';

test.describe.serial('test', () => {
  const blueprintName = uuidv4();
  test('create blueprint', async ({ page }) => {
    await login(page);
    const frame = await ibFrame(page);

    await frame.getByRole('heading', { name: 'Images About image builder' });
    await frame.getByRole('heading', { name: 'Blueprints' });
    await frame.getByTestId('blueprints-create-button').click();

    await frame.getByRole('heading', { name: 'Image output' });
    await frame.getByTestId('checkbox-guest-image').click();
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    if (isHosted()) {
      await frame.getByRole('heading', {
        name: 'Register systems using this image',
      });
      await page.getByTestId('register-later-radio').click();
      await frame.getByRole('button', { name: 'Next', exact: true }).click();
    }

    await frame.getByRole('heading', { name: 'Compliance' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('heading', { name: 'File system configuration' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    if (isHosted()) {
      await frame.getByRole('heading', { name: 'Repository snapshot' });
      await frame.getByRole('button', { name: 'Next', exact: true }).click();
      await frame.getByRole('heading', { name: 'Custom repositories' });
      await frame.getByRole('button', { name: 'Next', exact: true }).click();
    }

    await frame.getByRole('heading', { name: 'Additional packages' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('heading', { name: 'Users' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('heading', { name: 'Timezone' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('heading', { name: 'Locale' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('heading', { name: 'Hostname' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('heading', { name: 'Kernel' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('heading', { name: 'Firewall' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('heading', { name: 'Systemd services' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    if (isHosted()) {
      await frame.getByRole('heading', { name: 'First boot configuration' });
      await frame.getByRole('button', { name: 'Next', exact: true }).click();
    }

    await frame.getByRole('heading', { name: 'Details' });
    await frame.getByTestId('blueprint').fill(blueprintName);
    await expect(frame.getByTestId('blueprint')).toHaveValue(blueprintName);
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('button', { name: 'Create blueprint' }).click();
    await frame.getByTestId('close-button-saveandbuild-modal').click();
    await frame.getByRole('button', { name: 'Create blueprint' }).click();

    await expect(
      frame.locator('.pf-v5-c-card__title-text').getByText(blueprintName)
    ).toBeVisible();
  });

  test('edit blueprint', async ({ page }) => {
    // package searching is really slow the first time in cockpit
    if (!isHosted()) {
      test.setTimeout(300000);
    }

    await login(page);
    const frame = await ibFrame(page);
    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    await frame.getByText(blueprintName, { exact: true }).first().click();

    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await frame.getByTestId('packages-search-input').fill('osbuild-composer');
    await frame.getByTestId('packages-table').getByText('Searching');
    await frame.getByRole('gridcell', { name: 'osbuild-composer' }).first();
    await frame.getByRole('checkbox', { name: 'Select row 0' }).check();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame.getByRole('button', { name: 'About packages' }).click();
    await frame.getByRole('gridcell', { name: 'osbuild-composer' });
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();

    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'About packages' }).click();
    await frame.getByRole('gridcell', { name: 'osbuild-composer' });
    await frame.getByRole('button', { name: 'Cancel', exact: true }).click();
    await frame.getByRole('heading', { name: 'All images' });
  });

  test('build blueprint', async ({ page }) => {
    await login(page);
    const frame = await ibFrame(page);
    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    await frame.getByText(blueprintName, { exact: true }).first().click();
    await frame.getByTestId('blueprint-build-image-menu-option').click();

    // make sure the image is present
    await frame
      .getByTestId('images-table')
      .getByRole('button', { name: 'Details' })
      .click();
    await frame.getByText('Build Information');
  });

  test('delete blueprint', async ({ page }) => {
    await login(page);
    const frame = await ibFrame(page);
    await frame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    await frame.getByText(blueprintName, { exact: true }).first().click();
    await frame.getByTestId('blueprint-action-menu-toggle').click();
    await frame.getByRole('menuitem', { name: 'Delete blueprint' }).click();
    await frame.getByRole('button', { name: 'Delete' }).click();
  });
});
