import { describe, expect, it } from 'vitest';

import {
  addGroupToUserByUserIndex,
  addUser,
  initialState,
  removeGroupFromUserByIndex,
  removeUser,
  removeUserGroup,
  setUserAdministratorByIndex,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
  upsertUserGroup,
  type UserWithAdditionalInfo,
  wizardReducer,
  type WizardState,
} from '@/store/slices/wizard';

const createUserState = (users: UserWithAdditionalInfo[]): WizardState => ({
  ...initialState,
  users: {
    ...initialState.users,
    users,
  },
});

const createDefaultUser = (
  overrides: Partial<UserWithAdditionalInfo> = {},
): UserWithAdditionalInfo => ({
  name: 'testuser',
  password: '',
  ssh_key: '',
  groups: [],
  isAdministrator: false,
  hasPassword: false,
  ...overrides,
});

describe('user reducers', () => {
  describe('addUser', () => {
    it('should add a new user with default values', () => {
      const result = wizardReducer(initialState, addUser());

      expect(result.users.users).toHaveLength(1);
      expect(result.users.users[0].name).toBe('');
      expect(result.users.users[0].groups).toEqual([]);
      expect(result.users.users[0].isAdministrator).toBe(false);
    });

    it('should add multiple users', () => {
      let state = wizardReducer(initialState, addUser());
      state = wizardReducer(state, addUser());
      state = wizardReducer(state, addUser());

      expect(state.users.users).toHaveLength(3);
    });
  });

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

  describe('setUserNameByIndex', () => {
    it('should update user name at index', () => {
      const state = createUserState([createDefaultUser()]);

      const result = wizardReducer(
        state,
        setUserNameByIndex({ index: 0, name: 'newname' }),
      );

      expect(result.users.users[0].name).toBe('newname');
    });
  });

  describe('setUserPasswordByIndex', () => {
    it('should update user password at index', () => {
      const state = createUserState([createDefaultUser()]);
      const FAKE_PASSWORD = 'secretpass'; // notsecret

      const result = wizardReducer(
        state,
        setUserPasswordByIndex({ index: 0, password: FAKE_PASSWORD }),
      );

      expect(result.users.users[0].password).toBe(FAKE_PASSWORD);
    });
  });

  describe('setUserSshKeyByIndex', () => {
    it('should update user SSH key at index', () => {
      const state = createUserState([createDefaultUser()]);

      const result = wizardReducer(
        state,
        setUserSshKeyByIndex({ index: 0, sshKey: 'ssh-rsa AAAAB...' }),
      );

      expect(result.users.users[0].ssh_key).toBe('ssh-rsa AAAAB...');
    });
  });

  describe('setUserAdministratorByIndex', () => {
    it('should add wheel group when setting user as administrator', () => {
      const state = createUserState([createDefaultUser()]);

      const result = wizardReducer(
        state,
        setUserAdministratorByIndex({ index: 0, isAdministrator: true }),
      );

      expect(result.users.users[0].isAdministrator).toBe(true);
      expect(result.users.users[0].groups).toContain('wheel');
    });

    it('should remove wheel group when unsetting administrator', () => {
      const state = createUserState([
        createDefaultUser({
          groups: ['wheel', 'developers'],
          isAdministrator: true,
        }),
      ]);

      const result = wizardReducer(
        state,
        setUserAdministratorByIndex({ index: 0, isAdministrator: false }),
      );

      expect(result.users.users[0].isAdministrator).toBe(false);
      expect(result.users.users[0].groups).not.toContain('wheel');
      expect(result.users.users[0].groups).toContain('developers');
    });

    it('should preserve other groups when toggling administrator', () => {
      const state = createUserState([
        createDefaultUser({ groups: ['developers', 'docker'] }),
      ]);

      let result = wizardReducer(
        state,
        setUserAdministratorByIndex({ index: 0, isAdministrator: true }),
      );

      expect(result.users.users[0].groups).toEqual([
        'developers',
        'docker',
        'wheel',
      ]);

      result = wizardReducer(
        result,
        setUserAdministratorByIndex({ index: 0, isAdministrator: false }),
      );

      expect(result.users.users[0].groups).toEqual(['developers', 'docker']);
    });

    it('should not duplicate wheel when user already has it', () => {
      const state = createUserState([
        createDefaultUser({ groups: ['wheel'], isAdministrator: true }),
      ]);

      const result = wizardReducer(
        state,
        setUserAdministratorByIndex({ index: 0, isAdministrator: true }),
      );

      expect(result.users.users[0].groups).toEqual(['wheel']);
    });
  });

  describe('addGroupToUserByUserIndex', () => {
    it('should add a group to user', () => {
      const state = createUserState([createDefaultUser()]);

      const result = wizardReducer(
        state,
        addGroupToUserByUserIndex({ index: 0, group: 'developers' }),
      );

      expect(result.users.users[0].groups).toContain('developers');
    });

    it('should not add duplicate groups', () => {
      const state = createUserState([
        createDefaultUser({ groups: ['developers'] }),
      ]);

      const result = wizardReducer(
        state,
        addGroupToUserByUserIndex({ index: 0, group: 'developers' }),
      );

      expect(result.users.users[0].groups).toEqual(['developers']);
    });

    it('should set isAdministrator to true when adding wheel group', () => {
      const state = createUserState([createDefaultUser()]);

      const result = wizardReducer(
        state,
        addGroupToUserByUserIndex({ index: 0, group: 'wheel' }),
      );

      expect(result.users.users[0].groups).toContain('wheel');
      expect(result.users.users[0].isAdministrator).toBe(true);
    });
  });

  describe('removeGroupFromUserByIndex', () => {
    it('should remove a group from user', () => {
      const state = createUserState([
        createDefaultUser({ groups: ['developers', 'docker'] }),
      ]);

      const result = wizardReducer(
        state,
        removeGroupFromUserByIndex({ index: 0, group: 'developers' }),
      );

      expect(result.users.users[0].groups).toEqual(['docker']);
    });

    it('should set isAdministrator to false when removing wheel group', () => {
      const state = createUserState([
        createDefaultUser({
          groups: ['wheel', 'developers'],
          isAdministrator: true,
        }),
      ]);

      const result = wizardReducer(
        state,
        removeGroupFromUserByIndex({ index: 0, group: 'wheel' }),
      );

      expect(result.users.users[0].groups).not.toContain('wheel');
      expect(result.users.users[0].isAdministrator).toBe(false);
    });

    it('should do nothing when removing non-existent group', () => {
      const state = createUserState([
        createDefaultUser({ groups: ['developers'] }),
      ]);

      const result = wizardReducer(
        state,
        removeGroupFromUserByIndex({ index: 0, group: 'nonexistent' }),
      );

      expect(result.users.users[0].groups).toEqual(['developers']);
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
