import React from 'react';

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { PlatformProvider } from '@/context/platform';
import { hostedPlatform } from '@/context/platform/hosted';
import { onPremPlatform } from '@/context/platform/onprem';
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

  const isOnPremise = options.preloadedState?.env?.isOnPremise;
  const platform = isOnPremise ? onPremPlatform : hostedPlatform;
  const view = render(
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

  return { ...view, store };
};
