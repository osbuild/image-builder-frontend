import { screen, waitFor, within } from '@testing-library/react';

import { renderLandingPage } from '@/Components/LandingPage/tests/helpers';
import { server } from '@/test/mocks/server';
import {
  clearWithWait,
  clickWithWait,
  createUser,
  keyboardWithWait,
  typeWithWait,
  type UserEventInstance,
} from '@/test/testUtils';

import {
  BLUEPRINT_ID_CENTOS8,
  BLUEPRINT_ID_COMPLIANCE,
  BLUEPRINT_ID_DARK_CHOCOLATE,
  BLUEPRINT_ID_MILK_CHOCOLATE,
  BLUEPRINT_ID_MULTIPLE_TARGETS,
  BLUEPRINT_ID_OUT_OF_SYNC,
  createDefaultLandingPageHandler,
  createLandingPageHandler,
  emptyGetBlueprints,
  fetchMock,
} from './mocks';

fetchMock.enableMocks();

beforeAll(() => {
  server.close();
});

afterAll(() => {
  server.listen();
});

beforeEach(() => {
  fetchMock.mockResponse(createDefaultLandingPageHandler);
});

afterEach(() => {
  fetchMock.resetMocks();
  vi.restoreAllMocks();
});

const selectBlueprintById = async (user: UserEventInstance, bpId: string) => {
  const blueprint = await screen.findByTestId(bpId);
  await clickWithWait(user, blueprint);
  return blueprint;
};

const selectBlueprintByNameAndId = async (
  user: UserEventInstance,
  name: string,
  bpId: string,
) => {
  const search = await screen.findByRole('textbox', {
    name: /search input/i,
  });

  await clearWithWait(user, search);
  await typeWithWait(user, search, name);
  expect(screen.getByRole('textbox', { name: /search input/i })).toHaveValue(
    name,
  );

  await screen.findByText('compliance');
  const blueprint = await screen.findByTestId(bpId);
  await clickWithWait(user, blueprint);
  return blueprint;
};

