import { screen } from '@testing-library/react';
import { rest } from 'msw';

import api from '../../../api.js';
import { IMAGE_BUILDER_API } from '../../../constants.js';
import { mockComposesEmpty } from '../../fixtures/composes';
import { server } from '../../mocks/server.js';
import { renderWithReduxRouter } from '../../testUtils';

jest.mock('../../../store/actions/actions', () => {
  return {
    fetchComposes: () => ({ type: 'foo' }),
    fetchComposeStatus: () => ({ type: 'bar' }),
  };
});

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    isBeta: () => false,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn((flag) => (flag === 'edgeParity.image-list' ? false : true)),
}));

describe('Landing Page', () => {
  test('renders page heading', async () => {
    renderWithReduxRouter('', {});

    const composeImage = jest.spyOn(api, 'getVersion');
    composeImage.mockResolvedValue({ version: '1.0' });
    // check heading
    screen.getByRole('heading', { name: /Image Builder/i });
  });

  test('renders EmptyState child component', async () => {
    server.use(
      rest.get(`${IMAGE_BUILDER_API}/composes`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockComposesEmpty));
      })
    );

    renderWithReduxRouter('', {});

    // check action loads
    await screen.findByTestId('create-image-action');
    // check table loads
    await screen.findByTestId('empty-state');
  });
});
