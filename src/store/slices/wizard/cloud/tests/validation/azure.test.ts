import { describe, expect, it } from 'vitest';

import {
  validateAzureResourceGroup,
  validateAzureSubscriptionId,
  validateAzureTenantId,
} from '@/store/slices/wizard';

const validGuid = '3cf15247-e9db-4ace-abad-e9f797347d00';

describe.each([
  [
    'tenant ID',
    validateAzureTenantId,
    'Tenant ID is required',
    'Tenant ID must be 36 characters long',
    'Tenant ID must be a valid GUID',
  ],
  [
    'subscription ID',
    validateAzureSubscriptionId,
    'Subscription ID is required',
    'Subscription ID must be 36 characters long',
    'Subscription ID must be a valid GUID',
  ],
] as const)(
  'Azure %s validation',
  (_field, validate, requiredMessage, lengthMessage, formatMessage) => {
    it('accepts a valid GUID', () => {
      expect(validate(validGuid)).toEqual({ data: validGuid, errors: [] });
    });

    it('does not report an error when the value is undefined', () => {
      expect(validate(undefined)).toEqual({ data: undefined, errors: [] });
    });

    it('requires a value when the input is empty', () => {
      expect(validate('').errors.map(({ message }) => message)).toEqual([
        requiredMessage,
      ]);
    });

    it.each([
      ['too short', validGuid.slice(0, -1)],
      ['too long', `${validGuid}a`],
    ] as const)(
      'reports length and format errors for %s GUIDs',
      (_case, id) => {
        expect(validate(id).errors.map(({ message }) => message)).toEqual([
          lengthMessage,
          formatMessage,
        ]);
      },
    );

    it.each([
      ['invalid version', '3cf15247-e9db-6ace-abad-e9f797347d00'],
      ['invalid variant', '3cf15247-e9db-4ace-0bad-e9f797347d00'],
    ] as const)('reports a format error for %s GUIDs', (_case, id) => {
      const { errors } = validate(id);

      expect(errors.map(({ message }) => message)).toEqual([formatMessage]);
      expect(errors.map(({ kind, value }) => ({ kind, value }))).toEqual([
        { kind: 'format', value: id },
      ]);
    });
  },
);

describe('Azure resource group validation', () => {
  it.each(['resource-group-name', 'resource.group_1(test)'])(
    'accepts resource group %s',
    (resourceGroup) => {
      expect(validateAzureResourceGroup(resourceGroup)).toEqual({
        data: resourceGroup,
        errors: [],
      });
    },
  );

  it('does not report an error when the value is undefined', () => {
    expect(validateAzureResourceGroup(undefined)).toEqual({
      data: undefined,
      errors: [],
    });
  });

  it('requires a value when the input is empty', () => {
    expect(
      validateAzureResourceGroup('').errors.map(({ message }) => message),
    ).toEqual(['Resource group is required']);
  });

  it.each([
    ['invalid characters', '**invalid-group**'],
    ['trailing period', 'resource-group.'],
  ] as const)('reports a format error for %s', (_case, resourceGroup) => {
    expect(
      validateAzureResourceGroup(resourceGroup).errors.map(
        ({ kind, value }) => ({ kind, value }),
      ),
    ).toEqual([{ kind: 'format', value: resourceGroup }]);
  });
});
