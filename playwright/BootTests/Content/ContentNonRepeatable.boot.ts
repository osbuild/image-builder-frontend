/* eslint-disable playwright/no-wait-for-timeout */
import { expect } from '@playwright/test';

import { deleteRepository, navigateToRepositories } from './helpers';

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
  openWizard,
  registerLater,
} from '../../helpers/wizardHelpers';
import { buildImage } from '../helpers/imageBuilding';
import { AwsWrapper } from '../helpers/AwsWrapper';

test('Content integration test - Non repeatable build - URL source', async ({
  page,
  cleanup,
}) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'content-non-repeatable-test-' + crypto.randomUUID();
  const repositoryName =
    'content-non-repeatable-test-' + crypto.randomUUID().slice(0, 8);
  const repositoryUrl =
    'https://jlsherrill.fedorapeople.org/fake-repos/needed-errata/';
  const packageName = 'cockateel';

  // Here we want to be sure that the repository is deleted due to URL exclusivity per repository
  await deleteRepository(page, repositoryUrl);

  // Delete the blueprint and repository after the run
  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => deleteRepository(page, repositoryName));

  await ensureAuthenticated(page);

  await test.step('Create a custom repository', async () => {
    await navigateToRepositories(page);
    await page.getByRole('button', { name: 'Add repositories' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(repositoryName);
    await page.getByRole('radio', { name: 'Introspect only' }).click();
    await page.getByRole('textbox', { name: 'URL' }).fill(repositoryUrl);
    await page.getByRole('button', { name: 'Save' }).click();
    await page
      .getByRole('textbox', { name: 'filter search' })
      .fill(repositoryName);
    await expect(
      page.getByRole('gridcell', { name: repositoryName }),
    ).toBeVisible();
  });

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Open Wizard', async () => {
    await openWizard(frame);
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Fill Image Output and Registration', async () => {
    await fillInImageOutput(frame, 'aws', 'rhel10', 'x86_64');
    await frame.getByRole('textbox', { name: 'aws account id' }).fill(process.env.AWS_ACCOUNT_ID!);
    await registerLater(frame);
  });

  await test.step('Disable repeatable build', async () => {
    await frame.getByRole('button', { name: 'Base settings' }).click();
    await frame
      .getByRole('radio', { name: 'Disable repeatable build' })
      .click();
  });

  await test.step('Select the repository', async () => {
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();
    await frame
      .getByRole('textbox', { name: 'Filter repositories' })
      .fill(repositoryName);
    await frame.getByRole('option', { name: repositoryName }).click();
  });

  await test.step('Select the package', async () => {
    await frame
      .getByRole('textbox', { name: 'Search packages' })
      .fill(packageName);
    await frame.getByRole('option', { name: packageName }).click();
    await frame.getByRole('button', { name: 'Review image' }).click();
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  let amiId: string = '';

  await test.step('Build image and get AMI info', async () => {
    await buildImage(page);
    await frame.getByText('Launch').click();
    amiId = await frame.locator('span.pf-v6-u-font-weight-bold').filter({ hasText: /^ami-/ }).textContent() ?? '';
  });

  const image = new AwsWrapper(amiId);
  cleanup.add(() => image.terminateInstance());

  await test.step('Prepare AWS instance', async () => {
    await image.launchInstance();
  });

  await test.step('Test repository is on the system', async () => {
    const [exitCode, output] = await image.exec(
      `dnf repolist | grep ${repositoryName}`,
    );
    expect(exitCode).toBe(0);
    expect(output).toContain(repositoryName);
  });

  await test.step('Test package was installed', async () => {
    const [exitCode, output] = await image.exec(`rpm -q ${packageName}`);
    expect(exitCode).toBe(0);
    expect(output).toContain(packageName);
  });
});

