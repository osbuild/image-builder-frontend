import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { composeHandlers, createArchitecturesHandler } from '@/test/testUtils';

import { renderCreateMode, testRadio } from './helpers';
import {
  createDefaultFetchHandler,
  fetchMock,
  mockArchitectures,
} from './mocks';

describe('Create Image Wizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.enableMocks();
    fetchMock.mockResponse(createDefaultFetchHandler());
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  test('renders component', async () => {
    await renderCreateMode();

    // check heading
    await screen.findByRole('heading', { name: /Build an image/ });

    // check navigation
    await screen.findByRole('button', { name: 'Base settings' });
    await screen.findByRole('button', { name: 'Repositories and packages' });
    await screen.findByRole('button', { name: 'Advanced settings' });
    await screen.findByRole('button', { name: 'Review' });
  });
});

describe('Keyboard accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.enableMocks();
    fetchMock.mockResponse(
      composeHandlers(
        createArchitecturesHandler({ architectures: mockArchitectures }),
        createDefaultFetchHandler(),
      ),
    );
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  test('target environment radios are keyboard selectable', async () => {
    await renderCreateMode();

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', {
          name: /loading target environments/i,
        }),
      ).not.toBeInTheDocument(),
    );

    await testRadio(
      await screen.findByRole('radio', { name: /Amazon Web Services/i }),
    );
  });
});
