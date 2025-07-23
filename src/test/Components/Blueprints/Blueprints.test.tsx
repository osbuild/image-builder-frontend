import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import CreateImageWizard from '../../../Components/CreateImageWizard';
import LandingPage from '../../../Components/LandingPage/LandingPage';
import { IMAGE_BUILDER_API } from '../../../constants';
import {
  emptyGetBlueprints,
  mockBlueprintIds,
} from '../../fixtures/blueprints';
import { server } from '../../mocks/server';
import { renderCustomRoutesWithReduxRouter } from '../../testUtils';
import { user } from '../CreateImageWizard/wizardTestUtils';

const selectBlueprintById = async (bpId: string) => {
  const user = userEvent.setup();
  const blueprint = await screen.findByTestId(bpId);
  await waitFor(() => user.click(blueprint));
  return blueprint;
};

const selectBlueprintByNameAndId = async (name: string, bpId: string) => {
  const search = await screen.findByRole('textbox', {
    name: /search input/i,
  });

  await waitFor(() => user.clear(search));
  await waitFor(() => user.type(search, name));
  expect(screen.getByRole('textbox', { name: /search input/i })).toHaveValue(
    name
  );

  await screen.findByText('compliance');
  const blueprint = await screen.findByTestId(bpId);
  await waitFor(() => user.click(blueprint));
  return blueprint;
};

