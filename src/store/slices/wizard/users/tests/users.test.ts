import { describe, expect, it } from 'vitest';

import {
  initialState,
  removeUser,
  removeUserGroup,
  upsertUserGroup,
  type User,
  wizardReducer,
  type WizardState,
} from '@/store/slices/wizard';

const createUserState = (users: User[]): WizardState => ({
  ...initialState,
  users: {
    ...initialState.users,
    users,
  },
});

const createDefaultUser = (overrides: Partial<User> = {}): User => ({
  name: 'testuser',
  password: '',
  ssh_key: '',
  groups: [],
  hasPassword: false,
  ...overrides,
});

describe('user reducers', () => {
  describe('removeUser', () => {
    it('should remove user at specified index', () => {
      const state = createUserState([
        createDefaultUser({ name: 'user1' }),
        createDefaultUser({ name: 'user2' }),
        createDefaultUser({ name: 'user3' }),
      ]);

      const result = wizardReducer(state, removeUser(1));

      expect(result.users.users).toHaveLength(2);
      expect(result.users.users[0].name).toBe('user1');
      expect(result.users.users[1].name).toBe('user3');
    });

    it('should handle removing last user', () => {
      const state = createUserState([createDefaultUser({ name: 'onlyuser' })]);

      const result = wizardReducer(state, removeUser(0));

      expect(result.users.users).toHaveLength(0);
    });
  });
});

describe('user group reducers', () => {
  describe('upsertUserGroup', () => {
    it('should append a group when no index is provided', () => {
      const state: WizardState = {
        ...initialState,
        users: {
          ...initialState.users,
          groups: [],
        },
      };

      const result = wizardReducer(
        state,
        upsertUserGroup({ group: { name: 'developers' } }),
      );

      expect(result.users.groups).toEqual([{ name: 'developers' }]);
    });

    it('should replace a group at the specified index', () => {
      const state: WizardState = {
        ...initialState,
        users: {
          ...initialState.users,
          groups: [{ name: 'developers' }, { name: 'docker', gid: 1001 }],
        },
      };

      const result = wizardReducer(
        state,
        upsertUserGroup({ index: 1, group: { name: 'containers' } }),
      );

      expect(result.users.groups).toEqual([
        { name: 'developers' },
        { name: 'containers', gid: 1001 },
      ]);
    });

    it('should clear a group GID when it is explicitly undefined', () => {
      const state: WizardState = {
        ...initialState,
        users: {
          ...initialState.users,
          groups: [{ name: 'developers', gid: 1001 }],
        },
      };

      const result = wizardReducer(
        state,
        upsertUserGroup({ index: 0, group: { gid: undefined } }),
      );

      expect(result.users.groups).toEqual([{ name: 'developers' }]);
    });

    it.each([-1, 2, 0.5])(
      'should ignore an invalid group index: %s',
      (index) => {
        const state: WizardState = {
          ...initialState,
          users: {
            ...initialState.users,
            groups: [{ name: 'developers' }, { name: 'docker' }],
          },
        };

        const result = wizardReducer(
          state,
          upsertUserGroup({ index, group: { name: 'containers' } }),
        );

        expect(result.users.groups).toEqual([
          { name: 'developers' },
          { name: 'docker' },
        ]);
      },
    );
  });

  describe('removeUserGroup', () => {
    it('should remove user group at index', () => {
      const state: WizardState = {
        ...initialState,
        users: {
          ...initialState.users,
          groups: [
            { name: 'group1', gid: 1000 },
            { name: 'group2', gid: 1001 },
            { name: 'group3', gid: 1002 },
          ],
        },
      };

      const result = wizardReducer(state, removeUserGroup(1));

      expect(result.users.groups).toHaveLength(2);
      expect(result.users.groups[0].name).toBe('group1');
      expect(result.users.groups[1].name).toBe('group3');
    });
  });
});
