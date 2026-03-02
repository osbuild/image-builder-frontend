import React from 'react';

import { screen } from '@testing-library/react';

import { RHEL_10 } from '@/constants';
import {
  clearWithWait,
  clickWithWait,
  renderWithRedux,
  typeWithWait,
  type UserEventInstance,
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
  await typeWithWait(user, searchbox, searchTerm);
};

export const clearSearchInput = async (user: UserEventInstance) => {
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await clearWithWait(user, searchbox);
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

export const clickSelectedButton = async (user: UserEventInstance) => {
  const selectedBtn = await screen.findByRole('button', { name: /selected/i });
  await clickWithWait(user, selectedBtn);
};
