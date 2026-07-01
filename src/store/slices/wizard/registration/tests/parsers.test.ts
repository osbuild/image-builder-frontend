import { describe, expect, it } from 'vitest';

import { SATELLITE_PATH } from '@/constants';
import {
  BlueprintExportResponse,
  BlueprintResponse,
  Distributions,
} from '@/store/api/backend';

import { parseRegistrationFromRequest } from '../parsers';
import { initialState } from '../state';

const createMinimalBlueprint = (
  overrides: Partial<BlueprintResponse> = {},
): BlueprintResponse => ({
  id: 'blueprint-123',
  name: 'test-blueprint',
  description: 'A test blueprint',
  lint: { errors: [], warnings: [] },
  distribution: 'rhel-9' as Distributions,
  customizations: {},
  image_requests: [
    {
      architecture: 'x86_64',
      image_type: 'guest-image',
      upload_request: { type: 'aws.s3', options: {} },
    },
  ],
  ...overrides,
});

const createMinimalExport = (
  overrides: Partial<BlueprintExportResponse> = {},
): BlueprintExportResponse => ({
  name: 'exported-blueprint',
  description: 'An exported blueprint',
  distribution: 'rhel-9' as Distributions,
  customizations: {},
  metadata: {
    parent_id: null,
    exported_at: '',
    is_on_prem: false,
  },
  ...overrides,
});

