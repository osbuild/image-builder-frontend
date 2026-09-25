import { describe, expect, it } from 'vitest';

import { createMockState } from '../../tests/mockWizardState';
import { mapUsersCustomizations } from '../mappers';
import { initialState } from '../state';
import type { UsersSlice } from '../types';

const createState = (overrides: Partial<UsersSlice> = {}) =>
  createMockState({
    users: { ...initialState, ...overrides },
  });

describe('mapUsersCustomizations', () => {
  describe('users', () => {
    it('includes users with name and ssh key', () => {
      const state = createState({
        users: [
          {
            name: 'admin',
            password: '',
            ssh_key: 'ssh-rsa AAAA...',
            groups: ['wheel'],
            isAdministrator: true,
            hasPassword: false,
          },
        ],
      });
      const result = mapUsersCustomizations(state);
      expect(result.users).toEqual([
        expect.objectContaining({
          name: 'admin',
          ssh_key: 'ssh-rsa AAAA...',
          groups: ['wheel'],
        }),
      ]);
    });

    it('omits empty password and ssh_key fields', () => {
      const state = createState({
        users: [
          {
            name: 'testuser',
            password: '',
            ssh_key: '',
            groups: [],
            isAdministrator: false,
            hasPassword: false,
          },
        ],
      });
      const result = mapUsersCustomizations(state);
      expect(result.users![0]).not.toHaveProperty('password');
      expect(result.users![0]).not.toHaveProperty('ssh_key');
      expect(result.users![0]).not.toHaveProperty('groups');
    });

    it('filters out users with no name, password, ssh_key, or groups', () => {
      const state = createState({
        users: [
          {
            name: '',
            password: '',
            ssh_key: '',
            groups: [],
            isAdministrator: false,
            hasPassword: false,
          },
        ],
      });
      expect(mapUsersCustomizations(state)).not.toHaveProperty('users');
    });

    it('omits users key when no users', () => {
      const state = createState({ users: [] });
      expect(mapUsersCustomizations(state)).not.toHaveProperty('users');
    });
  });

  describe('groups', () => {
    it('includes groups with name', () => {
      const state = createState({
        groups: [{ name: 'developers', gid: 1001 }],
      });
      const result = mapUsersCustomizations(state);
      expect(result.groups).toEqual([{ name: 'developers', gid: 1001 }]);
    });

    it('preserves a zero gid', () => {
      const state = createState({
        groups: [{ name: 'root', gid: 0 }],
      });
      expect(mapUsersCustomizations(state).groups).toEqual([
        { name: 'root', gid: 0 },
      ]);
    });

    it('filters out groups with empty name', () => {
      const state = createState({
        groups: [{ name: '' }],
      });
      expect(mapUsersCustomizations(state)).not.toHaveProperty('groups');
    });

    it('omits gid when not set', () => {
      const state = createState({
        groups: [{ name: 'mygroup' }],
      });
      const result = mapUsersCustomizations(state);
      expect(result.groups![0]).not.toHaveProperty('gid');
    });
  });
});
