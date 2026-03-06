import { describe, expect, it } from 'vitest';

import wizardReducer, {
  addGroupToUserByUserIndex,
  addUser,
  addUserGroup,
  initialState,
  removeGroupFromUserByIndex,
  removeUser,
  removeUserGroup,
  setUserAdministratorByIndex,
  setUserGroupNameByIndex,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
  type UserWithAdditionalInfo,
  type wizardState,
} from '@/store/wizardSlice';

const createUserState = (users: UserWithAdditionalInfo[]): wizardState => ({
  ...initialState,
  users,
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

      expect(result.users).toHaveLength(1);
      expect(result.users[0].name).toBe('');
      expect(result.users[0].groups).toEqual([]);
      expect(result.users[0].isAdministrator).toBe(false);
    });

    it('should add multiple users', () => {
      let state = wizardReducer(initialState, addUser());
      state = wizardReducer(state, addUser());
      state = wizardReducer(state, addUser());

      expect(state.users).toHaveLength(3);
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

      expect(result.users).toHaveLength(2);
      expect(result.users[0].name).toBe('user1');
      expect(result.users[1].name).toBe('user3');
    });

    it('should handle removing last user', () => {
      const state = createUserState([createDefaultUser({ name: 'onlyuser' })]);

      const result = wizardReducer(state, removeUser(0));

      expect(result.users).toHaveLength(0);
    });
  });

  describe('setUserNameByIndex', () => {
    it('should update user name at index', () => {
      const state = createUserState([createDefaultUser()]);

      const result = wizardReducer(
        state,
        setUserNameByIndex({ index: 0, name: 'newname' }),
      );

      expect(result.users[0].name).toBe('newname');
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

      expect(result.users[0].password).toBe(FAKE_PASSWORD);
    });
  });

  describe('setUserSshKeyByIndex', () => {
    it('should update user SSH key at index', () => {
      const state = createUserState([createDefaultUser()]);

      const result = wizardReducer(
        state,
        setUserSshKeyByIndex({ index: 0, sshKey: 'ssh-rsa AAAAB...' }),
      );

      expect(result.users[0].ssh_key).toBe('ssh-rsa AAAAB...');
    });
  });

  describe('setUserAdministratorByIndex', () => {
    it('should add wheel group when setting user as administrator', () => {
      const state = createUserState([createDefaultUser()]);

      const result = wizardReducer(
        state,
        setUserAdministratorByIndex({ index: 0, isAdministrator: true }),
      );

      expect(result.users[0].isAdministrator).toBe(true);
      expect(result.users[0].groups).toContain('wheel');
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

      expect(result.users[0].isAdministrator).toBe(false);
      expect(result.users[0].groups).not.toContain('wheel');
      expect(result.users[0].groups).toContain('developers');
    });

    it('should preserve other groups when toggling administrator', () => {
      const state = createUserState([
        createDefaultUser({ groups: ['developers', 'docker'] }),
      ]);

      let result = wizardReducer(
        state,
        setUserAdministratorByIndex({ index: 0, isAdministrator: true }),
      );

      expect(result.users[0].groups).toEqual(['developers', 'docker', 'wheel']);

      result = wizardReducer(
        result,
        setUserAdministratorByIndex({ index: 0, isAdministrator: false }),
      );

      expect(result.users[0].groups).toEqual(['developers', 'docker']);
    });
  });

  describe('addGroupToUserByUserIndex', () => {
    it('should add a group to user', () => {
      const state = createUserState([createDefaultUser()]);

      const result = wizardReducer(
        state,
        addGroupToUserByUserIndex({ index: 0, group: 'developers' }),
      );

      expect(result.users[0].groups).toContain('developers');
    });

    it('should not add duplicate groups', () => {
      const state = createUserState([
        createDefaultUser({ groups: ['developers'] }),
      ]);

      const result = wizardReducer(
        state,
        addGroupToUserByUserIndex({ index: 0, group: 'developers' }),
      );

      expect(result.users[0].groups).toEqual(['developers']);
    });

    it('should set isAdministrator to true when adding wheel group', () => {
      const state = createUserState([createDefaultUser()]);

      const result = wizardReducer(
        state,
        addGroupToUserByUserIndex({ index: 0, group: 'wheel' }),
      );

      expect(result.users[0].groups).toContain('wheel');
      expect(result.users[0].isAdministrator).toBe(true);
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

      expect(result.users[0].groups).toEqual(['docker']);
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

      expect(result.users[0].groups).not.toContain('wheel');
      expect(result.users[0].isAdministrator).toBe(false);
    });

    it('should do nothing when removing non-existent group', () => {
      const state = createUserState([
        createDefaultUser({ groups: ['developers'] }),
      ]);

      const result = wizardReducer(
        state,
        removeGroupFromUserByIndex({ index: 0, group: 'nonexistent' }),
      );

      expect(result.users[0].groups).toEqual(['developers']);
    });
  });
});

