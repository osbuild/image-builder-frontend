import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import {
  createRepositoryViaApi,
  deleteRepositoryByUrlViaApi,
  deleteRepositoryViaApi,
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
  registerLater,
} from '../helpers/wizardHelpers';

const REPOSITORY_URL =
  'https://jlsherrill.fedorapeople.org/fake-repos/really-empty/';

test('Create blueprint with repository and test edit mode removal', async ({
  page,
  cleanup,
}) => {
  test.skip(
    !isHosted(),
    'Repositories require content-sources API (hosted only)',
  );

  const blueprintName = 'repo-test-' + uuidv4();
  const repositoryName = 'repo-test-' + uuidv4().slice(0, 8);

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
  });

  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => deleteRepositoryViaApi(page, repositoryUuid));

  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Fill in image output', async () => {
    await fillInImageOutput(frame, 'qcow2', 'rhel10', 'x86_64');
  });

  await test.step('Register later', async () => {
    await registerLater(frame);
  });

  await test.step('Select the repository', async () => {
    await frame.getByRole('button', { name: 'Repositories' }).click();
    await frame
      .getByRole('textbox', { name: 'Filter repositories' })
      .fill(repositoryName);
    await frame.getByRole('option', { name: repositoryName }).click();
  });

  await test.step('Fill blueprint details and create', async () => {
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit blueprint and verify repository is displayed', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Repositories' }).click();

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
    const removeButton = frame.getByRole('button', {
      name: /remove repository/i,
    });
    await removeButton.click();

    await expect(frame.getByText(/Are you sure?/)).toBeVisible();

    await frame.getByRole('button', { name: /Remove anyway/ }).click();

    await expect(frame.getByText(/Are you sure?/)).toBeHidden();

    await expect(
      frame.getByRole('gridcell', { name: repositoryName }),
    ).toBeHidden();
  });

  await test.step('Save changes and verify repository is removed', async () => {
    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();

    await expect(
      frame.getByRole('heading', { name: blueprintName }),
    ).toBeVisible();
  });
});
