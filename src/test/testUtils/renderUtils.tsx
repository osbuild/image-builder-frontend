import React, { ReactElement } from 'react';

import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { render, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';

import { PlatformProvider } from '@/context/platform';
import { hostedPlatform } from '@/context/platform/hosted';
import { onPremPlatform } from '@/context/platform/onprem';
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
  const store = createTestStore(wizardStateOverrides, options);
  const isOnPremise = options.preloadedState?.env?.isOnPremise;
  const platform = isOnPremise ? onPremPlatform : hostedPlatform;
  const view = render(
    <Provider store={store}>
      <PlatformProvider value={platform}>{component}</PlatformProvider>
    </Provider>,
  );
  return { ...view, store };
};

export const createTestStore = (
  wizardStateOverrides: WizardStateOverrides = {},
  options: RenderWithReduxOptions = {},
): EnhancedStore<RootState> => {
  const { preloadedState } = options;
  const isOnPremise = preloadedState?.env?.isOnPremise;

  return configureStore({
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
};
