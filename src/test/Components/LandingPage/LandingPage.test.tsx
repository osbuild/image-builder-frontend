import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { rest } from 'msw';
import nodeFetch, { Request, Response } from 'node-fetch';

import { IMAGE_BUILDER_API } from '../../../constants';
import { mockComposesEmpty } from '../../fixtures/composes';
import { server } from '../../mocks/server';
import { renderWithReduxRouter } from '../../testUtils';

Object.assign(global, { fetch: nodeFetch, Request, Response });

vi.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    isBeta: () => false,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn((flag) => {
    switch (flag) {
      case 'edgeParity.image-list':
        return false;
      default:
        return true;
    }
  }),
}));

describe('Landing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
