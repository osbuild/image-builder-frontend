import { screen } from '@testing-library/react';

import { createUser } from '@/test/testUtils';

import {
  addDisabledService,
  addEnabledService,
  addMaskedService,
  clearDisabledServiceInput,
  clearEnabledServiceInput,
  clearMaskedServiceInput,
  removeService,
  renderServicesStep,
} from './helpers';

describe('Services Component', () => {
  describe('Rendering', () => {
    test('displays step title and description', async () => {
      renderServicesStep();

      expect(
        await screen.findByRole('heading', { name: /Systemd services/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Enable, disable and mask systemd services/i),
      ).toBeInTheDocument();
    });

    test('displays all service input fields', async () => {
      renderServicesStep();

      expect(
        await screen.findByPlaceholderText(/Add enabled service/i),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Add disabled service/i),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Add masked service/i),
      ).toBeInTheDocument();
    });
  });

  describe('Enabled Services', () => {
    test('can add an enabled service', async () => {
      renderServicesStep();
      const user = createUser();

      await addEnabledService(user, 'httpd');

      expect(screen.getByText('httpd')).toBeInTheDocument();
    });

    test('can add multiple enabled services', async () => {
      renderServicesStep();
      const user = createUser();

      await addEnabledService(user, 'httpd');
      await addEnabledService(user, 'sshd');

      expect(screen.getByText('httpd')).toBeInTheDocument();
      expect(screen.getByText('sshd')).toBeInTheDocument();
    });

    test('can remove an enabled service', async () => {
      renderServicesStep();
      const user = createUser();

      await addEnabledService(user, 'httpd');
      await screen.findByText('httpd');

      await removeService(user, 'httpd');

      expect(screen.queryByText('httpd')).not.toBeInTheDocument();
    });

    test('shows validation error for invalid enabled service', async () => {
      renderServicesStep();
      const user = createUser();

      await addEnabledService(user, '-------');

      expect(
        screen.getByText('Expected format: <service-name>. Example: sshd'),
      ).toBeInTheDocument();

      await clearEnabledServiceInput(user);

      expect(
        screen.queryByText('Expected format: <service-name>. Example: sshd'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Disabled Services', () => {
    test('can add a disabled service', async () => {
      renderServicesStep();
      const user = createUser();

      await addDisabledService(user, 'telnet');

      expect(screen.getByText('telnet')).toBeInTheDocument();
    });

    test('can remove a disabled service', async () => {
      renderServicesStep();
      const user = createUser();

      await addDisabledService(user, 'telnet');
      await screen.findByText('telnet');

      await removeService(user, 'telnet');

      expect(screen.queryByText('telnet')).not.toBeInTheDocument();
    });

    test('shows validation error for invalid disabled service', async () => {
      renderServicesStep();
      const user = createUser();

      await addDisabledService(user, '-------');

      expect(
        screen.getByText('Expected format: <service-name>. Example: sshd'),
      ).toBeInTheDocument();

      await clearDisabledServiceInput(user);

      expect(
        screen.queryByText('Expected format: <service-name>. Example: sshd'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Masked Services', () => {
    test('can add a masked service', async () => {
      renderServicesStep();
      const user = createUser();

      await addMaskedService(user, 'nfs-server');

      expect(screen.getByText('nfs-server')).toBeInTheDocument();
    });

    test('can remove a masked service', async () => {
      renderServicesStep();
      const user = createUser();

      await addMaskedService(user, 'nfs-server');
      await screen.findByText('nfs-server');

      await removeService(user, 'nfs-server');

      expect(screen.queryByText('nfs-server')).not.toBeInTheDocument();
    });

    test('shows validation error for invalid masked service', async () => {
      renderServicesStep();
      const user = createUser();

      await addMaskedService(user, '-------');

      expect(
        screen.getByText('Expected format: <service-name>. Example: sshd'),
      ).toBeInTheDocument();

      await clearMaskedServiceInput(user);

      expect(
        screen.queryByText('Expected format: <service-name>. Example: sshd'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    test('renders with pre-populated enabled services from state', async () => {
      renderServicesStep({
        services: {
          enabled: ['httpd', 'sshd'],
          disabled: [],
          masked: [],
        },
      });

      expect(screen.getByText('httpd')).toBeInTheDocument();
      expect(screen.getByText('sshd')).toBeInTheDocument();
    });

    test('renders with pre-populated disabled services from state', async () => {
      renderServicesStep({
        services: {
          enabled: [],
          disabled: ['telnet', 'rsh'],
          masked: [],
        },
      });

      expect(screen.getByText('telnet')).toBeInTheDocument();
      expect(screen.getByText('rsh')).toBeInTheDocument();
    });

    test('renders with pre-populated masked services from state', async () => {
      renderServicesStep({
        services: {
          enabled: [],
          disabled: [],
          masked: ['nfs-server', 'rpcbind'],
        },
      });

      expect(screen.getByText('nfs-server')).toBeInTheDocument();
      expect(screen.getByText('rpcbind')).toBeInTheDocument();
    });
  });

  describe('State Updates', () => {
    test('updates store when enabled service is added', async () => {
      const { store } = renderServicesStep();
      const user = createUser();

      expect(store.getState().wizard.services.enabled).toHaveLength(0);

      await addEnabledService(user, 'httpd');

      expect(store.getState().wizard.services.enabled).toContain('httpd');
    });

    test('updates store when disabled service is added', async () => {
      const { store } = renderServicesStep();
      const user = createUser();

      expect(store.getState().wizard.services.disabled).toHaveLength(0);

      await addDisabledService(user, 'telnet');

      expect(store.getState().wizard.services.disabled).toContain('telnet');
    });

    test('updates store when masked service is added', async () => {
      const { store } = renderServicesStep();
      const user = createUser();

      expect(store.getState().wizard.services.masked).toHaveLength(0);

      await addMaskedService(user, 'nfs-server');

      expect(store.getState().wizard.services.masked).toContain('nfs-server');
    });

    test('updates store when service is removed', async () => {
      const { store } = renderServicesStep({
        services: {
          enabled: ['httpd'],
          disabled: [],
          masked: [],
        },
      });
      const user = createUser();

      expect(store.getState().wizard.services.enabled).toContain('httpd');

      await removeService(user, 'httpd');

      expect(store.getState().wizard.services.enabled).not.toContain('httpd');
    });
  });
});
