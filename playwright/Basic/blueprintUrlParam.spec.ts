import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { getBlueprintIdByName } from '../helpers/apiHelpers';
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
  fillInDetails,
  registerLater,
} from '../helpers/wizardHelpers';

test('Navigate with valid blueprint_id URL parameter', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'Hosted only');

  const blueprintName = uuidv4();
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Create a blueprint', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);
  });

  const blueprintId =
    await test.step('Get blueprint UUID via API', async () => {
      return await getBlueprintIdByName(page, blueprintName);
    });

  await test.step('Navigate with blueprint_id query parameter', async () => {
    await page.goto(
      `/insights/image-builder/landing?blueprint_id=${blueprintId}`,
    );
    await expect(
      frame.getByRole('heading', { name: `${blueprintName} images` }),
    ).toBeVisible({ timeout: 30000 });
  });

  await test.step('Verify blueprint is selected', async () => {
    await expect(
      frame.getByRole('heading', { name: `${blueprintName} images` }),
    ).toBeVisible();
    await expect(frame.getByTestId('images-table')).toBeVisible();
  });
});

test('Navigate with invalid blueprint_id is ignored', async ({ page }) => {
  test.skip(!isHosted(), 'Hosted only');

  await ensureAuthenticated(page);

  await test.step('Navigate with invalid blueprint_id', async () => {
    await page.goto('/insights/image-builder/landing?blueprint_id=not-a-uuid');
    await expect(page.getByRole('heading', { name: 'All images' })).toBeVisible(
      { timeout: 30000 },
    );
  });

  await test.step('Verify default view is shown', async () => {
    const frame = ibFrame(page);
    await expect(frame.getByTestId('images-table')).toBeVisible();
  });
});
