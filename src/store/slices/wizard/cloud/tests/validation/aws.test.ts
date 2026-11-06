import { describe, expect, it } from 'vitest';

import { validateAwsAccountId } from '@/store/slices/wizard';

describe('AWS account ID validation', () => {
  it.each(['123456789012', '000000000000'])(
    'accepts 12-digit account ID %s',
    (accountId) => {
      expect(validateAwsAccountId(accountId)).toEqual({
        data: accountId,
        errors: [],
      });
    },
  );

  it('does not report an error for an undefined account ID', () => {
    expect(validateAwsAccountId(undefined)).toEqual({
      data: undefined,
      errors: [],
    });
  });

  it.each([
    [
      'empty',
      '',
      [
        'Account ID is required',
        'Account ID must contain only digits',
        'Account ID must be 12 characters long',
      ],
    ],
    ['short', '12345678901', ['Account ID must be 12 characters long']],
    ['long', '1234567890123', ['Account ID must be 12 characters long']],
    ['non-numeric', '12345678901a', ['Account ID must contain only digits']],
  ] as const)(
    'reports validation errors for %s account IDs',
    (_case, id, messages) => {
      expect(
        validateAwsAccountId(id).errors.map(({ message }) => message),
      ).toEqual(messages);
    },
  );
});
