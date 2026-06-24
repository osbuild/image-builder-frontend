import { describe, expect, it } from 'vitest';

import {
  changeAwsAccountId,
  changeAwsRegion,
  changeAwsSourceId,
  changeAzureHyperVGeneration,
  changeAzureResourceGroup,
  changeAzureSubscriptionId,
  changeAzureTenantId,
  changeGcpAccountType,
  changeGcpEmail,
  initialState,
  reinitializeAws,
  reinitializeAzure,
  reinitializeGcp,
  wizardReducer,
  type WizardState,
} from '@/store/slices/wizard';

describe('target environment reducers', () => {
  describe('AWS', () => {
    describe('changeAwsAccountId', () => {
      it('should update AWS account ID', () => {
        const result = wizardReducer(
          initialState,
          changeAwsAccountId('123456789012'),
        );

        expect(result.cloudProviders.aws.accountId).toBe('123456789012');
      });
    });

    describe('changeAwsSourceId', () => {
      it('should set source ID', () => {
        const result = wizardReducer(
          initialState,
          changeAwsSourceId('source-123'),
        );

        expect(result.cloudProviders.aws.sourceId).toBe('source-123');
      });

      it('should clear source ID with undefined', () => {
        const stateWithSource: WizardState = {
          ...initialState,
          cloudProviders: {
            ...initialState.cloudProviders,
            aws: {
              ...initialState.cloudProviders.aws,
              sourceId: 'existing-source',
            },
          },
        };

        const result = wizardReducer(
          stateWithSource,
          changeAwsSourceId(undefined),
        );

        expect(result.cloudProviders.aws.sourceId).toBeUndefined();
      });
    });

    describe('changeAwsRegion', () => {
      it('should update region', () => {
        const result = wizardReducer(
          initialState,
          changeAwsRegion('eu-west-1'),
        );

        expect(result.cloudProviders.aws.region).toBe('eu-west-1');
      });
    });

    describe('reinitializeAws', () => {
      it('should reset all AWS fields to defaults', () => {
        const modifiedState: WizardState = {
          ...initialState,
          cloudProviders: {
            ...initialState.cloudProviders,
            aws: {
              accountId: '123456789012',
              shareMethod: 'manual',
              source: { id: 'test-source', name: 'Test Source' },
              sourceId: 'test-source',
              region: 'ap-southeast-1',
            },
          },
        };

        const result = wizardReducer(modifiedState, reinitializeAws());

        expect(result.cloudProviders.aws.accountId).toBe('');
        expect(result.cloudProviders.aws.shareMethod).toBe('manual');
        expect(result.cloudProviders.aws.source).toBeUndefined();
        expect(result.cloudProviders.aws.region).toBe('us-east-1');
      });

      it('should not affect other state', () => {
        const modifiedState: WizardState = {
          ...initialState,
          cloudProviders: {
            ...initialState.cloudProviders,
            azure: {
              ...initialState.cloudProviders.azure,
              tenantId: 'tenant-123',
            },
            aws: {
              accountId: '123456789012',
              shareMethod: 'manual',
              source: undefined,
              sourceId: undefined,
              region: 'ap-southeast-1',
            },
          },
        };

        const result = wizardReducer(modifiedState, reinitializeAws());

        expect(result.cloudProviders.azure.tenantId).toBe('tenant-123');
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

        expect(result.cloudProviders.azure.tenantId).toBe('tenant-abc-123');
      });
    });

    describe('changeAzureSubscriptionId', () => {
      it('should update subscription ID', () => {
        const result = wizardReducer(
          initialState,
          changeAzureSubscriptionId('sub-xyz-789'),
        );

        expect(result.cloudProviders.azure.subscriptionId).toBe('sub-xyz-789');
      });
    });

    describe('changeAzureResourceGroup', () => {
      it('should update resource group', () => {
        const result = wizardReducer(
          initialState,
          changeAzureResourceGroup('my-resource-group'),
        );

        expect(result.cloudProviders.azure.resourceGroup).toBe(
          'my-resource-group',
        );
      });
    });

    describe('changeAzureHyperVGeneration', () => {
      it('should set to V1', () => {
        const result = wizardReducer(
          initialState,
          changeAzureHyperVGeneration('V1'),
        );

        expect(result.cloudProviders.azure.hyperVGeneration).toBe('V1');
      });

      it('should set to V2', () => {
        const result = wizardReducer(
          initialState,
          changeAzureHyperVGeneration('V2'),
        );

        expect(result.cloudProviders.azure.hyperVGeneration).toBe('V2');
      });
    });

    describe('reinitializeAzure', () => {
      it('should reset all Azure fields to undefined', () => {
        const modifiedState: WizardState = {
          ...initialState,
          cloudProviders: {
            ...initialState.cloudProviders,
            azure: {
              ...initialState.cloudProviders.azure,
              tenantId: 'tenant-123',
              subscriptionId: 'sub-456',
              resourceGroup: 'rg-789',
            },
          },
        };

        const result = wizardReducer(modifiedState, reinitializeAzure());

        expect(result.cloudProviders.azure.tenantId).toBeUndefined();
        expect(result.cloudProviders.azure.subscriptionId).toBeUndefined();
        expect(result.cloudProviders.azure.resourceGroup).toBeUndefined();
      });

      it('should preserve hyperVGeneration', () => {
        const modifiedState: WizardState = {
          ...initialState,
          cloudProviders: {
            ...initialState.cloudProviders,
            azure: {
              ...initialState.cloudProviders.azure,
              tenantId: 'tenant-123',
              hyperVGeneration: 'V2',
            },
          },
        };

        const result = wizardReducer(modifiedState, reinitializeAzure());

        // hyperVGeneration is not reset by reinitializeAzure
        expect(result.cloudProviders.azure.hyperVGeneration).toBe('V2');
      });
    });
  });

  describe('GCP', () => {
    describe('changeGcpAccountType', () => {
      it('should update account type to user', () => {
        const result = wizardReducer(
          initialState,
          changeGcpAccountType('user'),
        );

        expect(result.cloudProviders.gcp.accountType).toBe('user');
      });

      it('should update account type to serviceAccount', () => {
        const result = wizardReducer(
          initialState,
          changeGcpAccountType('serviceAccount'),
        );

        expect(result.cloudProviders.gcp.accountType).toBe('serviceAccount');
      });

      it('should update account type to group', () => {
        const result = wizardReducer(
          initialState,
          changeGcpAccountType('group'),
        );

        expect(result.cloudProviders.gcp.accountType).toBe('group');
      });

      it('should update account type to domain', () => {
        const result = wizardReducer(
          initialState,
          changeGcpAccountType('domain'),
        );

        expect(result.cloudProviders.gcp.accountType).toBe('domain');
      });
    });

    describe('changeGcpEmail', () => {
      it('should update email', () => {
        const result = wizardReducer(
          initialState,
          changeGcpEmail('user@example.com'),
        );

        expect(result.cloudProviders.gcp.email).toBe('user@example.com');
      });
    });

    describe('reinitializeGcp', () => {
      it('should reset all GCP fields to defaults', () => {
        const modifiedState: WizardState = {
          ...initialState,
          cloudProviders: {
            ...initialState.cloudProviders,
            gcp: {
              accountType: 'serviceAccount',
              email: 'sa@example.com',
            },
          },
        };

        const result = wizardReducer(modifiedState, reinitializeGcp());

        expect(result.cloudProviders.gcp.accountType).toBe('user');
        expect(result.cloudProviders.gcp.email).toBe('');
      });
    });
  });
});
