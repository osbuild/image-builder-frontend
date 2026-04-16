import React from 'react';

import { screen, within } from '@testing-library/react';

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

export const clickAddLanguage = async (user: UserEventInstance) => {
  const addButton = await screen.findByRole('button', {
    name: /add language/i,
  });
  await clickWithWait(user, addButton);
  const toggle = await screen.findByRole('button', {
    name: /select a language/i,
  });
  await clickWithWait(user, toggle);
};

export const removeLanguageAtIndex = async (
  user: UserEventInstance,
  index: number,
) => {
  const removeButtons = screen.getAllByRole('button', {
    name: /remove language/i,
  });
  await clickWithWait(user, removeButtons[index]);
};

export const searchForLanguage = async (
  user: UserEventInstance,
  search: string,
) => {
  const searchInput = await screen.findByLabelText(/search by name/i);
  await typeWithWait(user, searchInput, search);
};

export const clearLanguageSearch = async (user: UserEventInstance) => {
  const searchInput = screen.getByLabelText(/search by name/i);
  await clearWithWait(user, searchInput);
};

export const selectLanguageOption = async (
  user: UserEventInstance,
  optionName: string | RegExp,
) => {
  const option = await screen.findByRole('menuitem', { name: optionName });
  await clickWithWait(user, option);
};

export const searchForKeyboard = async (
  user: UserEventInstance,
  search: string,
) => {
  const keyboardGroup = screen.getByRole('group', { name: /keyboard/i });
  const toggle = within(keyboardGroup).getByRole('button', {
    name: /select a keyboard|Menu toggle/i,
  });
  await clickWithWait(user, toggle);
  const searchInput = await screen.findByLabelText(/search by name/i);
  await typeWithWait(user, searchInput, search);
};

export const clearKeyboardSearch = async (user: UserEventInstance) => {
  const searchInput = screen.getByLabelText(/search by name/i);
  await clearWithWait(user, searchInput);
};

export const selectKeyboardOption = async (
  user: UserEventInstance,
  optionName: string | RegExp,
) => {
  const option = await screen.findByRole('menuitem', { name: optionName });
  await clickWithWait(user, option);
};
