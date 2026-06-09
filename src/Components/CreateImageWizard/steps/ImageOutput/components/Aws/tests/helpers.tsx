import React from 'react';

import { screen } from '@testing-library/react';

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
  return renderWithRedux(<Aws />, wizardStateOverrides);
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
