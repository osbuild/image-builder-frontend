import React from 'react';

import { screen } from '@testing-library/react';

import { clearUsersAndGroups, initialState } from '@/store/slices/wizard';
import {
  clearWithWait,
  clickWithWait,
  createUser,
  keyboardWithWait,
  renderWithRedux,
  tabWithWait,
  typeWithWait,
  waitForAction,
} from '@/test/testUtils';

import UserGroupsStep from '../index';

describe('UserGroups Component', () => {
  describe('Display groups', () => {
    test('shows an empty group row without storing it in Redux', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [],
        },
      });

      expect(
        await screen.findByRole('textbox', { name: /group name/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /group id/i })).toBeDisabled();
      expect(
        screen.getByRole('button', { name: /remove group/i }),
      ).toBeDisabled();
      expect(screen.getByRole('button', { name: /add group/i })).toBeDisabled();
      expect(store.getState().wizard.users.groups).toEqual([]);
    });

    test('keeps an empty row when stored groups are cleared', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [{ name: 'developers', gid: 1001 }],
        },
      });
      const groupInput = screen.getByRole('textbox', { name: /group name/i });
      const gidInput = screen.getByRole('textbox', { name: /group id/i });

      await waitForAction(() => {
        store.dispatch(clearUsersAndGroups());
      });

      expect(store.getState().wizard.users.groups).toEqual([]);
      expect(screen.getByRole('textbox', { name: /group name/i })).toBe(
        groupInput,
      );
      expect(groupInput).toHaveValue('');
      expect(gidInput).toHaveValue('');
      expect(gidInput).toBeDisabled();
    });

    test('stores the first non-empty name change without losing focus', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [],
        },
      });
      const user = createUser();

      const groupInput = await screen.findByRole('textbox', {
        name: /group name/i,
      });
      await typeWithWait(user, groupInput, 'd');

      expect(store.getState().wizard.users.groups).toEqual([{ name: 'd' }]);
      expect(groupInput).toHaveFocus();
      expect(screen.getByRole('textbox', { name: /group id/i })).toBeEnabled();
      expect(screen.getByRole('button', { name: /add group/i })).toBeEnabled();

      await keyboardWithWait(user, 'evelopers');

      expect(screen.getByRole('textbox', { name: /group name/i })).toBe(
        groupInput,
      );
      expect(groupInput).toHaveFocus();
      expect(groupInput).toHaveValue('developers');
      expect(store.getState().wizard.users.groups).toEqual([
        { name: 'developers' },
      ]);
    });

    test('does not store a whitespace-only display group', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />);
      const user = createUser();
      const groupInput = screen.getByRole('textbox', { name: /group name/i });

      await typeWithWait(user, groupInput, '   ');
      await tabWithWait(user);

      expect(groupInput).toHaveValue('   ');
      expect(store.getState().wizard.users.groups).toEqual([]);
      expect(screen.getByRole('textbox', { name: /group id/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /add group/i })).toBeDisabled();
    });

    test('adds and removes an empty display row without changing stored groups', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [{ name: 'developers' }],
        },
      });
      const user = createUser();

      await clickWithWait(
        user,
        screen.getByRole('button', { name: /add group/i }),
      );

      expect(
        screen.getAllByRole('textbox', { name: /group name/i }),
      ).toHaveLength(2);
      expect(store.getState().wizard.users.groups).toEqual([
        { name: 'developers' },
      ]);
      expect(screen.getByRole('button', { name: /add group/i })).toBeDisabled();

      await clickWithWait(
        user,
        screen.getAllByRole('button', { name: /remove group/i })[1],
      );

      expect(
        screen.getAllByRole('textbox', { name: /group name/i }),
      ).toHaveLength(1);
      expect(store.getState().wizard.users.groups).toEqual([
        { name: 'developers' },
      ]);
      expect(screen.getByRole('button', { name: /add group/i })).toBeEnabled();
    });

    test('stores an additional group without losing focus and validates duplicates', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [{ name: 'developers' }],
        },
      });
      const user = createUser();

      await clickWithWait(
        user,
        screen.getByRole('button', { name: /add group/i }),
      );
      const groupNameInput = screen.getAllByRole('textbox', {
        name: /group name/i,
      })[1];

      await typeWithWait(user, groupNameInput, 'developers');

      expect(groupNameInput).toHaveFocus();
      expect(groupNameInput).toHaveValue('developers');
      expect(store.getState().wizard.users.groups).toEqual([
        { name: 'developers' },
        { name: 'developers' },
      ]);
      expect(screen.getByRole('button', { name: /add group/i })).toBeDisabled();

      await tabWithWait(user);

      expect(
        screen.getByText('Duplicate group names: developers'),
      ).toBeVisible();
      await tabWithWait(user);

      expect(store.getState().wizard.users.groups).toEqual([
        { name: 'developers' },
        { name: 'developers' },
      ]);
      expect(groupNameInput).toHaveValue('developers');

      await clearWithWait(user, groupNameInput);
      await typeWithWait(user, groupNameInput, 'valid-group');

      expect(groupNameInput).toHaveFocus();
      expect(screen.getByRole('button', { name: /add group/i })).toBeEnabled();
      expect(store.getState().wizard.users.groups).toEqual([
        { name: 'developers' },
        { name: 'valid-group' },
      ]);
    });

    test('preserves an added group when other groups change', async () => {
      renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [{ name: 'developers' }, { name: 'admins' }],
        },
      });
      const user = createUser();

      await clickWithWait(
        user,
        screen.getByRole('button', { name: /add group/i }),
      );
      const groupInputs = screen.getAllByRole('textbox', {
        name: /group name/i,
      });
      const addedInput = groupInputs[2];

      await typeWithWait(user, addedInput, 'new-group');
      await typeWithWait(user, groupInputs[0], '-updated');

      expect(
        screen.getAllByRole('textbox', { name: /group name/i })[2],
      ).toHaveValue('new-group');

      await clickWithWait(
        user,
        screen.getAllByRole('button', { name: /remove group/i })[0],
      );

      expect(
        screen.getAllByRole('textbox', { name: /group name/i })[1],
      ).toHaveValue('new-group');
    });

    test('removing the last group clears its fields without replacing the row', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [{ name: 'developers', gid: 1001 }],
        },
      });
      const user = createUser();
      const groupInput = screen.getByRole('textbox', { name: /group name/i });
      const gidInput = screen.getByRole('textbox', { name: /group id/i });

      await clickWithWait(
        user,
        screen.getByRole('button', { name: /remove group/i }),
      );

      expect(store.getState().wizard.users.groups).toEqual([]);
      expect(screen.getByRole('textbox', { name: /group name/i })).toBe(
        groupInput,
      );
      expect(screen.getByRole('textbox', { name: /group id/i })).toBe(gidInput);
      expect(groupInput).toHaveValue('');
      expect(gidInput).toHaveValue('');
      expect(gidInput).toBeDisabled();
      expect(
        screen.queryByText('Group name is required'),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /remove group/i }),
      ).toBeDisabled();

      await typeWithWait(user, groupInput, 'admins');

      expect(groupInput).toHaveFocus();
      expect(store.getState().wizard.users.groups).toEqual([
        { name: 'admins' },
      ]);
      expect(screen.getByRole('button', { name: /add group/i })).toBeEnabled();
    });

    test('keeps a cleared name invalid until the stored group is removed', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [{ name: 'developers' }],
        },
      });
      const user = createUser();
      const groupInput = screen.getByRole('textbox', { name: /group name/i });
      const gidInput = screen.getByRole('textbox', { name: /group id/i });

      await clearWithWait(user, groupInput);
      await typeWithWait(user, gidInput, '!');

      expect(gidInput).toHaveValue('!');
      expect(store.getState().wizard.users.groups).toEqual([{ name: '' }]);
      expect(screen.getByText('Group name is required')).toBeVisible();
      expect(screen.getByRole('button', { name: /add group/i })).toBeDisabled();

      await clickWithWait(
        user,
        screen.getByRole('button', { name: /remove group/i }),
      );

      expect(store.getState().wizard.users.groups).toEqual([]);
      expect(groupInput).toHaveValue('');
      expect(gidInput).toHaveValue('');
      expect(gidInput).toBeDisabled();
      expect(
        screen.queryByText('Group name is required'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    test('pressing Enter in group name input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [],
        },
      });
      const user = createUser();

      const groupInput = await screen.findByRole('textbox', {
        name: /name/i,
      });
      await typeWithWait(user, groupInput, 'developers{Enter}');

      expect(groupInput).toBeInTheDocument();
      expect(store.getState().wizard.users.groups[0].name).toBe('developers');
    });

    test('persists an invalid group name for step validation', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [],
        },
      });
      const user = createUser();

      const groupInput = await screen.findByRole('textbox', {
        name: /group name/i,
      });
      await typeWithWait(user, groupInput, '!');

      expect(store.getState().wizard.users.groups[0].name).toBe('!');
      expect(screen.getByRole('button', { name: /add group/i })).toBeDisabled();
    });

    test('pressing Enter in group ID input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [
            {
              name: 'developers',
            },
          ],
        },
      });
      const user = createUser();

      const gidInput = await screen.findByRole('textbox', {
        name: /Group ID/i,
      });
      await typeWithWait(user, gidInput, '1001{Enter}');

      expect(gidInput).toBeInTheDocument();
      expect(store.getState().wizard.users.groups[0].name).toBe('developers');
      expect(store.getState().wizard.users.groups[0].gid).toBe(1001);
    });
  });
});
