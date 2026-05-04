import { screen } from '@testing-library/react';

import { createUser, typeWithWait } from '@/test/testUtils';

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
        screen.getByText(
          /Define the hostname to uniquely identify this system within your network environment/i,
        ),
      ).toBeInTheDocument();
    });

    test('X button is not visible when hostname is empty', async () => {
      renderHostnameStep();

      await screen.findByPlaceholderText(/Add a hostname/i);

      expect(
        screen.queryByRole('button', { name: /Clear hostname/i }),
      ).not.toBeInTheDocument();
    });

    test('X button appears when hostname has a value', async () => {
      renderHostnameStep({ hostname: 'some-host' });

      expect(
        await screen.findByRole('button', { name: /Clear hostname/i }),
      ).toBeInTheDocument();
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

    test('clears store when hostname is cleared via X button', async () => {
      const { store } = renderHostnameStep({ hostname: 'existing-hostname' });
      const user = createUser();

      expect(store.getState().wizard.hostname).toBe('existing-hostname');

      await clearHostname(user);

      expect(store.getState().wizard.hostname).toBe('');
    });
  });

  describe('Validation', () => {
    test('shows error for hostname starting with a hyphen', async () => {
      const user = createUser();
      renderHostnameStep();

      await enterHostname(user, '-invalid');
      await tabAway(user);

      expect(await screen.findByText(/Invalid hostname/i)).toBeInTheDocument();
    });

    test('shows error for hostname with uppercase letters', async () => {
      const user = createUser();
      renderHostnameStep();

      await enterHostname(user, 'INVALID');
      await tabAway(user);

      expect(await screen.findByText(/Invalid hostname/i)).toBeInTheDocument();
    });

    test('shows error for hostname exceeding 64 characters', async () => {
      const user = createUser();
      renderHostnameStep();

      await enterHostname(user, 'a'.repeat(65));
      await tabAway(user);

      expect(await screen.findByText(/Invalid hostname/i)).toBeInTheDocument();
    });

    test('does not show error for valid hostname', async () => {
      const user = createUser();
      renderHostnameStep();

      await enterHostname(user, 'valid-hostname');
      await tabAway(user);

      expect(screen.queryByText(/Invalid hostname/i)).not.toBeInTheDocument();
    });

    test('accepts valid hostname at max length (64 characters)', async () => {
      const user = createUser();
      renderHostnameStep();

      await enterHostname(user, 'a'.repeat(64));
      await tabAway(user);

      expect(screen.queryByText(/Invalid hostname/i)).not.toBeInTheDocument();
    });

    test('clears error when hostname becomes valid', async () => {
      const user = createUser();
      renderHostnameStep();

      await enterHostname(user, '-invalid');
      await tabAway(user);
      expect(await screen.findByText(/Invalid hostname/i)).toBeInTheDocument();

      await clearHostname(user);
      await enterHostname(user, 'valid-hostname');
      await tabAway(user);

      expect(screen.queryByText(/Invalid hostname/i)).not.toBeInTheDocument();
    });

    test('does not show error before interaction', async () => {
      renderHostnameStep();

      await screen.findByPlaceholderText(/Add a hostname/i);

      expect(screen.queryByText(/Invalid hostname/i)).not.toBeInTheDocument();
    });

    test('clears error when hostname is cleared via X button', async () => {
      const user = createUser();
      renderHostnameStep();

      await enterHostname(user, '-invalid');
      await tabAway(user);
      expect(await screen.findByText(/Invalid hostname/i)).toBeInTheDocument();

      await clearHostname(user);
      expect(screen.queryByText(/Invalid hostname/i)).not.toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    test('pressing Enter does not trigger page reload', async () => {
      const { store } = renderHostnameStep();
      const user = createUser();

      const hostnameInput =
        await screen.findByPlaceholderText(/Add a hostname/i);
      await typeWithWait(user, hostnameInput, 'test-hostname{Enter}');

      expect(
        screen.getByRole('heading', { name: /Hostname/i }),
      ).toBeInTheDocument();
      expect(hostnameInput).toBeInTheDocument();
      expect(store.getState().wizard.hostname).toBe('test-hostname');
    });
  });
});
