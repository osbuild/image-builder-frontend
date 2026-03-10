import { describe, expect, it } from 'vitest';

import { toComposerComposeRequest } from '@/store/api/backend';

import {
  createAmiImageRequest,
  createAmiImageRequestAarch64,
  createAzureImageRequest,
  createBlueprintWithBasicCustomizations,
  createBlueprintWithFullSubscription,
  createBlueprintWithMixedCustomizations,
  createBlueprintWithOpenScap,
  createBlueprintWithOpenScapAndPackages,
  createBlueprintWithPackages,
  createBlueprintWithSubscription,
  createBlueprintWithUsers,
  createBlueprintWithUsersAndPackages,
  createGuestImageRequest,
  createLocalImageRequest,
  createMinimalBlueprint,
  createSecureServerBlueprint,
  testDistributions,
} from './mocks/fixtures';

describe('toComposerComposeRequest', () => {
  describe('basic conversion', () => {
    it('should convert a minimal blueprint without customizations', () => {
      const blueprint = createMinimalBlueprint();
      const imageRequests = [createGuestImageRequest()];

      const result = toComposerComposeRequest(
        blueprint,
        'rhel-9',
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
      const blueprint = createBlueprintWithBasicCustomizations();

      const result = toComposerComposeRequest(blueprint, 'rhel-9', []);

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
      const blueprint = createBlueprintWithSubscription();

      const result = toComposerComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations?.subscription).toEqual({
        organization: '12345', // converted to string
        activation_key: 'my-activation-key', // underscore instead of hyphen
        server_url: 'https://subscription.rhsm.redhat.com',
        base_url: 'https://cdn.redhat.com',
        insights: true,
        rhc: false,
      });
    });

    it('should handle subscription with optional fields', () => {
      const blueprint = createBlueprintWithFullSubscription();

      const result = toComposerComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations?.subscription).toEqual({
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
      const blueprint = createBlueprintWithMixedCustomizations();

      const result = toComposerComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations).toHaveProperty('packages');
      expect(result.customizations).toHaveProperty('hostname');
      expect(result.customizations).toHaveProperty('subscription');
      expect(result.customizations?.packages).toEqual(['nginx']);
      expect(result.customizations?.hostname).toBe('webserver');
      expect(result.customizations?.subscription?.organization).toBe('11111');
    });
  });

  describe('user handling', () => {
    const password = process.env.TEST_PASSWORD || 'hashedpassword'; // not secret

    it('should convert ssh_key to key for cloud API', () => {
      const blueprint = createBlueprintWithUsers(password);

      const result = toComposerComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations?.users).toHaveLength(2);
      expect(result.customizations?.users?.[0]).toEqual({
        name: 'testuser',
        groups: ['wheel', 'docker'],
        key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...',
        password: password,
      });
      expect(result.customizations?.users?.[1]).toEqual({
        name: 'anotheruser',
        groups: ['users'],
      });
    });

    it('should handle users alongside other customizations', () => {
      const blueprint = createBlueprintWithUsersAndPackages();

      const result = toComposerComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations?.packages).toEqual(['htop']);
      expect(result.customizations?.hostname).toBe('server.example.com');
      expect(result.customizations?.users?.[0].key).toBe('ssh-rsa KEY123');
      expect(result.customizations?.users?.[0]).not.toHaveProperty('ssh_key');
    });
  });

  describe('openscap handling', () => {
    it('should transform openscap profile to only include profile_id', () => {
      const blueprint = createBlueprintWithOpenScap();

      const result = toComposerComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations?.openscap).toEqual({
        profile_id: 'xccdf_org.ssgproject.content_profile_cis',
      });
    });

    it('should handle openscap alongside other customizations', () => {
      const blueprint = createBlueprintWithOpenScapAndPackages();

      const result = toComposerComposeRequest(blueprint, 'rhel-9', []);

      expect(result.customizations?.packages).toEqual(['aide']);
      expect(result.customizations?.openscap).toEqual({
        profile_id: 'xccdf_org.ssgproject.content_profile_pci-dss',
      });
    });
  });

  describe('image_requests handling', () => {
    it('should transform a single image request', () => {
      const blueprint = createMinimalBlueprint();
      const imageRequests = [createAmiImageRequest()];

      const result = toComposerComposeRequest(
        blueprint,
        'rhel-9',
        imageRequests,
      );

      expect(result.image_requests).toHaveLength(1);
      expect(result.image_requests![0]).toEqual({
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
      const blueprint = createMinimalBlueprint();
      const imageRequests = [
        createGuestImageRequest(),
        createAmiImageRequestAarch64(),
      ];

      const result = toComposerComposeRequest(
        blueprint,
        'rhel-9',
        imageRequests,
      );

      expect(result.image_requests).toHaveLength(2);
      expect(result.image_requests![0].architecture).toBe('x86_64');
      expect(result.image_requests![1].architecture).toBe('aarch64');
      expect(result.image_requests![0].image_type).toBe('guest-image');
      expect(result.image_requests![1].image_type).toBe('ami');
    });

    it('should handle different upload request types', () => {
      const blueprint = createMinimalBlueprint();
      const imageRequests = [createAzureImageRequest()];

      const result = toComposerComposeRequest(
        blueprint,
        'rhel-9',
        imageRequests,
      );

      expect(result.image_requests![0].upload_targets![0]).toEqual({
        type: 'azure',
        upload_options: {
          tenant_id: 'tenant-123',
          subscription_id: 'sub-456',
          resource_group: 'my-rg',
        },
      });
    });

    it('should always set repositories to empty array', () => {
      const blueprint = createMinimalBlueprint();
      const imageRequests = [createLocalImageRequest()];

      const result = toComposerComposeRequest(
        blueprint,
        'rhel-9',
        imageRequests,
      );

      expect(result.image_requests![0].repositories).toEqual([]);
    });
  });

  describe('distribution handling', () => {
    it('should pass through the distribution parameter', () => {
      const blueprint = createMinimalBlueprint();

      const result = toComposerComposeRequest(blueprint, 'centos-9', []);
      expect(result.distribution).toBe('centos-9');
    });

    it('should handle different distribution versions', () => {
      const blueprint = createMinimalBlueprint();

      testDistributions.forEach((dist) => {
        const result = toComposerComposeRequest(blueprint, dist, []);
        expect(result.distribution).toBe(dist);
      });
    });
  });

  describe('complex scenarios', () => {
    it('should handle blueprint with subscription, openscap, and other customizations', () => {
      const blueprint = createSecureServerBlueprint();
      const imageRequests = [createAmiImageRequest('111222333444')];

      const result = toComposerComposeRequest(
        blueprint,
        'rhel-9',
        imageRequests,
      );

      // Verify all customizations are present and correctly transformed
      expect(result.customizations?.packages).toEqual([
        'firewalld',
        'aide',
        'audit',
      ]);
      expect(result.customizations?.hostname).toBe('secure.example.com');
      expect(result.customizations?.users).toHaveLength(1);
      expect(result.customizations?.users?.[0]).toEqual({
        name: 'secadmin',
        groups: ['wheel'],
        key: 'ssh-rsa AAAAB3...', // ssh_key converted to key
      });
      expect(result.customizations?.subscription).toEqual({
        organization: '54321',
        activation_key: 'secure-key',
        server_url: 'https://subscription.rhsm.redhat.com',
        base_url: 'https://cdn.redhat.com',
        insights: true,
        rhc: true,
      });
      expect(result.customizations?.openscap).toEqual({
        profile_id: 'xccdf_org.ssgproject.content_profile_stig',
      });
      expect(result.image_requests).toHaveLength(1);
      expect(result.distribution).toBe('rhel-9');
    });

    it('should handle empty image_requests array', () => {
      const blueprint = createBlueprintWithPackages();

      const result = toComposerComposeRequest(blueprint, 'rhel-9', []);

      expect(result.image_requests).toEqual([]);
    });
  });
});
