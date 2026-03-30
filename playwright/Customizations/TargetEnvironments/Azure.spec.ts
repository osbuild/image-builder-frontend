import { expect } from '@playwright/test';
import { selectTarget } from 'playwright/helpers/targetChooser';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../../fixtures/customizations';
import { isHosted } from '../../helpers/helpers';
import { ensureAuthenticated } from '../../helpers/login';
import { ibFrame, navigateToLandingPage } from '../../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  fillInDetails,
  registerLater,
} from '../../helpers/wizardHelpers';

const TENANT_GUID = 'b8f86d22-4371-46ce-95e7-65c415f3b1e2';
const SUBSCRIPTION_ID = '60631143-a7dc-4d15-988b-ba83f3c99711';
const RESOURCE_GROUP = 'testResourceGroup';

test('Create a blueprint with Azure target', async ({ page, cleanup }) => {
  test.skip(!isHosted(), 'Azure target is only available on hosted service');

  const blueprintName = 'test-azure-' + uuidv4();
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Select Azure target and verify field behavior', async () => {
    await page.getByRole('button', { name: 'Create image blueprint' }).click();

    await selectTarget(frame, 'azure');

    const nextButton = frame.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeDisabled();

    const tenantInput = frame.getByRole('textbox', {
      name: /azure tenant guid/i,
    });
    const subscriptionInput = frame.getByRole('textbox', {
      name: /subscription id/i,
    });
    const resourceGroupInput = frame.getByRole('textbox', {
      name: /resource group/i,
    });

    await expect(tenantInput).toHaveValue('');
    await expect(tenantInput).toBeEnabled();

    await expect(subscriptionInput).toHaveValue('');
    await expect(subscriptionInput).toBeEnabled();

    await expect(resourceGroupInput).toHaveValue('');
    await expect(resourceGroupInput).toBeEnabled();

    await tenantInput.fill(TENANT_GUID);
    await subscriptionInput.fill(SUBSCRIPTION_ID);
    await resourceGroupInput.fill(RESOURCE_GROUP);

    await expect(nextButton).toBeEnabled();
  });

  await test.step('Navigate to review and create blueprint', async () => {
    await frame.getByRole('button', { name: 'Next' }).click();
    await registerLater(frame);
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Verify Azure details on review step', async () => {
    await expect(frame.getByText('Microsoft Azure')).toBeVisible();
    await expect(frame.getByText(TENANT_GUID)).toBeVisible();
    await expect(frame.getByText(SUBSCRIPTION_ID)).toBeVisible();
    await expect(frame.getByText(RESOURCE_GROUP)).toBeVisible();
  });

  await test.step('Create blueprint', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit blueprint and verify Azure config persisted', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame
      .getByLabel('Wizard steps')
      .getByRole('button', { name: 'Image output' })
      .click();

    const tenantInput = frame.getByRole('textbox', {
      name: /azure tenant guid/i,
    });
    const subscriptionInput = frame.getByRole('textbox', {
      name: /subscription id/i,
    });
    const resourceGroupInput = frame.getByRole('textbox', {
      name: /resource group/i,
    });

    await expect(tenantInput).toHaveValue(TENANT_GUID);
    await expect(subscriptionInput).toHaveValue(SUBSCRIPTION_ID);
    await expect(resourceGroupInput).toHaveValue(RESOURCE_GROUP);

    await expect(
      frame.getByRole('button', { name: /Generation 2/i }),
    ).toBeVisible();
  });

  await test.step('Change Hyper-V generation to V1 and save', async () => {
    await frame.getByRole('button', { name: /Generation 2/i }).click();
    await frame.getByRole('option', { name: /generation 1/i }).click();

    await expect(
      frame.getByRole('button', { name: /Generation 1/i }),
    ).toBeVisible();

    await frame.getByRole('button', { name: 'Next', exact: true }).click();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  await test.step('Re-edit and verify V1 persisted', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame
      .getByLabel('Wizard steps')
      .getByRole('button', { name: 'Image output' })
      .click();

    await expect(
      frame.getByRole('button', { name: /Generation 1/i }),
    ).toBeVisible();

    await frame.getByRole('button', { name: 'Next', exact: true }).click();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });
});

test('Deselecting Azure removes its config from the blueprint', async ({
  page,
  cleanup,
}) => {
  test.skip(!isHosted(), 'Azure target is only available on hosted service');

  const blueprintName = 'test-azure-deselect-' + uuidv4();
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Select Azure and fill in fields', async () => {
    await page.getByRole('button', { name: 'Create image blueprint' }).click();

    await selectTarget(frame, 'azure');

    await frame
      .getByRole('textbox', { name: /azure tenant guid/i })
      .fill(TENANT_GUID);
    await frame
      .getByRole('textbox', { name: /subscription id/i })
      .fill(SUBSCRIPTION_ID);
    await frame
      .getByRole('textbox', { name: /resource group/i })
      .fill(RESOURCE_GROUP);

    await frame.getByRole('button', { name: 'Next' }).click();
  });

  await test.step('Go back and deselect Azure', async () => {
    await frame
      .getByLabel('Wizard steps')
      .getByRole('button', { name: 'Image output' })
      .click();

    await selectTarget(frame, 'azure');

    await expect(
      frame.getByRole('checkbox', { name: 'Microsoft Azure' }),
    ).not.toBeChecked();
  });

  await test.step('Select Guest Image and continue', async () => {
    await frame.getByRole('checkbox', { name: /Virtualization/i }).click();
    await frame.getByRole('button', { name: 'Next' }).click();
  });

  await test.step('Navigate to review and verify no Azure details', async () => {
    await registerLater(frame);
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);

    // Azure-specific details should not be present on the review step
    await expect(frame.getByText(TENANT_GUID)).toBeHidden();
    await expect(frame.getByText(SUBSCRIPTION_ID)).toBeHidden();
    await expect(frame.getByText(RESOURCE_GROUP)).toBeHidden();
  });

  await test.step('Create blueprint', async () => {
    await createBlueprint(frame, blueprintName);
  });
});