describe('Blueprints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const blueprintNameWithComposes = 'Dark Chocolate';
  const blueprintIdWithComposes = '677b010b-e95e-4694-9813-d11d847f1bfc';
  const blueprintIdWithMultipleTargets = 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa';
  const blueprintNameEmptyComposes = 'Milk Chocolate';
  const blueprintIdEmptyComposes = '193482e4-4bd0-4898-a8bc-dc8c33ed669f';
  const blueprintIdOutOfSync = '51243667-8d87-4aef-8dd1-84fc58261b05';
  const blueprintIdCentos8 = 'b1f10309-a250-4db8-ab64-c110176e3eb7';

  test('renders blueprints page', async () => {
    renderCustomRoutesWithReduxRouter();
    await screen.findByText(blueprintNameWithComposes);
    await screen.findByText(blueprintNameEmptyComposes);
  });
  test('renders blueprint empty state', async () => {
    server.use(
      http.get(`${IMAGE_BUILDER_API}/blueprints`, () => {
        return HttpResponse.json(emptyGetBlueprints);
      })
    );

    const view = renderCustomRoutesWithReduxRouter();
    await screen.findByText('No blueprints yet');
    const emptyStateAction = screen.getByRole('link', {
      name: /Add blueprint/i,
    });
    expect(emptyStateAction).toBeInTheDocument();

    user.click(emptyStateAction);

    const { router } = await view;
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        '/insights/image-builder/imagewizard'
      )
    );
  });
  test('renders blueprint composes', async () => {
    renderCustomRoutesWithReduxRouter();

    await selectBlueprintById(blueprintIdWithComposes);
    const table = await screen.findByTestId('images-table');
    const { findAllByText } = within(table);
    const images = await findAllByText('dark-chocolate-aws');
    expect(images).toHaveLength(2);
  });
  test('renders blueprint composes empty state', async () => {
    renderCustomRoutesWithReduxRouter();

    await selectBlueprintById(blueprintIdEmptyComposes);
    const table = await screen.findByTestId('images-table');
    const { findByText } = within(table);
    await findByText('No images');
  });

  test('click build images button', async () => {
    renderCustomRoutesWithReduxRouter();

    await selectBlueprintById(blueprintIdWithComposes);
    const buildImageBtn = await screen.findByRole('button', {
      name: /Build images/i,
    });
    expect(buildImageBtn).toBeEnabled();
  });

  test('uncheck Target option and check that build images button is Disable', async () => {
    renderCustomRoutesWithReduxRouter();

    await selectBlueprintById(blueprintIdWithComposes);
    const buildImageBtn = await screen.findByRole('button', {
      name: /Build images/i,
    });
    expect(buildImageBtn).toBeEnabled();
    const buildImageDropDown = screen.getByTestId('blueprint-build-image-menu');
    user.click(buildImageDropDown);

    const awsCheckbox = await screen.findByRole('checkbox', {
      name: /amazon web services/i,
    });
    expect(awsCheckbox).toBeChecked();

    user.click(awsCheckbox);
    await waitFor(() => expect(awsCheckbox).not.toBeChecked());

    const buildSelectedBtn = await screen.findByRole('button', {
      name: /Build images/i,
    });
    expect(buildSelectedBtn).toBeDisabled();
  });

  test('uncheck one Target option and check that you can build an image', async () => {
    renderCustomRoutesWithReduxRouter();

    await selectBlueprintById(blueprintIdWithMultipleTargets);
    const buildImageBtn = await screen.findByRole('button', {
      name: /Build images/i,
    });
    expect(buildImageBtn).toBeEnabled();
    const buildImageDropDown = screen.getByTestId('blueprint-build-image-menu');

    user.click(buildImageDropDown);
    const awsCheckbox = await screen.findByRole('checkbox', {
      name: /amazon web services/i,
    });
    expect(awsCheckbox).toBeChecked();

    user.click(awsCheckbox);
    await waitFor(() => expect(awsCheckbox).not.toBeChecked());
    const buildSelectedBtn = await screen.findByRole('button', {
      name: /Build images/i,
    });
    expect(buildSelectedBtn).toBeEnabled();
  });

  test('blueprint is out of sync', async () => {
    renderCustomRoutesWithReduxRouter();

    await selectBlueprintById(blueprintIdOutOfSync);
    await screen.findByText(
      'The selected blueprint is at version 2, the latest images are at version 1. Build images to synchronize with the latest version.'
    );

    await selectBlueprintById(blueprintIdWithComposes);
    expect(
      screen.queryByText(
        'The selected blueprint is at version 2, the latest images are at version 1. Build images to synchronize with the latest version.'
      )
    ).not.toBeInTheDocument();
  });

  test('CentOS 8 Stream renders', async () => {
    renderCustomRoutesWithReduxRouter();

    await selectBlueprintById(blueprintIdCentos8);
    await screen.findByText(
      /CentOS Stream 8 is no longer supported, building images from this blueprint will fail./
    );

    await selectBlueprintById(blueprintIdWithComposes);
    expect(
      screen.queryByText(
        /CentOS Stream 8 is no longer supported, building images from this blueprint will fail./
      )
    ).not.toBeInTheDocument();
  });

  test('blueprint linting and fixing', async () => {
    renderCustomRoutesWithReduxRouter();

    const id = mockBlueprintIds.compliance;
    await selectBlueprintByNameAndId('compliance', id);
    await screen.findByText('The selected blueprint has errors.');
    await screen.findByText("compliance: some thingy isn't right");

    const button = await screen.findByRole('button', {
      name: /fix errors automatically/i,
    });
    user.click(button);
    await waitFor(() => {
      expect(
        screen.queryByText('The selected blueprint has errors.')
      ).not.toBeInTheDocument();
    });
  });

  describe('edit blueprint', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    const editedBlueprintName = 'Dark Chocolate';
    const routes = [
      {
        path: 'insights/image-builder/*',
        element: <LandingPage />,
      },
      {
        path: 'insights/image-builder/imagewizard/:composeId?',
        element: <CreateImageWizard />,
      },
    ];

    test('open blueprint wizard in editing mode', async () => {
      await renderCustomRoutesWithReduxRouter(
        'imagewizard/677b010b-e95e-4694-9813-d11d847f1bfc',
        {},
        routes
      );
      const blueprintDetails = await screen.findByTestId(
        'image-details-expandable'
      );
      user.click(blueprintDetails);
      await screen.findByText(editedBlueprintName);
    });
    test('redirect to index page when blueprint is invalid', async () => {
      server.use(
        http.get(`${IMAGE_BUILDER_API}/blueprints/invalid-compose-id`, () => {
          return new HttpResponse(null, { status: 404 });
        })
      );
      await renderCustomRoutesWithReduxRouter(
        'imagewizard/invalid-compose-id',
        {},
        routes
      );
      await screen.findByRole('heading', { name: /Images/i, level: 1 });
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('filter blueprints', async () => {
      renderCustomRoutesWithReduxRouter();

      const searchInput = await screen.findByPlaceholderText(
        'Search by name or description'
      );
      searchInput.focus();
      user.keyboard('Milk');

      // wait for debounce
      await waitFor(
        () => {
          expect(
            screen.getByTestId(blueprintIdEmptyComposes)
          ).toBeInTheDocument();
        },
        {
          timeout: 1500,
        }
      );
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('paging of blueprints', async () => {
      renderCustomRoutesWithReduxRouter();

      expect(await screen.findAllByTestId('blueprint-card')).toHaveLength(10);

      const option = await screen.findByTestId('blueprints-pagination-bottom');
      const prevButton = within(option).getByRole('button', {
        name: /Go to previous page/i,
      });
      const button = within(option).getByRole('button', {
        name: /Go to next page/i,
      });

      expect(prevButton).toBeInTheDocument();
      expect(prevButton).toBeVisible();
      expect(prevButton).toBeDisabled();

      expect(button).toBeInTheDocument();
      expect(button).toBeVisible();
      await waitFor(() => {
        expect(button).toBeEnabled();
      });

      user.click(button);
      user.click(button);

      await waitFor(() => {
        expect(screen.getAllByTestId('blueprint-card')).toHaveLength(10);
      });
    });
  });

  describe('composes filtering', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('filter composes by blueprint version', async () => {
      renderCustomRoutesWithReduxRouter();

      await selectBlueprintById(blueprintIdWithComposes);

      // Wait for the filter appear (right now it's hidden unless a blueprint is selected)
      const composesVersionFilter = await screen.findByRole('button', {
        name: /All Versions/i,
      });

      expect(
        within(screen.getByTestId('images-table')).getAllByRole('row')
      ).toHaveLength(4);

      user.click(composesVersionFilter);
      const option = await screen.findByRole('menuitem', { name: 'Newest' });
      user.click(option);
      await waitFor(() =>
        expect(
          within(screen.getByTestId('images-table')).getAllByRole('row')
        ).toHaveLength(2)
      );
    });
  });

  describe('import/export blueprint', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    test('exporting blueprint', async () => {
      renderCustomRoutesWithReduxRouter();

      await selectBlueprintById(blueprintIdWithComposes);
      const toggleButton = await screen.findByRole('button', {
        name: /blueprint menu toggle/i,
      });
      await waitFor(() => user.click(toggleButton));

      const downloadButton = screen.getByRole('menuitem', {
        name: /download blueprint \(\.json\)/i,
      });
      expect(downloadButton).toBeInTheDocument();
    });
  });
});