describe('Blueprints', () => {
  test('renders blueprints page', async () => {
    renderLandingPage();
    await screen.findByText('Dark Chocolate');
    await screen.findByText('Milk Chocolate');
  });

  test('renders blueprint empty state', async () => {
    fetchMock.mockResponse(
      createLandingPageHandler({
        blueprints: { blueprintsResponse: emptyGetBlueprints },
      }),
    );

    const user = createUser();
    renderLandingPage();
    await screen.findByText('No blueprints');
    const emptyStateActions = await screen.findAllByRole('button', {
      name: /Create image blueprint/i,
    });
    const emptyStateAction = emptyStateActions[1];
    expect(emptyStateAction).toBeInTheDocument();

    await clickWithWait(user, emptyStateAction);
  });

  test('renders blueprint composes', async () => {
    const user = createUser();
    renderLandingPage();

    await selectBlueprintById(user, BLUEPRINT_ID_DARK_CHOCOLATE);
    const table = await screen.findByTestId('images-table');
    const { findAllByText } = within(table);
    const images = await findAllByText('dark-chocolate-aws');
    expect(images).toHaveLength(2);
  });

  test('renders blueprint composes empty state', async () => {
    const user = createUser();
    renderLandingPage();

    await selectBlueprintById(user, BLUEPRINT_ID_MILK_CHOCOLATE);
    const table = await screen.findByTestId('images-table');
    const { findByText } = within(table);
    await findByText('No images');
  });

  test('click build images button', async () => {
    const user = createUser();
    renderLandingPage();

    await selectBlueprintById(user, BLUEPRINT_ID_DARK_CHOCOLATE);
    const buildImageBtn = await screen.findByRole('button', {
      name: /Build images/i,
    });
    expect(buildImageBtn).toBeEnabled();
  });

  test('uncheck Target option and check that build images button is Disable', async () => {
    const user = createUser();
    renderLandingPage();

    await selectBlueprintById(user, BLUEPRINT_ID_DARK_CHOCOLATE);
    const buildImageBtn = await screen.findByRole('button', {
      name: /Build images/i,
    });
    expect(buildImageBtn).toBeEnabled();
    const buildImageDropDown = screen.getByTestId('blueprint-build-image-menu');
    await clickWithWait(user, buildImageDropDown);

    const awsCheckbox = await screen.findByRole('checkbox', {
      name: /amazon web services/i,
    });
    expect(awsCheckbox).toBeChecked();

    await clickWithWait(user, awsCheckbox);
    await waitFor(() => expect(awsCheckbox).not.toBeChecked());

    const buildSelectedBtn = await screen.findByRole('button', {
      name: /Build images/i,
    });
    expect(buildSelectedBtn).toBeDisabled();
  });

  test('uncheck one Target option and check that you can build an image', async () => {
    const user = createUser();
    renderLandingPage();

    await selectBlueprintById(user, BLUEPRINT_ID_MULTIPLE_TARGETS);
    const buildImageBtn = await screen.findByRole('button', {
      name: /Build images/i,
    });
    expect(buildImageBtn).toBeEnabled();
    const buildImageDropDown = screen.getByTestId('blueprint-build-image-menu');

    await clickWithWait(user, buildImageDropDown);
    const awsCheckbox = await screen.findByRole('checkbox', {
      name: /amazon web services/i,
    });
    expect(awsCheckbox).toBeChecked();

    await clickWithWait(user, awsCheckbox);
    await waitFor(() => expect(awsCheckbox).not.toBeChecked());
    const buildSelectedBtn = await screen.findByRole('button', {
      name: /Build images/i,
    });
    expect(buildSelectedBtn).toBeEnabled();
  });

  test('blueprint is out of sync', async () => {
    const user = createUser();
    renderLandingPage();

    await selectBlueprintById(user, BLUEPRINT_ID_OUT_OF_SYNC);
    await screen.findByText(
      'The selected blueprint is at version 2, the latest images are at version 1. Build images to synchronize with the latest version.',
    );

    await selectBlueprintById(user, BLUEPRINT_ID_DARK_CHOCOLATE);
    expect(
      screen.queryByText(
        'The selected blueprint is at version 2, the latest images are at version 1. Build images to synchronize with the latest version.',
      ),
    ).not.toBeInTheDocument();
  });

  test('CentOS 8 Stream renders', async () => {
    const user = createUser();
    renderLandingPage();

    await selectBlueprintById(user, BLUEPRINT_ID_CENTOS8);
    await screen.findByText(
      /CentOS Stream 8 is no longer supported, building images from this blueprint will fail./,
    );

    await selectBlueprintById(user, BLUEPRINT_ID_DARK_CHOCOLATE);
    await waitFor(() => {
      expect(
        screen.queryByText(
          /CentOS Stream 8 is no longer supported, building images from this blueprint will fail./,
        ),
      ).not.toBeInTheDocument();
    });
  });

  test('blueprint linting and fixing', async () => {
    const user = createUser();
    renderLandingPage();

    await selectBlueprintByNameAndId(
      user,
      'compliance',
      BLUEPRINT_ID_COMPLIANCE,
    );
    await screen.findByText(
      'The selected blueprint has compliance errors that can be automatically fixed, action required.',
    );
    await screen.findByText("compliance: some thingy isn't right");

    const button = await screen.findByRole('button', {
      name: /fix errors automatically/i,
    });
    await clickWithWait(user, button);
    await waitFor(() => {
      expect(
        screen.queryByText(
          'The selected blueprint has compliance errors that can be automatically fixed, action required.',
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe('edit blueprint', () => {
    test('open blueprint wizard in editing mode', async () => {
      renderLandingPage({
        route: `/imagewizard/${BLUEPRINT_ID_DARK_CHOCOLATE}`,
      });
      await screen.findByText('Dark Chocolate');
    });

    test('redirect to index page when blueprint is invalid', async () => {
      renderLandingPage({
        route: '/imagewizard/invalid-compose-id',
      });
      await screen.findByTestId('blueprints-create-button');
    });
  });

  describe('filtering', () => {
    test('filter blueprints', async () => {
      const user = createUser();
      renderLandingPage();

      const searchInput = await screen.findByPlaceholderText(
        'Search by name or description',
      );
      searchInput.focus();
      await keyboardWithWait(user, 'Milk');

      await waitFor(
        () => {
          expect(
            screen.getByTestId(BLUEPRINT_ID_MILK_CHOCOLATE),
          ).toBeInTheDocument();
        },
        {
          timeout: 1500,
        },
      );
    });
  });

  describe('pagination', () => {
    test('paging of blueprints', async () => {
      const user = createUser();
      renderLandingPage();

      expect(await screen.findAllByTestId('blueprint-card')).toHaveLength(10);

      const option = await screen.findByTestId('blueprints-pagination-bottom');
      const prevButton = within(option).getByRole('button', {
        name: /Go to previous page/i,
      });
      const nextButton = within(option).getByRole('button', {
        name: /Go to next page/i,
      });

      expect(prevButton).toBeInTheDocument();
      expect(prevButton).toBeVisible();
      expect(prevButton).toBeDisabled();

      expect(nextButton).toBeInTheDocument();
      expect(nextButton).toBeVisible();
      await waitFor(() => {
        expect(nextButton).toBeEnabled();
      });

      await clickWithWait(user, nextButton);
      await clickWithWait(user, nextButton);

      await waitFor(() => {
        expect(screen.getAllByTestId('blueprint-card')).toHaveLength(10);
      });
    });
  });

  describe('composes filtering', () => {
    test('filter composes by blueprint version', async () => {
      const user = createUser();
      renderLandingPage();

      await selectBlueprintById(user, BLUEPRINT_ID_DARK_CHOCOLATE);

      const composesVersionFilter = await screen.findByRole('button', {
        name: /All Versions/i,
      });

      expect(
        within(screen.getByTestId('images-table')).getAllByRole('row'),
      ).toHaveLength(5);

      await clickWithWait(user, composesVersionFilter);
      const versionOption = await screen.findByRole('menuitem', {
        name: 'Newest',
      });
      await clickWithWait(user, versionOption);
      await waitFor(() =>
        expect(
          within(screen.getByTestId('images-table')).getAllByRole('row'),
        ).toHaveLength(3),
      );
    });
  });

  describe('import/export blueprint', () => {
    test('exporting blueprint', async () => {
      const user = createUser();
      renderLandingPage();

      await selectBlueprintById(user, BLUEPRINT_ID_DARK_CHOCOLATE);
      const toggleButton = await screen.findByRole('button', {
        name: /blueprint menu toggle/i,
      });
      await clickWithWait(user, toggleButton);

      const downloadButton = screen.getByRole('menuitem', {
        name: /download blueprint \(\.json\)/i,
      });
      expect(downloadButton).toBeInTheDocument();
    });
  });
});
