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
  registerLater,
} from '../../helpers/wizardHelpers';
import { deleteRepository, navigateToRepositories } from '../helpers/helpers';
import {
  buildImage,
  constructFilePath,
  downloadImage,
} from '../helpers/imageBuilding';
import { OpenStackWrapper } from '../helpers/OpenStackWrapper';

test('Content integration test - Repeatable build - URL source', async ({
  page,
  cleanup,
}) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'content-repeatable-test-' + uuidv4();
  const filePath = constructFilePath(blueprintName, 'qcow2');
  const repositoryName = 'content-repeatable-test-' + uuidv4().slice(0, 8);
  const initialRepositoryUrl =
    'https://jlsherrill.fedorapeople.org/fake-repos/needed-errata-multi/1/';
  const updatedRepositoryUrl =
    'https://jlsherrill.fedorapeople.org/fake-repos/empty/';
  const packageName = 'cockateel';

  // Here we want to be sure that the repositories are deleted due to URL exclusivity per repository
  await deleteRepository(page, initialRepositoryUrl);
  await deleteRepository(page, updatedRepositoryUrl);

  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => deleteRepository(page, repositoryName));
  cleanup.add(() => OpenStackWrapper.deleteImage(blueprintName));
  cleanup.add(() => OpenStackWrapper.deleteInstance(blueprintName));

  await ensureAuthenticated(page);

  await test.step('Create a custom repository with snapshotting', async () => {
    await navigateToRepositories(page);
    await page.getByRole('button', { name: 'Add repositories' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(repositoryName);
    await page.getByRole('textbox', { name: 'URL' }).fill(initialRepositoryUrl);
    await page.getByRole('button', { name: 'Save' }).click();
    await page
      .getByRole('textbox', { name: 'Name/URL filter' })
      .fill(repositoryName);
    await expect(
      page.getByRole('gridcell', { name: repositoryName }),
    ).toBeVisible();
  });

  await test.step('Wait for initial snapshot to be created', async () => {
    await page
      .getByRole('textbox', { name: 'Name/URL filter' })
      .fill(repositoryName);
    await expect(
      page.getByRole('button', { name: '- 1 of 1' }).first(),
    ).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Valid' })).toBeVisible({
      timeout: 180000,
    });
  });

  await test.step('Edit repository to create new snapshot', async () => {
    await page
      .getByRole('textbox', { name: 'Name/URL filter' })
      .fill(repositoryName);
    await expect(
      page.getByRole('gridcell', { name: repositoryName }),
    ).toBeVisible();
    await page.getByLabel('Kebab toggle').click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();
    await page.getByRole('textbox', { name: 'URL' }).fill(updatedRepositoryUrl);
    await page.getByRole('button', { name: 'Save changes' }).click();
    // Need to make sure the old "Valid" state disappears after saving changes
    await expect(
      page.getByRole('gridcell', { name: 'In progress' }).first(),
    ).toBeVisible({
      timeout: 180000,
    });
  });

  await test.step('Wait for new snapshot to be created', async () => {
    await page
      .getByRole('textbox', { name: 'Name/URL filter' })
      .fill(repositoryName);
    await expect(
      page.getByRole('button', { name: '- 1 of 1' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('gridcell', { name: 'Valid' }).first(),
    ).toBeVisible({
      timeout: 180000,
    });
  });

  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame, 'qcow2', 'rhel10', 'x86_64');
    await registerLater(frame);
  });

  await test.step('Enable repeatable build and select snapshot date', async () => {
    await frame.getByRole('button', { name: 'Repeatable build' }).click();
    await frame.getByRole('radio', { name: 'Enable repeatable build' }).click();

    // TODO Would this work on the 1st?
    // Could check for that and select the previous month from the drop-down if so
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dayOfMonth = yesterday.getDate();
    const monthName = yesterday.toLocaleString('en-US', { month: 'long' });

    await frame.getByRole('button', { name: 'Toggle date picker' }).click();
    await frame
      .getByRole('button', {
        name: new RegExp(`^${dayOfMonth}\\s+${monthName}(\\s+\\d{4})?$`, 'i'),
      })
      .click();
  });

  await test.step('Select the repository', async () => {
    await frame.getByRole('button', { name: 'Repositories' }).click();
    await frame
      .getByRole('textbox', { name: 'Filter repositories' })
      .fill(repositoryName);
    await expect(frame.getByRole('button', { name: '- 1 of 1' })).toBeVisible();
    await frame.getByRole('checkbox', { name: 'Select row 0' }).click();
  });

  await test.step('Select the package', async () => {
    await frame.getByRole('button', { name: 'Additional packages' }).click();
    await frame
      .getByRole('textbox', { name: 'Search packages' })
      .fill(packageName);
    await frame.getByRole('checkbox', { name: 'Select row 0' }).click();
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
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

  // Note that the repo will be disabled, so we need to use --all to see it
  await test.step('Test repository is on the system', async () => {
    const [exitCode, output] = await image.exec(
      `dnf repolist --all | grep ${repositoryName}`,
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
