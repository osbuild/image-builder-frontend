import { describe, it, expect } from 'vitest';

import { UserSchema, UsersSchema, type User } from '../../Schemas/User';
import { UsernameSchema } from '../../Schemas/User/Username';
import { GroupsSchema } from '../../Schemas/User/Groups';
import { SSHKeySchema } from '../../Schemas/User/SSHKey';
import { PasswordSchema } from '../../Schemas/User/Password';
import { User as ApiUser } from '../../store/service/imageBuilderApi';

describe('UserSchema', () => {
  describe('UsernameSchema', () => {
    it('should accept valid usernames', () => {
      const validUsernames = [
        'user1',
        'test_user',
        'john.doe',
        'admin-user',
        'user123$',
        'a1',
        'Test123',
        'user-name.test_123',
      ];

      validUsernames.forEach((username) => {
        expect(() => UsernameSchema.parse(username)).not.toThrow();
      });
    });

    it('should reject usernames that are too long', () => {
      const longUsername = 'a'.repeat(33); // 33 characters
      expect(() => UsernameSchema.parse(longUsername)).toThrow(
        'The username cannot be longer than 32 characters',
      );
    });

    it('should reject usernames that are only digits', () => {
      expect(() => UsernameSchema.parse('123')).toThrow(
        'The username must contain atleast one letter',
      );
      expect(() => UsernameSchema.parse('00000')).toThrow(
        'The username must contain atleast one letter',
      );
    });

    it('should reject usernames with invalid format', () => {
      const invalidUsernames = [
        '-invalid', // starts with dash
        '.invalid', // starts with dot
        'invalid-', // ends with dash
        'invalid.', // ends with dot
        'user@name', // contains @
        'user name', // contains space
        'user#name', // contains #
        'user%name', // contains %
        '$invalid', // starts with $
        '',
      ];

      invalidUsernames.forEach((username) => {
        expect(() => UsernameSchema.parse(username)).toThrow(
          'The username must be alphanumeric only',
        );
      });
    });
  });

  describe('GroupsSchema', () => {
    it('should accept valid groups', () => {
      const validGroups = [
        ['admin'],
        ['users', 'wheel'],
        ['group1', 'group_2', 'test-group'],
        ['group$'],
        [], // empty array should be valid
      ];

      validGroups.forEach((groups) => {
        expect(() => GroupsSchema.parse(groups)).not.toThrow();
      });
    });

    it('should accept undefined (optional)', () => {
      expect(() => GroupsSchema.parse(undefined)).not.toThrow();
    });

    it('should reject groups that are too long', () => {
      const longGroupName = 'a'.repeat(33); // 33 characters
      expect(() => GroupsSchema.parse([longGroupName])).toThrow(
        'The group cannot be longer than 32 characters',
      );
    });

    it('should reject groups that are only digits', () => {
      expect(() => GroupsSchema.parse(['123'])).toThrow(
        'The groupname must contain at least one letter',
      );
    });

    it('should reject groups with invalid format', () => {
      const invalidGroupNames = [
        '-invalid', // starts with dash
        '.invalid', // starts with dot
        'group@name', // contains @
        'group name', // contains space
        'group#name', // contains #
      ];

      invalidGroupNames.forEach((groupName) => {
        expect(() => GroupsSchema.parse([groupName])).toThrow('invalid group');
      });
    });

    it('should reject duplicate groups', () => {
      expect(() => GroupsSchema.parse(['admin', 'users', 'admin'])).toThrow(
        'The group items must be unique',
      );
    });
  });

  describe('SSHKeySchema', () => {
    it('should accept valid SSH keys', () => {
      const validKeys = [
        'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDjnGRBXP0kL user@example.com',
        'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl user@host',
        'ssh-dss AAAAB3NzaC1kc3MAAACBAO53E7Evqp8bZKn/3m+7vbqajDjnGRBXP0kL',
        'ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTY=',
        'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDjnGRBXP0kL', // without comment
      ];

      validKeys.forEach((key) => {
        expect(() => SSHKeySchema.parse(key)).not.toThrow();
      });
    });

    it('should accept undefined (optional)', () => {
      expect(() => SSHKeySchema.parse(undefined)).not.toThrow();
    });

    it('should reject invalid SSH key types', () => {
      const invalidTypes = [
        'ssh-invalid AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDjnGRBXP0kL',
        'invalid-type AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDjnGRBXP0kL',
        'rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDjnGRBXP0kL',
      ];

      invalidTypes.forEach((key) => {
        expect(() => SSHKeySchema.parse(key)).toThrow(
          'SSH key must be one of ssh-rsa, ssh-dss, ssh-ed25519, or ecdsa-sha2-nistp(256|384|521)',
        );
      });
    });

    it('should reject invalid SSH key format', () => {
      const invalidKeys = [
        'ssh-rsa invalid-base64-data',
        'ssh-rsa',
        'ssh-rsa AAAAB3NzaC1yc2EAAAA@INVALID@',
        'ssh-ed25519 not-base64',
      ];

      invalidKeys.forEach((key) => {
        expect(() => SSHKeySchema.parse(key)).toThrow(
          'SSH key data must be base64 encoded',
        );
      });
    });
  });

  describe('PasswordSchema', () => {
    it('should accept valid passwords', () => {
      const validPasswords = [
        'Password123!', // all 4 character types
        'MyPass123', // 3 types: upper, lower, number
        'mypass123!', // 3 types: lower, number, special
        'MYPASS123!', // 3 types: upper, number, special
        'MyPassword!', // 3 types: upper, lower, special
        'a1B2c3D4e5', // mixed case and numbers
        '$1$salt$hashedpassword', // encrypted password (crypt format)
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // bcrypt
        '$6$salt$encryptedpassword', // sha512crypt
      ];

      validPasswords.forEach((password) => {
        expect(() => PasswordSchema.parse(password)).not.toThrow();
      });
    });

    it('should accept undefined (optional)', () => {
      expect(() => PasswordSchema.parse(undefined)).not.toThrow();
    });

    it('should reject passwords that are too short', () => {
      expect(() => PasswordSchema.parse('abc1')).toThrow(
        'Password must contain at least 6 characters',
      );
    });

    it('should reject passwords that are too long', () => {
      const longPassword = 'a'.repeat(129); // 129 characters
      expect(() => PasswordSchema.parse(longPassword)).toThrow(
        'Password must contain at most 128 characters',
      );
    });

    it('should reject weak passwords (less than 3 character types)', () => {
      const weakPasswords = [
        'password', // only lowercase
        'PASSWORD', // only uppercase
        '12345678', // only numbers
        '!@#$%^&*', // only special chars
        'Password', // only upper and lower
        'password123', // only lower and numbers
        'PASSWORD123', // only upper and numbers
        'password!@#', // only lower and special
        'PASSWORD!@#', // only upper and special
        '123456!@#', // only numbers and special
      ];

      weakPasswords.forEach((password) => {
        expect(() => PasswordSchema.parse(password)).toThrow(
          'Password must include at least three of the following: uppercase letter, lowercase letter, number, or special character',
        );
      });
    });
  });

  describe('UserSchema', () => {
    it('should accept valid user objects', () => {
      const validUsers: User[] = [
        {
          name: 'johndoe',
          groups: ['users', 'admin'],
          ssh_key:
            'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDjnGRBXP0kL user@example.com',
          password: 'SecurePass123!',
          hasPassword: true,
          isAdministrator: false,
        },
        {
          name: 'jane_smith',
          groups: undefined,
          ssh_key: undefined,
          password: undefined,
          hasPassword: false,
          isAdministrator: false,
        },
        {
          name: 'admin',
          groups: ['wheel'],
          ssh_key:
            'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl',
          password: '$6$salt$encryptedpassword',
          isAdministrator: false,
        },
      ];

      validUsers.forEach((user) => {
        expect(() => UserSchema.parse(user)).not.toThrow();
      });
    });

    it('should reject user objects with invalid fields', () => {
      const invalidUsers = [
        {
          name: '123', // invalid username
          groups: ['users'],
          ssh_key: undefined,
          password: undefined,
        },
        {
          name: 'validuser',
          groups: ['users', 'users'], // duplicate groups
          ssh_key: undefined,
          password: undefined,
        },
        {
          name: 'validuser',
          groups: ['users'],
          ssh_key: 'invalid-ssh-key', // invalid SSH key
          password: undefined,
        },
        {
          name: 'validuser',
          groups: ['users'],
          ssh_key: undefined,
          password: 'weak', // weak password
        },
      ];

      invalidUsers.forEach((user) => {
        expect(() => UserSchema.parse(user)).toThrow();
      });
    });

    it('should require username field', () => {
      const userWithoutUsername = {
        groups: ['users'],
        ssh_key: undefined,
        password: undefined,
      };

      expect(() => UserSchema.parse(userWithoutUsername)).toThrow();
    });

    it('should allow optional fields to be undefined', () => {
      const minimalUser = {
        name: 'validuser',
        groups: undefined,
        ssh_key: undefined,
        password: undefined,
      };

      expect(() => UserSchema.parse(minimalUser)).not.toThrow();
    });
  });

  describe('UsersSchema', () => {
    it('should accept valid user arrays', () => {
      const validUserArrays = [
        [], // empty array
        [
          {
            name: 'user1',
            groups: ['users'],
            ssh_key: undefined,
            password: 'Password123!',
          },
        ],
        [
          {
            name: 'user1',
            groups: ['users'],
            ssh_key: undefined,
            password: 'Password123!',
          },
          {
            name: 'user2',
            groups: ['admin'],
            ssh_key:
              'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDjnGRBXP0kL user@example.com',
            password: undefined,
          },
        ],
      ];

      validUserArrays.forEach((users) => {
        expect(() => UsersSchema.parse(users)).not.toThrow();
      });
    });

    it('should reject arrays with invalid users', () => {
      const invalidUserArrays = [
        [
          {
            name: '123', // invalid username
            groups: ['users'],
            ssh_key: undefined,
            password: undefined,
          },
        ],
        [
          {
            name: 'validuser',
            groups: ['users'],
            ssh_key: undefined,
            password: 'Password123!',
          },
          {
            name: 'user2',
            groups: ['users', 'users'], // duplicate groups
            ssh_key: undefined,
            password: undefined,
          },
        ],
      ];

      invalidUserArrays.forEach((users) => {
        expect(() => UsersSchema.parse(users)).toThrow();
      });
    });
  });

  describe('Type inference and API compatibility', () => {
    it('should infer correct types', () => {
      const user: User = {
        name: 'testuser',
        groups: ['users'],
        ssh_key: undefined,
        password: 'TestPass123!',
        hasPassword: true,
        isAdministrator: false,
      };

      // These should compile without TypeScript errors
      expect(typeof user.name).toBe('string');
      expect(Array.isArray(user.groups) || user.groups === undefined).toBe(
        true,
      );
      expect(
        typeof user.ssh_key === 'string' || user.ssh_key === undefined,
      ).toBe(true);
      expect(
        typeof user.password === 'string' || user.password === undefined,
      ).toBe(true);
      expect(
        typeof user.hasPassword === 'boolean' || user.hasPassword === undefined,
      ).toBe(true);
    });

    it('should be compatible with API User type structure', () => {
      // Test that UserSchema inferred type can be mapped to API User type
      const schemaUser: User = {
        name: 'apiuser',
        groups: ['admin', 'users'],
        ssh_key:
          'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDjnGRBXP0kL user@example.com',
        password: 'ApiPass123!',
        hasPassword: true,
        isAdministrator: false,
      };

      // Function to convert schema User to API User
      const convertToApiUser = (user: User): ApiUser => ({
        name: user.name, // username maps to name
        groups: user.groups,
        ssh_key: user.ssh_key,
        password: user.password,
        hasPassword: user.hasPassword,
      });

      const apiUser = convertToApiUser(schemaUser);

      // Verify the converted user has the correct API structure
      expect(apiUser.name).toBe('apiuser');
      expect(apiUser.groups).toEqual(['admin', 'users']);
      expect(apiUser.ssh_key).toBe(
        'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDjnGRBXP0kL user@example.com',
      );
      expect(apiUser.password).toBe('ApiPass123!');
      expect(apiUser.hasPassword).toBe(true);

      // Type assertions to ensure compatibility at compile time
      const _typeCheck: ApiUser = apiUser;
      expect(_typeCheck).toBeDefined();
    });

    it('should handle optional fields consistently with API', () => {
      const minimalSchemaUser: User = {
        name: 'minimal',
        groups: undefined,
        ssh_key: undefined,
        password: undefined,
        hasPassword: undefined,
        isAdministrator: false,
      };

      const convertToApiUser = (user: User): ApiUser => ({
        name: user.name,
        groups: user.groups,
        ssh_key: user.ssh_key,
        password: user.password,
        hasPassword: user.hasPassword,
      });

      const minimalApiUser = convertToApiUser(minimalSchemaUser);

      // All optional fields should be undefined, which matches API expectations
      expect(minimalApiUser.name).toBe('minimal');
      expect(minimalApiUser.groups).toBeUndefined();
      expect(minimalApiUser.ssh_key).toBeUndefined();
      expect(minimalApiUser.password).toBeUndefined();
      expect(minimalApiUser.hasPassword).toBeUndefined();
    });

    it('should validate schema user data can satisfy API requirements', () => {
      // Test that valid schema data passes validation and can be used with API
      const testUsers: User[] = [
        {
          name: 'john.doe',
          groups: ['wheel', 'docker'],
          ssh_key:
            'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl',
          password: undefined,
          hasPassword: false,
          isAdministrator: false,
        },
        {
          name: 'admin123',
          groups: undefined,
          ssh_key: undefined,
          password: 'SecureAdmin123!',
          hasPassword: true,
          isAdministrator: false,
        },
      ];

      testUsers.forEach((user) => {
        // Validate with schema
        expect(() => UserSchema.parse(user)).not.toThrow();

        // Convert to API format
        const apiUser: ApiUser = {
          name: user.name,
          groups: user.groups,
          ssh_key: user.ssh_key,
          password: user.password,
          hasPassword: user.hasPassword,
        };

        // Verify API user structure is valid
        expect(typeof apiUser.name).toBe('string');
        expect(
          apiUser.groups === undefined || Array.isArray(apiUser.groups),
        ).toBe(true);
        expect(
          apiUser.ssh_key === undefined || typeof apiUser.ssh_key === 'string',
        ).toBe(true);
        expect(
          apiUser.password === undefined ||
            typeof apiUser.password === 'string',
        ).toBe(true);
        expect(
          apiUser.hasPassword === undefined ||
            typeof apiUser.hasPassword === 'boolean',
        ).toBe(true);
      });
    });
  });
});
