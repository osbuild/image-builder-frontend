import { screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';

import { composeHandlers, createArchitecturesHandler } from '@/test/testUtils';

import { renderCreateMode, testCheckbox } from './helpers';
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

  test('should enable all navigation items in create mode', async () => {
    await renderCreateMode();

    const navigation = await screen.findByRole('navigation', {
      name: /wizard steps/i,
    });
    const baseNavItem = within(navigation).getByRole('button', {
      name: /base settings/i,
    });
    const contentNavItem = within(navigation).getByRole('button', {
      name: /repositories and packages/i,
    });
    const advancedNavItem = within(navigation).getByRole('button', {
      name: /advanced settings/i,
    });
    const reviewNavItem = within(navigation).getByRole('button', {
      name: /review/i,
    });

    expect(baseNavItem).toBeEnabled();
    expect(contentNavItem).toBeEnabled();
    expect(advancedNavItem).toBeEnabled();
    expect(reviewNavItem).toBeEnabled();
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

  test('target environment checkboxes are keyboard selectable', async () => {
    await renderCreateMode();

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', {
          name: /loading target environments/i,
        }),
      ).not.toBeInTheDocument(),
    );

    await testCheckbox(
      await screen.findByRole('checkbox', { name: /Amazon Web Services/i }),
    );
    await testCheckbox(
      await screen.findByRole('checkbox', { name: /Google Cloud/i }),
    );
    await testCheckbox(
      await screen.findByRole('checkbox', { name: /Microsoft Azure/i }),
    );
  });
});
