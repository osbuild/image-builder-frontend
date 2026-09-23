import React from 'react';

import { screen } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import { createUser, renderWithRedux, typeWithWait } from '@/test/testUtils';

import UserGroupsStep from '../index';

describe('UserGroups Component', () => {
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