describe('user group reducers', () => {
  describe('addUserGroup', () => {
    it('should add a new user group with auto-generated GID', () => {
      const result = wizardReducer(initialState, addUserGroup());

      // Initial state has one empty group, so this adds a second
      expect(result.userGroups.length).toBeGreaterThan(
        initialState.userGroups.length,
      );
      const newGroup = result.userGroups[result.userGroups.length - 1];
      expect(newGroup.name).toBe('');
      expect(newGroup.gid).toBeDefined();
    });

    it('should assign incrementing GIDs starting from 1000', () => {
      let state = wizardReducer(initialState, addUserGroup());
      state = wizardReducer(state, addUserGroup());

      // Filter out groups with GIDs
      const groupsWithGids = state.userGroups.filter(
        (g) => g.gid !== undefined,
      );
      const gids = groupsWithGids.map((g) => g.gid);

      // GIDs should be unique
      const uniqueGids = new Set(gids);
      expect(uniqueGids.size).toBe(gids.length);

      // GIDs should be >= 1000
      gids.forEach((gid) => {
        expect(gid).toBeGreaterThanOrEqual(1000);
      });
    });

    it('should skip already used GIDs', () => {
      const stateWithExistingGid: wizardState = {
        ...initialState,
        userGroups: [{ name: 'existing', gid: 1000 }],
      };

      const result = wizardReducer(stateWithExistingGid, addUserGroup());

      const newGroup = result.userGroups[result.userGroups.length - 1];
      expect(newGroup.gid).toBe(1001);
    });
  });

  describe('setUserGroupNameByIndex', () => {
    it('should update group name', () => {
      const state: wizardState = {
        ...initialState,
        userGroups: [{ name: '', gid: 1000 }],
      };

      const result = wizardReducer(
        state,
        setUserGroupNameByIndex({ index: 0, name: 'developers' }),
      );

      expect(result.userGroups[0].name).toBe('developers');
    });

    it('should trim whitespace from name', () => {
      const state: wizardState = {
        ...initialState,
        userGroups: [{ name: '', gid: 1000 }],
      };

      const result = wizardReducer(
        state,
        setUserGroupNameByIndex({ index: 0, name: '  developers  ' }),
      );

      expect(result.userGroups[0].name).toBe('developers');
    });

    it('should remove GID when name is set to empty', () => {
      const state: wizardState = {
        ...initialState,
        userGroups: [{ name: 'developers', gid: 1000 }],
      };

      const result = wizardReducer(
        state,
        setUserGroupNameByIndex({ index: 0, name: '' }),
      );

      expect(result.userGroups[0].name).toBe('');
      expect(result.userGroups[0].gid).toBeUndefined();
    });

    it('should assign GID when name is set on group without GID', () => {
      const state: wizardState = {
        ...initialState,
        userGroups: [{ name: '' }],
      };

      const result = wizardReducer(
        state,
        setUserGroupNameByIndex({ index: 0, name: 'developers' }),
      );

      expect(result.userGroups[0].name).toBe('developers');
      expect(result.userGroups[0].gid).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('removeUserGroup', () => {
    it('should remove user group at index', () => {
      const state: wizardState = {
        ...initialState,
        userGroups: [
          { name: 'group1', gid: 1000 },
          { name: 'group2', gid: 1001 },
          { name: 'group3', gid: 1002 },
        ],
      };

      const result = wizardReducer(state, removeUserGroup(1));

      expect(result.userGroups).toHaveLength(2);
      expect(result.userGroups[0].name).toBe('group1');
      expect(result.userGroups[1].name).toBe('group3');
    });
  });
});
