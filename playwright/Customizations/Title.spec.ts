import { expect } from '@playwright/test';

import { test } from '../fixtures/customizations';

test('Check Blueprint heading and button', async ({ page }) => {
  await page.goto('/insights/image-builder/landing');
  await expect(
    page.getByRole('heading', { name: 'Images' }).first(),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Blueprints' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Create image blueprint' }),
  ).toBeVisible();
});
