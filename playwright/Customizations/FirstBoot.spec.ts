import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
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
  importBlueprint,
  openWizard,
  registerLater,
} from '../helpers/wizardHelpers';

test('Create a blueprint with First boot customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();
  const scriptContent = '#!/bin/bash\necho "Hello, World!"';
  const editedScriptContent = '#!/bin/bash\necho "Edited script"';

  test.skip(
    !isHosted(),
    'First boot customization is not available in the plugin',
  );

  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  await test.step('Navigate to IB landing page', async () => {
    await navigateToLandingPage(page);
  });

  const frame = ibFrame(page);

  await test.step('Open Wizard', async () => {
    await openWizard(frame);
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Fill Image Output and Registration', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
  });

  await test.step('Navigate to Advanced settings', async () => {
    await frame.getByRole('button', { name: 'Advanced settings' }).click();
  });

  await test.step('Add first boot script', async () => {
    await frame.getByRole('button', { name: 'Start from scratch' }).click();

    const editorArea = frame.locator('.monaco-editor').first();
    await editorArea.click();
    await page.keyboard.type(scriptContent);

    await expect(
      frame.getByRole('button', { name: 'Start from scratch' }),
    ).toBeHidden();
  });

  await test.step('Verify shebang validation', async () => {
    const editorArea = frame.locator('.monaco-editor').first();

    await editorArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('echo "No shebang"');

    await expect(frame.getByText(/Missing shebang/i)).toBeVisible();

    await page.keyboard.press('Control+A');
    await page.keyboard.type(scriptContent);

    await expect(frame.getByText(/Missing shebang/i)).toBeHidden();
  });

  await test.step('Review and create BP', async () => {
    await frame.getByRole('button', { name: 'Review image' }).click();
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP with updated script', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Advanced settings' }).click();

    const editorArea = frame.locator('.monaco-editor').first();
    await editorArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(editedScriptContent);

    await frame.getByRole('button', { name: 'Review image' }).click();
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

  await test.step('Import BP', async () => {
    await importBlueprint(frame, exportedBP);
  });

  await test.step('Review imported BP', async () => {
    await fillInImageOutput(frame);
    if (!isHosted()) {
      await registerLater(frame);
    }
    await frame.getByRole('textbox', { name: 'Blueprint name' }).fill('tmp');
    await frame.getByRole('button', { name: 'Advanced settings' }).click();
    await expect(
      frame.getByRole('button', { name: 'Revert changes' }),
    ).toBeVisible();
    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
