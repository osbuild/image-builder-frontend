import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../../fixtures/customizations';
import { isHosted } from '../../helpers/helpers';
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
  registerWithActivationKey,
} from '../../helpers/wizardHelpers';
import {
  deleteRepository,
  deleteTemplate,
  navigateToRepositories,
  navigateToTemplates,
  pollForSystemInInventory,
  pollForSystemTemplateAttachment,
  sleep,
} from '../helpers/helpers';
import {
  buildImage,
  constructFilePath,
  downloadImage,
} from '../helpers/imageBuilding';
import { OpenStackWrapper } from '../helpers/OpenStackWrapper';

test('Content integration test - Content Template', async ({
  page,
  cleanup,
}) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot tests run only on the hosted service.',
  );

  const blueprintName = 'content-template-test-' + uuidv4();
  const filePath = constructFilePath(blueprintName, 'qcow2');
  const repositoryName = 'content-template-test-' + uuidv4().slice(0, 8);
  const templateName = 'content-template-test-' + uuidv4().slice(0, 8);
  const hostname = 'content-template-test-' + uuidv4().slice(0, 8); // Short unique hostname for system identification
  const repositoryUrl =
    'https://jlsherrill.fedorapeople.org/fake-repos/needed-errata/';
  const packageName = 'cockateel';

  // Ensure repository URL is not already in use
  await deleteRepository(page, repositoryUrl);

  // Register cleanup functions
  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => deleteRepository(page, repositoryName));
  cleanup.add(() => deleteTemplate(page, templateName));
  cleanup.add(() => OpenStackWrapper.deleteImage(blueprintName));
  cleanup.add(() => OpenStackWrapper.deleteInstance(blueprintName));

  await ensureAuthenticated(page);

  await test.step('Create a custom repository with snapshotting', async () => {
    await navigateToRepositories(page);
    await page.getByRole('button', { name: 'Add repositories' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(repositoryName);
    await page.getByRole('textbox', { name: 'URL' }).fill(repositoryUrl);
    await page.getByRole('button', { name: 'Save' }).click();
    await page
      .getByRole('textbox', { name: 'Name/URL filter' })
      .fill(repositoryName);
    await expect(
      page.getByRole('gridcell', { name: repositoryName }),
    ).toBeVisible();
    await expect(
      page.getByRole('gridcell', { name: 'Valid', exact: true }),
    ).toBeVisible({
      timeout: 180000,
    });
  });

  await test.step('Create a Content Template', async () => {
    await navigateToTemplates(page);
    await page.getByRole('button', { name: 'Create template' }).click();

    await page.getByRole('button', { name: 'filter architecture' }).click();
    await page.getByRole('menuitem', { name: 'x86_64' }).click();

    await page.getByRole('button', { name: 'filter OS version' }).click();
    await page.getByRole('menuitem', { name: 'el10' }).click();

    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Additional Red Hat repositories',
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await expect(
      page.getByRole('heading', { name: 'Other repositories', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('searchbox', { name: 'Filter by name/url' })
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

  await test.step('Fill in image output', async () => {
    await fillInImageOutput(frame, 'qcow2', 'rhel10', 'x86_64');
  });

  await test.step('Register with activation key', async () => {
    await registerWithActivationKey(frame);
  });

  await test.step('Select Content Template in Repeatable build step', async () => {
    await frame.getByRole('button', { name: 'Repeatable build' }).click();
    await frame.getByRole('radio', { name: 'Use a content template' }).click();

    await expect(frame.getByText(templateName)).toBeVisible({ timeout: 30000 });

    const templateRow = frame
      .getByRole('row')
      .filter({ hasText: templateName });
    await templateRow.getByRole('radio').click();
  });

  // SMELL: This shouldn't be necessary, but without loading this wizard step, the package search will fail
  await test.step('Verify repository is included from template', async () => {
    // Navigate to Repositories step to ensure the template's repository is loaded
    await frame.getByRole('button', { name: 'Repositories' }).click();
    await expect(
      frame.getByRole('row').filter({ hasText: repositoryName }),
    ).toBeVisible({ timeout: 30000 });
  });

  await test.step('Select the package', async () => {
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await frame
      .getByRole('textbox', { name: 'Search packages' })
      .fill(packageName);
    await expect(
      frame.getByRole('gridcell', { name: packageName }),
    ).toBeVisible({ timeout: 60000 });
    await frame
      .getByRole('row')
      .filter({ hasText: packageName })
      .getByLabel('Select row')
      .click();
  });

  await test.step('Set hostname for system identification', async () => {
    await frame.getByRole('button', { name: 'Hostname' }).click();
    await frame.getByRole('textbox', { name: 'hostname input' }).fill(hostname);
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Set Blueprint name', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Save the Blueprint', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Build the image', async () => {
    await buildImage(page);
  });

  await test.step('Download the image', async () => {
    await downloadImage(page, filePath);
  });

  const image = new OpenStackWrapper(blueprintName, 'qcow2', filePath);

  await test.step('Prepare Openstack instance', async () => {
    await image.createImage();
    await image.launchInstance();
  });

  await test.step('Test package was installed', async () => {
    const [exitCode, output] = await image.exec(`rpm -q ${packageName}`);
    expect(exitCode).toBe(0);
    expect(output).toContain(packageName);
  });

  await test.step('Wait for system registration to complete', async () => {
    const maxAttempts = 12;
    const delayMs = 10_000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const [exitCode, output] = await image.exec(
        'sudo subscription-manager status',
      );
      // eslint-disable-next-line no-console
      console.log(
        `Registration check attempt ${attempt}/${maxAttempts}: exit=${exitCode}`,
      );

      if (exitCode === 0) {
        // eslint-disable-next-line no-console
        console.log('System registration complete:', output);
        return;
      }

      if (attempt < maxAttempts) {
        // eslint-disable-next-line no-console
        console.log(`System not yet registered, waiting ${delayMs / 1000}s...`);
        await sleep(delayMs);
      }
    }

    // If we get here, registration never completed
    throw new Error(
      `System did not register within ${(maxAttempts * delayMs) / 1000} seconds`,
    );
  });

  await test.step('Verify system appears in Inventory', async () => {
    // Re-authenticate to refresh cookies (session may have expired during long build)
    await ensureAuthenticated(page);

    const result = await pollForSystemInInventory(
      page,
      blueprintName,
      10_000,
      12, // 12 attempts = 2 minutes max
    );
    expect(
      result.found,
      `System '${blueprintName}' should appear in Inventory`,
    ).toBe(true);
  });

  await test.step('Verify system is attached to content template', async () => {
    await ensureAuthenticated(page);

    const isAttached = await pollForSystemTemplateAttachment(
      page,
      blueprintName,
      templateName,
      10_000,
      12, // 12 attempts = 2 minutes max
    );
    expect(
      isAttached,
      `System '${blueprintName}' should be attached to template '${templateName}'`,
    ).toBe(true);
  });
});
