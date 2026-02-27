import { screen } from '@testing-library/react';

import { createUser } from '@/test/testUtils';

import {
  addDisabledService,
  addEnabledService,
  addPort,
  clearDisabledServiceInput,
  clearEnabledServiceInput,
  clearPortInput,
  removeItem,
  renderFirewallStep,
} from './helpers';

describe('Firewall Component', () => {
  describe('Rendering', () => {
    test('displays step title and description', async () => {
      renderFirewallStep();

      expect(
        await screen.findByRole('heading', { name: /Firewall/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Customize firewall settings for your image/i),
      ).toBeInTheDocument();
    });

    test('displays all input fields', async () => {
      renderFirewallStep();

      expect(
        await screen.findByPlaceholderText(/Enter port/i),
      ).toBeInTheDocument();

      const serviceInputs = screen.getAllByPlaceholderText(
        /Enter firewalld service/i,
      );
      expect(serviceInputs).toHaveLength(2);
    });
  });

  describe('Ports', () => {
    test('can add a port', async () => {
      renderFirewallStep();
      const user = createUser();

      await addPort(user, '80:tcp');

      expect(screen.getByText('80:tcp')).toBeInTheDocument();
    });

    test('can add multiple ports', async () => {
      renderFirewallStep();
      const user = createUser();

      await addPort(user, '80:tcp');
      await addPort(user, '443:udp');

      expect(screen.getByText('80:tcp')).toBeInTheDocument();
      expect(screen.getByText('443:udp')).toBeInTheDocument();
    });

    test('can remove a port', async () => {
      renderFirewallStep();
      const user = createUser();

      await addPort(user, '80:tcp');
      await screen.findByText('80:tcp');

      await removeItem(user, '80:tcp');

      expect(screen.queryByText('80:tcp')).not.toBeInTheDocument();
    });

    test('shows validation error for invalid port format', async () => {
      renderFirewallStep();
      const user = createUser();

      await addPort(user, '00:wrongFormat');

      expect(
        screen.getByText(
          'Expected format: <port/port-name>:<protocol>. Example: 8080:tcp, ssh:tcp',
        ),
      ).toBeInTheDocument();

      await clearPortInput(user);

      expect(
        screen.queryByText(
          'Expected format: <port/port-name>:<protocol>. Example: 8080:tcp, ssh:tcp',
        ),
      ).not.toBeInTheDocument();
    });

    test('shows error for duplicate port', async () => {
      renderFirewallStep();
      const user = createUser();

      await addPort(user, '80:tcp');
      await addPort(user, '80:tcp');

      expect(screen.getByText('Port already exists.')).toBeInTheDocument();
    });
  });

  describe('Enabled Services', () => {
    test('can add an enabled service', async () => {
      renderFirewallStep();
      const user = createUser();

      await addEnabledService(user, 'ssh');

      expect(screen.getByText('ssh')).toBeInTheDocument();
    });

    test('can remove an enabled service', async () => {
      renderFirewallStep();
      const user = createUser();

      await addEnabledService(user, 'ssh');
      await screen.findByText('ssh');

      await removeItem(user, 'ssh');

      expect(screen.queryByText('ssh')).not.toBeInTheDocument();
    });

    test('shows validation error for invalid enabled service', async () => {
      renderFirewallStep();
      const user = createUser();

      await addEnabledService(user, '-------');

      expect(
        screen.getByText(
          'Expected format: <firewalld-service-name>. Example: ssh.',
        ),
      ).toBeInTheDocument();

      await clearEnabledServiceInput(user);

      expect(
        screen.queryByText(
          'Expected format: <firewalld-service-name>. Example: ssh.',
        ),
      ).not.toBeInTheDocument();
    });

    test('shows error for duplicate enabled service', async () => {
      renderFirewallStep();
      const user = createUser();

      await addEnabledService(user, 'ssh');
      await addEnabledService(user, 'ssh');

      expect(
        screen.getByText('Enabled service already exists.'),
      ).toBeInTheDocument();
    });
  });

  describe('Disabled Services', () => {
    test('can add a disabled service', async () => {
      renderFirewallStep();
      const user = createUser();

      await addDisabledService(user, 'telnet');

      expect(screen.getByText('telnet')).toBeInTheDocument();
    });

    test('can remove a disabled service', async () => {
      renderFirewallStep();
      const user = createUser();

      await addDisabledService(user, 'telnet');
      await screen.findByText('telnet');

      await removeItem(user, 'telnet');

      expect(screen.queryByText('telnet')).not.toBeInTheDocument();
    });

    test('shows validation error for invalid disabled service', async () => {
      renderFirewallStep();
      const user = createUser();

      await addDisabledService(user, '-------');

      expect(
        screen.getByText(
          'Expected format: <firewalld-service-name>. Example: ssh.',
        ),
      ).toBeInTheDocument();

      await clearDisabledServiceInput(user);

      expect(
        screen.queryByText(
          'Expected format: <firewalld-service-name>. Example: ssh.',
        ),
      ).not.toBeInTheDocument();
    });

    test('shows error for duplicate disabled service', async () => {
      renderFirewallStep();
      const user = createUser();

      await addDisabledService(user, 'telnet');
      await addDisabledService(user, 'telnet');

      expect(
        screen.getByText('Disabled service already exists.'),
      ).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    test('renders with pre-populated ports from state', async () => {
      renderFirewallStep({
        firewall: {
          ports: ['80:tcp', '443:udp'],
          services: {
            enabled: [],
            disabled: [],
          },
        },
      });

      expect(screen.getByText('80:tcp')).toBeInTheDocument();
      expect(screen.getByText('443:udp')).toBeInTheDocument();
    });

    test('renders with pre-populated enabled services from state', async () => {
      renderFirewallStep({
        firewall: {
          ports: [],
          services: {
            enabled: ['ssh', 'http'],
            disabled: [],
          },
        },
      });

      expect(screen.getByText('ssh')).toBeInTheDocument();
      expect(screen.getByText('http')).toBeInTheDocument();
    });

    test('renders with pre-populated disabled services from state', async () => {
      renderFirewallStep({
        firewall: {
          ports: [],
          services: {
            enabled: [],
            disabled: ['telnet', 'ftp'],
          },
        },
      });

      expect(screen.getByText('telnet')).toBeInTheDocument();
      expect(screen.getByText('ftp')).toBeInTheDocument();
    });
  });

  describe('State Updates', () => {
    test('updates store when port is added', async () => {
      const { store } = renderFirewallStep();
      const user = createUser();

      expect(store.getState().wizard.firewall.ports).toHaveLength(0);

      await addPort(user, '80:tcp');

      expect(store.getState().wizard.firewall.ports).toContain('80:tcp');
    });

    test('updates store when multiple ports are added', async () => {
      const { store } = renderFirewallStep();
      const user = createUser();

      await addPort(user, '80:tcp');
      await addPort(user, '443:udp');

      const ports = store.getState().wizard.firewall.ports;
      expect(ports).toContain('80:tcp');
      expect(ports).toContain('443:udp');
    });

    test('updates store when port is removed', async () => {
      const { store } = renderFirewallStep({
        firewall: {
          ports: ['80:tcp'],
          services: {
            enabled: [],
            disabled: [],
          },
        },
      });
      const user = createUser();

      expect(store.getState().wizard.firewall.ports).toContain('80:tcp');

      await removeItem(user, '80:tcp');

      expect(store.getState().wizard.firewall.ports).not.toContain('80:tcp');
    });

    test('updates store when enabled service is added', async () => {
      const { store } = renderFirewallStep();
      const user = createUser();

      expect(store.getState().wizard.firewall.services.enabled).toHaveLength(0);

      await addEnabledService(user, 'ssh');

      expect(store.getState().wizard.firewall.services.enabled).toContain(
        'ssh',
      );
    });

    test('updates store when disabled service is added', async () => {
      const { store } = renderFirewallStep();
      const user = createUser();

      expect(store.getState().wizard.firewall.services.disabled).toHaveLength(
        0,
      );

      await addDisabledService(user, 'telnet');

      expect(store.getState().wizard.firewall.services.disabled).toContain(
        'telnet',
      );
    });

    test('updates store when service is removed', async () => {
      const { store } = renderFirewallStep({
        firewall: {
          ports: [],
          services: {
            enabled: ['ssh'],
            disabled: [],
          },
        },
      });
      const user = createUser();

      expect(store.getState().wizard.firewall.services.enabled).toContain(
        'ssh',
      );

      await removeItem(user, 'ssh');

      expect(store.getState().wizard.firewall.services.enabled).not.toContain(
        'ssh',
      );
    });
  });
});
