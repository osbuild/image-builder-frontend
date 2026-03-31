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

import LocaleStep from '../index';

export const renderLocaleStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<LocaleStep />, wizardStateOverrides);
};

export const searchForLanguage = async (
  user: UserEventInstance,
  search: string,
) => {
  const input = await screen.findByPlaceholderText(/select a language/i);
  await typeWithWait(user, input, search);
};

export const clearLanguageSearch = async (user: UserEventInstance) => {
  const input = await screen.findByPlaceholderText(/select a language/i);
  await clearWithWait(user, input);
};

export const selectLanguageOption = async (
  user: UserEventInstance,
  optionName: string | RegExp,
) => {
  const option = await screen.findByRole('option', { name: optionName });
  await clickWithWait(user, option);
};

export const searchForKeyboard = async (
  user: UserEventInstance,
  search: string,
) => {
  const input = await screen.findByPlaceholderText(/select a keyboard/i);
  await typeWithWait(user, input, search);
};

export const clearKeyboardSearch = async (user: UserEventInstance) => {
  const input = await screen.findByPlaceholderText(/select a keyboard/i);
  await clearWithWait(user, input);
};

export const selectKeyboardOption = async (
  user: UserEventInstance,
  optionName: string | RegExp,
) => {
  const option = await screen.findByRole('option', { name: optionName });
  await clickWithWait(user, option);
};
