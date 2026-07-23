import { screen } from '@testing-library/react';

import { renderLandingPage } from './helpers';
import { createDefaultFetchHandler, fetchMock } from './mocks';

fetchMock.enableMocks();

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

  test('does not show New in image builder banner when flag is disabled', async () => {
    renderLandingPage();

    await screen.findByRole('heading', { name: 'Image builder' });
    expect(
      screen.queryByTestId('new-in-image-builder-banner'),
    ).not.toBeInTheDocument();
  });
});
