import { describe, expect, it } from 'vitest';

import { isAwsAccountIdValid } from '@/Components/CreateImageWizard/validators';

describe('AWS validation', () => {
  it.each(['123456789012', '000000000000'])(
    'accepts 12-digit account ID %s',
    (accountId) => {
      expect(isAwsAccountIdValid(accountId)).toBe(true);
    },
  );

  it.each([
    ['undefined', undefined],
    ['empty', ''],
    ['short', '12345678901'],
    ['long', '1234567890123'],
    ['non-numeric', '12345678901a'],
  ] as const)('rejects %s account IDs', (_case, accountId) => {
    expect(isAwsAccountIdValid(accountId)).toBe(false);
  });
});
