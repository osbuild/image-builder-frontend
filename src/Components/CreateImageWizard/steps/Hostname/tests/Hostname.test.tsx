import { screen } from '@testing-library/react';

import { createUser } from '@/test/testUtils';

import {
  clearHostname,
  enterHostname,
  renderHostnameStep,
  tabAway,
} from './helpers';

describe('Hostname Component', () => {
  describe('Rendering', () => {
    test('displays hostname input field', async () => {
      renderHostnameStep();

      expect(
        await screen.findByPlaceholderText(/Add a hostname/i),
      ).toBeInTheDocument();
    });

    test('displays step title and description', async () => {
      renderHostnameStep();

      expect(
        await screen.findByRole('heading', { name: /Hostname/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Define a hostname for your image/i),
      ).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    test('empty hostname is valid', async () => {
      renderHostnameStep();

      const hostnameInput =
        await screen.findByPlaceholderText(/Add a hostname/i);

      expect(hostnameInput).toHaveValue('');
      expect(screen.queryByText(/Invalid hostname/i)).not.toBeInTheDocument();
    });

    test('shows error for invalid hostname starting with hyphen', async () => {
      renderHostnameStep();
      const user = createUser();

      await enterHostname(user, '-invalid-hostname-');

      await tabAway(user);

      expect(screen.getByText(/Invalid hostname/i)).toBeInTheDocument();
    });

    test('clears error when hostname becomes valid', async () => {
      renderHostnameStep();
      const user = createUser();

      await enterHostname(user, '-invalid-');
      await tabAway(user);

      expect(screen.getByText(/Invalid hostname/i)).toBeInTheDocument();

      await clearHostname(user);
      await enterHostname(user, 'valid-hostname');

      expect(screen.queryByText(/Invalid hostname/i)).not.toBeInTheDocument();
    });

    test('shows error for hostname exceeding 64 characters', async () => {
      renderHostnameStep();
      const user = createUser();

      const longHostname = 'a'.repeat(65);
      await enterHostname(user, longHostname);

      await tabAway(user);

      expect(screen.getByText(/Invalid hostname/i)).toBeInTheDocument();
    });

    test('accepts valid hostname at max length (64 characters)', async () => {
      renderHostnameStep();
      const user = createUser();

      const maxHostname = 'a'.repeat(64);
      await enterHostname(user, maxHostname);

      await tabAway(user);

      expect(screen.queryByText(/Invalid hostname/i)).not.toBeInTheDocument();
    });

    test('accepts valid hostname with hyphens', async () => {
      renderHostnameStep();
      const user = createUser();

      await enterHostname(user, 'my-valid-hostname');

      await tabAway(user);

      expect(screen.queryByText(/Invalid hostname/i)).not.toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    test('renders with pre-populated hostname from state', async () => {
      renderHostnameStep({ hostname: 'existing-hostname' });

      const hostnameInput =
        await screen.findByPlaceholderText(/Add a hostname/i);
      expect(hostnameInput).toHaveValue('existing-hostname');
    });
  });

  describe('State Updates', () => {
    test('updates store when hostname is entered', async () => {
      const { store } = renderHostnameStep();
      const user = createUser();

      await enterHostname(user, 'my-new-hostname');

      const state = store.getState();
      expect(state.wizard.hostname).toBe('my-new-hostname');
    });

    test('clears store when hostname is removed', async () => {
      const { store } = renderHostnameStep({ hostname: 'existing-hostname' });
      const user = createUser();

      expect(store.getState().wizard.hostname).toBe('existing-hostname');

      await clearHostname(user);

      expect(store.getState().wizard.hostname).toBe('');
    });
  });
});
