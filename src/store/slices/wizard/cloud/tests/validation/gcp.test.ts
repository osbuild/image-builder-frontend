import { describe, expect, it } from 'vitest';

import {
  isGcpDomainValid,
  isGcpEmailValid,
} from '@/Components/CreateImageWizard/validators';

describe('GCP validation', () => {
  describe('email', () => {
    it.each(['builder@example.com', 'alice+build@example.co.uk'])(
      'accepts %s',
      (email) => {
        expect(isGcpEmailValid(email)).toBe(true);
      },
    );

    it.each([
      ['undefined', undefined],
      ['empty', ''],
      ['malformed', 'not-an-email'],
      ['missing top-level domain', 'builder@example'],
      ['over 253 characters', `${'a'.repeat(242)}@example.com`],
    ] as const)('rejects %s email addresses', (_case, email) => {
      expect(isGcpEmailValid(email)).toBe(false);
    });
  });

  describe('domain', () => {
    it.each(['example.com', 'sub.example.co.uk'])('accepts %s', (domain) => {
      expect(isGcpDomainValid(domain)).toBe(true);
    });

    it.each([
      ['undefined', undefined],
      ['empty', ''],
      ['missing top-level domain', 'example'],
      ['leading hyphen', '-example.com'],
      ['trailing hyphen', 'example-.com'],
      ['consecutive dots', 'example..com'],
      ['over 253 characters', `${'a'.repeat(250)}.com`],
    ] as const)('rejects %s domains', (_case, domain) => {
      expect(isGcpDomainValid(domain)).toBe(false);
    });
  });
});
