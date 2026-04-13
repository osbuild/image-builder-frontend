import React from 'react';

import { screen } from '@testing-library/react';

import {
  advancedPartitions,
  basicPartitions,
} from '@/store/slices/wizard/tests/mocks';
import { renderWithRedux } from '@/test/testUtils';

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

      expect(screen.getByText('Append')).toBeInTheDocument();
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
      expect(screen.getByText('Append')).toBeInTheDocument();
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
      expect(screen.queryByText('Append')).not.toBeInTheDocument();
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
});
