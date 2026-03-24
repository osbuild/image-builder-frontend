import React from 'react';

import { waitFor } from '@testing-library/react';

import {
  renderWithRedux,
  type UserEventInstance,
  waitForAction,
  type WizardStateOverrides,
} from '@/test/testUtils';

import FirstBootStep from '../index';

export const renderFirstBootStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<FirstBootStep />, wizardStateOverrides);
};

export const uploadScript = async (
  user: UserEventInstance,
  scriptContent: string,
) => {
  let fileInput: HTMLInputElement | null = null;

  await waitFor(() => {
    fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input not found');
    }
  });

  const file = new File([scriptContent], 'script.sh', { type: 'text/x-sh' });
  await waitForAction(() => user.upload(fileInput!, file));
};
