import { describe, expect, it } from 'vitest';

import {
  BlueprintExportResponse,
  BlueprintResponse,
  Distributions,
  ImageRequest,
} from '@/store/api/backend';

import { parseCloudProvidersFromRequest } from '../parsers';

const baseImageRequest: ImageRequest = {
  architecture: 'x86_64',
  image_type: 'guest-image',
  upload_request: { type: 'aws.s3', options: {} },
};

const createMinimalBlueprint = (
  overrides: Partial<BlueprintResponse> = {},
): BlueprintResponse => ({
  id: 'blueprint-123',
  name: 'test-blueprint',
  description: 'A test blueprint',
  lint: { errors: [], warnings: [] },
  distribution: 'rhel-9' as Distributions,
  customizations: {},
  image_requests: [baseImageRequest],
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

const withImageRequests = (imageRequests: ImageRequest[]) =>
  createMinimalBlueprint({ image_requests: imageRequests });

describe('parseCloudProvidersFromRequest', () => {
  describe('edit mode (BlueprintResponse)', () => {
    it('returns initial-like defaults when no cloud image requests', () => {
      const result = parseCloudProvidersFromRequest(
        withImageRequests([baseImageRequest]),
      );
      expect(result.aws.accountId).toBe('');
      expect(result.azure.tenantId).toBeUndefined();
      expect(result.azure.subscriptionId).toBeUndefined();
      expect(result.azure.resourceGroup).toBeUndefined();
      expect(result.gcp.accountType).toBeUndefined();
      expect(result.gcp.email).toBe('');
    });

    it('returns defaults for empty image requests', () => {
      const result = parseCloudProvidersFromRequest(withImageRequests([]));
      expect(result.aws.accountId).toBe('');
      expect(result.gcp.email).toBe('');
    });

    describe('aws', () => {
      it('maps share_with_accounts to accountId', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'aws',
              upload_request: {
                type: 'aws',
                options: {
                  share_with_accounts: ['123456789012'],
                },
              },
            },
          ]),
        );
        expect(result.aws.accountId).toBe('123456789012');
      });

      it('takes the first account when multiple are provided', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'aws',
              upload_request: {
                type: 'aws',
                options: {
                  share_with_accounts: ['111111111111', '222222222222'],
                },
              },
            },
          ]),
        );
        expect(result.aws.accountId).toBe('111111111111');
      });

      it('defaults accountId to empty string when no share_with_accounts', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'aws',
              upload_request: { type: 'aws', options: {} },
            },
          ]),
        );
        expect(result.aws.accountId).toBe('');
      });

      it('maps share_with_sources to sourceId and source', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'aws',
              upload_request: {
                type: 'aws',
                options: {
                  share_with_sources: ['source-123'],
                },
              },
            },
          ]),
        );
        expect(result.aws.sourceId).toBe('source-123');
        expect(result.aws.source).toEqual({ id: 'source-123' });
      });

      it('sets shareMethod to manual when no share_with_sources', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'aws',
              upload_request: {
                type: 'aws',
                options: { share_with_accounts: ['123456789012'] },
              },
            },
          ]),
        );
        expect(result.aws.shareMethod).toBe('manual');
      });

      it('maps region for on-prem image requests', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'aws',
              upload_request: {
                type: 'aws',
                options: {
                  share_with_accounts: ['123456789012'],
                  region: 'eu-west-1',
                },
              },
            },
          ]),
        );
        expect(result.aws.region).toBe('eu-west-1');
      });

      it('sets region to undefined when not present in options', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'aws',
              upload_request: {
                type: 'aws',
                options: { share_with_accounts: ['123456789012'] },
              },
            },
          ]),
        );
        expect(result.aws.region).toBeUndefined();
      });

      it('returns defaults when no aws image request exists', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([baseImageRequest]),
        );
        expect(result.aws.accountId).toBe('');
        expect(result.aws.sourceId).toBeUndefined();
      });
    });

    describe('azure', () => {
      it('maps all azure fields when all are defined', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'azure',
              upload_request: {
                type: 'azure',
                options: {
                  tenant_id: 'tenant-abc',
                  subscription_id: 'sub-def',
                  resource_group: 'rg-test',
                  hyper_v_generation: 'V2',
                },
              },
            },
          ]),
        );
        expect(result.azure.tenantId).toBe('tenant-abc');
        expect(result.azure.subscriptionId).toBe('sub-def');
        expect(result.azure.resourceGroup).toBe('rg-test');
        expect(result.azure.hyperVGeneration).toBe('V2');
      });

      it('fills missing fields with empty string when at least one is defined', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'azure',
              upload_request: {
                type: 'azure',
                options: {
                  resource_group: 'rg-test',
                },
              },
            },
          ]),
        );
        expect(result.azure.tenantId).toBeUndefined();
        expect(result.azure.subscriptionId).toBeUndefined();
        expect(result.azure.resourceGroup).toBe('rg-test');
      });

      it('sets all to undefined when none are defined', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'azure',
              upload_request: {
                type: 'azure',
                options: { resource_group: '' },
              },
            },
          ]),
        );
        expect(result.azure.tenantId).toBeUndefined();
        expect(result.azure.subscriptionId).toBeUndefined();
        expect(result.azure.resourceGroup).toBeUndefined();
      });

      it('defaults hyper_v_generation to V1', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'azure',
              upload_request: {
                type: 'azure',
                options: { resource_group: 'rg-test' },
              },
            },
          ]),
        );
        expect(result.azure.hyperVGeneration).toBe('V1');
      });

      it('returns defaults when no azure image request exists', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([baseImageRequest]),
        );
        expect(result.azure.tenantId).toBeUndefined();
        expect(result.azure.subscriptionId).toBeUndefined();
        expect(result.azure.resourceGroup).toBeUndefined();
      });
    });

    describe('gcp', () => {
      it('parses accountType and email from share_with_accounts', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'gcp',
              upload_request: {
                type: 'gcp',
                options: {
                  share_with_accounts: ['user:alice@example.com'],
                },
              },
            },
          ]),
        );
        expect(result.gcp.accountType).toBe('user');
        expect(result.gcp.email).toBe('alice@example.com');
      });

      it('parses serviceAccount type', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'gcp',
              upload_request: {
                type: 'gcp',
                options: {
                  share_with_accounts: [
                    'serviceAccount:svc@project.iam.gserviceaccount.com',
                  ],
                },
              },
            },
          ]),
        );
        expect(result.gcp.accountType).toBe('serviceAccount');
        expect(result.gcp.email).toBe('svc@project.iam.gserviceaccount.com');
      });

      it('parses group type', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'gcp',
              upload_request: {
                type: 'gcp',
                options: {
                  share_with_accounts: ['group:admins@example.com'],
                },
              },
            },
          ]),
        );
        expect(result.gcp.accountType).toBe('group');
        expect(result.gcp.email).toBe('admins@example.com');
      });

      it('parses domain type', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'gcp',
              upload_request: {
                type: 'gcp',
                options: {
                  share_with_accounts: ['domain:example.com'],
                },
              },
            },
          ]),
        );
        expect(result.gcp.accountType).toBe('domain');
        expect(result.gcp.email).toBe('example.com');
      });

      it('returns defaults when share_with_accounts is empty', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'gcp',
              upload_request: {
                type: 'gcp',
                options: { share_with_accounts: [] },
              },
            },
          ]),
        );
        expect(result.gcp.accountType).toBeUndefined();
        expect(result.gcp.email).toBe('');
      });

      it('returns defaults when share_with_accounts is missing', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([
            {
              ...baseImageRequest,
              image_type: 'gcp',
              upload_request: { type: 'gcp', options: {} },
            },
          ]),
        );
        expect(result.gcp.accountType).toBeUndefined();
        expect(result.gcp.email).toBe('');
      });

      it('returns defaults when no gcp image request exists', () => {
        const result = parseCloudProvidersFromRequest(
          withImageRequests([baseImageRequest]),
        );
        expect(result.gcp.accountType).toBeUndefined();
        expect(result.gcp.email).toBe('');
      });
    });
  });

  describe('import mode (BlueprintExportResponse)', () => {
    it('returns all defaults when no image requests present', () => {
      const result = parseCloudProvidersFromRequest(createMinimalExport());
      expect(result.aws.accountId).toBe('');
      expect(result.azure.tenantId).toBeUndefined();
      expect(result.azure.subscriptionId).toBeUndefined();
      expect(result.azure.resourceGroup).toBeUndefined();
      expect(result.gcp.accountType).toBeUndefined();
      expect(result.gcp.email).toBe('');
    });
  });
});
