import { describe, expect, it } from 'vitest';

import wizardReducer, {
  changeAwsAccountId,
  changeAwsRegion,
  changeAwsShareMethod,
  changeAwsSourceId,
  changeAzureHyperVGeneration,
  changeAzureResourceGroup,
  changeAzureSubscriptionId,
  changeAzureTenantId,
  changeGcpAccountType,
  changeGcpEmail,
  changeGcpShareMethod,
  initialState,
  reinitializeAws,
  reinitializeAzure,
  reinitializeGcp,
  type wizardState,
} from '@/store/slices/wizard';

describe('target environment reducers', () => {
  describe('AWS', () => {
    describe('changeAwsAccountId', () => {
      it('should update AWS account ID', () => {
        const result = wizardReducer(
          initialState,
          changeAwsAccountId('123456789012'),
        );

        expect(result.aws.accountId).toBe('123456789012');
      });
    });

    describe('changeAwsShareMethod', () => {
      it('should update share method to sources', () => {
        const result = wizardReducer(
          initialState,
          changeAwsShareMethod('sources'),
        );

        expect(result.aws.shareMethod).toBe('sources');
      });

      it('should update share method to manual', () => {
        const result = wizardReducer(
          initialState,
          changeAwsShareMethod('manual'),
        );

        expect(result.aws.shareMethod).toBe('manual');
      });
    });

    describe('changeAwsSourceId', () => {
      it('should set source ID', () => {
        const result = wizardReducer(
          initialState,
          changeAwsSourceId('source-123'),
        );

        expect(result.aws.sourceId).toBe('source-123');
      });

      it('should clear source ID with undefined', () => {
        const stateWithSource: wizardState = {
          ...initialState,
          aws: {
            ...initialState.aws,
            sourceId: 'existing-source',
          },
        };

        const result = wizardReducer(
          stateWithSource,
          changeAwsSourceId(undefined),
        );

        expect(result.aws.sourceId).toBeUndefined();
      });
    });

    describe('changeAwsRegion', () => {
      it('should update region', () => {
        const result = wizardReducer(
          initialState,
          changeAwsRegion('eu-west-1'),
        );

        expect(result.aws.region).toBe('eu-west-1');
      });
    });

    describe('reinitializeAws', () => {
      it('should reset all AWS fields to defaults', () => {
        const modifiedState: wizardState = {
          ...initialState,
          aws: {
            accountId: '123456789012',
            shareMethod: 'manual',
            source: { id: 'test-source', name: 'Test Source' },
            sourceId: 'test-source',
            region: 'ap-southeast-1',
          },
        };

        const result = wizardReducer(modifiedState, reinitializeAws());

        expect(result.aws.accountId).toBe('');
        expect(result.aws.shareMethod).toBe('manual');
        expect(result.aws.source).toBeUndefined();
        expect(result.aws.region).toBe('us-east-1');
      });

      it('should not affect other state', () => {
        const modifiedState: wizardState = {
          ...initialState,
          azure: {
            ...initialState.azure,
            tenantId: 'tenant-123',
          },
          aws: {
            accountId: '123456789012',
            shareMethod: 'manual',
            source: undefined,
            sourceId: undefined,
            region: 'ap-southeast-1',
          },
        };

        const result = wizardReducer(modifiedState, reinitializeAws());

        expect(result.azure.tenantId).toBe('tenant-123');
      });
    });
  });

  describe('Azure', () => {
    describe('changeAzureTenantId', () => {
      it('should update tenant ID', () => {
        const result = wizardReducer(
          initialState,
          changeAzureTenantId('tenant-abc-123'),
        );

        expect(result.azure.tenantId).toBe('tenant-abc-123');
      });
    });

    describe('changeAzureSubscriptionId', () => {
      it('should update subscription ID', () => {
        const result = wizardReducer(
          initialState,
          changeAzureSubscriptionId('sub-xyz-789'),
        );

        expect(result.azure.subscriptionId).toBe('sub-xyz-789');
      });
    });

    describe('changeAzureResourceGroup', () => {
      it('should update resource group', () => {
        const result = wizardReducer(
          initialState,
          changeAzureResourceGroup('my-resource-group'),
        );

        expect(result.azure.resourceGroup).toBe('my-resource-group');
      });
    });

    describe('changeAzureHyperVGeneration', () => {
      it('should set to V1', () => {
        const result = wizardReducer(
          initialState,
          changeAzureHyperVGeneration('V1'),
        );

        expect(result.azure.hyperVGeneration).toBe('V1');
      });

      it('should set to V2', () => {
        const result = wizardReducer(
          initialState,
          changeAzureHyperVGeneration('V2'),
        );

        expect(result.azure.hyperVGeneration).toBe('V2');
      });
    });

    describe('reinitializeAzure', () => {
      it('should reset all Azure fields to undefined', () => {
        const modifiedState: wizardState = {
          ...initialState,
          azure: {
            ...initialState.azure,
            tenantId: 'tenant-123',
            subscriptionId: 'sub-456',
            resourceGroup: 'rg-789',
          },
        };

        const result = wizardReducer(modifiedState, reinitializeAzure());

        expect(result.azure.tenantId).toBeUndefined();
        expect(result.azure.subscriptionId).toBeUndefined();
        expect(result.azure.resourceGroup).toBeUndefined();
      });

      it('should preserve hyperVGeneration', () => {
        const modifiedState: wizardState = {
          ...initialState,
          azure: {
            ...initialState.azure,
            tenantId: 'tenant-123',
            hyperVGeneration: 'V2',
          },
        };

        const result = wizardReducer(modifiedState, reinitializeAzure());

        // hyperVGeneration is not reset by reinitializeAzure
        expect(result.azure.hyperVGeneration).toBe('V2');
      });
    });
  });

  describe('GCP', () => {
    describe('changeGcpShareMethod', () => {
      it('should set to withGoogle and initialize accountType', () => {
        const result = wizardReducer(
          initialState,
          changeGcpShareMethod('withGoogle'),
        );

        expect(result.gcp.shareMethod).toBe('withGoogle');
        expect(result.gcp.accountType).toBe('user');
      });

      it('should set to withInsights and clear accountType and email', () => {
        const stateWithGcpConfig: wizardState = {
          ...initialState,
          gcp: {
            ...initialState.gcp,
            shareMethod: 'withGoogle',
            accountType: 'serviceAccount',
            email: 'test@example.com',
          },
        };

        const result = wizardReducer(
          stateWithGcpConfig,
          changeGcpShareMethod('withInsights'),
        );

        expect(result.gcp.shareMethod).toBe('withInsights');
        expect(result.gcp.accountType).toBeUndefined();
        expect(result.gcp.email).toBe('');
      });
    });

    describe('changeGcpAccountType', () => {
      it('should update account type to user', () => {
        const result = wizardReducer(
          initialState,
          changeGcpAccountType('user'),
        );

        expect(result.gcp.accountType).toBe('user');
      });

      it('should update account type to serviceAccount', () => {
        const result = wizardReducer(
          initialState,
          changeGcpAccountType('serviceAccount'),
        );

        expect(result.gcp.accountType).toBe('serviceAccount');
      });

      it('should update account type to group', () => {
        const result = wizardReducer(
          initialState,
          changeGcpAccountType('group'),
        );

        expect(result.gcp.accountType).toBe('group');
      });

      it('should update account type to domain', () => {
        const result = wizardReducer(
          initialState,
          changeGcpAccountType('domain'),
        );

        expect(result.gcp.accountType).toBe('domain');
      });
    });

    describe('changeGcpEmail', () => {
      it('should update email', () => {
        const result = wizardReducer(
          initialState,
          changeGcpEmail('user@example.com'),
        );

        expect(result.gcp.email).toBe('user@example.com');
      });
    });

    describe('reinitializeGcp', () => {
      it('should reset all GCP fields to defaults', () => {
        const modifiedState: wizardState = {
          ...initialState,
          gcp: {
            shareMethod: 'withInsights',
            accountType: 'serviceAccount',
            email: 'sa@example.com',
          },
        };

        const result = wizardReducer(modifiedState, reinitializeGcp());

        expect(result.gcp.shareMethod).toBe('withGoogle');
        expect(result.gcp.accountType).toBe('user');
        expect(result.gcp.email).toBe('');
      });
    });
  });
});
