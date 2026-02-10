import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { IMAGE_BUILDER_API } from '../../../constants';
import { mockComposesEmpty } from '../../fixtures/composes';
import { server } from '../../mocks/server';
import { renderCustomRoutesWithReduxRouter } from '../../testUtils';

describe('Landing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders page heading', async () => {
    renderCustomRoutesWithReduxRouter();

    // check heading
    const heading = await screen.findByText('Image builder');
    expect(heading).toHaveRole('heading');
  });

  test('renders EmptyState child component', async () => {
    server.use(
      http.get(`${IMAGE_BUILDER_API}/composes`, () => {
        return HttpResponse.json(mockComposesEmpty);
      }),
    );

    renderCustomRoutesWithReduxRouter();
    // check table loads
    await screen.findByText(
      /Image builder is a tool for creating deployment-ready customized system images/i,
    );
  });

  test('does not show New in image builder banner when on-premises', async () => {
    renderCustomRoutesWithReduxRouter('/', {
      env: { isOnPremise: true },
    });

    await screen.findByRole('heading', { name: 'Image builder' });
    expect(
      screen.queryByTestId('new-in-image-builder-banner'),
    ).not.toBeInTheDocument();
  });
});
