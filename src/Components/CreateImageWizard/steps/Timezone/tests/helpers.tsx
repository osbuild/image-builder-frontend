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

import TimezoneStep from '../index';

export const renderTimezoneStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<TimezoneStep />, wizardStateOverrides);
};

export const openTimezoneDropdown = async (user: UserEventInstance) => {
  const dropdown = await screen.findByPlaceholderText(/Select a timezone/i);
  await clickWithWait(user, dropdown);
};

export const typeTimezone = async (
  user: UserEventInstance,
  timezone: string,
) => {
  const dropdown = await screen.findByPlaceholderText(/Select a timezone/i);
  await typeWithWait(user, dropdown, timezone);
};

export const clearTimezone = async (user: UserEventInstance) => {
  const dropdown = await screen.findByPlaceholderText(/Select a timezone/i);
  await clearWithWait(user, dropdown);
};

export const selectTimezoneOption = async (
  user: UserEventInstance,
  optionName: string | RegExp,
) => {
  const option = await screen.findByRole('option', { name: optionName });
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
