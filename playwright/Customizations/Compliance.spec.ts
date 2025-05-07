import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/cleanup';
import { isHosted } from '../helpers/helpers';
import { login } from '../helpers/login';
import { navigateToOptionalSteps, ibFrame } from '../helpers/navHelpers';
import {
  registerLater,
  fillInDetails,
  createBlueprint,
  fillInImageOutputGuest,
  deleteBlueprint,
  exportBlueprint,
  importBlueprint,
} from '../helpers/wizardHelpers';

test('Create a blueprint with Compliance customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
  await cleanup.add(() => deleteBlueprint(page, blueprintName));

  // Login, navigate to IB and get the frame
  await login(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async (step) => {
    step.skip(!isHosted());
    await navigateToOptionalSteps(frame);
    await registerLater(frame);
  });

  await test.step('Select and fill the Compliance step', async (step) => {
    step.skip(!isHosted());
    await frame.getByRole('button', { name: 'Compliance' }).click();
    await frame.getByRole('button', { name: 'OpenSCAP profiles' }).click();
    await frame.getByPlaceholder('Select a profile').fill('ccn_basic');
    await frame
      .getByRole('option', {
        name: 'Centro Criptológico Nacional (CCN) - STIC for Red Hat Enterprise Linux 9 - Basic',
      })
      .click();
    await expect(frame.getByPlaceholder('Select a profile')).toHaveValue(
      'xccdf_org.ssgproject.content_profile_ccn_basic'
    );

    // Compliance policies - dunno if they are there in the test profiles
    await frame.getByRole('button', { name: 'Compliance policies' }).click();
    frame.getByPlaceholder('Select a policy');
    await frame
      .getByRole('option', {
        name: 'CIS Red Hat Enterprise Linux 9 Benchmark for Level 2 - Server (Customizations Test)',
      })
      .click();
    await expect(frame.getByPlaceholder('Select a profile')).toHaveValue(
      'CIS Red Hat Enterprise Linux 9 Benchmark for Level 2 - Server (Customizations Test)'
    );
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async (step) => {
    step.skip(!isHosted());
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async (step) => {
    step.skip(!isHosted());
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit BP', async (step) => {
    step.skip(!isHosted());
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Compliance' }).click();
    await frame.getByRole('button', { name: 'Clear input' }).first().click();
    await frame.getByPlaceholder('Select a profile').fill('ism_o');
    await frame
      .getByRole('option', {
        name: 'Australian Cyber Security Centre (ACSC) ISM Official',
      })
      .click();
    await expect(frame.getByPlaceholder('Select a profile')).toHaveValue(
      'xccdf_org.ssgproject.content_profile_ism_o'
    );
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  // This is for hosted service only as these features are not available in cockpit plugin
  await test.step('Export BP', async (step) => {
    step.skip(!isHosted(), 'Exporting is not available in the plugin');
    await exportBlueprint(page, blueprintName);
  });

  await test.step('Import BP', async (step) => {
    step.skip(!isHosted(), 'Importing is not available in the plugin');
    await importBlueprint(page, blueprintName);
  });

  await test.step('Review imported BP', async (step) => {
    step.skip(!isHosted(), 'Review is not available in the plugin');
    await fillInImageOutputGuest(page);
    await frame.getByRole('button', { name: 'Compliance' }).click();
    await expect(frame.getByPlaceholder('Select a profile')).toHaveValue(
      'xccdf_org.ssgproject.content_profile_ism_o'
    );
    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
