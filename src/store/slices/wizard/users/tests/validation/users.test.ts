import { describe, expect, it } from 'vitest';

import { checkPasswordValidity } from '@/Components/CreateImageWizard/utilities/useValidation';
import {
  isSshKeyValid,
  isUserGroupValid,
  isUserNameValid,
} from '@/Components/CreateImageWizard/validators';

describe('user validation', () => {
  describe('user names', () => {
    it.each([
      ['ab', 'two-character user name'],
      ['testuser', 'simple user name'],
      ['1user', 'user name starting with a digit'],
      ['test.user', 'user name with a dot'],
      ['test_user', 'user name with an underscore'],
      ['test-user', 'user name with a hyphen'],
      ['testuser$', 'user name ending with a dollar sign'],
      ['a'.repeat(32), 'user name at the maximum length'],
    ])('accepts %s as a valid %s', (name) => {
      expect(isUserNameValid(name)).toBe(true);
    });

    it.each([
      ['', 'empty user name'],
      ['a', 'single-character user name'],
      ['12345', 'purely numeric user name'],
      ['_user', 'user name starting with an underscore'],
      ['user-', 'user name ending with a hyphen'],
      ['user name', 'user name containing spaces'],
      ['user$name', 'user name containing a dollar sign in the middle'],
      ['a'.repeat(33), 'user name over the maximum length'],
    ])('rejects %s as an invalid %s', (name) => {
      expect(isUserNameValid(name)).toBe(false);
    });
  });

  describe('group names', () => {
    it.each([
      ['a', 'single-letter group name'],
      ['developers', 'simple group name'],
      ['dev-ops', 'hyphenated group name'],
      ['dev_ops', 'underscored group name'],
      ['_developers', 'group name starting with an underscore'],
      ['developers$', 'group name ending with a dollar sign'],
      ['developers-', 'group name ending with a hyphen'],
      ['group123', 'group name with digits'],
      ['a'.repeat(32), 'group name at the maximum length'],
    ])('accepts %s as a valid %s', (group) => {
      expect(isUserGroupValid(group)).toBe(true);
    });

    it.each([
      ['', 'empty group name'],
      ['12345', 'purely numeric group name'],
      ['invalid.group', 'group name containing a dot'],
      ['developers!', 'group name containing punctuation'],
      ['-developers', 'group name starting with a hyphen'],
      ['a'.repeat(33), 'group name over the maximum length'],
    ])('rejects %s as an invalid %s', (group) => {
      expect(isUserGroupValid(group)).toBe(false);
    });
  });

  describe('SSH keys', () => {
    it.each([
      ['ssh-rsa AAAA', 'RSA key'],
      ['ssh-dss AAAA', 'DSS key'],
      ['ssh-ed25519 AAAA', 'Ed25519 key'],
      ['ecdsa-sha2-nistp256 AAAA', 'ECDSA key using nistp256'],
      ['ecdsa-sha2-nistp384 AAAA', 'ECDSA key using nistp384'],
      ['ecdsa-sha2-nistp521 AAAA', 'ECDSA key using nistp521'],
      ['ssh-rsa A+/= comment with spaces', 'key with a comment'],
    ])('accepts a valid %s', (key) => {
      expect(isSshKeyValid(key)).toBe(true);
    });

    it.each([
      ['', 'empty key'],
      ['ssh-rsa', 'key without key material'],
      ['ssh-unknown AAAA', 'unsupported key type'],
      ['ssh-rsa AAAA!', 'key material containing invalid characters'],
    ])('rejects an invalid %s', (key) => {
      expect(isSshKeyValid(key)).toBe(false);
    });
  });

  describe('passwords', () => {
    it('rejects empty passwords', () => {
      expect(checkPasswordValidity('').isValid).toBe(false);
    });

    it.each([
      [5, false],
      [6, true],
      [128, true],
      [129, false],
    ])(
      'validates a simple password by its %i-character length',
      (length, isValid) => {
        expect(checkPasswordValidity('a'.repeat(length)).isValid).toBe(isValid);
      },
    );

    it('accepts encrypted password hashes', () => {
      expect(checkPasswordValidity('$6$salt$hash').isValid).toBe(true);
    });
  });
});
