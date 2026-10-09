import { describe, expect, it } from 'vitest';

import { type User, validateUserList } from '@/store/slices/wizard';

const getUser = (name: string, overrides: Partial<User> = {}): User => ({
  name,
  password: '',
  ssh_key: '',
  groups: [],
  hasPassword: false,
  ...overrides,
});

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
      expect(validateUserList([getUser(name)], []).errors).toEqual([]);
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
      const { errors } = validateUserList([getUser(name)], []);

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'format',
            path: [0, 'name'],
          }),
        ]),
      );
      expect(
        errors.every(({ path }) => path?.[0] === 0 && path[1] === 'name'),
      ).toBe(true);
    });
  });

  describe('duplicate users', () => {
    it('rejects duplicate user names', () => {
      const { errors } = validateUserList(
        [getUser('admin'), getUser('admin')],
        [],
      );

      expect(errors).toEqual([
        expect.objectContaining({
          kind: 'duplicate',
          message: 'Duplicate user names: admin',
          path: [1, 'name'],
        }),
      ]);
    });
  });

  describe('user groups', () => {
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
      expect(
        validateUserList([getUser('admin', { groups: [group] })], []).errors,
      ).toEqual([]);
    });

    it.each([
      ['', 'empty group name'],
      ['12345', 'purely numeric group name'],
      ['invalid.group', 'group name containing a dot'],
      ['developers!', 'group name containing punctuation'],
      ['-developers', 'group name starting with a hyphen'],
      ['a'.repeat(33), 'group name over the maximum length'],
    ])('rejects %s as an invalid %s', (group) => {
      const { errors } = validateUserList(
        [getUser('admin', { groups: [group] })],
        [],
      );

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'format',
            path: [0, 'groups', 0],
          }),
        ]),
      );
      expect(
        errors.every(
          ({ path }) =>
            path?.[0] === 0 && path[1] === 'groups' && path[2] === 0,
        ),
      ).toBe(true);
    });

    it('rejects duplicate group names', () => {
      const { errors } = validateUserList(
        [getUser('admin', { groups: ['developers', 'developers'] })],
        [],
      );

      expect(errors).toEqual([
        expect.objectContaining({
          kind: 'duplicate',
          message: 'Duplicate user groups: developers',
          path: [0, 'groups'],
        }),
      ]);
    });

    it('rejects membership in a group with the same name as the user', () => {
      const { errors } = validateUserList(
        [getUser('admin', { groups: ['admin'] })],
        [],
      );

      expect(errors).toEqual([
        expect.objectContaining({
          kind: 'format',
          message: 'User cannot be a member of a group with the same name',
          path: [0, 'groups'],
        }),
      ]);
    });
  });

  describe('passwords', () => {
    it.each([
      ['empty password', ''],
      ['password at the minimum length', 'a'.repeat(6)],
      ['password at the maximum length', 'a'.repeat(128)],
      ['encrypted password hash', '$6$salt$hash'],
    ])('accepts %s', (_description, password) => {
      expect(
        validateUserList([getUser('admin', { password })], []).errors,
      ).toEqual([]);
    });

    it.each([
      ['password under the minimum length', 'a'.repeat(5)],
      ['password over the maximum length', 'a'.repeat(129)],
      ['password containing only whitespace', ' '.repeat(6)],
    ])('rejects %s', (_description, password) => {
      const { errors } = validateUserList([getUser('admin', { password })], []);

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'format',
            path: [0, 'password'],
          }),
        ]),
      );
    });
  });

  describe('SSH keys', () => {
    it.each([
      ['ssh-rsa AAAA', 'RSA key'],
      ['ssh-ed25519 AAAA', 'Ed25519 key'],
      ['ssh-dss AAAA', 'DSA key'],
      ['ecdsa-sha2-nistp256 AAAA', 'ECDSA key using nistp256'],
      ['ecdsa-sha2-nistp384 AAAA', 'ECDSA key using nistp384'],
      ['ecdsa-sha2-nistp521 AAAA', 'ECDSA key using nistp521'],
      ['ssh-rsa A+/= comment with spaces', 'key with a comment'],
    ])('accepts a valid %s', (ssh_key) => {
      expect(
        validateUserList([getUser('admin', { ssh_key })], []).errors,
      ).toEqual([]);
    });

    it.each([
      ['ssh-rsa', 'key without key material'],
      ['ssh-unknown AAAA', 'unsupported key type'],
      ['ssh-rsa AAAA!', 'key material containing invalid characters'],
    ])('rejects an invalid %s', (ssh_key) => {
      const { errors } = validateUserList([getUser('admin', { ssh_key })], []);

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'format',
            path: [0, 'ssh_key'],
          }),
        ]),
      );
    });
  });
});
