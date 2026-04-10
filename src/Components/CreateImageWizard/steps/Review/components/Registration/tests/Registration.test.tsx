import React from 'react';

import { screen } from '@testing-library/react';

import { renderWithRedux } from '@/test/testUtils';

import { createDefaultRestrictions } from '../../tests/helpers';
import Registration from '../index';

describe('Registration', () => {
  test('renders the registration card', () => {
    renderWithRedux(
      <Registration restrictions={createDefaultRestrictions()} />,
      {
        imageTypes: ['guest-image'],
      },
    );

    expect(screen.getByText('Registration')).toBeInTheDocument();
  });

  describe('Register later', () => {
    test('displays register later message', () => {
      renderWithRedux(
        <Registration restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          registration: {
            registrationType: 'register-later',
            activationKey: undefined,
            orgId: undefined,
            satelliteRegistration: {
              command: undefined,
              caCert: undefined,
            },
          },
        },
      );

      expect(screen.getByText('Registration method')).toBeInTheDocument();
      expect(screen.getByText('Register the system later')).toBeInTheDocument();
    });
  });

  describe('Register now', () => {
    test('displays RHSM registration for register-now', () => {
      renderWithRedux(
        <Registration restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          registration: {
            registrationType: 'register-now',
            activationKey: 'my-key',
            orgId: '12345',
            satelliteRegistration: {
              command: undefined,
              caCert: undefined,
            },
          },
        },
      );

      expect(
        screen.getByText('Register with Red Hat Subscription Manager (RHSM)'),
      ).toBeInTheDocument();
      expect(screen.getByText('Organisation ID')).toBeInTheDocument();
      expect(screen.getByText('12345')).toBeInTheDocument();
      expect(screen.getByText('Activation key')).toBeInTheDocument();
      expect(screen.getByText('my-key')).toBeInTheDocument();
    });

    test('displays insights registration for register-now-insights', () => {
      renderWithRedux(
        <Registration restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          registration: {
            registrationType: 'register-now-insights',
            activationKey: 'insights-key',
            orgId: '67890',
            satelliteRegistration: {
              command: undefined,
              caCert: undefined,
            },
          },
        },
      );

      expect(
        screen.getByText(
          'Enable predictive analytics and management capabilities',
        ),
      ).toBeInTheDocument();
    });

    test('displays rhc registration for register-now-rhc', () => {
      renderWithRedux(
        <Registration restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          registration: {
            registrationType: 'register-now-rhc',
            activationKey: 'rhc-key',
            orgId: '11111',
            satelliteRegistration: {
              command: undefined,
              caCert: undefined,
            },
          },
        },
      );

      expect(
        screen.getByText(
          'Enable predictive analytics and management capabilities',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Enable remote remediations and system management with automation',
        ),
      ).toBeInTheDocument();
    });
  });

  test('returns null when registration is hidden', () => {
    const { container } = renderWithRedux(
      <Registration
        restrictions={createDefaultRestrictions({
          registration: { shouldHide: true },
        })}
      />,
      {
        imageTypes: ['guest-image'],
      },
    );

    expect(container).toBeEmptyDOMElement();
  });

  describe('Register satellite', () => {
    test('displays satellite registration', () => {
      renderWithRedux(
        <Registration restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          registration: {
            registrationType: 'register-satellite',
            activationKey: undefined,
            orgId: undefined,
            satelliteRegistration: {
              command: 'satellite-command',
              caCert: 'ca-cert-content',
            },
          },
        },
      );

      expect(screen.getByText('Registration method')).toBeInTheDocument();
    });
  });
});