test('Content integration test - Non repeatable build - Upload source', async ({
  page,
  cleanup,
}) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'content-non-repeatable-test-' + crypto.randomUUID();
  const repositoryName =
    'content-non-repeatable-test-' + crypto.randomUUID().slice(0, 8);
  const packageName = 'cockateel';
  const dependencyPackageName = 'wolf';

  // Delete the blueprint and repository after the run
  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => deleteRepository(page, repositoryName));

  await ensureAuthenticated(page);

  await test.step('Create a custom repository', async () => {
    await navigateToRepositories(page);
    await page.getByRole('button', { name: 'Add repositories' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(repositoryName);
    await page.getByRole('radio', { name: 'Upload' }).first().click();
    await Promise.all([
      page.getByRole('button', { name: 'Save and upload content' }).click(),
      page.waitForResponse(
        (resp) =>
          resp.url().includes('/bulk_create/') &&
          resp.status() >= 200 &&
          resp.status() < 300,
      ),
    ]);
    // Upload the package in order to create the repository
    await page.getByRole('button', { name: 'Upload', exact: true }).click();
    // TODO: Playwright is too fast for the Upload dialog
    // this results in a unavaiable repository with 400 error
    // https://issues.redhat.com/browse/HMS-9551
    await page.waitForTimeout(3000); // Slow down execution to avoid the 400 error
    await expect(
      page.getByText(
        'Use the form below to upload content to your repository.',
      ),
    ).toBeVisible();
    await page.waitForTimeout(3000);
    await page
      .locator('#pf-modal-part-1  > div')
      .locator('input[type=file]')
      .setInputFiles([
        './playwright/fixtures/data/cockateel-3.1-1.noarch.rpm',
        './playwright/fixtures/data/wolf-9.4-2.noarch.rpm',
      ]);
    await page.waitForTimeout(3000);
    await expect(page.getByText('All uploads completed!')).toBeVisible();
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Confirm changes' }).click();
    await page
      .getByRole('textbox', { name: 'filter search' })
      .fill(repositoryName);
    await expect(
      page.getByRole('gridcell', { name: repositoryName }),
    ).toBeVisible();
  });

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Open Wizard', async () => {
    await openWizard(frame);
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Fill Image Output and Registration', async () => {
    await fillInImageOutput(frame, 'aws', 'rhel10', 'x86_64');
    await frame.getByRole('textbox', { name: 'aws account id' }).fill(process.env.AWS_ACCOUNT_ID!);
    await registerLater(frame);
  });

  await test.step('Disable repeatable build', async () => {
    await frame.getByRole('button', { name: 'Base settings' }).click();
    await frame
      .getByRole('radio', { name: 'Disable repeatable build' })
      .click();
  });

  await test.step('Select the repository', async () => {
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();
    await frame
      .getByRole('textbox', { name: 'Filter repositories' })
      .fill(repositoryName);
    await expect(
      frame.getByRole('option', { name: repositoryName }),
    ).toBeEnabled({
      timeout: 180000,
    });
    await frame.getByRole('option', { name: repositoryName }).click();
  });

  await test.step('Select the package', async () => {
    await frame
      .getByRole('textbox', { name: 'Search packages' })
      .fill(packageName);
    await expect(
      frame.getByRole('option', { name: packageName }),
    ).toBeVisible();
    await frame.getByRole('option', { name: packageName }).click();
    await frame
      .getByRole('textbox', { name: 'Search packages' })
      .fill(dependencyPackageName);
    await expect(
      frame.getByRole('option', { name: dependencyPackageName }),
    ).toBeVisible();
    await frame.getByRole('option', { name: dependencyPackageName }).click();
    await frame.getByRole('button', { name: 'Review image' }).click();
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  let amiId: string = '';

  await test.step('Build image and get AMI info', async () => {
    await buildImage(page);
    await frame.getByText('Launch').click();
    amiId = await frame.locator('span.pf-v6-u-font-weight-bold').filter({ hasText: /^ami-/ }).textContent() ?? '';
  });

  const image = new AwsWrapper(amiId);
  cleanup.add(() => image.terminateInstance());

  await test.step('Prepare AWS instance', async () => {
    await image.launchInstance();
  });

  await test.step('Test repository is on the system', async () => {
    const [exitCode, output] = await image.exec(
      `dnf repolist | grep ${repositoryName}`,
    );
    expect(exitCode).toBe(0);
    expect(output).toContain(repositoryName);
  });

  await test.step('Test package was installed', async () => {
    const [exitCode, output] = await image.exec(`rpm -q ${packageName}`);
    expect(exitCode).toBe(0);
    expect(output).toContain(packageName);
  });
});

test('Content integration test - Non repeatable build - Community repository', async ({
  page,
  cleanup,
}) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'content-non-repeatable-test-' + crypto.randomUUID();
  const repositoryName = 'EPEL 10 Everything x86_64';
  const packageName = 'aha';

  // Delete the blueprint after the run
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Open Wizard', async () => {
    await openWizard(frame);
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Fill Image Output and Registration', async () => {
    await fillInImageOutput(frame, 'aws', 'rhel10', 'x86_64');
    await frame.getByRole('textbox', { name: 'aws account id' }).fill(process.env.AWS_ACCOUNT_ID!);
    await registerLater(frame);
  });

  await test.step('Disable repeatable build', async () => {
    await frame.getByRole('button', { name: 'Base settings' }).click();
    await frame
      .getByRole('radio', { name: 'Disable repeatable build' })
      .click();
  });

  await test.step('Select the repository', async () => {
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();
    await frame
      .getByRole('textbox', { name: 'Filter repositories' })
      .fill(repositoryName);
    await frame.getByRole('option', { name: repositoryName }).click();
  });

  await test.step('Select the package', async () => {
    await frame
      .getByRole('textbox', { name: 'Search packages' })
      .fill(packageName);
    await frame.getByRole('option', { name: packageName }).click();
    await frame.getByRole('button', { name: 'Review image' }).click();
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  let amiId: string = '';

  await test.step('Build image and get AMI info', async () => {
    await buildImage(page);
    await frame.getByText('Launch').click();
    amiId = await frame.locator('span.pf-v6-u-font-weight-bold').filter({ hasText: /^ami-/ }).textContent() ?? '';
  });

  const image = new AwsWrapper(amiId);
  cleanup.add(() => image.terminateInstance());

  await test.step('Prepare AWS instance', async () => {
    await image.launchInstance();
  });

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
});
