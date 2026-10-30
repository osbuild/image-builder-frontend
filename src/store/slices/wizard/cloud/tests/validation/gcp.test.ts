import { describe, expect, it } from 'vitest';

import { validateGcpAccount } from '@/store/slices/wizard';

describe('GCP account validation', () => {
  it('does not report an error when no account type is selected', () => {
    expect(validateGcpAccount(undefined)).toEqual({
      data: undefined,
      errors: [],
    });
  });

  describe('email accounts', () => {
    it.each([
      ['user', 'builder@example.com'],
      ['serviceAccount', 'alice+build@example.co.uk'],
      ['group', 'admins@example.com'],
    ] as const)('accepts a valid %s email', (accountType, email) => {
      expect(validateGcpAccount({ accountType, email })).toEqual({
        data: email,
        errors: [],
      });
    });

    it.each([
      ['empty', '', ['Email is required']],
      ['malformed', 'not-an-email', ['Invalid email']],
      ['missing top-level domain', 'builder@example', ['Invalid email']],
    ] as const)('rejects %s email addresses', (_case, email, messages) => {
      expect(
        validateGcpAccount({ accountType: 'user', email }).errors.map(
          ({ message }) => message,
        ),
      ).toEqual(messages);
    });
  });

  describe('domain accounts', () => {
    it.each(['example.com', 'sub.example.co.uk'])(
      'accepts hostname %s',
      (domain) => {
        expect(validateGcpAccount({ accountType: 'domain', domain })).toEqual({
          data: domain,
          errors: [],
        });
      },
    );

    it.each([
      ['empty', '', ['Domain is required']],
      ['protocol included', 'https://example.com', ['Invalid domain']],
      ['invalid hostname', 'not a domain', ['Invalid domain']],
      ['single-label hostname', 'localhost', ['Invalid domain']],
    ] as const)('rejects %s domain values', (_case, domain, messages) => {
      expect(
        validateGcpAccount({ accountType: 'domain', domain }).errors.map(
          ({ message }) => message,
        ),
      ).toEqual(messages);
    });
  });
});
