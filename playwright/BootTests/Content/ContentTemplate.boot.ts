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
  pollForSystemTemplateAttachment,
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
    'Skipping test. Boot test run only on the hosted service.',
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
  // TODO: Fix cleaning up of template
  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => deleteRepository(page, repositoryName));
  cleanup.add(() => deleteTemplate(page, templateName));
  cleanup.add(() => OpenStackWrapper.deleteImage(blueprintName));
  cleanup.add(() => OpenStackWrapper.deleteInstance(blueprintName));

  await ensureAuthenticated(page);

  // Step 1: Create a custom repository with snapshotting enabled
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
  });

  await test.step('Wait for repository snapshot to be created', async () => {
    await page
      .getByRole('textbox', { name: 'Name/URL filter' })
      .fill(repositoryName);
    await expect(page.getByRole('gridcell', { name: 'Valid' })).toBeVisible({
      timeout: 180000,
    });
  });

  // Step 2: Create a Content Template
  await test.step('Create a Content Template', async () => {
    await navigateToTemplates(page);
    await page.getByRole('button', { name: 'Create template' }).click();

    // Select architecture: x86_64
    await page.getByRole('button', { name: 'filter architecture' }).click();
    await page.getByRole('menuitem', { name: 'x86_64' }).click();

    // Select OS version: el10
    await page.getByRole('button', { name: 'filter OS version' }).click();
    await page.getByRole('menuitem', { name: 'el10' }).click();

    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Skip Red Hat repositories step
    await expect(
      page.getByRole('heading', {
        name: 'Additional Red Hat repositories',
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Select our custom repository
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

    // Set up date - Use latest content
    await expect(
      page.getByRole('heading', { name: 'Set up date', exact: true }),
    ).toBeVisible();
    await page.getByText('Use the latest content', { exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Enter template details
    await expect(page.getByText('Enter template details')).toBeVisible();
    await page.getByPlaceholder('Enter name').fill(templateName);
    await page.getByPlaceholder('Description').fill('Content template test');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Create template only (not assigning to systems)
    await page.getByRole('button', { name: 'Create other options' }).click();
    await page.getByText('Create template only', { exact: true }).click();

    // Wait for template to be created and valid
    await page
      .getByRole('searchbox', { name: 'Filter by name' })
      .fill(templateName);
    await expect(
      page
        .getByRole('row')
        .filter({ hasText: templateName })
        .getByText('Valid'),
    ).toBeVisible({ timeout: 180000 });
  });

  // Step 3: Navigate to Image Builder and create blueprint with content template
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Fill in image output', async () => {
    await fillInImageOutput(frame, 'qcow2', 'rhel10', 'x86_64');
  });

  await test.step('Register with activation key', async () => {
    await registerWithActivationKey(frame);
  });

  await test.step('Select content template in Repeatable build step', async () => {
    await frame.getByRole('button', { name: 'Repeatable build' }).click();
    await frame.getByRole('radio', { name: 'Use a content template' }).click();

    // Wait for the template to appear in the list
    // Use text matching to find our template name in the table
    await expect(frame.getByText(templateName)).toBeVisible({ timeout: 30000 });

    // Find the row containing our template and click its radio button
    // PatternFly tables render radio buttons with aria-label like "Select row X"
    const templateRow = frame.locator('tr').filter({ hasText: templateName });
    await templateRow.locator('input[type="radio"]').click();
  });

  // FIXME: This really shouldn't be necessary, but without loading this wizard step, the package search will fail
  await test.step('Verify repository is included from template', async () => {
    // Navigate to Repositories step to ensure the template's repository is loaded
    await frame.getByRole('button', { name: 'Repositories' }).click();
    // Verify the repository from the template is visible in the list
    await expect(
      frame.getByRole('row').filter({ hasText: repositoryName }),
    ).toBeVisible({ timeout: 30000 });
  });

  await test.step('Select the package', async () => {
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await frame
      .getByRole('textbox', { name: 'Search packages' })
      .fill(packageName);
    // Wait for the package to appear in search results
    await expect(
      frame.getByRole('gridcell', { name: packageName }),
    ).toBeVisible({ timeout: 60000 });
    await frame.getByRole('checkbox', { name: 'Select row 0' }).click();
  });

  await test.step('Set hostname for system identification', async () => {
    await frame.getByRole('button', { name: 'Hostname' }).click();
    await frame.getByRole('textbox', { name: 'hostname input' }).fill(hostname);
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  // Step 4: Build and Boot
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

  // Step 5: Verify Image Content
  await test.step('Test repository is on the system', async () => {
    const [exitCode, output] = await image.exec(
      `dnf repolist | grep "${repositoryName}"`,
    );
    expect(exitCode).toBe(0);
    expect(output).toContain(repositoryName);
  });

  await test.step('Test package was installed', async () => {
    const [exitCode, output] = await image.exec(`rpm -q ${packageName}`);
    expect(exitCode).toBe(0);
    expect(output).toContain(packageName);
  });

  // Step 5: Verify system is attached to template (registration happens automatically at boot)
//  await test.step('Verify system is attached to content template', async () => {
//    // Re-authenticate to refresh cookies (session may have expired during long build)
//    await ensureAuthenticated(page);
//
//    // Hostname was set in the wizard, so we know it without needing to SSH in
//    // eslint-disable-next-line no-console
//    console.log(`Looking for system with hostname: ${hostname}`);
//
//    const isAttached = await pollForSystemTemplateAttachment(
//      page,
//      hostname,
//      templateName,
//      10_000, // 10 second delay
//      30, // 30 attempts = 5 minutes max
//    );
//    expect(
//      isAttached,
//      `System '${hostname}' should be attached to template '${templateName}'`,
//    ).toBe(true);
//  });
});
