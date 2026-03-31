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
    name: /search package/i,
  });
  await typeWithWait(user, searchbox, searchTerm);
};

export const clickOnSearchBox = async (user: UserEventInstance) => {
  const searchbox = await screen.findByRole('textbox', {
    name: /search package/i,
  });
  await clickWithWait(user, searchbox);
};

export const clearSearchInput = async (user: UserEventInstance) => {
  const searchbox = await screen.findByRole('textbox', {
    name: /search package/i,
  });
  await clearWithWait(user, searchbox);
};

export const switchToPackageGroups = async (user: UserEventInstance) => {
  const dropdownButton = await screen.findByRole('button', {
    name: /individual packages/i,
  });
  await clickWithWait(user, dropdownButton);
  const groupsOption = await screen.findByText(/package groups/i);
  await clickWithWait(user, groupsOption);
};

export const openPackageDetails = async (user: UserEventInstance) => {
  const expandableButton = await screen.findByRole('button', {
    name: /details/i,
  });
  await clickWithWait(user, expandableButton);
};

export const selectPkgOption = async (
  user: UserEventInstance,
  name: string,
) => {
  const options = await screen.findAllByRole('option', {
    name: new RegExp(name, 'i'),
  });
  await clickWithWait(user, options[0]);
};
