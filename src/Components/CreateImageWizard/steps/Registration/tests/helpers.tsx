import React from 'react';

import { screen } from '@testing-library/react';

import {
  clickWithWait,
  renderWithRedux,
  type RenderWithReduxOptions,
  typeWithWait,
  type UserEventInstance,
  type WizardStateOverrides,
} from '@/test/testUtils';

import RegistrationStep from '../index';

export const renderRegistrationStep = (
  wizardStateOverrides: WizardStateOverrides = {},
  options: RenderWithReduxOptions = {},
) => {
  return renderWithRedux(<RegistrationStep />, wizardStateOverrides, options);
};

export const selectAutomaticRegistration = async (user: UserEventInstance) => {
  const radio = await screen.findByRole('radio', {
    name: /automatically register to red hat/i,
  });
  await clickWithWait(user, radio);
};

export const selectRegisterLater = async (user: UserEventInstance) => {
  const radio = await screen.findByRole('radio', {
    name: /register later/i,
  });
  await clickWithWait(user, radio);
};

export const selectSatelliteRegistration = async (user: UserEventInstance) => {
  const radio = await screen.findByRole('radio', {
    name: /register for a satellite or capsule server/i,
  });
  await clickWithWait(user, radio);
};

export const toggleInsights = async (user: UserEventInstance) => {
  const toggle = await screen.findByRole('switch', {
    name: /enable predictive analytics/i,
  });
  await clickWithWait(user, toggle);
};

export const toggleRhc = async (user: UserEventInstance) => {
  const toggle = await screen.findByRole('switch', {
    name: /enable remote remediations/i,
  });
  await clickWithWait(user, toggle);
};

export const enterActivationKey = async (
  user: UserEventInstance,
  key: string,
) => {
  const input = await screen.findByRole('textbox', {
    name: /activation key/i,
  });
  await typeWithWait(user, input, key);
};

export const enterOrgId = async (user: UserEventInstance, orgId: string) => {
  const input = await screen.findByRole('textbox', {
    name: /organization id/i,
  });
  await typeWithWait(user, input, orgId);
};

export const enterSatelliteCommand = async (
  user: UserEventInstance,
  command: string,
) => {
  const input = await screen.findByRole('textbox', {
    name: /registration command/i,
  });
  await typeWithWait(user, input, command);
};
