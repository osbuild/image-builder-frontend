import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { exportedLocaleBP } from '../fixtures/data/exportBlueprintContents';
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
  exportBlueprint,
  fillInDetails,
  fillInImageOutputGuest,
  importBlueprint,
  registerLater,
  verifyExportedBlueprint,
} from '../helpers/wizardHelpers';

test('Create a blueprint with Locale customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
  });

  await test.step('Check that the Locale step shows langpacks, but not the Additional packages', async () => {
    await frame.getByRole('button', { name: 'Locale' }).click();
    await frame.getByPlaceholder('Select a language').click();
    await frame.getByPlaceholder('Select a language').fill('ru_RU');
    await frame
      .getByRole('option', { name: 'Russian - Russia (ru_RU.UTF-8)' })
      .click();

    // Cockpit search is slow - wait up to 1 minute for verification to complete
    await expect(
      frame.getByText(
        'The following packages will be added based on your preferred locale:',
      ),
    ).toBeVisible({ timeout: 60_000 });
    await expect(frame.getByText('langpacks-ru')).toBeVisible();

    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await frame
      .getByRole('textbox', { name: 'Search packages' })
      .fill('langpacks-ru');
    await frame.getByRole('button', { name: 'Selected' }).click();
    await expect(frame.getByText('langpacks-ru')).toHaveCount(0);
  });

  await test.step('Select and fill the Locale step', async () => {
    await frame.getByRole('button', { name: 'Locale' }).click();
    await frame.getByPlaceholder('Select a language').fill('en_US');
    await frame
      .getByRole('option', {
        name: 'English - United States (en_US.UTF-8)',
      })
      .click();
    await expect(
      frame.getByText('English - United States (en_US.UTF-8)'),
    ).toBeVisible();
    await frame.getByPlaceholder('Select a language').fill('fy');
    await frame
      .getByRole('option', {
        name: 'Western Frisian - Germany (fy_DE.UTF-8)',
      })
      .click();
    await expect(
      frame.getByText('Western Frisian - Germany (fy_DE.UTF-8)'),
    ).toBeVisible();
    await frame.getByPlaceholder('Select a language').fill('aa');
    // Verify that the dropdown shows filtered options starting with 'aa'
    await expect(
      frame.getByRole('option', { name: 'aa - Eritrea (aa_ER.UTF-8)' }),
    ).toBeAttached();
    await expect(
      frame.getByRole('option', { name: 'aa - Ethiopia (aa_ET.UTF-8)' }),
    ).toBeAttached();
    await frame.getByPlaceholder('Select a language').fill('xxx');
    await expect(frame.getByText('No results found for')).toBeAttached();
    await frame.getByRole('button', { name: 'Menu toggle' }).nth(1).click();
    await frame.getByPlaceholder('Select a keyboard').fill('ami');
    await frame.getByRole('option', { name: 'amiga-de' }).click();
    // Cockpit search query is slow; wait up to 1 minute for verification
    await expect(frame.getByText('langpacks-en')).toBeVisible({
      timeout: 60_000,
    });
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP and verify locale langpacks in request', async () => {
    if (!isHosted()) {
      await createBlueprint(frame, blueprintName);
      return;
    }
    const [request] = await Promise.all([
      page.waitForRequest(
        (req) =>
          req.url().includes('/api/image-builder/v1/blueprints') &&
          req.method() === 'POST',
      ),
      createBlueprint(frame, blueprintName),
    ]);

    const body = request.postDataJSON();
    const packages: string[] = body?.customizations?.packages ?? [];
    const localeLangpacks = packages.filter((p) =>
      /^langpacks-[a-z]+$/.test(p),
    );
    expect(localeLangpacks.length).toBeGreaterThan(0);
    expect(packages).toEqual(
      expect.arrayContaining(['langpacks-ru', 'langpacks-en']),
    );
    // Locale customization must match selected languages (fy has no langpack, so not in packages)
    expect(body?.customizations?.locale?.languages).toEqual(
      expect.arrayContaining([
        'C.UTF-8',
        'ru_RU.UTF-8',
        'en_US.UTF-8',
        'fy_DE.UTF-8',
      ]),
    );
  });

  await test.step('Edit BP', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByLabel('Revisit Locale step').click();
    await expect(
      frame.getByText('English - United States (en_US.UTF-8)'),
    ).toBeVisible();
    await expect(
      frame.getByText('Western Frisian - Germany (fy_DE.UTF-8)'),
    ).toBeVisible();
    await expect(
      frame.getByText('Russian - Russia (ru_RU.UTF-8)'),
    ).toBeVisible();
    await frame.getByPlaceholder('Select a language').fill('en_GB');
    await frame
      .getByRole('option', {
        name: 'English - United Kingdom (en_GB.UTF-8)',
      })
      .click();
    await expect(
      frame.getByText('English - United Kingdom (en_GB.UTF-8)'),
    ).toBeVisible();
    await frame.getByRole('button', { name: 'Menu toggle' }).nth(1).click();
    await frame.getByRole('option', { name: 'ANSI-dvorak' }).click();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  let exportedBP = '';

  await test.step('Export BP', async () => {
    exportedBP = await exportBlueprint(page);
    cleanup.add(async () => {
      await fsPromises.rm(path.dirname(exportedBP), { recursive: true });
    });
  });

  await test.step('Review exported BP', async (step) => {
    step.skip(
      isHosted(),
      'Only verify the contents of the exported blueprint in cockpit',
    );
    verifyExportedBlueprint(exportedBP, exportedLocaleBP(blueprintName));
  });

  await test.step('Import BP', async () => {
    await importBlueprint(frame, exportedBP);
  });

  await test.step('Review imported BP', async () => {
    await fillInImageOutputGuest(frame);
    await frame.getByRole('button', { name: 'Locale' }).click();
    await expect(
      frame.getByText('English - United States (en_US.UTF-8)'),
    ).toBeVisible();
    await expect(
      frame.getByText('English - United Kingdom (en_GB.UTF-8)'),
    ).toBeVisible();
    await expect(
      frame.getByText('Western Frisian - Germany (fy_DE.UTF-8)'),
    ).toBeVisible();
    await expect(
      frame.getByText('Russian - Russia (ru_RU.UTF-8)'),
    ).toBeVisible();
    await expect(frame.getByPlaceholder('Select a keyboard')).toHaveValue(
      'ANSI-dvorak',
    );
    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
