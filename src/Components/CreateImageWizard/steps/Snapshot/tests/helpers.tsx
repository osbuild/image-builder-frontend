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

import RepeatableBuildStep from '..';

export const renderRepeatableBuildStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<RepeatableBuildStep />, wizardStateOverrides);
};

export const selectDisableRepeatableBuild = async (user: UserEventInstance) => {
  const snapshotDisabledRadio = await screen.findByRole('radio', {
    name: /Disable repeatable build/i,
  });
  await clickWithWait(user, snapshotDisabledRadio);
};

export const selectEnableRepeatableBuild = async (user: UserEventInstance) => {
  const snapshotRadio = await screen.findByRole('radio', {
    name: /Enable repeatable build/i,
  });
  await clickWithWait(user, snapshotRadio);
};

export const clickClearDate = async (user: UserEventInstance) => {
  const clearButton = await screen.findByRole('button', {
    name: /clear date/i,
  });
  await clickWithWait(user, clearButton);
};

export const clickTodaysDate = async (user: UserEventInstance) => {
  const todaysDateButton = await screen.findByRole('button', {
    name: /today's date/i,
  });
  await clickWithWait(user, todaysDateButton);
};

export const clearAndFillDatePickerInput = async (
  user: UserEventInstance,
  input: string,
) => {
  const dateInput = await screen.findByRole('textbox', {
    name: /date picker/i,
  });

  await clearWithWait(user, dateInput);
  await typeWithWait(user, dateInput, input);
};

export const checkDatePickerValue = async (value: string) => {
  const datePickerInput = await screen.findByRole('textbox', {
    name: /date picker/i,
  });
  expect(datePickerInput).toHaveValue(value);
};

export const selectUseAContentTemplate = async (user: UserEventInstance) => {
  const templateRadio = await screen.findByRole('radio', {
    name: /Use a content template/i,
  });
  await clickWithWait(user, templateRadio);
};

export const openTemplateDropdown = async (user: UserEventInstance) => {
  const templateDropdown = await screen.findByRole('button', {
    name: /Select content template/i,
  });
  await clickWithWait(user, templateDropdown);
};

export const selectTemplate = async (
  user: UserEventInstance,
  templateName: string,
) => {
  const templateDropdown = await screen.findByRole('button', {
    name: /Select content template/i,
  });
  await clickWithWait(user, templateDropdown);

  const templateOption = await screen.findByRole('menuitem', {
    name: new RegExp(templateName),
  });
  await clickWithWait(user, templateOption);
};

export const fillTemplateSearch = async (
  user: UserEventInstance,
  searchTerm: string,
) => {
  const templateSearchInput = await screen.findByRole('textbox', {
    name: /filter content templates/i,
  });
  await typeWithWait(user, templateSearchInput, searchTerm);
};

export const checkTemplatesCount = async (expectedCount: number) => {
  const templates = await screen.findAllByRole('menuitem');
  expect(templates).toHaveLength(expectedCount);
};
