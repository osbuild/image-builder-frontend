import { screen } from '@testing-library/react';

import { createUser } from '@/test/testUtils';

import {
  enterCallbackUrl,
  enterHostConfigKey,
  renderAAPStep,
  toggleInsecureCheckbox,
} from './helpers';

describe('AAP Component', () => {
  describe('Rendering', () => {
    test('displays step title and description', async () => {
      renderAAPStep();

      expect(
        await screen.findByRole('heading', {
          name: /Ansible Automation Platform/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Configure the image with an AAP callback/i),
      ).toBeInTheDocument();
    });

    test('displays required input fields', async () => {
      renderAAPStep();

      expect(
        await screen.findByRole('textbox', { name: /ansible callback url/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: /host config key/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Callback URL', () => {
    test('can enter a callback URL', async () => {
      renderAAPStep();
      const user = createUser();

      await enterCallbackUrl(user, 'https://controller.example.com/callback/');

      const input = await screen.findByRole('textbox', {
        name: /ansible callback url/i,
      });
      expect(input).toHaveValue('https://controller.example.com/callback/');
    });

    test('shows insecure checkbox for HTTPS URLs', async () => {
      renderAAPStep();
      const user = createUser();

      await enterCallbackUrl(user, 'https://controller.example.com/callback/');

      expect(
        await screen.findByRole('checkbox', { name: /insecure/i }),
      ).toBeInTheDocument();
    });

    test('does not show insecure checkbox for HTTP URLs', async () => {
      renderAAPStep();
      const user = createUser();

      await enterCallbackUrl(user, 'http://controller.example.com/callback/');

      expect(
        screen.queryByRole('checkbox', { name: /insecure/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Host Config Key', () => {
    test('can enter a host config key', async () => {
      renderAAPStep();
      const user = createUser();

      await enterHostConfigKey(user, 'my-host-config-key');

      const input = await screen.findByRole('textbox', {
        name: /host config key/i,
      });
      expect(input).toHaveValue('my-host-config-key');
    });
  });

  describe('TLS Configuration', () => {
    test('certificate input is visible by default for HTTPS URLs', async () => {
      renderAAPStep();
      const user = createUser();

      await enterCallbackUrl(user, 'https://controller.example.com/callback/');

      expect(
        await screen.findByText(/Certificate authority/i),
      ).toBeInTheDocument();
    });

    test('certificate input is hidden when insecure checkbox is checked', async () => {
      renderAAPStep();
      const user = createUser();

      await enterCallbackUrl(user, 'https://controller.example.com/callback/');
      await screen.findByRole('checkbox', { name: /insecure/i });

      await toggleInsecureCheckbox(user);

      expect(
        screen.queryByText(/Certificate authority/i),
      ).not.toBeInTheDocument();
    });

    test('certificate input reappears when insecure checkbox is unchecked', async () => {
      renderAAPStep();
      const user = createUser();

      await enterCallbackUrl(user, 'https://controller.example.com/callback/');
      await screen.findByRole('checkbox', { name: /insecure/i });

      await toggleInsecureCheckbox(user);
      await toggleInsecureCheckbox(user);

      expect(
        await screen.findByText(/Certificate authority/i),
      ).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    test('renders with pre-populated callback URL from state', async () => {
      renderAAPStep({
        aapRegistration: {
          callbackUrl: 'https://existing.controller.com/callback/',
          hostConfigKey: '',
          tlsCertificateAuthority: '',
          skipTlsVerification: false,
        },
      });

      const input = await screen.findByRole('textbox', {
        name: /ansible callback url/i,
      });
      expect(input).toHaveValue('https://existing.controller.com/callback/');
    });

    test('renders with pre-populated host config key from state', async () => {
      renderAAPStep({
        aapRegistration: {
          callbackUrl: '',
          hostConfigKey: 'existing-key',
          tlsCertificateAuthority: '',
          skipTlsVerification: false,
        },
      });

      const input = await screen.findByRole('textbox', {
        name: /host config key/i,
      });
      expect(input).toHaveValue('existing-key');
    });

    test('renders with insecure checkbox checked when skipTlsVerification is true', async () => {
      renderAAPStep({
        aapRegistration: {
          callbackUrl: 'https://controller.example.com/callback/',
          hostConfigKey: '',
          tlsCertificateAuthority: '',
          skipTlsVerification: true,
        },
      });

      const checkbox = await screen.findByRole('checkbox', {
        name: /insecure/i,
      });
      expect(checkbox).toBeChecked();
    });
  });

  describe('State Updates', () => {
    test('updates store when callback URL is entered', async () => {
      const { store } = renderAAPStep();
      const user = createUser();

      await enterCallbackUrl(user, 'https://controller.example.com/callback/');

      expect(store.getState().wizard.aapRegistration.callbackUrl).toBe(
        'https://controller.example.com/callback/',
      );
    });

    test('updates store when host config key is entered', async () => {
      const { store } = renderAAPStep();
      const user = createUser();

      await enterHostConfigKey(user, 'my-host-config-key');

      expect(store.getState().wizard.aapRegistration.hostConfigKey).toBe(
        'my-host-config-key',
      );
    });

    test('updates store when insecure checkbox is toggled', async () => {
      const { store } = renderAAPStep({
        aapRegistration: {
          callbackUrl: 'https://controller.example.com/callback/',
          hostConfigKey: '',
          tlsCertificateAuthority: '',
          skipTlsVerification: false,
        },
      });
      const user = createUser();

      expect(store.getState().wizard.aapRegistration.skipTlsVerification).toBe(
        false,
      );

      await toggleInsecureCheckbox(user);

      expect(store.getState().wizard.aapRegistration.skipTlsVerification).toBe(
        true,
      );
    });
  });
});
