import React from 'react';

import { screen } from '@testing-library/react';

import { RHEL_10 } from '@/constants';
import {
  clickWithWait,
  renderWithRedux,
  typeWithWait,
  UserEventInstance,
  WizardStateOverrides,
} from '@/test/testUtils';

import RepositoriesStep from '..';

export const renderRepositoriesStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<RepositoriesStep />, {
    distribution: RHEL_10,
    architecture: 'x86_64',
    ...wizardStateOverrides,
  });
};

export const typeIntoSearchBox = async (
  user: UserEventInstance,
  searchTerm: string,
) => {
  const searchbox = await screen.findByRole('textbox', {
    name: /filter repositories/i,
  });
  await typeWithWait(user, searchbox, searchTerm);
};

export const selectRepo = async (user: UserEventInstance, repoName: string) => {
  await typeIntoSearchBox(user, repoName);
  const repoOption = await screen.findByRole('option', {
    name: new RegExp(repoName, 'i'),
  });
  await clickWithWait(user, repoOption);
};

export const removeRepo = async (user: UserEventInstance) => {
  const removerRepoButton = await screen.findByRole('button', {
    name: /remove repository/i,
  });
  await clickWithWait(user, removerRepoButton);
};
