import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';

import { RHEL_10 } from '../../../../../constants';
import { serviceMiddleware, serviceReducer } from '../../../../../store';
import { initialState } from '../../../../../store/wizardSlice';
import PackagesStep from '../index';

export type WizardStateOverrides = Partial<typeof initialState>;

export const renderPackagesStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  const store = configureStore({
    reducer: serviceReducer,
    middleware: serviceMiddleware,
    preloadedState: {
      wizard: {
        ...initialState,
        distribution: RHEL_10,
        architecture: 'x86_64',
        ...wizardStateOverrides,
      },
    },
  });

  const result = render(
    <Provider store={store}>
      <PackagesStep />
    </Provider>,
  );

  return { ...result, store };
};

export const typeIntoSearchBox = async (
  user: ReturnType<typeof userEvent.setup>,
  searchTerm: string,
) => {
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await waitFor(() => user.type(searchbox, searchTerm));
};

export const clearSearchInput = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await waitFor(() => user.clear(searchbox));
};

export const clickPackageCheckbox = async (
  user: ReturnType<typeof userEvent.setup>,
  rowIndex: number,
) => {
  const checkbox = await screen.findByRole('checkbox', {
    name: new RegExp(`select row ${rowIndex}`, 'i'),
  });
  await waitFor(() => user.click(checkbox));
};

export const toggleSelectedPackages = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  const selectedBtn = await screen.findByRole('button', { name: /selected/i });
  await waitFor(() => user.click(selectedBtn));
};
