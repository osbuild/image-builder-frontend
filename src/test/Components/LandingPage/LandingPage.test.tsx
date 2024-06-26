import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

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
      http.get(`${IMAGE_BUILDER_API}/composes`, () => {
        return HttpResponse.json(mockComposesEmpty);
      })
    );

    renderWithReduxRouter('', {});
    // check table loads
    await screen.findByTestId('empty-state');
  });
});
