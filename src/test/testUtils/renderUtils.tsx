import React, { ReactElement } from 'react';

import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { render, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';

import {
  onPremMiddleware,
  onPremReducer,
  RootState,
  serviceMiddleware,
  serviceReducer,
} from '@/store';
import { initialState } from '@/store/slices/wizard';

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
  const isOnPremise = preloadedState?.env?.isOnPremise;

  const store = configureStore({
    // this makes typescript quite unhappy. I think it should
    // be fine for now since this is just for our test suite.
    // @ts-expect-error see above note
    reducer: isOnPremise ? onPremReducer : serviceReducer,
    middleware: isOnPremise ? onPremMiddleware : serviceMiddleware,
    preloadedState: {
      wizard: {
        ...initialState,
        ...wizardStateOverrides,
      },
      ...preloadedState,
    },
  });

  const view = render(<Provider store={store}>{component}</Provider>);

  return { ...view, store };
};
