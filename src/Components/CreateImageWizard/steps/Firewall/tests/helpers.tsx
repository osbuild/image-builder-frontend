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

import FirewallStep from '../index';

export const renderFirewallStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<FirewallStep />, wizardStateOverrides);
};

export const addPort = async (user: UserEventInstance, port: string) => {
  const input = await screen.findByPlaceholderText(/Enter port/i);
  await typeWithWait(user, input, `${port}{Enter}`);
};

export const addEnabledService = async (
  user: UserEventInstance,
  service: string,
) => {
  const inputs = await screen.findAllByPlaceholderText(
    /Enter firewalld service/i,
  );
  // First input is enabled services
  await typeWithWait(user, inputs[0], `${service}{Enter}`);
};

export const addDisabledService = async (
  user: UserEventInstance,
  service: string,
) => {
  const inputs = await screen.findAllByPlaceholderText(
    /Enter firewalld service/i,
  );
  // Second input is disabled services
  await typeWithWait(user, inputs[1], `${service}{Enter}`);
};

export const removeItem = async (user: UserEventInstance, item: string) => {
  const removeButton = await screen.findByRole('button', {
    name: `Close ${item}`,
  });
  await clickWithWait(user, removeButton);
};

export const clearPortInput = async (user: UserEventInstance) => {
  const input = await screen.findByPlaceholderText(/Enter port/i);
  await clearWithWait(user, input);
};

export const clearEnabledServiceInput = async (user: UserEventInstance) => {
  const inputs = await screen.findAllByPlaceholderText(
    /Enter firewalld service/i,
  );
  await clearWithWait(user, inputs[0]);
};

export const clearDisabledServiceInput = async (user: UserEventInstance) => {
  const inputs = await screen.findAllByPlaceholderText(
    /Enter firewalld service/i,
  );
  await clearWithWait(user, inputs[1]);
};
