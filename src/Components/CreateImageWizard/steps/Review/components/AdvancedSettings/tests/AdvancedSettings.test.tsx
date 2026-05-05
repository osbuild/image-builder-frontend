import React from 'react';

import { screen } from '@testing-library/react';

import {
  advancedPartitions,
  basicPartitions,
} from '@/store/slices/wizard/tests/mocks';
import { renderWithRedux } from '@/test/testUtils';

import { adminUser, developerUser, guestUser } from './mocks';

import { createDefaultRestrictions } from '../../tests/helpers';
import AdvancedSettingsOverview from '../index';

describe('AdvancedSettingsOverview', () => {
  test('renders the card with "Advanced settings" title', () => {
    renderWithRedux(
      <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
      {
        imageTypes: ['guest-image'],
      },
    );

    expect(screen.getByText('Advanced settings')).toBeInTheDocument();
  });

  describe('Filesystem', () => {
    describe('Automatic mode', () => {
      test('displays "Automatic" label', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            imageTypes: ['guest-image'],
            fscMode: 'automatic',
          },
        );

        expect(screen.getByText('Automatic')).toBeInTheDocument();
      });

      test('does not show partition count or min size', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            imageTypes: ['guest-image'],
            fscMode: 'automatic',
          },
        );

        expect(
          screen.queryByText('Image size (minimum)'),
        ).not.toBeInTheDocument();
      });
    });

    describe('Basic mode', () => {
      test('displays "Manual" label', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            imageTypes: ['guest-image'],
            fscMode: 'basic',
            fileSystem: {
              partitions: basicPartitions.singleRoot,
            },
          },
        );

        expect(screen.getByText('Manual')).toBeInTheDocument();
      });

      test('shows partition count', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            imageTypes: ['guest-image'],
            fscMode: 'basic',
            fileSystem: {
              partitions: basicPartitions.rootAndHome,
            },
          },
        );

        expect(screen.getByText('2')).toBeInTheDocument();
      });

      test('shows min size in GiB', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            imageTypes: ['guest-image'],
            fscMode: 'basic',
            fileSystem: {
              partitions: basicPartitions.rootAndHome,
            },
          },
        );

        expect(screen.getByText('Image size (minimum)')).toBeInTheDocument();
        expect(screen.getByText('15 GiB')).toBeInTheDocument();
      });
    });

    describe('Advanced mode', () => {
      test('displays "Manual" label', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            imageTypes: ['guest-image'],
            fscMode: 'advanced',
            disk: {
              minsize: '',
              unit: 'GiB',
              type: 'gpt',
              partitions: advancedPartitions.singlePlain,
            },
          },
        );

        expect(screen.getByText('Manual')).toBeInTheDocument();
      });

      test('shows combined partition and logical volume count', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            imageTypes: ['guest-image'],
            fscMode: 'advanced',
            disk: {
              minsize: '',
              unit: 'GiB',
              type: 'gpt',
              partitions: advancedPartitions.withLvm,
            },
          },
        );

        // 1 partition + 2 logical volumes = 3
        expect(screen.getByText('3')).toBeInTheDocument();
      });

      test('shows min size in GiB', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            imageTypes: ['guest-image'],
            fscMode: 'advanced',
            disk: {
              minsize: '',
              unit: 'GiB',
              type: 'gpt',
              partitions: advancedPartitions.withLvm,
            },
          },
        );

        expect(screen.getByText('Image size (minimum)')).toBeInTheDocument();
        // 1 (boot) + 10 (root lv) + 5 (home lv) = 16 GiB
        expect(screen.getByText('16 GiB')).toBeInTheDocument();
      });
    });

    describe('Min size edge cases', () => {
      test('shows "Less than 1GiB" when minSize < 1', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            imageTypes: ['guest-image'],
            fscMode: 'basic',
            fileSystem: {
              partitions: basicPartitions.smallPartition,
            },
          },
        );

        expect(screen.getByText('Less than 1GiB')).toBeInTheDocument();
      });
    });
  });

  describe('Timezone', () => {
    test('displays timezone value', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          timezone: {
            timezone: 'America/New_York',
            ntpservers: [],
          },
        },
      );

      expect(screen.getByText('Timezone')).toBeInTheDocument();
      expect(screen.getByText('America/New_York')).toBeInTheDocument();
    });

    test('displays empty timezone when not set', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          timezone: {
            timezone: '',
            ntpservers: [],
          },
        },
      );

      expect(screen.getByText('Timezone')).toBeInTheDocument();
    });

    test('displays NTP servers when configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          timezone: {
            timezone: 'UTC',
            ntpservers: ['0.pool.ntp.org', '1.pool.ntp.org'],
          },
        },
      );

      expect(screen.getByText('NTP servers')).toBeInTheDocument();
      expect(screen.getByText('0.pool.ntp.org')).toBeInTheDocument();
      expect(screen.getByText('1.pool.ntp.org')).toBeInTheDocument();
    });

    test('does not display NTP servers section when empty', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          timezone: {
            timezone: 'Europe/London',
            ntpservers: [],
          },
        },
      );

      expect(screen.queryByText('NTP servers')).not.toBeInTheDocument();
    });
  });

  describe('Locale', () => {
    test('displays language and keyboard when both are set', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          locale: {
            languages: ['en_US.UTF-8'],
            keyboard: 'us',
          },
        },
      );

      expect(screen.getByText('Language')).toBeInTheDocument();
      expect(screen.getByText('en_US.UTF-8')).toBeInTheDocument();
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
      expect(screen.getByText('us')).toBeInTheDocument();
    });

    test('displays multiple languages', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          locale: {
            languages: ['en_US.UTF-8', 'es_ES.UTF-8', 'fr_FR.UTF-8'],
            keyboard: 'us',
          },
        },
      );

      expect(screen.getByText('en_US.UTF-8')).toBeInTheDocument();
      expect(screen.getByText('es_ES.UTF-8')).toBeInTheDocument();
      expect(screen.getByText('fr_FR.UTF-8')).toBeInTheDocument();
    });

    test('displays only keyboard when languages are empty', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          locale: {
            languages: [],
            keyboard: 'us',
          },
        },
      );

      expect(screen.queryByText('Language')).not.toBeInTheDocument();
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
      expect(screen.getByText('us')).toBeInTheDocument();
    });

    test('displays only language when keyboard is empty', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          locale: {
            languages: ['en_US.UTF-8'],
            keyboard: '',
          },
        },
      );

      expect(screen.getByText('Language')).toBeInTheDocument();
      expect(screen.getByText('en_US.UTF-8')).toBeInTheDocument();
      expect(screen.queryByText('Keyboard')).not.toBeInTheDocument();
    });

    test('does not display locale section when both are empty', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          locale: {
            languages: [],
            keyboard: '',
          },
        },
      );

      expect(screen.queryByText('Language')).not.toBeInTheDocument();
      expect(screen.queryByText('Keyboard')).not.toBeInTheDocument();
    });
  });

  describe('Hostname', () => {
    test('displays hostname when set', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          hostname: 'my-server.example.com',
        },
      );

      expect(screen.getByText('Hostname')).toBeInTheDocument();
      expect(screen.getByText('my-server.example.com')).toBeInTheDocument();
    });

    test('does not display hostname section when empty', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          hostname: '',
        },
      );

      expect(screen.queryByText('Hostname')).not.toBeInTheDocument();
    });
  });

  describe('Kernel', () => {
    test('displays kernel package name when set', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          kernel: {
            name: 'kernel-rt',
            append: [],
          },
        },
      );

      expect(screen.getByText('Kernel package')).toBeInTheDocument();
      expect(screen.getByText('kernel-rt')).toBeInTheDocument();
    });

    test('displays kernel append arguments', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          kernel: {
            name: '',
            append: ['quiet', 'splash', 'rhgb'],
          },
        },
      );

      expect(screen.getByText('Args')).toBeInTheDocument();
      expect(
        screen.getByRole('list', { name: 'Kernel arguments' }),
      ).toBeInTheDocument();
      expect(screen.getByText('quiet')).toBeInTheDocument();
      expect(screen.getByText('splash')).toBeInTheDocument();
      expect(screen.getByText('rhgb')).toBeInTheDocument();
    });

    test('displays both kernel package and append arguments', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          kernel: {
            name: 'kernel-debug',
            append: ['debug', 'console=ttyS0'],
          },
        },
      );

      expect(screen.getByText('Kernel package')).toBeInTheDocument();
      expect(screen.getByText('kernel-debug')).toBeInTheDocument();
      expect(screen.getByText('Args')).toBeInTheDocument();
      expect(screen.getByText('debug')).toBeInTheDocument();
      expect(screen.getByText('console=ttyS0')).toBeInTheDocument();
    });

    test('hides kernel section when no kernel name or args are set', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          kernel: {
            name: '',
            append: [],
          },
        },
      );

      expect(screen.queryByText('Kernel package')).not.toBeInTheDocument();
      expect(screen.queryByText('Args')).not.toBeInTheDocument();
    });

    test('displays user-selected kernel args with blue labels', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          kernel: {
            name: '',
            append: ['quiet', 'splash'],
          },
        },
      );

      const quietLabel = screen.getByText('quiet').closest('.pf-v6-c-label');
      const splashLabel = screen.getByText('splash').closest('.pf-v6-c-label');

      expect(quietLabel).toHaveClass('pf-m-blue');
      expect(splashLabel).toHaveClass('pf-m-blue');
    });

    test('displays oscap kernel args with default (grey) labels', () => {
      renderWithRedux(
        <AdvancedSettingsOverview
          restrictions={createDefaultRestrictions()}
          oscapKernelArgs={['audit=1', 'audit_backlog_limit=8192']}
        />,
        {
          imageTypes: ['guest-image'],
          kernel: {
            name: '',
            append: ['audit=1'],
          },
        },
      );

      const label = screen.getByText('audit=1').closest('.pf-v6-c-label');
      // Grey is the default color, so no color modifier class is applied
      expect(label).not.toHaveClass('pf-m-blue');
      expect(label).toHaveClass('pf-m-filled');
    });

    test('displays mixed kernel args with correct label colors', () => {
      renderWithRedux(
        <AdvancedSettingsOverview
          restrictions={createDefaultRestrictions()}
          oscapKernelArgs={['audit=1']}
        />,
        {
          imageTypes: ['guest-image'],
          kernel: {
            name: '',
            append: ['audit=1', 'quiet'],
          },
        },
      );

      const auditLabel = screen.getByText('audit=1').closest('.pf-v6-c-label');
      const quietLabel = screen.getByText('quiet').closest('.pf-v6-c-label');

      // Oscap args use grey (default), user args use blue
      expect(auditLabel).not.toHaveClass('pf-m-blue');
      expect(quietLabel).toHaveClass('pf-m-blue');
    });
  });

  describe('Services', () => {
    test('displays all service sections with empty messages by default', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          services: {
            enabled: [],
            disabled: [],
            masked: [],
          },
        },
      );

      expect(screen.getByText('Enabled systemd services')).toBeInTheDocument();
      expect(screen.getByText('Disabled systemd services')).toBeInTheDocument();
      expect(screen.getByText('Masked systemd services')).toBeInTheDocument();
      expect(screen.getAllByText('No services selected')).toHaveLength(3);
    });

    test('displays enabled services', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          services: {
            enabled: ['httpd', 'sshd'],
            disabled: [],
            masked: [],
          },
        },
      );

      expect(
        screen.getByRole('list', { name: 'Enabled services' }),
      ).toBeInTheDocument();
      expect(screen.getByText('httpd')).toBeInTheDocument();
      expect(screen.getByText('sshd')).toBeInTheDocument();
    });

    test('displays disabled services', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          services: {
            enabled: [],
            disabled: ['bluetooth', 'cups'],
            masked: [],
          },
        },
      );

      expect(screen.getByText('bluetooth')).toBeInTheDocument();
      expect(screen.getByText('cups')).toBeInTheDocument();
    });

    test('displays masked services', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          services: {
            enabled: [],
            disabled: [],
            masked: ['firewalld'],
          },
        },
      );

      expect(screen.getByText('firewalld')).toBeInTheDocument();
    });

    test('displays user-selected services with blue labels', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          services: {
            enabled: ['httpd'],
            disabled: ['cups'],
            masked: ['firewalld'],
          },
        },
      );

      const httpdLabel = screen.getByText('httpd').closest('.pf-v6-c-label');
      const cupsLabel = screen.getByText('cups').closest('.pf-v6-c-label');
      const firewalldLabel = screen
        .getByText('firewalld')
        .closest('.pf-v6-c-label');

      expect(httpdLabel).toHaveClass('pf-m-blue');
      expect(cupsLabel).toHaveClass('pf-m-blue');
      expect(firewalldLabel).toHaveClass('pf-m-blue');
    });

    test('displays oscap services with default (grey) labels', () => {
      renderWithRedux(
        <AdvancedSettingsOverview
          restrictions={createDefaultRestrictions()}
          oscapServices={{
            enabled: ['auditd', 'rsyslog'],
            disabled: ['autofs'],
            masked: ['nfs-server'],
          }}
        />,
        {
          imageTypes: ['guest-image'],
          services: {
            enabled: ['auditd'],
            disabled: ['autofs'],
            masked: ['nfs-server'],
          },
        },
      );

      const auditdLabel = screen.getByText('auditd').closest('.pf-v6-c-label');
      const autofsLabel = screen.getByText('autofs').closest('.pf-v6-c-label');
      const nfsLabel = screen.getByText('nfs-server').closest('.pf-v6-c-label');

      // Oscap services use grey (default)
      expect(auditdLabel).not.toHaveClass('pf-m-blue');
      expect(autofsLabel).not.toHaveClass('pf-m-blue');
      expect(nfsLabel).not.toHaveClass('pf-m-blue');
    });

    test('displays mixed services with correct label colors', () => {
      renderWithRedux(
        <AdvancedSettingsOverview
          restrictions={createDefaultRestrictions()}
          oscapServices={{
            enabled: ['auditd'],
            disabled: [],
            masked: [],
          }}
        />,
        {
          imageTypes: ['guest-image'],
          services: {
            enabled: ['auditd', 'httpd'],
            disabled: [],
            masked: [],
          },
        },
      );

      const auditdLabel = screen.getByText('auditd').closest('.pf-v6-c-label');
      const httpdLabel = screen.getByText('httpd').closest('.pf-v6-c-label');

      // Oscap services use grey (default), user services use blue
      expect(auditdLabel).not.toHaveClass('pf-m-blue');
      expect(httpdLabel).toHaveClass('pf-m-blue');
    });
  });

  describe('Firstboot', () => {
    const firstBootScript = `#! /bin/bash

echo 'Hello there, General Kenobi!'`;

    test('does not display when script is empty', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          firstBoot: { script: '' },
        },
      );

      expect(
        screen.queryByText('First boot configuration'),
      ).not.toBeInTheDocument();
    });

    test('displays heading when script is configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          firstBoot: { script: firstBootScript },
        },
      );

      expect(screen.getByText('First boot configuration')).toBeInTheDocument();
    });

    test('displays configured status when script is set', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          firstBoot: { script: firstBootScript },
        },
      );

      expect(screen.getByText('Configured')).toBeInTheDocument();
    });
  });

  describe('Users', () => {
    test('does not render users section when no users configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          users: [],
        },
      );

      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });

    test('displays users heading when users are configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          users: [adminUser, developerUser],
        },
      );

      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    test('does not display user columns when no users configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          users: [],
        },
      );

      expect(screen.queryByText('Username')).not.toBeInTheDocument();
      expect(screen.queryByText('Password')).not.toBeInTheDocument();
      expect(screen.queryByText('SSH key')).not.toBeInTheDocument();
      expect(screen.queryByText('Groups')).not.toBeInTheDocument();
      expect(screen.queryByText('Administrator')).not.toBeInTheDocument();
    });

    test('displays all column headings when users are configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          users: [adminUser],
        },
      );

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('SSH key')).toBeInTheDocument();
      expect(screen.getByText('Groups')).toBeInTheDocument();
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    test('displays usernames', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          users: [adminUser, developerUser],
        },
      );

      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('developer')).toBeInTheDocument();
    });

    test('displays masked passwords', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          users: [adminUser, developerUser],
        },
      );

      // All passwords should be masked as *****
      const maskedPasswords = screen.getAllByText('*****');
      expect(maskedPasswords).toHaveLength(2);
    });

    test('displays administrator status', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          users: [adminUser, developerUser],
        },
      );

      // One admin (Enabled) and one non-admin (Disabled) under Administrator column
      const adminColumn = screen.getByText('Administrator').closest('div');
      expect(adminColumn).toHaveTextContent('Enabled');
      expect(adminColumn).toHaveTextContent('Disabled');
    });

    test('displays SSH keys', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          users: [{ ...adminUser, ssh_key: 'ssh-rsa AAAA' }],
        },
      );

      expect(screen.getByText('SSH key')).toBeInTheDocument();
      expect(screen.getByText('ssh-rsa AAAA')).toBeInTheDocument();
    });

    test('displays groups', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          users: [{ ...adminUser, groups: ['wheel', 'docker'] }],
        },
      );

      expect(screen.getByText('Groups')).toBeInTheDocument();
      expect(screen.getByText('wheel, docker')).toBeInTheDocument();
    });

    test('displays multiple users with all their data', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          users: [
            { ...adminUser, ssh_key: 'ssh-rsa adminkey', groups: ['wheel'] },
            { ...developerUser, ssh_key: 'ssh-rsa devkey', groups: ['docker'] },
            guestUser,
          ],
        },
      );

      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('developer')).toBeInTheDocument();
      expect(screen.getByText('guest')).toBeInTheDocument();
      expect(screen.getAllByText('*****')).toHaveLength(3);
    });
  });

  describe('Firewall', () => {
    test('does not render firewall when no configuration', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          firewall: {
            ports: [],
            services: {
              enabled: [],
              disabled: [],
            },
          },
        },
      );

      expect(screen.queryByText('Firewall')).not.toBeInTheDocument();
    });

    test('displays firewall as enabled when ports are configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          firewall: {
            ports: ['22/tcp', '443/tcp'],
            services: {
              enabled: [],
              disabled: [],
            },
          },
        },
      );

      expect(screen.getByText('Firewall')).toBeInTheDocument();
      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    test('displays firewall as enabled when services are configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          firewall: {
            ports: [],
            services: {
              enabled: ['httpd'],
              disabled: [],
            },
          },
        },
      );

      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    test('displays ports column', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          firewall: {
            ports: ['22/tcp', '443/tcp', '8080/tcp'],
            services: {
              enabled: [],
              disabled: [],
            },
          },
        },
      );

      expect(screen.getByText('Ports')).toBeInTheDocument();
      expect(screen.getByText('22/tcp')).toBeInTheDocument();
      expect(screen.getByText('443/tcp')).toBeInTheDocument();
      expect(screen.getByText('8080/tcp')).toBeInTheDocument();
    });

    test('displays enabled services column', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          firewall: {
            ports: [],
            services: {
              enabled: ['httpd', 'sshd'],
              disabled: [],
            },
          },
        },
      );

      expect(screen.getByText('Enabled services')).toBeInTheDocument();
      expect(screen.getByText('httpd')).toBeInTheDocument();
      expect(screen.getByText('sshd')).toBeInTheDocument();
    });

    test('displays disabled services column', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          firewall: {
            ports: [],
            services: {
              enabled: [],
              disabled: ['cups', 'bluetooth'],
            },
          },
        },
      );

      expect(screen.getByText('Disabled services')).toBeInTheDocument();
      expect(screen.getByText('cups')).toBeInTheDocument();
      expect(screen.getByText('bluetooth')).toBeInTheDocument();
    });

    test('pads shorter columns with placeholder', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          firewall: {
            ports: ['22/tcp', '443/tcp', '8080/tcp'],
            services: {
              enabled: ['httpd'],
              disabled: [],
            },
          },
        },
      );

      // 3 ports, 1 enabled service, 0 disabled services
      // Should have 2 placeholders in enabled column and 3 in disabled column
      const placeholders = screen.getAllByText('--');
      expect(placeholders).toHaveLength(5);
    });

    test('displays all three columns with configuration', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          firewall: {
            ports: ['22/tcp'],
            services: {
              enabled: ['httpd', 'sshd'],
              disabled: ['cups'],
            },
          },
        },
      );

      expect(screen.getByText('Ports')).toBeInTheDocument();
      expect(screen.getByText('Enabled services')).toBeInTheDocument();
      expect(screen.getByText('Disabled services')).toBeInTheDocument();

      expect(screen.getByText('22/tcp')).toBeInTheDocument();
      expect(screen.getByText('httpd')).toBeInTheDocument();
      expect(screen.getByText('sshd')).toBeInTheDocument();
      expect(screen.getByText('cups')).toBeInTheDocument();
    });

    test('does not display any firewall content when firewall is disabled', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          firewall: {
            ports: [],
            services: {
              enabled: [],
              disabled: [],
            },
          },
        },
      );

      expect(screen.queryByText('Firewall')).not.toBeInTheDocument();
      expect(screen.queryByText('Ports')).not.toBeInTheDocument();
      expect(screen.queryByText('Enabled services')).not.toBeInTheDocument();
      expect(screen.queryByText('Disabled services')).not.toBeInTheDocument();
    });
  });
});
