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

  describe('Hidden sections', () => {
    test('aap is hidden when registration is not restricted', () => {
      renderWithRedux(
        <Registration
          restrictions={createDefaultRestrictions({
            registration: { shouldHide: false },
            aap: { shouldHide: true },
          })}
        />,
        {
          imageTypes: ['guest-image'],
        },
      );

      expect(screen.getByText('Registration')).toBeInTheDocument();
    });

    test('registration is hidden when aap is not restricted', () => {
      renderWithRedux(
        <Registration
          restrictions={createDefaultRestrictions({
            registration: { shouldHide: true },
            aap: { shouldHide: false },
          })}
        />,
        {
          imageTypes: ['guest-image'],
          aapRegistration: {
            enabled: true,
            callbackUrl: 'https://aap.example.com/callback/',
            hostConfigKey: 'my-host-config-key',
            tlsCertificateAuthority: undefined,
            skipTlsVerification: undefined,
          },
        },
      );

      expect(
        screen.getByText('Ansible automation platform'),
      ).toBeInTheDocument();
      expect(screen.getByText('Registration')).toBeInTheDocument();
    });

    test('returns null when registration and aap are hidden', () => {
      const { container } = renderWithRedux(
        <Registration
          restrictions={createDefaultRestrictions({
            registration: { shouldHide: true },
            aap: { shouldHide: true },
          })}
        />,
        {
          imageTypes: ['guest-image'],
        },
      );

      expect(container).toBeEmptyDOMElement();
    });
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

  describe('Ansible Automation Platform', () => {
    test('does not render AAP when not configured', () => {
      renderWithRedux(
        <Registration restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          aapRegistration: {
            enabled: false,
            callbackUrl: undefined,
            hostConfigKey: undefined,
            tlsCertificateAuthority: undefined,
            skipTlsVerification: undefined,
          },
        },
      );

      expect(
        screen.queryByText('Ansible automation platform'),
      ).not.toBeInTheDocument();
    });

    test('displays AAP as enabled when configured', () => {
      renderWithRedux(
        <Registration restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          aapRegistration: {
            enabled: true,
            callbackUrl:
              'https://aap.example.com/api/v2/job_templates/42/callback/',
            hostConfigKey: 'my-host-config-key',
            tlsCertificateAuthority: undefined,
            skipTlsVerification: undefined,
          },
        },
      );

      expect(
        screen.getByText('Ansible automation platform'),
      ).toBeInTheDocument();
      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    test('displays callback URL when configured', () => {
      renderWithRedux(
        <Registration restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          aapRegistration: {
            enabled: true,
            callbackUrl:
              'https://aap.example.com/api/v2/job_templates/42/callback/',
            hostConfigKey: 'my-host-config-key',
            tlsCertificateAuthority: undefined,
            skipTlsVerification: undefined,
          },
        },
      );

      expect(screen.getByText('Ansible callback url')).toBeInTheDocument();
      expect(
        screen.getByText(
          'https://aap.example.com/api/v2/job_templates/42/callback/',
        ),
      ).toBeInTheDocument();
    });

    test('displays host config key when configured', () => {
      renderWithRedux(
        <Registration restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          aapRegistration: {
            enabled: true,
            callbackUrl: 'https://aap.example.com/callback/',
            hostConfigKey: 'my-host-config-key',
            tlsCertificateAuthority: undefined,
            skipTlsVerification: undefined,
          },
        },
      );

      expect(screen.getByText('Host config key')).toBeInTheDocument();
      expect(screen.getByText('my-host-config-key')).toBeInTheDocument();
    });

    test('displays TLS certificate as not configured when missing', () => {
      renderWithRedux(
        <Registration restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          aapRegistration: {
            enabled: true,
            callbackUrl: 'https://aap.example.com/callback/',
            hostConfigKey: 'my-host-config-key',
            tlsCertificateAuthority: undefined,
            skipTlsVerification: undefined,
          },
        },
      );

      expect(screen.getByText('TLS certificate')).toBeInTheDocument();
      expect(screen.getByText('Not configured')).toBeInTheDocument();
    });

    test('displays TLS certificate as configured when present', () => {
      const caCert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJALmwR2HBkG3NMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAlVTMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjMwMTAxMDAwMDAwWhcNMjQwMTAxMDAwMDAwWjBF
-----END CERTIFICATE-----`;

      renderWithRedux(
        <Registration restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          aapRegistration: {
            enabled: true,
            callbackUrl: 'https://aap.example.com/callback/',
            hostConfigKey: 'my-host-config-key',
            tlsCertificateAuthority: caCert,
            skipTlsVerification: undefined,
          },
        },
      );

      expect(screen.getByText('TLS certificate')).toBeInTheDocument();
      expect(screen.getByText('Configured')).toBeInTheDocument();
    });

    test('does not display any AAP content when disabled', () => {
      renderWithRedux(
        <Registration restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          aapRegistration: {
            enabled: false,
            callbackUrl: undefined,
            hostConfigKey: undefined,
            tlsCertificateAuthority: undefined,
            skipTlsVerification: undefined,
          },
        },
      );

      expect(
        screen.queryByText('Ansible automation platform'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Ansible callback url'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Host config key')).not.toBeInTheDocument();
      expect(screen.queryByText('TLS certificate')).not.toBeInTheDocument();
    });
  });
});
