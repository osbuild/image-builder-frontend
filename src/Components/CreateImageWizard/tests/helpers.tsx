import React from 'react';

import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import TOML from 'smol-toml';

import { RootState, serviceMiddleware, serviceReducer } from '@/store';
import { BlueprintItem } from '@/store/api/backend';
import { mapOnPremToHosted } from '@/store/api/backend/onprem/composerApi/helpers/blueprintMapper';
import { parseStateFromRequest } from '@/store/slices/wizard';
import {
  clickWithWait,
  createUser,
  keyboardWithWait,
  UserEventInstance,
} from '@/test/testUtils';

import CreateImageWizard from '../CreateImageWizard';

type RenderWizardOptions = {
  preloadedState?: Partial<RootState>;
  initialRoute?: string;
  waitForHeading?: RegExp;
};

const renderWizard = async (
  options: RenderWizardOptions = {},
): Promise<{ store: EnhancedStore<RootState> }> => {
  const {
    preloadedState = {},
    initialRoute = '/insights/image-builder/',
    waitForHeading,
  } = options;

  const store = configureStore({
    reducer: serviceReducer,
    middleware: serviceMiddleware,
    preloadedState,
  });

  const routes = [
    {
      path: 'insights/image-builder/',
      element: <CreateImageWizard />,
    },
  ];

  const router = createMemoryRouter(routes, {
    initialEntries: [initialRoute],
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

  if (waitForHeading) {
    await screen.findByRole('heading', { name: waitForHeading });
  }

  return { store };
};

export const renderWithQueryParams = async (
  queryString: string = '',
): Promise<{ store: EnhancedStore<RootState> }> => {
  return renderWizard({
    preloadedState: {
      wizardModal: {
        isModalOpen: true,
        mode: 'create' as const,
      },
    },
    initialRoute: `/insights/image-builder${queryString}`,
    waitForHeading: /image output/i,
  });
};

export const renderCreateMode = async (): Promise<{
  store: EnhancedStore<RootState>;
}> => {
  return renderWizard({
    preloadedState: {
      wizardModal: {
        isModalOpen: true,
        mode: 'create' as const,
      },
    },
    initialRoute: '/insights/image-builder/',
    waitForHeading: /image output/i,
  });
};

export const renderEditMode = async (
  blueprintId: string,
): Promise<{ store: EnhancedStore<RootState> }> => {
  return renderWizard({
    preloadedState: {
      wizardModal: {
        isModalOpen: true,
        mode: 'edit' as const,
      },
      blueprints: {
        selectedBlueprintId: blueprintId,
        searchInput: undefined,
        offset: 0,
        limit: 10,
        versionFilter: 'latest' as const,
      },
    },
    initialRoute: '/insights/image-builder/',
    waitForHeading: /review image configuration/i,
  });
};

export const renderImportMode = async (
  blueprintToml: string,
): Promise<{ store: EnhancedStore<RootState> }> => {
  const tomlBlueprint = TOML.parse(blueprintToml);
  const blueprintFromFile = await mapOnPremToHosted(
    tomlBlueprint as BlueprintItem,
  );
  const importBlueprintState = parseStateFromRequest(blueprintFromFile);

  return renderWizard({
    preloadedState: {
      wizardModal: {
        isModalOpen: true,
        mode: 'import' as const,
      },
      wizard: importBlueprintState,
    },
    initialRoute: '/insights/image-builder/',
    waitForHeading: /build an image/i,
  });
};

export const testCheckbox = async (checkbox: HTMLElement) => {
  const user = createUser();

  checkbox.focus();
  await keyboardWithWait(user, ' ');
  expect(checkbox).toBeChecked();
};

export const selectGuestImage = async (user: UserEventInstance) => {
  await clickWithWait(
    user,
    await screen.findByRole('checkbox', {
      name: /virtualization guest image/i,
    }),
  );
};

export const selectRegisterLater = async (user: UserEventInstance) => {
  await clickWithWait(
    user,
    await screen.findByRole('radio', { name: /register later/i }),
  );
};
