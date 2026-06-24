import React from 'react';

import { screen } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import {
  clickWithWait,
  renderWithRedux,
  tabWithWait,
  typeWithWait,
  type UserEventInstance,
  type WizardStateOverrides,
} from '@/test/testUtils';

import HostnameStep from '../index';

export const renderHostnameStep = (
  systemOverrides: Partial<typeof initialState.system> = {},
) => {
  const wizardStateOverrides: WizardStateOverrides =
    Object.keys(systemOverrides).length > 0
      ? { system: { ...initialState.system, ...systemOverrides } }
      : {};
  return renderWithRedux(<HostnameStep />, wizardStateOverrides);
};

export const enterHostname = async (
  user: UserEventInstance,
  hostname: string,
) => {
  const hostnameInput = await screen.findByPlaceholderText(/Add a hostname/i);
  await typeWithWait(user, hostnameInput, hostname);
};

export const clearHostname = async (user: UserEventInstance) => {
  const clearButton = await screen.findByRole('button', {
    name: /Clear hostname/i,
  });
  await clickWithWait(user, clearButton);
};

export const tabAway = async (user: UserEventInstance) => {
  await tabWithWait(user);
};
