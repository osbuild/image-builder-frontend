import React from 'react';

import { screen } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import { renderWithRedux, type WizardStateOverrides } from '@/test/testUtils';

import NoUsersAlert from '../NoUsersAlert';

const testUser = {
  name: 'testuser',
  password: '',
  ssh_key: '',
  isAdministrator: false,
  groups: [],
  hasPassword: false,
};

const imageModeOverrides = (
  overrides: WizardStateOverrides = {},
): WizardStateOverrides => ({
  details: {
    ...initialState.details,
    blueprint: { ...initialState.details.blueprint, mode: 'image' },
  },
  output: {
    ...initialState.output,
    imageTypes: ['guest-image'],
  },
  ...overrides,
});

describe('NoUsersAlert', () => {
  test('warns when a disk image has no users', async () => {
    renderWithRedux(<NoUsersAlert />, imageModeOverrides());

    expect(await screen.findByText(/no users added/i)).toBeInTheDocument();
    expect(screen.getByText(/cloud-init/i)).toBeInTheDocument();
  });

  test('does not warn for the container installer', () => {
    renderWithRedux(
      <NoUsersAlert />,
      imageModeOverrides({
        output: {
          ...initialState.output,
          imageTypes: ['bootable-container-iso'],
        },
      }),
    );

    expect(screen.queryByText(/no users added/i)).not.toBeInTheDocument();
  });

  test('does not warn when a user is configured', () => {
    renderWithRedux(
      <NoUsersAlert />,
      imageModeOverrides({
        system: {
          ...initialState.system,
          users: [testUser],
        },
      }),
    );

    expect(screen.queryByText(/no users added/i)).not.toBeInTheDocument();
  });

  test('does not warn in package mode', () => {
    renderWithRedux(<NoUsersAlert />, {
      output: {
        ...initialState.output,
        imageTypes: ['guest-image'],
      },
    });

    expect(screen.queryByText(/no users added/i)).not.toBeInTheDocument();
  });
});
