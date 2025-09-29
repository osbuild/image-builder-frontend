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
  fillInDetails,
  registerLater,
} from '../helpers/wizardHelpers';

test('Basic create/build/delete test', async ({ page, cleanup }) => {
  const blueprintName = uuidv4();
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to review step in Wizard', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill in BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Build failure', async (step) => {
    step.skip(
      !isHosted(),
      'Skip build failure on prem, as it is not possible to intercept cockpit.http using playwright',
    );
    await page.route(/compose$/, async (route) => {
      const data = {
        errors: [
          {
            detail: 'detailed error description for this compose failure',
            title: '500',
          },
        ],
      };
      await route.fulfill({
        status: 500,
        json: data,
      });
    });

    await frame.getByTestId('blueprint-build-image-menu-option').click();
    await expect(
      frame.getByText('detailed error description for this compose failure'),
    ).toBeVisible();
    await page.unroute(/compose$/);
  });

  await test.step('Build start', async () => {
    await frame.getByTestId('blueprint-build-image-menu-option').click();
    // make sure the notification is visible
    await expect(frame.getByText('Image is being built')).toBeVisible();
  });
});
