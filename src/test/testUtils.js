import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import CreateImageWizard from '../Components/CreateImageWizard/CreateImageWizard';
import LandingPage from '../Components/LandingPage/LandingPage';
import ShareImageModal from '../Components/ShareImageModal/ShareImageModal';
import { middleware, reducer } from '../store';
import { resolveRelPath } from '../Utilities/path';

export const renderCustomRoutesWithReduxRouter = (
  route = '/',
  preloadedState = {},
  routes
) => {
  const store = configureStore({ reducer, middleware, preloadedState });

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

export const clickBack = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /Back/ }));
};

export const clickNext = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /Next/ }));
};

export const clickCancel = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /Cancel/ }));
};

export const getNextButton = async () => {
  const next = await screen.findByRole('button', { name: /Next/ });
  return next;
};

export const verifyCancelButton = async (router) => {
  await clickCancel();
  expect(router.state.location.pathname).toBe('/insights/image-builder');
};
