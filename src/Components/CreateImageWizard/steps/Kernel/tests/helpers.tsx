import React from 'react';

import { screen } from '@testing-library/react';

import {
  clickWithWait,
  renderWithRedux,
  typeWithWait,
  type UserEventInstance,
  type WizardStateOverrides,
} from '@/test/testUtils';

import KernelStep from '../index';

export const renderKernelStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<KernelStep />, wizardStateOverrides);
};

export const openKernelNameDropdown = async (user: UserEventInstance) => {
  const dropdown = await screen.findByRole('button', {
    name: /Select default kernel/i,
  });
  await clickWithWait(user, dropdown);
};

export const clearKernelName = async (user: UserEventInstance) => {
  const toggle = await screen.findByRole('button', {
    name: /kernel/i,
  });
  await clickWithWait(user, toggle);
  await selectKernelOption(user, 'None');
};

export const selectKernelOption = async (
  user: UserEventInstance,
  optionName: string | RegExp,
) => {
  const option = await screen.findByRole('option', { name: optionName });
  await clickWithWait(user, option);
};

export const addKernelArgument = async (
  user: UserEventInstance,
  argument: string,
) => {
  const input = await screen.findByPlaceholderText(/Add kernel argument/i);
  await typeWithWait(user, input, `${argument}{Enter}`);
};

export const removeKernelArgument = async (
  user: UserEventInstance,
  argument: string,
) => {
  const removeButton = await screen.findByRole('button', {
    name: `Remove ${argument}`,
  });
  await clickWithWait(user, removeButton);
};
