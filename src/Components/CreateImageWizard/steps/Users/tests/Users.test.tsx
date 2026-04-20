import React from 'react';

import { screen } from '@testing-library/react';

import { createUser, renderWithRedux, typeWithWait } from '@/test/testUtils';

import UsersStep from '../index';

describe('Users Component', () => {
  describe('Form submission', () => {
    test('pressing Enter in username input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<UsersStep />, {
        users: [
          {
            name: '',
            password: '',
            ssh_key: '',
            isAdministrator: false,
            groups: [],
            hasPassword: false,
          },
        ],
      });
      const user = createUser();

      const usernameInput = await screen.findByRole('textbox', {
        name: /user name/i,
      });
      await typeWithWait(user, usernameInput, 'testuser{Enter}');

      expect(usernameInput).toBeInTheDocument();
      expect(store.getState().wizard.users[0].name).toBe('testuser');
    });

    test('pressing Enter in password input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<UsersStep />, {
        users: [
          {
            name: 'testuser',
            password: '',
            ssh_key: '',
            isAdministrator: false,
            groups: [],
            hasPassword: false,
          },
        ],
      });
      const user = createUser();

      const passwordInput = await screen.findByPlaceholderText(/set password/i);
      await typeWithWait(user, passwordInput, 'SecurePass123{Enter}');

      expect(passwordInput).toBeInTheDocument();
      expect(store.getState().wizard.users[0].password).toBe('SecurePass123');
    });

    test('pressing Enter in SSH key input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<UsersStep />, {
        users: [
          {
            name: 'testuser',
            password: '',
            ssh_key: '',
            isAdministrator: false,
            groups: [],
            hasPassword: false,
          },
        ],
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
      expect(store.getState().wizard.users[0].ssh_key).toBe(
        'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ',
      );
    });
  });
});
