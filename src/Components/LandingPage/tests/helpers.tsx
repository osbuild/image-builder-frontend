import React from 'react';

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { createTestStore, type RenderWithReduxOptions } from '@/test/testUtils';

import LandingPage from '../LandingPage';

export const renderLandingPage = (options: RenderWithReduxOptions = {}) => {
  const store = createTestStore({}, options);

  const routes = [
    {
      path: '/',
      element: <LandingPage />,
    },
  ];

  const router = createMemoryRouter(routes, {
    initialEntries: ['/'],
  });

  const view = render(
    <Provider store={store}>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
    </Provider>,
  );

  return { ...view, store };
};
