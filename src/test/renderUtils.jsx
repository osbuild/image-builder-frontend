// TODO: This legacy render utility derives platform from process.env.IS_ON_PREMISE.
// New tests should use src/test/testUtils/renderUtils.tsx which reads platform
// from Redux state (options.preloadedState.env.isOnPremise), enabling per-test
// platform switching without env-var manipulation.
import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import LandingPage from '../Components/LandingPage/LandingPage';
import { PlatformProvider } from '../context/platform';
import { hostedPlatform } from '../context/platform/hosted';
import { onPremPlatform } from '../context/platform/onprem';
import {
  serviceMiddleware as middleware,
  onPremMiddleware as onPremMiddleware,
  onPremReducer as onPremReducer,
  serviceReducer as reducer,
} from '../store';

// Test-only utility for resolving paths outside React components
const resolveRelPath = (path = '') => {
  if (process.env.IS_ON_PREMISE) {
    return path.length > 0 ? path : '/';
  }
  return `/insights/image-builder${path.length > 0 ? `/${path}` : ''}`;
};

const defaultRoutes = [
  {
    path: 'insights/image-builder/*',
    element: <LandingPage />,
  },
];

const cockpitRoutes = [
  {
    path: '/*',
    element: <LandingPage />,
  },
];

export const renderCustomRoutesWithReduxRouter = async (
  route = '/',
  preloadedState = {},
  routes = process.env.IS_ON_PREMISE ? cockpitRoutes : defaultRoutes,
) => {
  const mw = process.env.IS_ON_PREMISE ? onPremMiddleware : middleware;
  const red = process.env.IS_ON_PREMISE ? onPremReducer : reducer;
  const store = configureStore({
    reducer: red,
    middleware: mw,
    preloadedState,
  });

  const router = createMemoryRouter(routes, {
    initialEntries: [resolveRelPath(route)],
  });

  const platform = process.env.IS_ON_PREMISE ? onPremPlatform : hostedPlatform;

  render(
    <Provider store={store}>
      <PlatformProvider value={platform}>
        <RouterProvider
          router={router}
          future={{
            v7_startTransition: true,
          }}
        />
      </PlatformProvider>
    </Provider>,
  );

  return { router, store };
};
