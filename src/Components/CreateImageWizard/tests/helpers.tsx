import React from 'react';

import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { RootState, serviceMiddleware, serviceReducer } from '@/store';

import CreateImageWizard3 from '../../CreateImageWizard3/CreateImageWizard3';

export const renderWithQueryParams = async (
  queryString: string = '',
): Promise<{ store: EnhancedStore<RootState> }> => {
  const store = configureStore({
    reducer: serviceReducer,
    middleware: serviceMiddleware,
    preloadedState: {
      wizardModal: {
        isModalOpen: true,
        mode: 'create' as const,
      },
    },
  });

  const routes = [
    {
      path: 'insights/image-builder/',
      element: <CreateImageWizard3 />,
    },
  ];

  const router = createMemoryRouter(routes, {
    initialEntries: [`/insights/image-builder${queryString}`],
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

  await screen.findByRole('heading', { name: /image output/i });

  return { store };
};
