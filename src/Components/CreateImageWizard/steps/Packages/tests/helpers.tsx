import React from 'react';

import { screen } from '@testing-library/react';

import { RHEL_10 } from '@/constants';
import {
  clickWithWait,
  renderWithRedux,
  type UserEventInstance,
  waitForAction,
  type WizardStateOverrides,
} from '@/test/testUtils';

import PackagesStep from '../index';

export const renderPackagesStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<PackagesStep />, {
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
    name: /search packages/i,
  });
  await waitForAction(() => user.type(searchbox, searchTerm));
};

export const clearSearchInput = async (user: UserEventInstance) => {
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await waitForAction(() => user.clear(searchbox));
};

export const clickPackageCheckbox = async (
  user: UserEventInstance,
  rowIndex: number,
) => {
  const checkbox = await screen.findByRole('checkbox', {
    name: new RegExp(`select row ${rowIndex}`, 'i'),
  });
  await clickWithWait(user, checkbox);
};
