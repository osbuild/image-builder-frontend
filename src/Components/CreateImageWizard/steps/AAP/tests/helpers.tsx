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

import AAPStep from '../index';

export const renderAAPStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<AAPStep />, wizardStateOverrides);
};

export const enterCallbackUrl = async (
  user: UserEventInstance,
  url: string,
) => {
  const input = await screen.findByRole('textbox', {
    name: /ansible callback url/i,
  });
  await clearWithWait(user, input);
  await typeWithWait(user, input, url);
};

export const enterHostConfigKey = async (
  user: UserEventInstance,
  key: string,
) => {
  const input = await screen.findByRole('textbox', {
    name: /host config key/i,
  });
  await clearWithWait(user, input);
  await typeWithWait(user, input, key);
};

export const enterCertificate = async (
  user: UserEventInstance,
  certificate: string,
) => {
  const input = await screen.findByRole('textbox', {
    name: /file upload/i,
  });
  await clearWithWait(user, input);
  await typeWithWait(user, input, certificate);
};

export const toggleInsecureCheckbox = async (user: UserEventInstance) => {
  const checkbox = await screen.findByRole('checkbox', { name: /insecure/i });
  await clickWithWait(user, checkbox);
};
