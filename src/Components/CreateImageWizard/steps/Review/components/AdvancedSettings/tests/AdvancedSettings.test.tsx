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
});
