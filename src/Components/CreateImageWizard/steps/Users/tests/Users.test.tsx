import React from 'react';

import { screen, within } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import {
  clickWithWait,
  createUser,
  renderWithRedux,
  typeWithWait,
} from '@/test/testUtils';

import UsersStep from '../index';

describe('Users Component', () => {
  describe('User removal', () => {
    test('allows cancelling and removes only the selected user when confirmed', async () => {
      const { store } = renderWithRedux(<UsersStep />, {
        users: {
          ...initialState.users,
          users: [
            {
              name: 'firstuser',
              password: '',
              ssh_key: '',
              groups: [],
              hasPassword: false,
            },
            {
              name: 'seconduser',
              password: '',
              ssh_key: '',
              groups: [],
              hasPassword: false,
            },
          ],
        },
      });
      const user = createUser();

      await clickWithWait(
        user,
        screen.getAllByRole('button', { name: 'Remove user' })[1],
      );

      let dialog = screen.getByRole('dialog');
      expect(
        within(dialog).getByText('Remove user seconduser?'),
      ).toBeInTheDocument();
      expect(screen.getAllByRole('dialog')).toHaveLength(1);

      await clickWithWait(
        user,
        within(dialog).getByRole('button', { name: 'Cancel' }),
      );
      expect(
        store.getState().wizard.users.users.map(({ name }) => name),
      ).toEqual(['firstuser', 'seconduser']);

      await clickWithWait(
        user,
        screen.getAllByRole('button', { name: 'Remove user' })[1],
      );
      dialog = screen.getByRole('dialog');
      await clickWithWait(
        user,
        within(dialog).getByRole('button', { name: 'Remove user' }),
      );

      expect(
        store.getState().wizard.users.users.map(({ name }) => name),
      ).toEqual(['firstuser']);
    });
  });

  describe('Form submission', () => {
    test('pressing Enter in username input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<UsersStep />);
      expect(store.getState().wizard.users.users).toEqual([]);

      const user = createUser();

      const usernameInput = await screen.findByRole('textbox', {
        name: /user name/i,
      });
      await typeWithWait(user, usernameInput, 'testuser{Enter}');

      expect(usernameInput).toBeInTheDocument();
      expect(store.getState().wizard.users.users[0].name).toBe('testuser');
    });

    test('pressing Enter in password input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<UsersStep />, {
        users: {
          ...initialState.users,
          users: [
            {
              name: 'testuser',
              password: '',
              ssh_key: '',
              groups: [],
              hasPassword: false,
            },
          ],
        },
      });
      const user = createUser();

      const passwordInput = await screen.findByPlaceholderText(/set password/i);
      await typeWithWait(user, passwordInput, 'SecurePass123{Enter}');

      expect(passwordInput).toBeInTheDocument();
      expect(store.getState().wizard.users.users[0].password).toBe(
        'SecurePass123',
      );
    });

    test('pressing Enter in SSH key input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<UsersStep />, {
        users: {
          ...initialState.users,
          users: [
            {
              name: 'testuser',
              password: '',
              ssh_key: '',
              groups: [],
              hasPassword: false,
            },
          ],
        },
      });
      const user = createUser();

      const sshKeyInput = await screen.findByRole('textbox', {
        name: /public ssh key/i,
      });
      await typeWithWait(
        user,
        sshKeyInput,
        'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ{Enter}',
      );

      expect(sshKeyInput).toBeInTheDocument();
      expect(store.getState().wizard.users.users[0].ssh_key).toBe(
        'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ',
      );
    });
  });

  describe('Password guidance', () => {
    test('shows plain text warning and openssl hint on-prem', async () => {
      renderWithRedux(
        <UsersStep />,
        {},
        {
          preloadedState: {
            env: { isOnPremise: true },
          },
        },
      );

      expect(
        await screen.findByText(/stored in plain text on this host/i),
      ).toBeInTheDocument();
      expect(screen.getByText('openssl passwd -6')).toBeInTheDocument();
    });

    test('does not show the plain text warning in the hosted service', async () => {
      renderWithRedux(<UsersStep />, {});

      await screen.findByText(/create user accounts/i);

      expect(
        screen.queryByText(/stored in plain text/i),
      ).not.toBeInTheDocument();
    });
  });
});
