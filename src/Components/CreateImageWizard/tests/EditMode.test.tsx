import { screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';

import {
  clearWithWait,
  clickWithWait,
  composeHandlers,
  createArchitecturesHandler,
  createUser,
  typeWithWait,
} from '@/test/testUtils';

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

  test.each(['Next', 'Review image', 'Review'])(
    '%s blocks an invalid hostname draft and proceeds after correction',
    async (buttonName) => {
      const { store } = await renderEditMode(mockBlueprintId);
      const user = createUser();

      await clickWithWait(
        user,
        screen.getByRole('button', { name: 'Advanced settings' }),
      );
      const hostnameInput = await screen.findByRole('textbox', {
        name: 'hostname input',
      });
      const previousHostname = store.getState().wizard.system.hostname;

      await typeWithWait(user, hostnameInput, '-invalid');
      await clickWithWait(
        user,
        screen.getByRole('button', { name: buttonName }),
      );

      await waitFor(() =>
        expect(store.getState().wizard.validation.forceShowErrors).toBe(true),
      );
      expect(
        screen.getByRole('heading', { name: 'Advanced settings' }),
      ).toBeInTheDocument();
      expect(hostnameInput).toHaveAttribute('aria-invalid', 'true');
      expect(store.getState().wizard.system.hostname).toBe(previousHostname);

      await clearWithWait(user, hostnameInput);
      await typeWithWait(user, hostnameInput, 'valid-hostname');
      await clickWithWait(
        user,
        screen.getByRole('button', { name: buttonName }),
      );

      expect(
        await screen.findByRole('heading', {
          name: /review image configuration/i,
        }),
      ).toBeInTheDocument();
      expect(store.getState().wizard.system.hostname).toBe('valid-hostname');
      expect(store.getState().wizard.validation.pendingInputs).toEqual([]);
    },
  );

  test('resets forced errors after status navigation succeeds', async () => {
    const { store } = await renderEditMode(mockBlueprintId);
    const user = createUser();
    const navigation = await screen.findByRole('navigation', {
      name: /wizard steps/i,
    });

    await clickWithWait(
      user,
      within(navigation).getByRole('button', { name: /advanced settings/i }),
    );
    const hostnameInput = await screen.findByRole('textbox', {
      name: 'hostname input',
    });

    await typeWithWait(user, hostnameInput, '-invalid');
    await clickWithWait(
      user,
      within(navigation).getByRole('button', { name: /review/i }),
    );
    await waitFor(() =>
      expect(store.getState().wizard.validation.forceShowErrors).toBe(true),
    );

    await clearWithWait(user, hostnameInput);
    await typeWithWait(user, hostnameInput, 'valid-hostname');
    await clickWithWait(
      user,
      within(navigation).getByRole('button', { name: /review/i }),
    );

    expect(
      await screen.findByRole('heading', {
        name: /review image configuration/i,
      }),
    ).toBeInTheDocument();
    expect(store.getState().wizard.validation.forceShowErrors).toBe(false);
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
