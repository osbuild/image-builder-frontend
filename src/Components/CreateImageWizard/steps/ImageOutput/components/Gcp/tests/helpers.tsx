import React from 'react';

import { screen } from '@testing-library/react';

import {
  clickWithWait,
  renderWithRedux,
  typeWithWait,
  UserEventInstance,
  WizardStateOverrides,
} from '@/test/testUtils';

import Gcp from '..';

export const renderGcpStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<Gcp />, wizardStateOverrides);
};

export const checkAccountTypeValue = async (value: string) => {
  const accountTypeToggle = await screen.findByRole('button', {
    name: new RegExp(value, 'i'),
  });
  expect(accountTypeToggle).toBeInTheDocument();
};

export const checkPrincipalValue = async (value: string) => {
  const principalInput = await screen.findByRole('textbox', {
    name: /google principal/i,
  });
  expect(principalInput).toHaveValue(value);
};

export const selectAccountType = async (
  user: UserEventInstance,
  accountTypeLabel: string,
) => {
  const accountTypeToggle = await screen.findByRole('button', {
    name: /Select account type|Google account|Service account|Google group|Google Workspace domain/i,
  });
  await clickWithWait(user, accountTypeToggle);

  const option = await screen.findByRole('option', { name: accountTypeLabel });
  await clickWithWait(user, option);
};

export const fillPrincipalValue = async (
  user: UserEventInstance,
  value: string,
) => {
  const principalInput = await screen.findByRole('textbox', {
    name: /google principal/i,
  });
  await typeWithWait(user, principalInput, value);
};
