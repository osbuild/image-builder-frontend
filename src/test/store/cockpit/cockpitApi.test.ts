import { describe, expect, it } from 'vitest';

import { toCloudAPIComposeRequest } from '../../../store/cockpit/cockpitApi';
import type {
  CockpitCreateBlueprintRequest,
  CockpitImageRequest,
} from '../../../store/cockpit/types';
import type { OpenScapProfile } from '../../../store/service/imageBuilderApi';

describe('toCloudAPIComposeRequest', () => {
  describe('basic conversion', () => {
    it('should convert a minimal blueprint without customizations', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {},
        image_requests: [],
      };

      const distribution = 'rhel-9';
      const imageRequests: CockpitImageRequest[] = [
        {
          architecture: 'x86_64',
          image_type: 'guest-image',
          upload_request: {
            type: 'aws.s3',
            options: {},
          },
        },
      ];

      const result = toCloudAPIComposeRequest(
        blueprint,
        distribution,
        imageRequests,
      );

      expect(result).toEqual({
        distribution: 'rhel-9',
        customizations: {},
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'guest-image',
            repositories: [],
            upload_targets: [
              {
                type: 'aws.s3',
                upload_options: {},
              },
            ],
          },
        ],
      });
    });

    it('should preserve basic customizations that are compatible', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {
          packages: ['vim', 'git', 'curl'],
          hostname: 'my-server',
          users: [
            {
              name: 'admin',
              groups: ['wheel'],
              ssh_key: 'ssh-rsa AAAAB3...',
            },
          ],
        },
        image_requests: [],
      };

      const result = toCloudAPIComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations).toEqual({
        packages: ['vim', 'git', 'curl'],
        hostname: 'my-server',
        users: [
          {
            name: 'admin',
            groups: ['wheel'],
            key: 'ssh-rsa AAAAB3...', // ssh_key converted to key
          },
        ],
      });
    });
  });

  describe('subscription handling', () => {
    it('should transform subscription from cockpit format to cloud API format', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {
          subscription: {
            organization: 12345,
            'activation-key': 'my-activation-key',
            'server-url': 'https://subscription.rhsm.redhat.com',
            'base-url': 'https://cdn.redhat.com',
            insights: true,
            rhc: false,
          },
        },
        image_requests: [],
      };

      const result = toCloudAPIComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations.subscription).toEqual({
        organization: '12345', // converted to string
        activation_key: 'my-activation-key', // underscore instead of hyphen
        server_url: 'https://subscription.rhsm.redhat.com',
        base_url: 'https://cdn.redhat.com',
        insights: true,
        rhc: false,
      });
    });

    it('should handle subscription with optional fields', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {
          subscription: {
            organization: 67890,
            'activation-key': 'key123',
            'server-url': 'https://server.example.com',
            'base-url': 'https://base.example.com',
            insights: false,
            rhc: true,
            insights_client_proxy: 'http://proxy.example.com:8080',
          },
        },
        image_requests: [],
      };

      const result = toCloudAPIComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations.subscription).toEqual({
        organization: '67890',
        activation_key: 'key123',
        server_url: 'https://server.example.com',
        base_url: 'https://base.example.com',
        insights: false,
        rhc: true,
        insights_client_proxy: 'http://proxy.example.com:8080',
      });
    });

    it('should handle subscription alongside other customizations', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {
          packages: ['nginx'],
          hostname: 'webserver',
          subscription: {
            organization: 11111,
            'activation-key': 'web-key',
            'server-url': 'https://subscription.rhsm.redhat.com',
            'base-url': 'https://cdn.redhat.com',
            insights: true,
          },
        },
        image_requests: [],
      };

      const result = toCloudAPIComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations).toHaveProperty('packages');
      expect(result.customizations).toHaveProperty('hostname');
      expect(result.customizations).toHaveProperty('subscription');
      expect(result.customizations.packages).toEqual(['nginx']);
      expect(result.customizations.hostname).toBe('webserver');
      expect(result.customizations.subscription?.organization).toBe('11111');
    });
  });

  describe('user handling', () => {
    const password = process.env.TEST_PASSWORD || 'hashedpassword'; // not secret

    it('should convert ssh_key to key for cloud API', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {
          users: [
            {
              name: 'testuser',
              groups: ['wheel', 'docker'],
              ssh_key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...',
              password: password,
            },
            {
              name: 'anotheruser',
              groups: ['users'],
              // user without ssh_key
            },
          ],
        },
        image_requests: [],
      };

      const result = toCloudAPIComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations.users).toHaveLength(2);
      expect(result.customizations.users?.[0]).toEqual({
        name: 'testuser',
        groups: ['wheel', 'docker'],
        key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...',
        password: password,
      });
      expect(result.customizations.users?.[1]).toEqual({
        name: 'anotheruser',
        groups: ['users'],
      });
    });

    it('should handle users alongside other customizations', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {
          packages: ['htop'],
          hostname: 'server.example.com',
          users: [
            {
              name: 'admin',
              ssh_key: 'ssh-rsa KEY123',
            },
          ],
        },
        image_requests: [],
      };

      const result = toCloudAPIComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations.packages).toEqual(['htop']);
      expect(result.customizations.hostname).toBe('server.example.com');
      expect(result.customizations.users?.[0].key).toBe('ssh-rsa KEY123');
      expect(result.customizations.users?.[0]).not.toHaveProperty('ssh_key');
    });
  });

  describe('openscap handling', () => {
    it('should transform openscap profile to only include profile_id', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {
          openscap: {
            profile_id: 'xccdf_org.ssgproject.content_profile_cis',
            profile_name: 'CIS Red Hat Enterprise Linux 9 Benchmark',
            profile_description: 'This profile defines a baseline...',
          } as OpenScapProfile,
        },
        image_requests: [],
      };

      const result = toCloudAPIComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations.openscap).toEqual({
        profile_id: 'xccdf_org.ssgproject.content_profile_cis',
      });
    });

    it('should handle openscap alongside other customizations', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {
          packages: ['aide'],
          openscap: {
            profile_id: 'xccdf_org.ssgproject.content_profile_pci-dss',
            profile_name: 'PCI-DSS',
          } as OpenScapProfile,
        },
        image_requests: [],
      };

      const result = toCloudAPIComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations.packages).toEqual(['aide']);
      expect(result.customizations.openscap).toEqual({
        profile_id: 'xccdf_org.ssgproject.content_profile_pci-dss',
      });
    });
  });

  describe('image_requests handling', () => {
    it('should transform a single image request', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {},
        image_requests: [],
      };

      const imageRequests: CockpitImageRequest[] = [
        {
          architecture: 'x86_64',
          image_type: 'ami',
          upload_request: {
            type: 'aws',
            options: {
              share_with_accounts: ['123456789012'],
            },
          },
        },
      ];

      const result = toCloudAPIComposeRequest(
        blueprint,
        'rhel-9',
        imageRequests,
      );

      expect(result.image_requests).toHaveLength(1);
      expect(result.image_requests[0]).toEqual({
        architecture: 'x86_64',
        image_type: 'ami',
        repositories: [],
        upload_targets: [
          {
            type: 'aws',
            upload_options: {
              share_with_accounts: ['123456789012'],
            },
          },
        ],
      });
    });

    it('should transform multiple image requests', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {},
        image_requests: [],
      };

      const imageRequests: CockpitImageRequest[] = [
        {
          architecture: 'x86_64',
          image_type: 'guest-image',
          upload_request: {
            type: 'aws.s3',
            options: {},
          },
        },
        {
          architecture: 'aarch64',
          image_type: 'ami',
          upload_request: {
            type: 'aws',
            options: {
              share_with_accounts: ['999888777666'],
            },
          },
        },
      ];

      const result = toCloudAPIComposeRequest(
        blueprint,
        'rhel-9',
        imageRequests,
      );

      expect(result.image_requests).toHaveLength(2);
      expect(result.image_requests[0].architecture).toBe('x86_64');
      expect(result.image_requests[1].architecture).toBe('aarch64');
      expect(result.image_requests[0].image_type).toBe('guest-image');
      expect(result.image_requests[1].image_type).toBe('ami');
    });

    it('should handle different upload request types', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {},
        image_requests: [],
      };

      const imageRequests: CockpitImageRequest[] = [
        {
          architecture: 'x86_64',
          image_type: 'vhd',
          upload_request: {
            type: 'azure',
            options: {
              tenant_id: 'tenant-123',
              subscription_id: 'sub-456',
              resource_group: 'my-rg',
            },
          },
        },
      ];

      const result = toCloudAPIComposeRequest(
        blueprint,
        'rhel-9',
        imageRequests,
      );

      expect(result.image_requests[0].upload_targets[0]).toEqual({
        type: 'azure',
        upload_options: {
          tenant_id: 'tenant-123',
          subscription_id: 'sub-456',
          resource_group: 'my-rg',
        },
      });
    });

    it('should always set repositories to empty array', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {},
        image_requests: [],
      };

      const imageRequests: CockpitImageRequest[] = [
        {
          architecture: 'x86_64',
          image_type: 'guest-image',
          upload_request: {
            type: 'local',
            options: {},
          },
        },
      ];

      const result = toCloudAPIComposeRequest(
        blueprint,
        'rhel-9',
        imageRequests,
      );

      expect(result.image_requests[0].repositories).toEqual([]);
    });
  });

  describe('distribution handling', () => {
    it('should pass through the distribution parameter', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {},
        image_requests: [],
      };

      const result = toCloudAPIComposeRequest(blueprint, 'centos-9', []);
      expect(result.distribution).toBe('centos-9');
    });

    it('should handle different distribution versions', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {},
        image_requests: [],
      };

      const distributions = [
        'rhel-8',
        'rhel-9',
        'rhel-10',
        'centos-9',
        'fedora-40',
      ];

      distributions.forEach((dist) => {
        const result = toCloudAPIComposeRequest(blueprint, dist, []);
        expect(result.distribution).toBe(dist);
      });
    });
  });

  describe('complex scenarios', () => {
    it('should handle blueprint with subscription, openscap, and other customizations', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'secure-server',
        description: 'Secure server blueprint',
        distribution: 'rhel-9',
        customizations: {
          packages: ['firewalld', 'aide', 'audit'],
          hostname: 'secure.example.com',
          users: [
            {
              name: 'secadmin',
              groups: ['wheel'],
              ssh_key: 'ssh-rsa AAAAB3...',
            },
          ],
          subscription: {
            organization: 54321,
            'activation-key': 'secure-key',
            'server-url': 'https://subscription.rhsm.redhat.com',
            'base-url': 'https://cdn.redhat.com',
            insights: true,
            rhc: true,
          },
          openscap: {
            profile_id: 'xccdf_org.ssgproject.content_profile_stig',
            profile_name: 'DISA STIG',
            profile_description: 'Security Technical Implementation Guide',
          } as OpenScapProfile,
        },
        image_requests: [],
      };

      const imageRequests: CockpitImageRequest[] = [
        {
          architecture: 'x86_64',
          image_type: 'ami',
          upload_request: {
            type: 'aws',
            options: {
              share_with_accounts: ['111222333444'],
            },
          },
        },
      ];

      const result = toCloudAPIComposeRequest(
        blueprint,
        'rhel-9',
        imageRequests,
      );

      // Verify all customizations are present and correctly transformed
      expect(result.customizations.packages).toEqual([
        'firewalld',
        'aide',
        'audit',
      ]);
      expect(result.customizations.hostname).toBe('secure.example.com');
      expect(result.customizations.users).toHaveLength(1);
      expect(result.customizations.users?.[0]).toEqual({
        name: 'secadmin',
        groups: ['wheel'],
        key: 'ssh-rsa AAAAB3...', // ssh_key converted to key
      });
      expect(result.customizations.subscription).toEqual({
        organization: '54321',
        activation_key: 'secure-key',
        server_url: 'https://subscription.rhsm.redhat.com',
        base_url: 'https://cdn.redhat.com',
        insights: true,
        rhc: true,
      });
      expect(result.customizations.openscap).toEqual({
        profile_id: 'xccdf_org.ssgproject.content_profile_stig',
      });
      expect(result.image_requests).toHaveLength(1);
      expect(result.distribution).toBe('rhel-9');
    });

    it('should handle empty image_requests array', () => {
      const blueprint: CockpitCreateBlueprintRequest = {
        name: 'test-blueprint',
        description: 'Test description',
        distribution: 'rhel-9',
        customizations: {
          packages: ['vim'],
        },
        image_requests: [],
      };

      const result = toCloudAPIComposeRequest(blueprint, 'rhel-9', []);

      expect(result.image_requests).toEqual([]);
    });
  });
});
