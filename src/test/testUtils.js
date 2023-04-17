import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import CreateImageWizard from '../Components/CreateImageWizard/CreateImageWizard';
import LandingPage from '../Components/LandingPage/LandingPage';
import ShareImageModal from '../Components/ShareImageModal/ShareImageModal';
import { middleware, reducer } from '../store';
import { resolveRelPath } from '../Utilities/path';

export const renderWithReduxRouter = (route = '/', preloadedState = {}) => {
  const store = configureStore({ reducer, middleware, preloadedState });

  const routes = [
    {
      path: 'insights/image-builder/*',
      element: <LandingPage />,
    },
    {
      path: 'insights/image-builder/imagewizard/:composeId?',
      element: <CreateImageWizard />,
    },
    {
      path: 'insights/image-builder/share/:composeId',
      element: <ShareImageModal />,
    },
  ];

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

export const renderWithProvider = (
  component,
  container,
  preloadedState = {}
) => {
  const store = configureStore({ reducer, middleware, preloadedState });

  return render(<Provider store={store}>{component}</Provider>, {
    container: container,
  });
};
