import { describe, expect, it } from 'vitest';

import {
  isAzureResourceGroupValid,
  isAzureSubscriptionIdValid,
  isAzureTenantGUIDValid,
} from '@/Components/CreateImageWizard/validators';

const validGuid = '3cf15247-e9db-4ace-abad-e9f797347d00';

describe('Azure validation', () => {
  it('accepts a valid tenant GUID and subscription ID', () => {
    expect(isAzureTenantGUIDValid(validGuid)).toBe(true);
    expect(isAzureSubscriptionIdValid(validGuid)).toBe(true);
  });

  it.each([
    ['undefined', undefined],
    ['empty', ''],
    ['malformed', 'invalid-guid'],
    ['invalid version', '3cf15247-e9db-6ace-abad-e9f797347d00'],
    ['invalid variant', '3cf15247-e9db-4ace-0bad-e9f797347d00'],
  ] as const)('rejects %s tenant GUIDs and subscription IDs', (_case, id) => {
    expect(isAzureTenantGUIDValid(id)).toBe(false);
    expect(isAzureSubscriptionIdValid(id)).toBe(false);
  });

  it.each(['resource-group-name', 'resource.group_1(test)'])(
    'accepts resource group %s',
    (resourceGroup) => {
      expect(isAzureResourceGroupValid(resourceGroup)).toBe(true);
    },
  );

  it.each([
    ['undefined', undefined],
    ['empty', ''],
    ['invalid characters', '**invalid-group**'],
    ['trailing period', 'resource-group.'],
  ] as const)(
    'rejects resource group with %s value',
    (_case, resourceGroup) => {
      expect(isAzureResourceGroupValid(resourceGroup)).toBe(false);
    },
  );
});
