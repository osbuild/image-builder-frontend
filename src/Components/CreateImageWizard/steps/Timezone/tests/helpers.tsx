import React from 'react';

import { screen } from '@testing-library/react';

import {
  clickWithWait,
  renderWithRedux,
  typeWithWait,
  type UserEventInstance,
  type WizardStateOverrides,
} from '@/test/testUtils';

import TimezoneStep from '../index';

export const renderTimezoneStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<TimezoneStep />, wizardStateOverrides);
};

export const openTimezoneDropdown = async (user: UserEventInstance) => {
  const toggle = await screen.findByRole('button', {
    name: /Select a timezone/i,
  });
  await clickWithWait(user, toggle);
};

export const typeTimezone = async (
  user: UserEventInstance,
  timezone: string,
) => {
  const searchInput = await screen.findByLabelText(/Filter timezone/i);
  await typeWithWait(user, searchInput, timezone);
};

export const selectTimezoneOption = async (
  user: UserEventInstance,
  optionName: string | RegExp,
) => {
  const option = await screen.findByRole('menuitem', { name: optionName });
  await clickWithWait(user, option);
};

export const addNtpServer = async (user: UserEventInstance, server: string) => {
  const input = await screen.findByPlaceholderText(/Add NTP servers/i);
  await typeWithWait(user, input, `${server}{Enter}`);
};

export const removeNtpServer = async (
  user: UserEventInstance,
  server: string,
) => {
  const removeButton = await screen.findByRole('button', {
    name: `Remove ${server}`,
  });
  await clickWithWait(user, removeButton);
};
