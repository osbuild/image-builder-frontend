/* eslint-disable testing-library/no-node-access */
// PatternFly Label components render text in child spans with color classes on the parent.
// Tests need .closest() to access the label element for class assertions.
import React from 'react';

import { screen } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import {
  advancedPartitions,
  basicPartitions,
} from '@/store/slices/wizard/filesystem/tests/mocks';
import { renderWithRedux } from '@/test/testUtils';

import { adminUser, developerUser, guestUser, userGroups } from './mocks';

import { createDefaultRestrictions } from '../../tests/helpers';
import AdvancedSettingsOverview from '../index';

describe('AdvancedSettingsOverview', () => {
  test('renders the card with "Advanced settings" title', () => {
    renderWithRedux(
      <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
      {
        output: {
          ...initialState.output,
          imageTypes: ['guest-image'],
        },
      },
    );

    expect(screen.getByText('Advanced settings')).toBeInTheDocument();
  });

  describe('Filesystem', () => {
    describe('Automatic mode', () => {
      test('displays automatic partitioning label', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            output: {
              ...initialState.output,
              imageTypes: ['guest-image'],
            },
            filesystem: {
              mode: 'automatic',
              disk: {
                minsize: '',
                unit: 'GiB',
                partitions: [],
                type: undefined,
              },
              fileSystem: { partitions: [] },
              partitioningMode: undefined,
            },
          },
        );

        expect(screen.getByText('Automatic partitioning')).toBeInTheDocument();
      });

      test('does not show partitions or min size', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            output: {
              ...initialState.output,
              imageTypes: ['guest-image'],
            },
            filesystem: {
              mode: 'automatic',
              disk: {
                minsize: '',
                unit: 'GiB',
                partitions: [],
                type: undefined,
              },
              fileSystem: { partitions: [] },
              partitioningMode: undefined,
            },
          },
        );

        expect(
          screen.queryByText('Image size (minimum)'),
        ).not.toBeInTheDocument();
        expect(screen.queryByText('Partitions')).not.toBeInTheDocument();
      });
    });

    describe('Basic mode', () => {
      test('displays manual partitioning label', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            output: {
              ...initialState.output,
              imageTypes: ['guest-image'],
            },
            filesystem: {
              mode: 'basic',
              disk: {
                minsize: '',
                unit: 'GiB',
                partitions: [],
                type: undefined,
              },
              fileSystem: {
                partitions: basicPartitions.singleRoot,
              },
              partitioningMode: undefined,
            },
          },
        );

        expect(screen.getByText('Manual partitioning')).toBeInTheDocument();
      });

      test('shows partition mount points', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            output: {
              ...initialState.output,
              imageTypes: ['guest-image'],
            },
            filesystem: {
              mode: 'basic',
              disk: {
                minsize: '',
                unit: 'GiB',
                partitions: [],
                type: undefined,
              },
              fileSystem: {
                partitions: basicPartitions.rootAndHome,
              },
              partitioningMode: undefined,
            },
          },
        );

        expect(screen.getByText('Partitions')).toBeInTheDocument();
        expect(screen.getByText('/')).toBeInTheDocument();
        expect(screen.getByText('/home')).toBeInTheDocument();
      });

      test('shows min size in GiB', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            output: {
              ...initialState.output,
              imageTypes: ['guest-image'],
            },
            filesystem: {
              mode: 'basic',
              disk: {
                minsize: '',
                unit: 'GiB',
                partitions: [],
                type: undefined,
              },
              fileSystem: {
                partitions: basicPartitions.rootAndHome,
              },
              partitioningMode: undefined,
            },
          },
        );

        expect(screen.getByText('Image size (minimum)')).toBeInTheDocument();
        expect(screen.getByText('15 GiB')).toBeInTheDocument();
      });
    });

    describe('Advanced mode', () => {
      test('displays advanced disk partitioning label', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            output: {
              ...initialState.output,
              imageTypes: ['guest-image'],
            },
            filesystem: {
              mode: 'advanced',
              disk: {
                minsize: '',
                unit: 'GiB',
                type: 'gpt',
                partitions: advancedPartitions.singlePlain,
              },
              fileSystem: { partitions: [] },
              partitioningMode: undefined,
            },
          },
        );

        expect(
          screen.getByText('Advanced disk partitioning'),
        ).toBeInTheDocument();
      });

      test('shows plain partition details', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            output: {
              ...initialState.output,
              imageTypes: ['guest-image'],
            },
            filesystem: {
              mode: 'advanced',
              disk: {
                minsize: '',
                unit: 'GiB',
                type: 'gpt',
                partitions: advancedPartitions.singlePlain,
              },
              fileSystem: { partitions: [] },
              partitioningMode: undefined,
            },
          },
        );

        expect(screen.getByText('Partitions')).toBeInTheDocument();
        expect(screen.getByText('/boot')).toBeInTheDocument();
        expect(screen.getByText('ext4')).toBeInTheDocument();
      });

      test('shows volume group and logical volumes', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            output: {
              ...initialState.output,
              imageTypes: ['guest-image'],
            },
            filesystem: {
              mode: 'advanced',
              disk: {
                minsize: '',
                unit: 'GiB',
                type: 'gpt',
                partitions: advancedPartitions.withLvm,
              },
              fileSystem: { partitions: [] },
              partitioningMode: undefined,
            },
          },
        );

        expect(screen.getByText('Volume group manager')).toBeInTheDocument();
        expect(screen.getByText('vg0')).toBeInTheDocument();
        expect(screen.getByText('Logical volumes')).toBeInTheDocument();
        expect(screen.getByText('root')).toBeInTheDocument();
        expect(screen.getByText('home')).toBeInTheDocument();
      });
    });

    describe('Min size edge cases', () => {
      test('shows "Less than 1GiB" when minSize < 1', () => {
        renderWithRedux(
          <AdvancedSettingsOverview
            restrictions={createDefaultRestrictions()}
          />,
          {
            output: {
              ...initialState.output,
              imageTypes: ['guest-image'],
            },
            filesystem: {
              mode: 'basic',
              disk: {
                minsize: '',
                unit: 'GiB',
                partitions: [],
                type: undefined,
              },
              fileSystem: {
                partitions: basicPartitions.smallPartition,
              },
              partitioningMode: undefined,
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            timezone: {
              timezone: 'America/New_York',
              ntpservers: [],
            },
          },
        },
      );

      expect(screen.getAllByText('Timezone')).toHaveLength(2);
      expect(screen.getByText('America/New_York')).toBeInTheDocument();
    });

    test('displays empty timezone when not set', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            timezone: {
              timezone: '',
              ntpservers: [],
            },
          },
        },
      );

      expect(screen.getAllByText('Timezone')).toHaveLength(2);
    });

    test('displays NTP servers when configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            timezone: {
              timezone: 'UTC',
              ntpservers: ['0.pool.ntp.org', '1.pool.ntp.org'],
            },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            timezone: {
              timezone: 'Europe/London',
              ntpservers: [],
            },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            locale: {
              languages: ['en_US.UTF-8'],
              keyboard: 'us',
            },
          },
        },
      );

      expect(screen.getByText('Language')).toBeInTheDocument();
      expect(screen.getByText('en_US.UTF-8')).toBeInTheDocument();
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
      expect(screen.getByText('us')).toBeInTheDocument();
    });

    test('displays singular Language heading for one language', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            locale: {
              languages: ['en_US.UTF-8'],
              keyboard: '',
            },
          },
        },
      );

      expect(screen.getByText('Language')).toBeInTheDocument();
      expect(screen.queryByText('Languages')).not.toBeInTheDocument();
    });

    test('displays multiple languages', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            locale: {
              languages: ['en_US.UTF-8', 'es_ES.UTF-8', 'fr_FR.UTF-8'],
              keyboard: 'us',
            },
          },
        },
      );

      expect(screen.getByText('Languages')).toBeInTheDocument();
      expect(screen.getByText('en_US.UTF-8')).toBeInTheDocument();
      expect(screen.getByText('es_ES.UTF-8')).toBeInTheDocument();
      expect(screen.getByText('fr_FR.UTF-8')).toBeInTheDocument();
    });

    test('displays only keyboard when languages are empty', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            locale: {
              languages: [],
              keyboard: 'us',
            },
          },
        },
      );

      expect(screen.queryByText('Language')).not.toBeInTheDocument();
      expect(screen.queryByText('Languages')).not.toBeInTheDocument();
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
      expect(screen.getByText('us')).toBeInTheDocument();
    });

    test('displays only language when keyboard is empty', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            locale: {
              languages: ['en_US.UTF-8'],
              keyboard: '',
            },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            locale: {
              languages: [],
              keyboard: '',
            },
          },
        },
      );

      expect(screen.queryByText('Language')).not.toBeInTheDocument();
      expect(screen.queryByText('Languages')).not.toBeInTheDocument();
      expect(screen.queryByText('Keyboard')).not.toBeInTheDocument();
    });
  });

  describe('Hostname', () => {
    test('displays hostname when set', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: { ...initialState.system, hostname: 'my-server.example.com' },
        },
      );

      expect(screen.getByText('Hostname')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('my-server.example.com')).toBeInTheDocument();
    });

    test('does not display hostname section when empty', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: { ...initialState.system, hostname: '' },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            kernel: {
              name: 'kernel-rt',
              append: [],
            },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            kernel: {
              name: '',
              append: ['quiet', 'splash', 'rhgb'],
            },
          },
        },
      );

      expect(screen.getByText('Arguments')).toBeInTheDocument();
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            kernel: {
              name: 'kernel-debug',
              append: ['debug', 'console=ttyS0'],
            },
          },
        },
      );

      expect(screen.getByText('Kernel package')).toBeInTheDocument();
      expect(screen.getByText('kernel-debug')).toBeInTheDocument();
      expect(screen.getByText('Arguments')).toBeInTheDocument();
      expect(screen.getByText('debug')).toBeInTheDocument();
      expect(screen.getByText('console=ttyS0')).toBeInTheDocument();
    });

    test('hides kernel section when no kernel name or args are set', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            kernel: {
              name: '',
              append: [],
            },
          },
        },
      );

      expect(screen.queryByText('Kernel package')).not.toBeInTheDocument();
      expect(screen.queryByText('Arguments')).not.toBeInTheDocument();
    });

    test('displays user-selected kernel args with blue labels', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            kernel: {
              name: '',
              append: ['quiet', 'splash'],
            },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            kernel: {
              name: '',
              append: ['audit=1'],
            },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            kernel: {
              name: '',
              append: ['audit=1', 'quiet'],
            },
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
    test('hides services section when no services configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            services: {
              enabled: [],
              disabled: [],
              masked: [],
            },
          },
        },
      );

      expect(
        screen.queryByText('Enabled systemd services'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Disabled systemd services'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Masked systemd services'),
      ).not.toBeInTheDocument();
    });

    test('displays enabled services', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            services: {
              enabled: ['httpd', 'sshd'],
              disabled: [],
              masked: [],
            },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            services: {
              enabled: [],
              disabled: ['bluetooth', 'cups'],
              masked: [],
            },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            services: {
              enabled: [],
              disabled: [],
              masked: ['firewalld'],
            },
          },
        },
      );

      expect(screen.getByText('firewalld')).toBeInTheDocument();
    });

    test('displays user-selected services with blue labels', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            services: {
              enabled: ['httpd'],
              disabled: ['cups'],
              masked: ['firewalld'],
            },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            services: {
              enabled: ['auditd'],
              disabled: ['autofs'],
              masked: ['nfs-server'],
            },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            services: {
              enabled: ['auditd', 'httpd'],
              disabled: [],
              masked: [],
            },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: { ...initialState.system, firstBoot: { script: '' } },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            firstBoot: { script: firstBootScript },
          },
        },
      );

      expect(screen.getByText('First boot configuration')).toBeInTheDocument();
    });

    test('displays configured status when script is set', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            firstBoot: { script: firstBootScript },
          },
        },
      );

      expect(screen.getByText('Custom script')).toBeInTheDocument();
      expect(
        screen.getByText(/Hello there, General Kenobi/),
      ).toBeInTheDocument();
    });
  });

  describe('Users', () => {
    test('does not render users section when no users configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: { ...initialState.system, users: [] },
        },
      );

      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });

    test('does not render users section when only empty users exist', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            users: [
              {
                name: '',
                password: '',
                hasPassword: false,
                ssh_key: '',
                groups: [],
                isAdministrator: false,
              },
            ],
          },
        },
      );

      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });

    test('filters out empty users and renders only non-empty ones', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            users: [
              {
                name: '',
                password: '',
                hasPassword: false,
                ssh_key: '',
                groups: [],
                isAdministrator: false,
              },
              adminUser,
            ],
          },
        },
      );

      expect(screen.getAllByText('Users').length).toBeGreaterThan(0);
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getAllByText('*****')).toHaveLength(1);
    });

    test('displays users heading when users are configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: { ...initialState.system, users: [adminUser, developerUser] },
        },
      );

      expect(screen.getAllByText('Users').length).toBeGreaterThan(0);
    });

    test('does not display user columns when no users configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: { ...initialState.system, users: [] },
        },
      );

      expect(screen.queryByText('Username')).not.toBeInTheDocument();
      expect(screen.queryByText('Password')).not.toBeInTheDocument();
      expect(screen.queryByText('SSH Key')).not.toBeInTheDocument();
      expect(screen.queryByText('Groups')).not.toBeInTheDocument();
      expect(screen.queryByText('Administrator')).not.toBeInTheDocument();
    });

    test('displays all column headings when users are configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: { ...initialState.system, users: [adminUser] },
        },
      );

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('SSH Key')).toBeInTheDocument();
      expect(screen.getByText('Groups')).toBeInTheDocument();
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    test('displays usernames', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: { ...initialState.system, users: [adminUser, developerUser] },
        },
      );

      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('developer')).toBeInTheDocument();
    });

    test('displays masked passwords', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: { ...initialState.system, users: [adminUser, developerUser] },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: { ...initialState.system, users: [adminUser, developerUser] },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            users: [{ ...adminUser, ssh_key: 'ssh-rsa AAAA' }],
          },
        },
      );

      expect(screen.getByText('SSH Key')).toBeInTheDocument();
      expect(screen.getByText('ssh-rsa AAAA')).toBeInTheDocument();
    });

    test('displays groups', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            users: [{ ...adminUser, groups: ['wheel', 'docker'] }],
          },
        },
      );

      expect(screen.getByText('Groups')).toBeInTheDocument();
      expect(screen.getByText('wheel, docker')).toBeInTheDocument();
    });

    test('displays multiple users with all their data', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            users: [
              { ...adminUser, ssh_key: 'ssh-rsa adminkey', groups: ['wheel'] },
              {
                ...developerUser,
                ssh_key: 'ssh-rsa devkey',
                groups: ['docker'],
              },
              guestUser,
            ],
          },
        },
      );

      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('developer')).toBeInTheDocument();
      expect(screen.getByText('guest')).toBeInTheDocument();
      expect(screen.getAllByText('*****')).toHaveLength(3);
    });

    test('renders users section when users are not required', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            users: [adminUser],
            groups: userGroups,
          },
        },
      );

      expect(screen.getAllByText('Users').length).toBeGreaterThan(0);
      expect(screen.getByText('User groups')).toBeInTheDocument();
    });

    test('does not render users section when users are standalone', () => {
      renderWithRedux(
        <AdvancedSettingsOverview
          restrictions={createDefaultRestrictions({
            users: { isStandalone: true },
          })}
        />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            users: [adminUser],
            groups: userGroups,
          },
        },
      );

      expect(screen.queryByText('Users')).not.toBeInTheDocument();
      expect(screen.queryByText('User groups')).not.toBeInTheDocument();
    });
  });

  describe('Firewall', () => {
    test('does not render firewall when no configuration', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            firewall: {
              ports: [],
              services: {
                enabled: [],
                disabled: [],
              },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            firewall: {
              ports: ['22/tcp', '443/tcp'],
              services: {
                enabled: [],
                disabled: [],
              },
            },
          },
        },
      );

      expect(screen.getByText('Firewall')).toBeInTheDocument();
      expect(screen.getByText('Firewall designations')).toBeInTheDocument();
    });

    test('displays firewall section when services are configured', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            firewall: {
              ports: [],
              services: {
                enabled: ['httpd'],
                disabled: [],
              },
            },
          },
        },
      );

      expect(screen.getByText('Firewall designations')).toBeInTheDocument();
    });

    test('displays ports column', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            firewall: {
              ports: ['22/tcp', '443/tcp', '8080/tcp'],
              services: {
                enabled: [],
                disabled: [],
              },
            },
          },
        },
      );

      expect(screen.getByText('Port')).toBeInTheDocument();
      expect(screen.getByText('22/tcp')).toBeInTheDocument();
      expect(screen.getByText('443/tcp')).toBeInTheDocument();
      expect(screen.getByText('8080/tcp')).toBeInTheDocument();
    });

    test('displays enabled services column', () => {
      renderWithRedux(
        <AdvancedSettingsOverview restrictions={createDefaultRestrictions()} />,
        {
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            firewall: {
              ports: [],
              services: {
                enabled: ['httpd', 'sshd'],
                disabled: [],
              },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            firewall: {
              ports: [],
              services: {
                enabled: [],
                disabled: ['cups', 'bluetooth'],
              },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            firewall: {
              ports: ['22/tcp', '443/tcp', '8080/tcp'],
              services: {
                enabled: ['httpd'],
                disabled: [],
              },
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            firewall: {
              ports: ['22/tcp'],
              services: {
                enabled: ['httpd', 'sshd'],
                disabled: ['cups'],
              },
            },
          },
        },
      );

      expect(screen.getByText('Port')).toBeInTheDocument();
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
          output: {
            ...initialState.output,
            imageTypes: ['guest-image'],
          },
          system: {
            ...initialState.system,
            firewall: {
              ports: [],
              services: {
                enabled: [],
                disabled: [],
              },
            },
          },
        },
      );

      expect(screen.queryByText('Firewall')).not.toBeInTheDocument();
      expect(screen.queryByText('Port')).not.toBeInTheDocument();
      expect(screen.queryByText('Enabled services')).not.toBeInTheDocument();
      expect(screen.queryByText('Disabled services')).not.toBeInTheDocument();
    });
  });
});
