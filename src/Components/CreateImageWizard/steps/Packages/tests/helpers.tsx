import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RHEL_10 } from '@/constants';
import { renderWithRedux, type WizardStateOverrides } from '@/test/testUtils';

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
  user: ReturnType<typeof userEvent.setup>,
  searchTerm: string,
) => {
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await waitFor(() => user.type(searchbox, searchTerm));
};

export const clearSearchInput = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await waitFor(() => user.clear(searchbox));
};

export const clickPackageCheckbox = async (
  user: ReturnType<typeof userEvent.setup>,
  rowIndex: number,
) => {
  const checkbox = await screen.findByRole('checkbox', {
    name: new RegExp(`select row ${rowIndex}`, 'i'),
  });
  await waitFor(() => user.click(checkbox));
};

export const toggleSelectedPackages = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  const selectedBtn = await screen.findByRole('button', { name: /selected/i });
  await waitFor(() => user.click(selectedBtn));
};
