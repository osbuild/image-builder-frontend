import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { isHosted } from '../helpers/helpers';
import { ensureAuthenticated } from '../helpers/login';
import { ibFrame, navigateToLandingPage } from '../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  exportBlueprint,
  importBlueprint,
} from '../helpers/wizardHelpers';

test('Image mode blueprint create, edit, export, import', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'Image mode on hosted only');

  const blueprintName = 'test-' + uuidv4();
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);
  await navigateToLandingPage(page);

  // Enable preview so the image-mode Unleash flag is active
  const previewToggle = page.locator('#preview-toggle');
  if (!(await previewToggle.isChecked())) {
    await previewToggle.click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(2000);
  }
  await expect(page.getByRole('heading', { name: 'All images' })).toBeVisible({
    timeout: 30000,
  });

  const frame = ibFrame(page);

  await frame.getByRole('button', { name: 'Create image blueprint' }).click();

  // Skip the test if the image mode flag is not enabled in this environment
  const imageModeToggle = frame.getByRole('button', { name: 'Image mode' });
  try {
    await expect(imageModeToggle).toBeVisible({ timeout: 10000 });
  } catch {
    test.skip(true, 'Image mode flag not enabled');
  }

  await test.step('Fill in details', async () => {
    await frame
      .getByRole('textbox', { name: 'Blueprint name' })
      .fill(blueprintName);
    await frame
      .getByRole('textbox', { name: 'Blueprint description' })
      .fill('Testing blueprint');
  });

  await test.step('Fill in image output with image mode', async () => {
    await imageModeToggle.click();

    const imageSourceDropdown = frame.getByRole('button', {
      name: /Select a bootc image/,
    });
    await expect(imageSourceDropdown).toBeVisible({ timeout: 10000 });
    await expect(imageSourceDropdown).toBeEnabled({ timeout: 5000 });
    await imageSourceDropdown.click();

    const firstOption = frame.getByRole('option').first();
    await expect(firstOption).toBeVisible({ timeout: 10000 });
    await firstOption.click();

    await frame.getByRole('checkbox', { name: 'Virtualization' }).click();
  });

  await test.step('Fill in user', async () => {
    await frame
      .getByRole('textbox', { name: 'blueprint user name' })
      .fill('testuser');
  });

  await test.step('Create blueprint', async () => {
    const firstNextButton = frame.getByRole('button', {
      name: 'Next',
      exact: true,
    });
    await expect(firstNextButton).toBeEnabled({ timeout: 10000 });
    await firstNextButton.click();
    const nextButton = frame.getByRole('button', { name: 'Next', exact: true });
    await expect(nextButton).toBeEnabled({ timeout: 10000 });
    await nextButton.click();
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit blueprint and verify image output', async () => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(2000);

    await frame.getByRole('button', { name: 'Edit blueprint' }).click();

    await frame.getByRole('button', { name: 'Base settings' }).click();

    const imageModeButton = frame.getByRole('button', { name: 'Image mode' });
    await expect(imageModeButton).toHaveAttribute('aria-pressed', 'true');

    await expect(
      frame.getByRole('button', { name: /Select a bootc image/ }),
    ).toBeHidden();

    await expect(
      frame.getByRole('checkbox', { name: 'Virtualization' }),
    ).toBeChecked();
  });

  await test.step('Verify user in edit modal', async () => {
    await expect(
      frame.getByRole('textbox', { name: 'blueprint user name' }),
    ).toHaveValue('testuser');

    await frame.getByRole('button', { name: 'Next', exact: true }).click();
    const saveNextButton = frame.getByRole('button', {
      name: 'Next',
      exact: true,
    });
    await expect(saveNextButton).toBeEnabled({ timeout: 10000 });
    await saveNextButton.click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  let exportedBP = '';

  await test.step('Export blueprint', async () => {
    exportedBP = await exportBlueprint(page);
    cleanup.add(async () => {
      await fsPromises.rm(path.dirname(exportedBP), { recursive: true });
    });
  });

  const importedName = blueprintName + '-imported';
  cleanup.add(() => deleteBlueprint(page, importedName));

  await test.step('Import blueprint', async () => {
    await importBlueprint(frame, exportedBP);
  });

  await test.step('Verify imported blueprint', async () => {
    const importedImageMode = frame.getByRole('button', {
      name: 'Image mode',
    });
    await expect(importedImageMode).toBeVisible({ timeout: 10000 });
    await expect(importedImageMode).toHaveAttribute('aria-pressed', 'true');

    // Export doesn't include image_requests, so image types must be re-selected
    await frame.getByRole('checkbox', { name: 'Virtualization' }).click();

    await expect(
      frame.getByRole('textbox', { name: 'blueprint user name' }),
    ).toHaveValue('testuser');

    // Change the name to avoid "name already exists" conflict
    await frame
      .getByRole('textbox', { name: 'Blueprint name' })
      .fill(importedName);
  });
});
