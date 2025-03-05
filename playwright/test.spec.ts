import { expect, test } from '@playwright/test';

import {
  loginCockpit,
  ibFrame,
} from './lib/lib';

test.describe('test', () => {
  test('create blueprint', async ({ page }) => {
    await loginCockpit(page, 'admin', 'foobar');
    // await enableComposer(page);
    const frame = await ibFrame(page);

    // image output
    await frame.getByRole('heading', { name: 'Images About image builder' });
    await frame.getByRole('heading', { name: 'Blueprints' });
    await frame.getByRole('heading', { name: 'No blueprints yet' });
    await frame.getByTestId('create-blueprint-action-emptystate').click();
    await frame.getByRole('heading', { name: 'Image output' });
    await frame.getByTestId('checkbox-guest-image').click();
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('heading', { name: 'File system configuration' });
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

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

    await frame.getByRole('heading', { name: 'Details' });
    await frame.getByTestId('blueprint').fill('test-blueprint');
    await expect(frame.getByTestId('blueprint')).toHaveValue('test-blueprint');
    await frame.getByRole('button', { name: 'Next', exact: true }).click();

    await frame.getByRole('button', { name: 'Create blueprint' }).click();
    await frame.getByTestId('close-button-saveandbuild-modal').click();
    await frame.getByRole('button', { name: 'Create blueprint' }).click();

    await frame.getByText('test-blueprint');
  });

  test('edit blueprint', async ({ page }) => {
    // package searching is really slow the first time
    test.setTimeout(300000)

    await loginCockpit(page, 'admin', 'foobar');
    const frame = await ibFrame(page);
    await frame.getByText('test-blueprint').click();

    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await frame.getByTestId('packages-search-input').fill('osbuild-composer');
    await frame.getByTestId('packages-table').getByText('Searching');
    await frame.getByRole('gridcell', { name: 'osbuild-composer' }).first();
    await frame.getByRole('checkbox', { name: 'Select row 0' }).check();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame.getByRole('button', { name: 'About packages' }).click();
    await frame.getByRole('gridcell', { name: 'osbuild-composer' });
    await frame.getByRole('button', { name: 'Save changes to blueprint' }).click();

    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'About packages' }).click();
    await frame.getByRole('gridcell', { name: 'osbuild-composer' });
    await frame.getByRole('button', { name: 'Cancel', exact: true }).click();
    await frame.getByRole('heading', { name: 'All images' });
  });

  test('build blueprint', async ({ page }) => {
    // add time enough for depsolving
    test.setTimeout(60 * 1000);
    await loginCockpit(page, 'admin', 'foobar');
    const frame = await ibFrame(page);
    await frame.getByText('test-blueprint').click();
    await frame.getByTestId('blueprint-build-image-menu-option').click();

    // make sure the image is present
    await frame.getByTestId('images-table').getByText('Fedora');
  });

  test('delete blueprint', async ({ page }) => {
    await loginCockpit(page, 'admin', 'foobar');
    const frame = await ibFrame(page);
    await frame.getByText('test-blueprint').click();
    await frame.getByTestId('blueprint-action-menu-toggle').click();
    await frame.getByRole('menuitem', { name: 'Delete blueprint' }).click();
    await frame.getByRole('button', { name: 'Delete' }).click();
  });
});
