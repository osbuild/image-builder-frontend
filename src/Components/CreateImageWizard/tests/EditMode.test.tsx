import { screen, within } from '@testing-library/react';
import { vi } from 'vitest';

import { composeHandlers, createArchitecturesHandler } from '@/test/testUtils';

import { renderEditMode } from './helpers';
import {
  createBlueprintHandler,
  fetchMock,
  mockArchitectures,
  mockBlueprint,
  mockBlueprintId,
} from './mocks';

describe('EditMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.enableMocks();
    fetchMock.mockResponse(
      composeHandlers(
        createArchitecturesHandler({ architectures: mockArchitectures }),
        createBlueprintHandler({ blueprint: mockBlueprint }),
      ),
    );
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  test('should enable all navigation items in edit mode', async () => {
    await renderEditMode(mockBlueprintId);

    const heading = await screen.findByRole('heading', {
      name: /review image configuration/i,
    });

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

    expect(heading).toBeInTheDocument();
    expect(baseNavItem).toBeEnabled();
    expect(contentNavItem).toBeEnabled();
    expect(advancedNavItem).toBeEnabled();
    expect(reviewNavItem).toBeEnabled();
  });
});
