import { describe, expect, it } from 'vitest';

import {
  BlueprintResponse,
  Customizations,
  Distributions,
} from '@/store/api/backend';

import { parseUsersFromRequest } from '../parsers';
import { initialState } from '../state';

const createMinimalBlueprint = (
  overrides: Partial<BlueprintResponse> = {},
): BlueprintResponse => ({
  id: 'blueprint-123',
  name: 'test-blueprint',
  description: 'A test blueprint',
  lint: { errors: [], warnings: [] },
  distribution: 'rhel-9' as Distributions,
  customizations: {},
  image_requests: [
    {
      architecture: 'x86_64',
      image_type: 'guest-image',
      upload_request: { type: 'aws.s3', options: {} },
    },
  ],
  ...overrides,
});

const withCustomizations = (customizations: Customizations) =>
  createMinimalBlueprint({ customizations });

describe('parseUsersFromRequest', () => {
  describe('users', () => {
    it('returns initial users when not provided', () => {
      const result = parseUsersFromRequest(withCustomizations({}));
      expect(result.users).toEqual(initialState.users);
    });

    it('returns initial users when array is empty', () => {
      const result = parseUsersFromRequest(withCustomizations({ users: [] }));
      expect(result.users).toEqual(initialState.users);
    });

    it('maps user name and defaults password to empty string', () => {
      const result = parseUsersFromRequest(
        withCustomizations({ users: [{ name: 'admin' }] }),
      );
      expect(result.users[0].name).toBe('admin');
      expect(result.users[0].password).toBe('');
    });

    it('maps ssh_key, defaulting to empty string', () => {
      const result = parseUsersFromRequest(
        withCustomizations({
          users: [{ name: 'admin', ssh_key: 'ssh-rsa AAAA...' }],
        }),
      );
      expect(result.users[0].ssh_key).toBe('ssh-rsa AAAA...');

      const result2 = parseUsersFromRequest(
        withCustomizations({ users: [{ name: 'admin' }] }),
      );
      expect(result2.users[0].ssh_key).toBe('');
    });

    it('maps groups, defaulting to empty array', () => {
      const result = parseUsersFromRequest(
        withCustomizations({
          users: [{ name: 'admin', groups: ['wheel', 'docker'] }],
        }),
      );
      expect(result.users[0].groups).toEqual(['wheel', 'docker']);

      const result2 = parseUsersFromRequest(
        withCustomizations({ users: [{ name: 'admin' }] }),
      );
      expect(result2.users[0].groups).toEqual([]);
    });

    it('sets isAdministrator true when user is in wheel group', () => {
      const result = parseUsersFromRequest(
        withCustomizations({
          users: [{ name: 'admin', groups: ['wheel', 'docker'] }],
        }),
      );
      expect(result.users[0].isAdministrator).toBe(true);
    });

    it('sets isAdministrator false when user is not in wheel group', () => {
      const result = parseUsersFromRequest(
        withCustomizations({
          users: [{ name: 'regular', groups: ['docker'] }],
        }),
      );
      expect(result.users[0].isAdministrator).toBe(false);
    });

    it('sets isAdministrator false when groups is undefined', () => {
      const result = parseUsersFromRequest(
        withCustomizations({ users: [{ name: 'nogroups' }] }),
      );
      expect(result.users[0].isAdministrator).toBe(false);
    });

    it('maps hasPassword flag', () => {
      const result = parseUsersFromRequest(
        withCustomizations({
          users: [{ name: 'admin', hasPassword: true }],
        }),
      );
      expect(result.users[0].hasPassword).toBe(true);

      const result2 = parseUsersFromRequest(
        withCustomizations({ users: [{ name: 'admin' }] }),
      );
      expect(result2.users[0].hasPassword).toBe(false);
    });

    it('maps multiple users', () => {
      const result = parseUsersFromRequest(
        withCustomizations({
          users: [
            {
              name: 'admin',
              groups: ['wheel'],
              ssh_key: 'ssh-rsa key',
              hasPassword: true,
            },
            {
              name: 'deploy',
              groups: ['docker'],
              ssh_key: 'ssh-ed25519 BBB',
            },
          ],
        }),
      );
      expect(result.users).toHaveLength(2);
      expect(result.users[0].name).toBe('admin');
      expect(result.users[0].isAdministrator).toBe(true);
      expect(result.users[0].hasPassword).toBe(true);
      expect(result.users[1].name).toBe('deploy');
      expect(result.users[1].isAdministrator).toBe(false);
      expect(result.users[1].hasPassword).toBe(false);
    });
  });

  describe('groups', () => {
    it('returns initial groups when not provided', () => {
      const result = parseUsersFromRequest(withCustomizations({}));
      expect(result.groups).toEqual(initialState.groups);
    });

    it('returns initial groups when array is empty', () => {
      const result = parseUsersFromRequest(withCustomizations({ groups: [] }));
      expect(result.groups).toEqual(initialState.groups);
    });

    it('maps group name', () => {
      const result = parseUsersFromRequest(
        withCustomizations({ groups: [{ name: 'developers' }] }),
      );
      expect(result.groups).toEqual([{ name: 'developers' }]);
    });

    it('includes gid when defined', () => {
      const result = parseUsersFromRequest(
        withCustomizations({
          groups: [{ name: 'developers', gid: 1001 }],
        }),
      );
      expect(result.groups).toEqual([{ name: 'developers', gid: 1001 }]);
    });

    it('includes a gid of zero', () => {
      const result = parseUsersFromRequest(
        withCustomizations({
          groups: [{ name: 'root', gid: 0 }],
        }),
      );
      expect(result.groups).toEqual([{ name: 'root', gid: 0 }]);
    });

    it('omits gid when undefined', () => {
      const result = parseUsersFromRequest(
        withCustomizations({ groups: [{ name: 'developers' }] }),
      );
      expect(result.groups[0]).not.toHaveProperty('gid');
    });

    it('maps multiple groups with mixed gid presence', () => {
      const result = parseUsersFromRequest(
        withCustomizations({
          groups: [
            { name: 'developers', gid: 1001 },
            { name: 'ops' },
            { name: 'dba', gid: 1003 },
          ],
        }),
      );
      expect(result.groups).toEqual([
        { name: 'developers', gid: 1001 },
        { name: 'ops' },
        { name: 'dba', gid: 1003 },
      ]);
    });
  });
});
