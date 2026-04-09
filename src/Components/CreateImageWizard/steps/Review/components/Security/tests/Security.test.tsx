import React from 'react';

import { screen } from '@testing-library/react';

import { renderWithRedux } from '@/test/testUtils';

import { createDefaultRestrictions } from '../../tests/helpers';
import Security from '../index';

describe('Security', () => {
  test('renders the security card for hosted service', () => {
    renderWithRedux(<Security restrictions={createDefaultRestrictions()} />, {
      imageTypes: ['guest-image'],
    });

    expect(screen.getByText('Compliance configuration')).toBeInTheDocument();
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
    });
  });

  describe('OpenSCAP', () => {
    test('displays OpenSCAP profile when compliance type is openscap', () => {
      renderWithRedux(<Security restrictions={createDefaultRestrictions()} />, {
        imageTypes: ['guest-image'],
        compliance: {
          complianceType: 'openscap',
          profileID: 'xccdf_org.ssgproject.content_profile_cis',
          policyID: undefined,
          policyTitle: undefined,
        },
      });

      expect(screen.getByText('OpenSCAP profile')).toBeInTheDocument();
      expect(
        screen.getAllByText('xccdf_org.ssgproject.content_profile_cis').length,
      ).toBeGreaterThanOrEqual(1);
    });

    test('displays Compliance policy when compliance type is compliance', () => {
      renderWithRedux(<Security restrictions={createDefaultRestrictions()} />, {
        imageTypes: ['guest-image'],
        compliance: {
          complianceType: 'compliance',
          profileID: undefined,
          policyID: 'policy-123',
          policyTitle: 'My Compliance Policy',
        },
      });

      expect(screen.getByText('Compliance policy')).toBeInTheDocument();
      expect(screen.getByText('My Compliance Policy')).toBeInTheDocument();
    });
  });
});
