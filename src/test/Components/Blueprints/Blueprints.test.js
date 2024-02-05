import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';

import { IMAGE_BUILDER_API } from '../../../constants';
import { emptyGetBlueprints } from '../../fixtures/blueprints';
import { server } from '../../mocks/server';
import { renderWithReduxRouter } from '../../testUtils';
import '@testing-library/jest-dom';

import '@testing-library/jest-dom';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    isBeta: () => false,
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

describe('Blueprints', () => {
  const user = userEvent.setup();
  const blueprintNameWithComposes = 'Dark Chocolate';
  const blueprintIdWithComposes = '677b010b-e95e-4694-9813-d11d847f1bfc';
  const blueprintNameEmptyComposes = 'Milk Chocolate';
  const blueprintIdEmptyComposes = '193482e4-4bd0-4898-a8bc-dc8c33ed669f';

  test('renders blueprints page', async () => {
    renderWithReduxRouter('', {});
    await screen.findByText(blueprintNameWithComposes);
    await screen.findByText(blueprintNameEmptyComposes);
  });
  test('renders blueprint empty state', async () => {
    server.use(
      rest.get(
        `${IMAGE_BUILDER_API}/experimental/blueprints`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(emptyGetBlueprints));
        }
      )
    );

    renderWithReduxRouter('', {});
    await screen.findByText('No blueprints yet');
  });
  test('renders blueprint composes', async () => {
    renderWithReduxRouter('', {});
    const idMatcher = blueprintIdWithComposes;
    const nameMatcher = (_, element) =>
      element.getAttribute('name') === 'blueprints';

    const radioButtons = await screen.findAllByRole('radio', {
      name: nameMatcher,
    });
    const elementById = radioButtons.find(
      (button) => button.getAttribute('id') === idMatcher
    );

    await user.click(elementById);
    const table = await screen.findByTestId('images-table');
    const { findByText } = within(table);
    await findByText(blueprintNameWithComposes);
  });
  test('renders blueprint composes empty state', async () => {
    renderWithReduxRouter('', {});
    const idMatcher = blueprintIdEmptyComposes;
    const nameMatcher = (_, element) =>
      element.getAttribute('name') === 'blueprints';

    const radioButtons = await screen.findAllByRole('radio', {
      name: nameMatcher,
    });
    const elementById = radioButtons.find(
      (button) => button.getAttribute('id') === idMatcher
    );
    await user.click(elementById);
    expect(screen.queryByTestId('images-table')).not.toBeInTheDocument();
  });
  test('click build image button', async () => {
    renderWithReduxRouter('', {});
    const idMatcher = blueprintIdWithComposes;
    const nameMatcher = (_, element) =>
      element.getAttribute('name') === 'blueprints';

    const radioButtons = await screen.findAllByRole('radio', {
      name: nameMatcher,
    });
    const elementById = radioButtons.find(
      (button) => button.getAttribute('id') === idMatcher
    );

    await user.click(elementById);
    const buildImageBtn = await screen.findByRole('button', {
      name: /Build image/i,
    });
    expect(buildImageBtn).toBeEnabled();
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
      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(2);
      });
    });
  });
});
