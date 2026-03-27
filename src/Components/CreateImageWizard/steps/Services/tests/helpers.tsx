import React from 'react';

import { screen } from '@testing-library/react';

import {
  clearWithWait,
  clickWithWait,
  renderWithRedux,
  typeWithWait,
  type UserEventInstance,
  type WizardStateOverrides,
} from '@/test/testUtils';

import ServicesStep from '../index';

export const renderServicesStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<ServicesStep />, wizardStateOverrides);
};

export const addEnabledService = async (
  user: UserEventInstance,
  service: string,
) => {
  const input = await screen.findByPlaceholderText(/Add enabled service/i);
  await typeWithWait(user, input, `${service}{Enter}`);
};

export const addDisabledService = async (
  user: UserEventInstance,
  service: string,
) => {
  const input = await screen.findByPlaceholderText(/Add disabled service/i);
  await typeWithWait(user, input, `${service}{Enter}`);
};

export const addMaskedService = async (
  user: UserEventInstance,
  service: string,
) => {
  const input = await screen.findByPlaceholderText(/Add masked service/i);
  await typeWithWait(user, input, `${service}{Enter}`);
};

export const removeService = async (
  user: UserEventInstance,
  service: string,
) => {
  const removeButton = await screen.findByRole('button', {
    name: `Remove ${service}`,
  });
  await clickWithWait(user, removeButton);
};

export const clearEnabledServiceInput = async (user: UserEventInstance) => {
  const input = await screen.findByPlaceholderText(/Add enabled service/i);
  await clearWithWait(user, input);
};

export const clearDisabledServiceInput = async (user: UserEventInstance) => {
  const input = await screen.findByPlaceholderText(/Add disabled service/i);
  await clearWithWait(user, input);
};

export const clearMaskedServiceInput = async (user: UserEventInstance) => {
  const input = await screen.findByPlaceholderText(/Add masked service/i);
  await clearWithWait(user, input);
};
