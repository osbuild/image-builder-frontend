import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { RootState, serviceMiddleware, serviceReducer } from '@/store';
import { changeBlueprintName, setIsCustomName } from '@/store/slices/wizard';

import CreateImageWizard from '../CreateImageWizard';

// insights-chrome remounts this module routinely, so the wizard must treat a
// remount as a continuation rather than a fresh start. Guarding initialization
// with a ref silently discarded whatever the user had already entered.
const renderWizardWithStore = (store: ReturnType<typeof makeStore>) => {
  const router = createMemoryRouter(
    [{ path: 'insights/image-builder/', element: <CreateImageWizard /> }],
    { initialEntries: ['/insights/image-builder/'] },
  );

  return render(
    <Provider store={store}>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </Provider>,
  );
};

const makeStore = () =>
  configureStore({
    reducer: serviceReducer,
    middleware: serviceMiddleware,
    preloadedState: {
      wizardModal: {
        isModalOpen: true,
        mode: 'create' as const,
        hasInitialized: false,
      },
    } as Partial<RootState>,
  });

describe('wizard re-initialization', () => {
  test('a remount does not discard details the user already entered', async () => {
    const store = makeStore();

    const view = renderWizardWithStore(store);
    await screen.findByRole('heading', { name: /image output/i });

    // Mirrors what typing in the Details step dispatches.
    act(() => {
      store.dispatch(changeBlueprintName('my-blueprint'));
      store.dispatch(setIsCustomName());
    });
    expect(store.getState().wizard.details.blueprint.name).toBe('my-blueprint');

    view.unmount();

    renderWizardWithStore(store);
    await screen.findByRole('heading', { name: /image output/i });

    expect(store.getState().wizard.details.blueprint.name).toBe('my-blueprint');
  });
});
