import React from 'react';

import { screen } from '@testing-library/react';

import {
  clearWithWait,
  renderWithRedux,
  typeWithWait,
  type UserEventInstance,
  type WizardStateOverrides,
} from '@/test/testUtils';

import DetailsStep from '../index';

export const renderDetailsStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<DetailsStep />, wizardStateOverrides);
};

export const enterBlueprintName = async (
  user: UserEventInstance,
  name: string,
) => {
  const input = await screen.findByRole('textbox', {
    name: /blueprint name/i,
  });
  await clearWithWait(user, input);
  await typeWithWait(user, input, name);
};

export const enterBlueprintDescription = async (
  user: UserEventInstance,
  description: string,
) => {
  const input = await screen.findByRole('textbox', {
    name: /blueprint description/i,
  });
  await clearWithWait(user, input);
  await typeWithWait(user, input, description);
};

export const clearBlueprintName = async (user: UserEventInstance) => {
  const input = await screen.findByRole('textbox', {
    name: /blueprint name/i,
  });
  await clearWithWait(user, input);
};

export const clearBlueprintDescription = async (user: UserEventInstance) => {
  const input = await screen.findByRole('textbox', {
    name: /blueprint description/i,
  });
  await clearWithWait(user, input);
};
