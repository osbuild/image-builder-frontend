import { describe, expect, it } from 'vitest';

import { createMockState } from '../../tests/mockWizardState';
import { mapRegistrationCustomizations, mapSatelliteFiles } from '../mappers';
import { initialState } from '../state';
import type { RegistrationSlice } from '../types';

const createState = (overrides: Partial<RegistrationSlice> = {}) =>
  createMockState({
    registration: { ...initialState, ...overrides },
  });

describe('mapRegistrationCustomizations', () => {
  describe('subscription', () => {
    it('returns subscription for register-now-rhc', () => {
      const state = createState({
        type: 'register-now-rhc',
        activationKey: 'my-key',
        orgId: '123',
        serverUrl: 'https://server.example.com',
        baseUrl: 'https://base.example.com',
      });
      const result = mapRegistrationCustomizations(state);
      expect(result.subscription).toEqual(
        expect.objectContaining({
          'activation-key': 'my-key',
          organization: 123,
          insights: true,
          rhc: true,
        }),
      );
    });

    it('returns subscription for register-now-insights', () => {
      const state = createState({
        type: 'register-now-insights',
        activationKey: 'my-key',
        orgId: '456',
      });
      const result = mapRegistrationCustomizations(state);
      expect(result.subscription).toEqual(
        expect.objectContaining({
          insights: true,
          rhc: false,
        }),
      );
    });

    it('returns subscription for register-now', () => {
      const state = createState({
        type: 'register-now',
        activationKey: 'my-key',
        orgId: '789',
      });
      const result = mapRegistrationCustomizations(state);
      expect(result.subscription).toEqual(
        expect.objectContaining({
          insights: false,
          rhc: false,
        }),
      );
    });

    it('omits subscription for register-later', () => {
      const state = createState({ type: 'register-later' });
      expect(mapRegistrationCustomizations(state)).not.toHaveProperty(
        'subscription',
      );
    });

    it('omits subscription for register-satellite', () => {
      const state = createState({ type: 'register-satellite' });
      expect(mapRegistrationCustomizations(state)).not.toHaveProperty(
        'subscription',
      );
    });

    it('omits subscription when orgId is missing', () => {
      const state = createState({
        type: 'register-now-rhc',
        activationKey: 'my-key',
        orgId: undefined,
      });
      expect(mapRegistrationCustomizations(state)).not.toHaveProperty(
        'subscription',
      );
    });

    it('omits subscription when orgId is not numeric', () => {
      const state = createState({
        type: 'register-now-rhc',
        activationKey: 'my-key',
        orgId: 'not-a-number',
      });
      expect(mapRegistrationCustomizations(state)).not.toHaveProperty(
        'subscription',
      );
    });

    it('throws when activation key is undefined for register-now type', () => {
      const state = createState({
        type: 'register-now-rhc',
        activationKey: undefined,
        orgId: '123',
      });
      expect(() => mapRegistrationCustomizations(state)).toThrow(
        'Activation key unexpectedly undefined',
      );
    });
  });

  describe('aap_registration', () => {
    it('returns aap_registration when enabled with callback url', () => {
      const state = createState({
        type: 'register-later',
        aap: {
          enabled: true,
          callbackUrl: 'https://aap.example.com/callback',
          hostConfigKey: 'config-key',
          tlsCertificateAuthority: undefined,
          skipTlsVerification: undefined,
        },
      });
      const result = mapRegistrationCustomizations(state);
      expect(result.aap_registration).toEqual({
        ansible_callback_url: 'https://aap.example.com/callback',
        host_config_key: 'config-key',
        tls_certificate_authority: undefined,
        skip_tls_verification: undefined,
      });
    });

    it('omits aap_registration when disabled', () => {
      const state = createState({
        type: 'register-later',
        aap: { ...initialState.aap, enabled: false },
      });
      expect(mapRegistrationCustomizations(state)).not.toHaveProperty(
        'aap_registration',
      );
    });

    it('omits aap_registration when enabled but no fields set', () => {
      const state = createState({
        type: 'register-later',
        aap: {
          enabled: true,
          callbackUrl: undefined,
          hostConfigKey: undefined,
          tlsCertificateAuthority: undefined,
          skipTlsVerification: undefined,
        },
      });
      expect(mapRegistrationCustomizations(state)).not.toHaveProperty(
        'aap_registration',
      );
    });
  });

  describe('cacerts', () => {
    it('returns cacerts for satellite registration with cert', () => {
      const state = createState({
        type: 'register-satellite',
        satelliteRegistration: {
          command: 'sat-cmd',
          caCert: 'PEM-CERT-DATA',
        },
      });
      const result = mapRegistrationCustomizations(state);
      expect(result.cacerts).toEqual({
        pem_certs: ['PEM-CERT-DATA'],
      });
    });

    it('omits cacerts when not satellite registration', () => {
      const state = createState({
        type: 'register-later',
        satelliteRegistration: {
          command: undefined,
          caCert: 'PEM-CERT-DATA',
        },
      });
      expect(mapRegistrationCustomizations(state)).not.toHaveProperty(
        'cacerts',
      );
    });

    it('omits cacerts when satellite registration has no cert', () => {
      const state = createState({
        type: 'register-satellite',
        satelliteRegistration: {
          command: 'sat-cmd',
          caCert: undefined,
        },
      });
      expect(mapRegistrationCustomizations(state)).not.toHaveProperty(
        'cacerts',
      );
    });
  });
});

describe('mapSatelliteFiles', () => {
  it('returns files for satellite registration with command', () => {
    const state = createState({
      type: 'register-satellite',
      satelliteRegistration: {
        command: 'satellite-register --org=123',
        caCert: undefined,
      },
    });
    const result = mapSatelliteFiles(state);
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ data_encoding: 'base64' }),
      ]),
    );
  });

  it('returns empty array when not satellite registration', () => {
    const state = createState({
      type: 'register-now-rhc',
      satelliteRegistration: {
        command: 'satellite-register --org=123',
        caCert: undefined,
      },
    });
    expect(mapSatelliteFiles(state)).toEqual([]);
  });

  it('returns empty array when no command set', () => {
    const state = createState({
      type: 'register-satellite',
      satelliteRegistration: {
        command: undefined,
        caCert: undefined,
      },
    });
    expect(mapSatelliteFiles(state)).toEqual([]);
  });
});
