import { expect } from '@playwright/test';

import { test } from '../fixtures/customizations';
import {
  createRepositoryViaApi,
  deleteRepositoryByUrlViaApi,
  deleteRepositoryViaApi,
  waitForIntrospection,
} from '../helpers/apiHelpers';
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

// Content sources allows one repository per url per organization, and this
// spec claims the url by deleting whatever already holds it. Every spec
// therefore needs a url of its own - sharing one with RepeatableBuild meant
// this test deleted that test's repository out from under it mid-run.
const REPOSITORY_URL = 'https://jlsherrill.fedorapeople.org/fake-repos/signed/';

test('Create blueprint with repository and test edit mode removal', async ({
  page,
  cleanup,
}) => {
  test.skip(
    !isHosted(),
    'Repositories require content-sources API (hosted only)',
  );

  const blueprintName = 'repo-test-' + crypto.randomUUID();
  const repositoryName = 'repo-test-' + crypto.randomUUID().slice(0, 8);

  await ensureAuthenticated(page);

  // Delete any existing repository with this URL (URL exclusivity)
  await deleteRepositoryByUrlViaApi(page, REPOSITORY_URL);

  let repositoryUuid: string;

  await test.step('Create repository via API', async () => {
    const repository = await createRepositoryViaApi(page, {
      name: repositoryName,
      url: REPOSITORY_URL,
      snapshot: false,
    });
    repositoryUuid = repository.uuid;
    // The wizard lists repositories filtered by architecture and version, and
    // a repository does not qualify until content sources has introspected it.
    await waitForIntrospection(page, repositoryName);
  });

  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => deleteRepositoryViaApi(page, repositoryUuid));

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

  await test.step('Fill in image output and registration', async () => {
    await fillInImageOutput(frame, 'qcow2');
    await registerLater(frame);
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

  await test.step('Review and create blueprint', async () => {
    await frame.getByRole('button', { name: 'Review image' }).click();
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit blueprint and verify repository is displayed', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame
      .getByRole('button', { name: 'Repositories and packages' })
      .click();

    await expect(
      frame.getByRole('gridcell', { name: repositoryName }),
    ).toBeVisible();

    await expect(
      frame.getByText(
        /Removing previously added repositories may lead to issues with selected packages/i,
      ),
    ).toBeVisible();
  });

  await test.step('Remove repository and verify warning modal', async () => {
    const repoRow = frame.getByRole('row', { name: repositoryName });
    await repoRow.getByRole('button', { name: /remove repository/i }).click();

    await expect(frame.getByText(/Are you sure?/)).toBeVisible();

    await frame.getByRole('button', { name: /Remove anyway/ }).click();

    await expect(frame.getByText(/Are you sure?/)).toBeHidden();

    await expect(
      frame.getByRole('gridcell', { name: repositoryName }),
    ).toBeHidden();
  });

  await test.step('Save changes and verify repository is removed', async () => {
    await frame.getByRole('button', { name: 'Review image' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();

    await expect(
      frame.getByRole('heading', { name: blueprintName }),
    ).toBeVisible();
  });
});
