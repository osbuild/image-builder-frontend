import { screen } from '@testing-library/react';

import { server } from '@/test/mocks/server';

import { renderLandingPage } from './helpers';
import { createDefaultFetchHandler, fetchMock } from './mocks';

fetchMock.enableMocks();

// Disable global MSW server for this file - we use fetch mocks instead
beforeAll(() => {
  server.close();
});

// Restore global MSW server so other tests don't break
afterAll(() => {
  server.listen();
});

beforeEach(() => {
  fetchMock.mockResponse(createDefaultFetchHandler);
});

afterEach(() => {
  fetchMock.resetMocks();
});

describe('Landing Page', () => {
  test('renders page heading', async () => {
    renderLandingPage();

    const heading = await screen.findByText('Image builder');
    expect(heading).toHaveRole('heading');
  });

  test('renders EmptyState child component', async () => {
    renderLandingPage();

    await screen.findByText(
      /Image builder is a tool for creating deployment-ready customized system images/i,
    );
  });

  test('does not show New in image builder banner when on-premises', async () => {
    renderLandingPage({
      preloadedState: { env: { isOnPremise: true } },
    });

    await screen.findByRole('heading', { name: 'Image builder' });
    expect(
      screen.queryByTestId('new-in-image-builder-banner'),
    ).not.toBeInTheDocument();
  });
});
