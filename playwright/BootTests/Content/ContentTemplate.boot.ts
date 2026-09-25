import { expect } from '@playwright/test';

import {
  deleteRepository,
  deleteTemplate,
  navigateToRepositories,
  navigateToTemplates,
  pollForSystemInInventory,
  pollForSystemTemplateAttachment,
} from './helpers';

import { test } from '../../fixtures/customizations';
import { isHosted, sleep } from '../../helpers/helpers';
import { ensureAuthenticated } from '../../helpers/login';
import {
  fillInImageOutput,
  ibFrame,
  navigateToLandingPage,
} from '../../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  fillInDetails,
  openWizard,
  registerAutomatically,
} from '../../helpers/wizardHelpers';
import { AwsWrapper } from '../helpers/AwsWrapper';
import { buildImage } from '../helpers/imageBuilding';

test('Content integration test - Content Template', async ({
  page,
  cleanup,
}) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot tests run only on the hosted service.',
  );

  const blueprintName = 'content-template-test-' + crypto.randomUUID();
  const repositoryName =
    'content-template-test-' + crypto.randomUUID().slice(0, 8);
  const templateName =
    'content-template-test-' + crypto.randomUUID().slice(0, 8);
  const hostname = 'content-template-test-' + crypto.randomUUID().slice(0, 8);
  const repositoryUrl =
    'https://jlsherrill.fedorapeople.org/fake-repos/needed-errata-multi/2/';
  const packageName = 'cockateel';
  const layeredPackageName = 'pcs'; // Package from the High Availability layered repo (installed at first boot, not build time)
  const layeredRepoDisplayName = 'High Availability'; // Shown in Content Sources UI; used for filter and row selection

  // Register cleanup functions
  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => deleteRepository(page, repositoryName));
  cleanup.add(() => deleteTemplate(page, templateName));

  await ensureAuthenticated(page);

  // Ensure repository URL is not already in use
  await deleteRepository(page, repositoryUrl);

  await test.step('Create a custom repository with snapshotting', async () => {
    await navigateToRepositories(page);
    await page.getByRole('button', { name: 'Add repositories' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(repositoryName);
    await page.getByRole('textbox', { name: 'URL' }).fill(repositoryUrl);
    await page.getByRole('button', { name: 'Save' }).click();
    await page
      .getByRole('textbox', { name: 'filter search' })
      .fill(repositoryName);
    await expect(
      page.getByRole('row').filter({ hasText: repositoryName }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('row')
        .filter({ hasText: repositoryName })
        .getByText('Valid', { exact: true }),
    ).toBeVisible({
      timeout: 180000,
    });
  });

  await test.step('Create a Content Template', async () => {
    await navigateToTemplates(page);
    await page.getByRole('button', { name: 'Create template' }).click();

    await page.getByRole('button', { name: 'filter OS version' }).click();
    await page.getByRole('menuitem', { name: 'RHEL 10' }).click();

    await page.getByRole('button', { name: 'filter architecture' }).click();
    await page.getByRole('menuitem', { name: 'x86_64' }).click();

    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Additional Red Hat repositories',
        exact: true,
      }),
    ).toBeVisible();

    // Search for and select High Availability repo (wait for searchbox to be ready)
    const repoFilter = page.getByRole('searchbox', { name: 'Filter by name' });
    await repoFilter.waitFor({ state: 'visible', timeout: 60000 });
    await repoFilter.fill(layeredRepoDisplayName);
    await expect(
      page.getByRole('row').filter({ hasText: layeredRepoDisplayName }),
    ).toBeVisible({ timeout: 60000 });
    await page
      .getByRole('row')
      .filter({ hasText: layeredRepoDisplayName })
      .first()
      .getByLabel('Select row')
      .click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await expect(
      page.getByRole('heading', { name: 'Other repositories', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('searchbox', { name: 'Filter by name' })
      .fill(repositoryName);
    // Wait for the search results to load (can take time on stage)
    await expect(
      page.getByRole('row').filter({ hasText: repositoryName }),
    ).toBeVisible({ timeout: 60000 });
    await page
      .getByRole('row')
      .filter({ hasText: repositoryName })
      .getByLabel('Select row')
      .click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await expect(
      page.getByRole('heading', { name: 'Set up date', exact: true }),
    ).toBeVisible();
    await page.getByRole('radio', { name: 'Use the latest content' }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await expect(
      page.getByRole('heading', { name: 'Enter template details' }),
    ).toBeVisible();
    await page.getByPlaceholder('Enter name').fill(templateName);
    await page.getByPlaceholder('Description').fill('Content template test');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await page.getByRole('button', { name: 'Create other options' }).click();
    await page.getByRole('menuitem', { name: 'Create template only' }).click();

    // Wait for template to be created and valid
    await page
      .getByRole('searchbox', { name: 'Filter by name' })
      .fill(templateName);
    await expect(
      page
        .getByRole('row')
        .filter({ hasText: templateName })
        .getByText('Valid', { exact: true }),
    ).toBeVisible({ timeout: 180000 });
  });

  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Open Wizard', async () => {
    await openWizard(frame);
  });

  await test.step('Set Blueprint name', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Fill in image output', async () => {
    await fillInImageOutput(frame, 'aws', 'rhel10', 'x86_64');
    await frame
      .getByRole('textbox', { name: 'aws account id' })
      .fill(process.env.AWS_ACCOUNT_ID!);
  });

  await test.step('Register automatically', async () => {
    await registerAutomatically(frame);
  });

  await test.step('Select Content Template in Repeatable build step', async () => {
    await frame.getByRole('button', { name: 'Base settings' }).click();
    await frame.getByRole('radio', { name: 'Use a content template' }).click();

    const templatesDropdown = frame.getByRole('button', {
      name: 'Select content template',
    });
    await templatesDropdown.click();

    const templatesSearchInput = frame.getByRole('textbox', {
      name: 'Filter content templates',
    });
    await templatesSearchInput.fill(templateName);
    await expect(frame.getByText(templateName)).toBeVisible({ timeout: 30000 });

    const templateOption = frame.getByRole('menuitem', {
      name: 'content-template-test-',
    });
    await templateOption.click();
    await expect(
      frame.getByRole('button', { name: /content-template-test-/ }),
    ).toBeVisible();
  });

  // SMELL: This shouldn't be necessary, but without loading this wizard step, the package search will fail
  await test.step('Verify repositories are included from template', async () => {
    // Navigate to Repositories step to ensure the template's repositories are loaded
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();
    await expect(
      frame.getByRole('row').filter({ hasText: repositoryName }),
    ).toBeVisible({ timeout: 30000 });
    await expect(
      frame.getByRole('row').filter({ hasText: layeredRepoDisplayName }),
    ).toBeVisible({ timeout: 30000 });
  });

  // Custom package is installed here, not layered package (pcs)
  await test.step('Select the package from custom repository', async () => {
    await frame
      .getByRole('textbox', { name: 'Search packages' })
      .fill(packageName);
    await expect(frame.getByRole('option', { name: packageName })).toBeVisible({
      timeout: 60000,
    });
    await frame.getByRole('option', { name: packageName }).click();
  });

  await test.step('Set hostname', async () => {
    await frame.getByRole('button', { name: 'Advanced settings' }).click();
    await frame.getByRole('textbox', { name: 'hostname input' }).fill(hostname);
    await frame.getByRole('button', { name: 'Review image' }).click();
  });

  await test.step('Save the Blueprint', async () => {
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

  await test.step('Test custom package was installed', async () => {
    const [exitCode, output] = await image.exec(`rpm -q ${packageName}`);
    expect(exitCode).toBe(0);
    expect(output).toContain(packageName);
  });

  await test.step('Wait for system registration to complete', async () => {
    const deadline = Date.now() + 5 * 60_000;
    while (Date.now() < deadline) {
      const [serviceExitCode, output] = await image.exec(
        'sudo -n timeout 10s systemctl show --no-pager osbuild-subscription-register.service ' +
          '-p LoadState -p ActiveState -p Result -p ExecMainStatus ' +
          '-p ExecMainExitTimestampMonotonic -p ConditionResult -p ConditionTimestampMonotonic',
      );
      expect(
        serviceExitCode,
        'Reading registration service state should succeed',
      ).toBe(0);
      const state = Object.fromEntries(
        output
          .trim()
          .split('\n')
          .map((line) => line.split('=')),
      );
      expect(state.LoadState, 'Registration service should exist').toBe(
        'loaded',
      );
      expect(
        state.ActiveState,
        `Registration service failed: ${state.Result}, exit=${state.ExecMainStatus}`,
      ).not.toBe('failed');
      if (
        state.ConditionResult === 'no' &&
        Number(state.ConditionTimestampMonotonic) > 0
      ) {
        throw new Error(
          'Registration service was skipped because its condition was not met',
        );
      }

      // This oneshot becomes inactive after finishing; the timestamp proves it ran.
      if (
        state.ActiveState === 'inactive' &&
        Number(state.ExecMainExitTimestampMonotonic) > 0
      ) {
        expect(
          state.Result,
          'Registration service should finish successfully',
        ).toBe('success');
        expect(state.ExecMainStatus).toBe('0');
        const [exitCode] = await image.exec(
          'sudo -n timeout 30s subscription-manager status',
        );
        expect(exitCode, 'System should be registered after first boot').toBe(
          0,
        );
        return;
      }
      await sleep(Math.max(0, Math.min(10_000, deadline - Date.now())));
    }
    throw new Error('First-boot registration did not finish within 5 minutes');
  });

  await test.step('Install package from layered product repo', async () => {
    const [installExitCode] = await image.exec(
      `sudo dnf install -y ${layeredPackageName}`,
    );
    expect(installExitCode).toBe(0);
  });

  await test.step('Test layered product package was installed', async () => {
    const [exitCode, output] = await image.exec(`rpm -q ${layeredPackageName}`);
    expect(exitCode).toBe(0);
    expect(output).toContain(layeredPackageName);
  });

  const instanceId = image.getInstanceId();

  const inventoryId =
    await test.step('Verify system appears in Inventory', async () => {
      // The session may have expired during the image build; log in again if prompted.
      await ensureAuthenticated(page);

      const result = await pollForSystemInInventory(
        page,
        instanceId,
        10_000,
        12, // 12 attempts = 2 minutes max
      );
      if (!result.found || !result.inventoryId) {
        throw new Error(
          `AWS instance '${instanceId}' should appear in Inventory`,
        );
      }
      return result.inventoryId;
    });

  await test.step('Verify system is attached to content template', async () => {
    const isAttached = await pollForSystemTemplateAttachment(
      page,
      inventoryId,
      templateName,
      10_000,
      12, // 12 attempts = 2 minutes max
    );
    expect(
      isAttached,
      `AWS instance '${instanceId}' (Inventory ID '${inventoryId}') should be attached to template '${templateName}'`,
    ).toBe(true);
  });
});