describe('parseRegistrationFromRequest', () => {
  describe('edit mode (BlueprintResponse)', () => {
    describe('registration type', () => {
      it('returns register-now-rhc when subscription has rhc enabled', () => {
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            customizations: {
              subscription: {
                organization: 123,
                'activation-key': 'key-1',
                'server-url': 'https://sub.example.com',
                'base-url': 'https://cdn.example.com',
                insights: true,
                rhc: true,
              },
            },
          }),
        );
        expect(result.type).toBe('register-now-rhc');
      });

      it('returns register-now-insights when subscription has no rhc', () => {
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            customizations: {
              subscription: {
                organization: 123,
                'activation-key': 'key-1',
                'server-url': 'https://sub.example.com',
                'base-url': 'https://cdn.example.com',
                insights: true,
              },
            },
          }),
        );
        expect(result.type).toBe('register-now-insights');
      });

      it('returns register-satellite when files contain satellite command', () => {
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            customizations: {
              files: [
                {
                  path: SATELLITE_PATH,
                  data: btoa('curl https://sat.example.com | bash'),
                },
              ],
            },
          }),
        );
        expect(result.type).toBe('register-satellite');
      });

      it('returns register-later when no subscription and no satellite', () => {
        const result = parseRegistrationFromRequest(createMinimalBlueprint());
        expect(result.type).toBe('register-later');
      });

      it('returns register-later for non-RHEL distribution with subscription', () => {
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            distribution: 'centos-9' as Distributions,
            customizations: {
              subscription: {
                organization: 123,
                'activation-key': 'key-1',
                'server-url': '',
                'base-url': '',
                insights: true,
                rhc: true,
              },
            },
          }),
        );
        expect(result.type).toBe('register-later');
      });
    });

    describe('subscription fields', () => {
      it('maps server URL and base URL', () => {
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            customizations: {
              subscription: {
                organization: 123,
                'activation-key': 'key-1',
                'server-url': 'https://sub.example.com',
                'base-url': 'https://cdn.example.com',
                insights: true,
                rhc: true,
              },
            },
          }),
        );
        expect(result.serverUrl).toBe('https://sub.example.com');
        expect(result.baseUrl).toBe('https://cdn.example.com');
      });

      it('defaults server URL and base URL to empty string when missing', () => {
        const result = parseRegistrationFromRequest(createMinimalBlueprint());
        expect(result.serverUrl).toBe('');
        expect(result.baseUrl).toBe('');
      });

      it('maps proxy', () => {
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            customizations: {
              subscription: {
                organization: 123,
                'activation-key': 'key-1',
                'server-url': '',
                'base-url': '',
                insights: true,
                insights_client_proxy: 'http://proxy.example.com:8080',
              },
            },
          }),
        );
        expect(result.proxy).toBe('http://proxy.example.com:8080');
      });

      it('leaves proxy undefined when not provided', () => {
        const result = parseRegistrationFromRequest(createMinimalBlueprint());
        expect(result.proxy).toBeUndefined();
      });
    });

    describe('activation key and org ID', () => {
      it('maps activation key and org ID for RHEL distributions', () => {
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            distribution: 'rhel-9' as Distributions,
            customizations: {
              subscription: {
                organization: 456,
                'activation-key': 'my-activation-key',
                'server-url': '',
                'base-url': '',
                insights: true,
              },
            },
          }),
        );
        expect(result.activationKey).toBe('my-activation-key');
        expect(result.orgId).toBe('456');
      });

      it('sets activation key and org ID to undefined for non-RHEL', () => {
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            distribution: 'centos-9' as Distributions,
            customizations: {
              subscription: {
                organization: 456,
                'activation-key': 'my-activation-key',
                'server-url': '',
                'base-url': '',
                insights: true,
              },
            },
          }),
        );
        expect(result.activationKey).toBeUndefined();
        expect(result.orgId).toBeUndefined();
      });
    });

    describe('satellite registration', () => {
      it('extracts satellite command from files by decoding base64', () => {
        const command = 'curl https://sat.example.com/register | bash';
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            customizations: {
              files: [{ path: SATELLITE_PATH, data: btoa(command) }],
            },
          }),
        );
        expect(result.satelliteRegistration.command).toBe(command);
      });

      it('returns initial state when no satellite file found', () => {
        const result = parseRegistrationFromRequest(createMinimalBlueprint());
        expect(result.satelliteRegistration).toEqual(
          initialState.satelliteRegistration,
        );
      });

      it('returns initial state when satellite file has no data', () => {
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            customizations: {
              files: [{ path: SATELLITE_PATH }],
            },
          }),
        );
        expect(result.satelliteRegistration).toEqual(
          initialState.satelliteRegistration,
        );
      });

      it('finds satellite file among multiple files', () => {
        const command = 'register-satellite-cmd';
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            customizations: {
              files: [
                { path: '/etc/motd', data: btoa('welcome') },
                { path: SATELLITE_PATH, data: btoa(command) },
              ],
            },
          }),
        );
        expect(result.satelliteRegistration.command).toBe(command);
      });

      // NOTE: caCert is only parsed when a satellite command is present.
      // The original requestMapper parsed them independently, but cacerts
      // is exclusively a satellite registration concern (the mapper only
      // produces it for satellite) so coupling them here is more correct.
      it('maps CA certificate from cacerts when satellite file is present', () => {
        const cert =
          '-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----';
        const command = 'curl https://sat.example.com | bash';
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            customizations: {
              files: [{ path: SATELLITE_PATH, data: btoa(command) }],
              cacerts: { pem_certs: [cert] },
            },
          }),
        );
        expect(result.satelliteRegistration.caCert).toBe(cert);
      });

      it('ignores cacerts when no satellite command is present', () => {
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            customizations: {
              cacerts: { pem_certs: ['some-cert'] },
            },
          }),
        );
        expect(result.satelliteRegistration.caCert).toBeUndefined();
      });

      it('leaves caCert undefined when cacerts not provided', () => {
        const result = parseRegistrationFromRequest(createMinimalBlueprint());
        expect(result.satelliteRegistration.caCert).toBeUndefined();
      });
    });

    describe('AAP registration', () => {
      it('sets aap enabled and maps all fields when aap_registration present', () => {
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            customizations: {
              aap_registration: {
                ansible_callback_url: 'https://aap.example.com/callback',
                host_config_key: 'config-key-123',
                tls_certificate_authority: '-----BEGIN CERT-----',
                skip_tls_verification: true,
              },
            },
          }),
        );
        expect(result.aap).toEqual({
          enabled: true,
          callbackUrl: 'https://aap.example.com/callback',
          hostConfigKey: 'config-key-123',
          tlsCertificateAuthority: '-----BEGIN CERT-----',
          skipTlsVerification: true,
        });
      });

      it('sets aap disabled when aap_registration is undefined', () => {
        const result = parseRegistrationFromRequest(createMinimalBlueprint());
        expect(result.aap.enabled).toBe(false);
      });

      it('maps optional AAP fields as undefined when not provided', () => {
        const result = parseRegistrationFromRequest(
          createMinimalBlueprint({
            customizations: {
              aap_registration: {
                ansible_callback_url: 'https://aap.example.com/callback',
                host_config_key: 'key-1',
              },
            },
          }),
        );
        expect(result.aap.tlsCertificateAuthority).toBeUndefined();
        expect(result.aap.skipTlsVerification).toBeUndefined();
      });
    });
  });

  describe('import mode (BlueprintExportResponse)', () => {
    it('defaults all fields to initial state except AAP', () => {
      const result = parseRegistrationFromRequest(createMinimalExport());
      expect(result.serverUrl).toBe(initialState.serverUrl);
      expect(result.baseUrl).toBe(initialState.baseUrl);
      expect(result.proxy).toBe(initialState.proxy);
      expect(result.type).toBe(initialState.type);
      expect(result.activationKey).toBe(initialState.activationKey);
      expect(result.orgId).toBe(initialState.orgId);
      expect(result.satelliteRegistration).toEqual(
        initialState.satelliteRegistration,
      );
    });

    it('does not parse subscription even when present', () => {
      const result = parseRegistrationFromRequest(
        createMinimalExport({
          customizations: {
            subscription: {
              organization: 123,
              'activation-key': 'key-1',
              'server-url': 'https://sub.example.com',
              'base-url': 'https://cdn.example.com',
              insights: true,
              rhc: true,
            },
          },
        }),
      );
      expect(result.type).toBe(initialState.type);
      expect(result.serverUrl).toBe(initialState.serverUrl);
      expect(result.baseUrl).toBe(initialState.baseUrl);
    });

    it('does not parse satellite even when present', () => {
      const result = parseRegistrationFromRequest(
        createMinimalExport({
          customizations: {
            files: [
              {
                path: SATELLITE_PATH,
                data: btoa('curl https://sat.example.com | bash'),
              },
            ],
          },
        }),
      );
      expect(result.type).toBe(initialState.type);
      expect(result.satelliteRegistration).toEqual(
        initialState.satelliteRegistration,
      );
    });

    it('parses AAP registration when present', () => {
      const result = parseRegistrationFromRequest(
        createMinimalExport({
          customizations: {
            aap_registration: {
              ansible_callback_url: 'https://aap.example.com/callback',
              host_config_key: 'import-key',
              tls_certificate_authority: '-----BEGIN CERT-----',
              skip_tls_verification: false,
            },
          },
        }),
      );
      expect(result.aap).toEqual({
        enabled: true,
        callbackUrl: 'https://aap.example.com/callback',
        hostConfigKey: 'import-key',
        tlsCertificateAuthority: '-----BEGIN CERT-----',
        skipTlsVerification: false,
      });
    });

    it('defaults AAP when aap_registration is undefined', () => {
      const result = parseRegistrationFromRequest(createMinimalExport());
      expect(result.aap).toEqual(initialState.aap);
    });

    it('preserves AAP optional fields as undefined when not provided', () => {
      const result = parseRegistrationFromRequest(
        createMinimalExport({
          customizations: {
            aap_registration: {
              ansible_callback_url: 'https://aap.example.com',
              host_config_key: 'key',
            },
          },
        }),
      );
      expect(result.aap.enabled).toBe(true);
      expect(result.aap.tlsCertificateAuthority).toBeUndefined();
      expect(result.aap.skipTlsVerification).toBeUndefined();
    });
  });
});
