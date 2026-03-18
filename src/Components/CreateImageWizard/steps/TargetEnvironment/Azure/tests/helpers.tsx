import React from 'react';

import { screen } from '@testing-library/react';

import {
  clickWithWait,
  renderWithRedux,
  typeWithWait,
  UserEventInstance,
  WizardStateOverrides,
} from '@/test/testUtils';

import Azure from '..';

export const renderAzureStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<Azure />, wizardStateOverrides);
};

export const checkHyperVGenValue = async (value: string) => {
  const hyperVDropdownToggle = await screen.findByRole('button', {
    name: value,
  });
  expect(hyperVDropdownToggle).toBeInTheDocument();
};

export const checkTenantGuidValue = async (value: string) => {
  const tenantGuidInput = await screen.findByPlaceholderText(
    /Enter your 36-character GUID/i,
  );
  expect(tenantGuidInput).toHaveValue(value);
};

export const checkSubscriptionIdValue = async (value: string) => {
  const subscriptionIdInput = await screen.findByPlaceholderText(
    /Enter your 36-character ID/i,
  );
  expect(subscriptionIdInput).toHaveValue(value);
};

export const checkResourceGroupValue = async (value: string) => {
  const resourceGroupInput = await screen.findByPlaceholderText(
    /Enter your resource group/i,
  );
  expect(resourceGroupInput).toHaveValue(value);
};

export const openHyperVGenerationDropdown = async (user: UserEventInstance) => {
  const hyperVDropdownToggle = await screen.findByRole('button', {
    name: 'Generation 2 (UEFI)',
  });
  await clickWithWait(user, hyperVDropdownToggle);
};

export const fillTenantGuidValue = async (
  user: UserEventInstance,
  value: string,
) => {
  const tenantGuidInput = await screen.findByPlaceholderText(
    /Enter your 36-character GUID/i,
  );
  await typeWithWait(user, tenantGuidInput, value);
};

export const fillSubscriptionIdValue = async (
  user: UserEventInstance,
  value: string,
) => {
  const subscriptionIdInput = await screen.findByPlaceholderText(
    /Enter your 36-character ID/i,
  );
  await typeWithWait(user, subscriptionIdInput, value);
};

export const fillResourceGroupValue = async (
  user: UserEventInstance,
  value: string,
) => {
  const resourceGroupInput = await screen.findByPlaceholderText(
    /Enter your resource group/i,
  );
  await typeWithWait(user, resourceGroupInput, value);
};

export const clearInputValue = async (
  user: UserEventInstance,
  index: number,
) => {
  const clearInputButton = await screen.findAllByRole('button', {
    name: /clear input/i,
  });
  await clickWithWait(user, clearInputButton[index]);
};
