import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import ImportImageWizard from '../Components/CreateImageWizard/ImportImageWizard';
import LandingPage from '../Components/LandingPage/LandingPage';
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
  {
    path: 'insights/image-builder/imagewizard/import',
    element: <ImportImageWizard />,
  },
];

const cockpitRoutes = [
  {
    path: '/*',
    element: <LandingPage />,
  },
];

export const renderCustomRoutesWithReduxRouter = (
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

  render(
    <Provider store={store}>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
    </Provider>,
  );

  return { router, store };
};
