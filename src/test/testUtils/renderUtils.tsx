import React, { ReactElement } from 'react';

import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { render, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';

import { RootState, serviceMiddleware, serviceReducer } from '@/store';
import { initialState } from '@/store/wizardSlice';

export type WizardStateOverrides = Partial<typeof initialState>;

export type RenderWithReduxResult = RenderResult & {
  store: EnhancedStore<RootState>;
};

export type RenderWithReduxOptions = {
  preloadedState?: Partial<RootState>;
};

export const renderWithRedux = (
  component: ReactElement,
  wizardStateOverrides: WizardStateOverrides = {},
  options: RenderWithReduxOptions = {},
): RenderWithReduxResult => {
  const { preloadedState } = options;

  const store = configureStore({
    reducer: serviceReducer,
    middleware: serviceMiddleware,
    preloadedState: preloadedState ?? {
      wizard: {
        ...initialState,
        ...wizardStateOverrides,
      },
    },
  });

  const view = render(<Provider store={store}>{component}</Provider>);

  return { ...view, store };
};
