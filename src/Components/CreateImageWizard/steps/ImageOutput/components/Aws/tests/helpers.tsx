import React from 'react';

import { screen } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import {
  renderWithRedux,
  typeWithWait,
  UserEventInstance,
  WizardStateOverrides,
} from '@/test/testUtils';

import Aws from '..';

export const renderAwsStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  const cloudProviders = wizardStateOverrides.cloudProviders;
  return renderWithRedux(<Aws />, {
    ...wizardStateOverrides,
    cloudProviders: {
      ...initialState.cloudProviders,
      ...cloudProviders,
      aws: cloudProviders?.aws ?? { shareMethod: 'manual', accountId: '' },
    },
  });
};

export const checkAccountIdValue = async (value: string) => {
  const accountIdInput = await screen.findByRole('textbox', {
    name: /aws account id/i,
  });
  expect(accountIdInput).toHaveValue(value);
};

export const fillAccountIdValue = async (
  user: UserEventInstance,
  value: string,
) => {
  const accountIdInput = await screen.findByRole('textbox', {
    name: /aws account id/i,
  });
  await typeWithWait(user, accountIdInput, value);
};
