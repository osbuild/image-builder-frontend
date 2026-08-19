import { expect } from '@playwright/test';

import { test } from '../../fixtures/customizations';
import { isHosted } from '../../helpers/helpers';
import { ensureAuthenticated } from '../../helpers/login';
import { ibFrame, navigateToLandingPage } from '../../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  openWizard,
} from '../../helpers/wizardHelpers';
import { AwsWrapper } from '../helpers/AwsWrapper';
import { buildImage } from '../helpers/imageBuilding';

test('Image mode boot integration test', async ({ page, cleanup }) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'image-mode-test-' + crypto.randomUUID();

  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);
  await navigateToLandingPage(page);

  // Mark the "save and build" informational modal as already seen so it
  // doesn't block the create flow.
  await page.evaluate(() => {
    window.localStorage.setItem('imageBuilder.saveAndBuildModalSeen', 'true');
  });

  const frame = ibFrame(page);

  await test.step('Open Wizard', async () => {
    await openWizard(frame);
  });

  const imageModeToggle = frame.getByRole('button', { name: 'Image mode' });
  await expect(imageModeToggle).toBeVisible({ timeout: 10000 });

  await test.step('Fill in blueprint details', async () => {
    await frame
      .getByRole('textbox', { name: 'Blueprint name' })
      .fill(blueprintName);
    await frame
      .getByRole('textbox', { name: 'Blueprint description' })
      .fill('Image mode boot test blueprint');
  });

  await test.step('Enable image mode and select image output', async () => {
    await imageModeToggle.click();

    const imageSourceDropdown = frame.getByRole('button', {
      name: /Red Hat Enterprise Linux|RHEL/i,
    });
    await expect(imageSourceDropdown).toBeVisible({ timeout: 10000 });
    await expect(imageSourceDropdown).toBeEnabled({ timeout: 5000 });
    await imageSourceDropdown.click();

    const rhelSourceOption = frame
      .getByRole('option', { name: /RHEL/i })
      .first();
    await expect(rhelSourceOption).toBeVisible({ timeout: 10000 });
    await rhelSourceOption.click();

    // In image mode, arch is determined by the image source, so we only select the target
    await frame.getByRole('radio', { name: /Amazon Web Services/ }).click();
    await frame
      .getByRole('textbox', { name: 'aws account id' })
      .fill(process.env.AWS_ACCOUNT_ID!);
  });

  await test.step('Create blueprint', async () => {
    const reviewImageButton = frame.getByRole('button', {
      name: 'Review image',
    });
    await expect(reviewImageButton).toBeEnabled({ timeout: 10000 });
    await reviewImageButton.click();
    await createBlueprint(frame, blueprintName);
  });

  let amiId: string = '';

  await test.step('Build image and get AMI info', async () => {
    await buildImage(page);
    await frame.getByText('Launch').click();
    amiId =
      (await frame
        .locator('span.pf-v6-u-font-weight-bold')
        .filter({ hasText: /^ami-/ })
        .textContent()) ?? '';
  });

  const image = new AwsWrapper(amiId);
  cleanup.add(() => image.terminateInstance());

  await test.step('Prepare AWS instance', async () => {
    await image.launchInstance();
  });

  await test.step('Verify image boots successfully', async () => {
    const [exitCode, output] = await image.exec('cat /etc/os-release');
    expect(exitCode).toBe(0);
    expect(output).toContain('Red Hat Enterprise Linux');
  });

  await test.step('Verify system is operational', async () => {
    const [exitCode, output] = await image.exec('systemctl is-system-running');
    expect(exitCode).toBe(0);
    expect(output).toMatch(/running|degraded/);
  });

  await test.step('Verify basic system commands work', async () => {
    const [exitCode] = await image.exec('rpm -qa');
    expect(exitCode).toBe(0);
  });
});
