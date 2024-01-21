import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';

import { IMAGE_BUILDER_API } from '../../../constants';
import { emptyGetBlueprints } from '../../fixtures/blueprints';
import { server } from '../../mocks/server';
import { renderWithReduxRouter } from '../../testUtils';

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
  const blueprintNameEmptyComposes = 'Milk Chocolate';

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
    const nameMatcher = (_, element) =>
      element.getAttribute('name') === blueprintNameWithComposes;

    const blueprintRadioBtn = await screen.findByRole('radio', {
      name: nameMatcher,
    });
    await user.click(blueprintRadioBtn);
    const table = await screen.findByTestId('images-table');
    const { findByText } = within(table);
    await findByText(blueprintNameWithComposes);
  });
  test('renders blueprint composes empty state', async () => {
    renderWithReduxRouter('', {});
    const nameMatcher = (_, element) =>
      element.getAttribute('name') === blueprintNameEmptyComposes;

    const blueprintRadioBtn = await screen.findByRole('radio', {
      name: nameMatcher,
    });
    await user.click(blueprintRadioBtn);
    expect(screen.queryByTestId('images-table')).not.toBeInTheDocument();
  });
});
