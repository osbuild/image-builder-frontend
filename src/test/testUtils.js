import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import ImportImageWizard from '../Components/CreateImageWizard/ImportImageWizard';
import LandingPage from '../Components/LandingPage/LandingPage';
import ShareImageModal from '../Components/ShareImageModal/ShareImageModal';
import {
  serviceMiddleware as middleware,
  serviceReducer as reducer,
  onPremMiddleware as onPremMiddleware,
  onPremReducer as onPremReducer,
} from '../store';
import { resolveRelPath } from '../Utilities/path';

const defaultRoutes = [
  {
    path: 'insights/image-builder/*',
    element: <LandingPage />,
  },
  {
    path: 'insights/image-builder/imagewizard/import',
    element: <ImportImageWizard />,
  },
  {
    path: 'insights/image-builder/share/:composeId',
    element: <ShareImageModal />,
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
  routes = process.env.IS_ON_PREMISE ? cockpitRoutes : defaultRoutes
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
      <RouterProvider router={router} />
    </Provider>
  );

  return { router, store };
};
