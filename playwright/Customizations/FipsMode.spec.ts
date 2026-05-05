import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { isServiceAvailable } from '../helpers/apiHelpers';
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
  openWizard,
  registerLater,
} from '../helpers/wizardHelpers';

test('FIPS switch toggles and persists through save', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'FIPS mode is not available in the plugin');

  await test.step('Check if Compliance service is available', async () => {
    const complianceLandingPageEndpoint =
      '/api/compliance/v2/policies?limit=1&offset=0';
    test.skip(
      !(await isServiceAvailable(complianceLandingPageEndpoint, page)),
      `Endpoint ${complianceLandingPageEndpoint} is not available - service is most likely down.`,
    );
  });

  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
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

  await test.step('Toggle FIPS and select OpenSCAP profile', async () => {
    const fipsSwitch = frame.locator('label[for="fips-enabled-switch"]');
    await expect(fipsSwitch).toBeVisible();
    await fipsSwitch.click();
    await expect(frame.locator('#fips-enabled-switch')).toBeChecked();
    await fipsSwitch.click();
    await expect(frame.locator('#fips-enabled-switch')).not.toBeChecked();

    await frame
      .getByRole('radio', { name: 'Use a default OpenSCAP profile' })
      .check();

    await frame.getByTestId('profileSelect').click();
    await frame
      .getByRole('option', {
        name: /Red Hat STIG for Red Hat Enterprise Linux 10/i,
      })
      .click();

    const fipsInput = frame.locator('#fips-enabled-switch');
    await expect(fipsInput).toBeChecked();
  });

  await test.step('Navigate to Advanced settings and verify FIPS alert on Kernel', async () => {
    await frame.getByRole('button', { name: 'Advanced settings' }).click();
    await expect(
      frame.getByText(
        'Kernel will be configured to use FIPS, no additional configuration needed.',
      ),
    ).toBeVisible();
    await frame.getByRole('button', { name: 'Review image' }).click();
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP and verify FIPS remained enabled', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Base settings' }).click();
    const fipsInput = frame.locator('#fips-enabled-switch');
    await expect(fipsInput).toBeChecked();
  });
});
