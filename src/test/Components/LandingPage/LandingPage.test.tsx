import { screen } from '@testing-library/react';
import { rest } from 'msw';

import { IMAGE_BUILDER_API } from '../../../constants';
import { mockComposesEmpty } from '../../fixtures/composes';
import { server } from '../../mocks/server';
import { renderWithReduxRouter } from '../../testUtils';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    isBeta: () => false,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn((flag) => {
    switch (flag) {
      case 'edgeParity.image-list':
        return false;
      default:
        return true;
    }
  }),
}));

describe('Landing Page', () => {
  test('renders page heading', async () => {
    renderWithReduxRouter('', {});

    // check heading
    const heading = await screen.findByText('Images');
    expect(heading).toHaveRole('heading');
  });

  test('renders EmptyState child component', async () => {
    server.use(
      rest.get(`${IMAGE_BUILDER_API}/composes`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockComposesEmpty));
      })
    );

    renderWithReduxRouter('', {});
    // check table loads
    await screen.findByTestId('empty-state');
  });
});
