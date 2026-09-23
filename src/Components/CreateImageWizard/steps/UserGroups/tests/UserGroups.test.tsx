import React from 'react';

import { screen } from '@testing-library/react';

import { clearUsersAndGroups, initialState } from '@/store/slices/wizard';
import {
  clearWithWait,
  clickWithWait,
  createUser,
  renderWithRedux,
  tabWithWait,
  typeWithWait,
  waitForAction,
} from '@/test/testUtils';

import UserGroupsStep from '../index';

describe('UserGroups Component', () => {
  describe('Draft groups', () => {
    test('shows a draft group without storing it in Redux', async () => {
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
      expect(store.getState().wizard.users.groups).toEqual([]);
    });

    test('shows a draft group when committed groups are cleared', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [{ name: 'developers' }],
        },
      });

      await waitForAction(() => {
        store.dispatch(clearUsersAndGroups());
      });

      expect(store.getState().wizard.users.groups).toEqual([]);
      expect(
        await screen.findByRole('textbox', { name: /group id/i }),
      ).toBeDisabled();
    });

    test('commits the draft when a group name is entered', async () => {
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

      expect(store.getState().wizard.users.groups).toEqual([]);
      expect(screen.getByRole('textbox', { name: /group id/i })).toBeEnabled();

      await tabWithWait(user);

      expect(store.getState().wizard.users.groups).toEqual([{ name: 'd' }]);
    });

    test('does not commit a draft when the GID field loses focus', async () => {
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
      await tabWithWait(user);

      expect(
        screen.getByText('Duplicate group names: developers'),
      ).toBeVisible();
      expect(store.getState().wizard.users.groups).toEqual([
        { name: 'developers' },
      ]);

      await tabWithWait(user);

      expect(store.getState().wizard.users.groups).toEqual([
        { name: 'developers' },
      ]);
      expect(groupNameInput).toHaveValue('developers');

      await clearWithWait(user, groupNameInput);
      await typeWithWait(user, groupNameInput, 'valid-group');
      await tabWithWait(user);

      expect(store.getState().wizard.users.groups).toEqual([
        { name: 'developers' },
        { name: 'valid-group' },
      ]);
    });

    test('preserves draft input when committed groups change', async () => {
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
      const draftInput = groupInputs[2];

      await typeWithWait(user, draftInput, 'draft');
      await typeWithWait(user, groupInputs[0], '-updated');

      expect(
        screen.getAllByRole('textbox', { name: /group name/i })[2],
      ).toHaveValue('draft');

      await clickWithWait(
        user,
        screen.getAllByRole('button', { name: /remove group/i })[0],
      );

      expect(
        screen.getAllByRole('textbox', { name: /group name/i })[1],
      ).toHaveValue('draft');
    });
  });

  describe('Form submission', () => {
    test('pressing Enter in group name input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<UserGroupsStep />, {
        users: {
          ...initialState.users,
          groups: [
            {
              name: '',
            },
          ],
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
          groups: [{ name: '' }],
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
