import { expect } from '@playwright/test';

import { test } from '../fixtures/customizations';
import { isHosted } from '../helpers/helpers';
import { ensureAuthenticated } from '../helpers/login';
import {
  fillInImageOutput,
  ibFrame,
  navigateToLandingPage,
} from '../helpers/navHelpers';
import { registerLater } from '../helpers/wizardHelpers';

test('shows on-premise wildcard search instructions when running on-premise', async ({
  page,
}) => {
  test.skip(isHosted(), 'Skip on-premise specific tests on hosted');

  await ensureAuthenticated(page);
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Navigate to packages step', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
    // Navigate to packages step
    await frame
      .getByRole('button', { name: 'Additional packages', exact: false })
      .click();
  });

  await test.step('Verify on-premise wildcard search instructions', async () => {
    await expect(
      frame.getByRole('textbox', { name: /Search packages/i }),
    ).toBeVisible();

    await expect(
      frame.getByText(/glob using asterisk wildcards \(\*\)/i),
    ).toBeVisible();

    await expect(
      frame.getByText(
        /Search for package groups by starting your search with the '@' character/i,
      ),
    ).toBeHidden();
  });
});
