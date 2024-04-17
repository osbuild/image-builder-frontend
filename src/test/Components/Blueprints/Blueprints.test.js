import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';

import CreateImageWizard from '../../../Components/CreateImageWizardV2';
import LandingPage from '../../../Components/LandingPage/LandingPage';
import { IMAGE_BUILDER_API } from '../../../constants';
import { emptyGetBlueprints } from '../../fixtures/blueprints';
import { server } from '../../mocks/server';
import {
  renderCustomRoutesWithReduxRouter,
  renderWithReduxRouter,
} from '../../testUtils';
import '@testing-library/jest-dom';

import '@testing-library/jest-dom';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    isBeta: () => true,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn((flag) =>
    flag === 'image-builder.new-wizard.enabled' ? true : false
  ),
}));

const selectBlueprintById = async (user, bpId) => {
  const blueprint = await screen.findByTestId(bpId);
  await user.click(blueprint);
  return blueprint;
};

describe('Blueprints', () => {
  const user = userEvent.setup();
  const blueprintNameWithComposes = 'Dark Chocolate';
  const blueprintIdWithComposes = '677b010b-e95e-4694-9813-d11d847f1bfc';
  const blueprintNameEmptyComposes = 'Milk Chocolate';
  const blueprintIdEmptyComposes = '193482e4-4bd0-4898-a8bc-dc8c33ed669f';
  const blueprintIdOutOfSync = '51243667-8d87-4aef-8dd1-84fc58261b05';

  test('renders blueprints page', async () => {
    renderWithReduxRouter('', {});
    await screen.findByText(blueprintNameWithComposes);
    await screen.findByText(blueprintNameEmptyComposes);
  });
  test('renders blueprint empty state', async () => {
    // scrollTo is not defined in jsdom - needed for the navigation to the wizard
    window.HTMLElement.prototype.scrollTo = function () {};

    server.use(
      rest.get(
        `${IMAGE_BUILDER_API}/experimental/blueprints`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(emptyGetBlueprints));
        }
      )
    );

    const { router } = await renderWithReduxRouter('', {});
    await screen.findByText('No blueprints yet');
    const emptyStateAction = screen.getByRole('link', {
      name: /Add blueprint/i,
    });
    expect(emptyStateAction).toBeInTheDocument();

    await user.click(emptyStateAction);
    expect(router.state.location.pathname).toBe(
      '/insights/image-builder/imagewizard'
    );
  });
  test('renders blueprint composes', async () => {
    renderWithReduxRouter('', {});

    await selectBlueprintById(user, blueprintIdWithComposes);
    const table = await screen.findByTestId('images-table');
    const { findAllByText } = within(table);
    const images = await findAllByText('dark-chocolate-aws');
    expect(images).toHaveLength(2);
  });
  test('renders blueprint composes empty state', async () => {
    renderWithReduxRouter('', {});

    await selectBlueprintById(user, blueprintIdEmptyComposes);
    const table = await screen.findByTestId('images-table');
    const { findByText } = within(table);
    await findByText('No images');
  });

  test('click build image button', async () => {
    renderWithReduxRouter('', {});

    await selectBlueprintById(user, blueprintIdWithComposes);
    const buildImageBtn = await screen.findByRole('button', {
      name: /Build image/i,
    });
    expect(buildImageBtn).toBeEnabled();
  });

  test('blueprint is out of sync', async () => {
    renderWithReduxRouter('', {});

    await selectBlueprintById(user, blueprintIdOutOfSync);
    await screen.findByText(
      'The selected blueprint is at version 2, images are at version 1. Build images to synchronize with the latest version.'
    );

    await selectBlueprintById(user, blueprintIdWithComposes);
    expect(
      screen.queryByText(
        'The selected blueprint is at version 2, images are at version 1. Build images to synchronize with the latest version.'
      )
    ).not.toBeInTheDocument();
  });

  describe('edit blueprint', () => {
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
      const blueprintDetails = await screen.findByText('Image details');
      await user.click(blueprintDetails);
      await screen.findByText(editedBlueprintName);
    });
    test('redirect to index page when blueprint is invalid', async () => {
      server.use(
        rest.get(
          `${IMAGE_BUILDER_API}/experimental/blueprints/invalid-compose-id`,
          (req, res, ctx) => {
            return res(ctx.status(404));
          }
        )
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
    test('filter blueprints', async () => {
      renderWithReduxRouter('', {});

      const searchInput = await screen.findByPlaceholderText(
        'Search by name or description'
      );
      searchInput.focus();
      await user.keyboard('Milk');

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
    test('paging of blueprints', async () => {
      renderWithReduxRouter('', {});

      expect(await screen.findAllByRole('checkbox')).toHaveLength(10);

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

      await user.click(button);

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox')).toHaveLength(1);
      });
    });
  });

  describe('composes filtering', () => {
    test('filter composes by blueprint version', async () => {
      renderWithReduxRouter('', {});

      await selectBlueprintById(user, blueprintIdWithComposes);

      // Wait for the filter appear (right now it's hidden unless a blueprint is selected)
      const composesVersionFilter = await screen.findByRole('button', {
        name: /All Versions/i,
      });

      expect(
        within(screen.getByTestId('images-table')).getAllByRole('row')
      ).toHaveLength(4);

      await user.click(composesVersionFilter);
      const option = await screen.findByRole('menuitem', { name: 'Newest' });
      await user.click(option);
      expect(
        within(screen.getByTestId('images-table')).getAllByRole('row')
      ).toHaveLength(2);
    });
  });
});
