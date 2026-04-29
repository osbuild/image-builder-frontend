import React from 'react';

import { screen } from '@testing-library/react';

import { renderWithRedux } from '@/test/testUtils';

import { createDefaultRestrictions } from '../../tests/helpers';
import Security from '../index';

describe('Security', () => {
  test('does not render the security card when nothing is configured', () => {
    const mockSecuritySummary = {
      title: undefined,
      fipsRequired: false,
      packages: [],
      services: { enabled: [], disabled: [], masked: [], total: 0 },
      kernel: { append: [] },
    };

    renderWithRedux(
      <Security
        restrictions={createDefaultRestrictions()}
        security={mockSecuritySummary}
      />,
      {
        imageTypes: ['guest-image'],
      },
    );

    expect(
      screen.queryByText('Compliance configuration'),
    ).not.toBeInTheDocument();
  });

  describe('FIPS', () => {
    test('displays FIPS enabled status', () => {
      renderWithRedux(<Security restrictions={createDefaultRestrictions()} />, {
        imageTypes: ['guest-image'],
        fips: {
          enabled: true,
        },
      });

      expect(screen.getByText('FIPS mode')).toBeInTheDocument();
      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    test('does not render FIPS when disabled', () => {
      renderWithRedux(<Security restrictions={createDefaultRestrictions()} />, {
        imageTypes: ['guest-image'],
        fips: {
          enabled: false,
        },
      });

      expect(screen.queryByText('FIPS mode')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Compliance configuration'),
      ).not.toBeInTheDocument();
    });
  });

  describe('OpenSCAP', () => {
    test('displays OpenSCAP profile when compliance type is openscap', () => {
      const mockSummaryWithCIS = {
        title: 'CIS Red Hat Enterprise Linux 9 Benchmark',
        fipsRequired: false,
        packages: [],
        services: { enabled: [], disabled: [], masked: [], total: 0 },
        kernel: { append: [] },
      };

      renderWithRedux(
        <Security
          restrictions={createDefaultRestrictions()}
          security={mockSummaryWithCIS}
        />,
        {
          imageTypes: ['guest-image'],
          compliance: {
            complianceType: 'openscap',
            profileID: 'xccdf_org.ssgproject.content_profile_cis',
            policyID: undefined,
            policyTitle: undefined,
          },
        },
      );

      expect(screen.getByText('OpenSCAP profile')).toBeInTheDocument();
      expect(
        screen.getByText('CIS Red Hat Enterprise Linux 9 Benchmark'),
      ).toBeInTheDocument();
    });

    test('displays Compliance policy when compliance type is compliance', () => {
      const mockComplianceSummary = {
        title: 'My Compliance Policy',
        fipsRequired: false,
        packages: [],
        services: { enabled: [], disabled: [], masked: [], total: 0 },
        kernel: { append: [] },
      };

      renderWithRedux(
        <Security
          restrictions={createDefaultRestrictions()}
          security={mockComplianceSummary}
        />,
        {
          imageTypes: ['guest-image'],
          compliance: {
            complianceType: 'compliance',
            profileID: undefined,
            policyID: 'policy-123',
            policyTitle: 'My Compliance Policy',
          },
        },
      );

      expect(screen.getByText('Compliance policy')).toBeInTheDocument();
      expect(screen.getByText('My Compliance Policy')).toBeInTheDocument();
    });

    test('does not display added items when no packages or services', () => {
      renderWithRedux(<Security restrictions={createDefaultRestrictions()} />, {
        imageTypes: ['guest-image'],
        compliance: {
          complianceType: 'openscap',
          profileID: 'test-profile',
          policyID: undefined,
          policyTitle: undefined,
        },
      });

      // Without API data returning packages/services, "Added items" shouldn't show
      expect(screen.queryByText('Added items')).not.toBeInTheDocument();
    });
  });
});
