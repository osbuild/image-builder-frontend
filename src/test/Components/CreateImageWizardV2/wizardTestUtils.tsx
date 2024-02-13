import React from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MockedRequest } from 'msw';

import CreateImageWizard from '../../../Components/CreateImageWizardV2/CreateImageWizard';
import { server } from '../../mocks/server';
import { renderCustomRoutesWithReduxRouter } from '../../testUtils';

export function spyOnRequest(pathname: string) {
  return new Promise((resolve) => {
    const listener = async (req: MockedRequest) => {
      if (req.url.pathname === pathname) {
        const requestData = await req.clone().json();
        resolve(requestData);
        // Cleanup listener after successful intercept
        server.events.removeListener('request:match', listener);
      }
    };

    server.events.on('request:match', listener);
  });
}

const routes = [
  {
    path: 'insights/image-builder/*',
    element: <div />,
  },
  {
    path: 'insights/image-builder/imagewizard/:composeId?',
    element: <CreateImageWizard />,
  },
];

export const render = async () => {
  await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
};

export const enterBlueprintName = async () => {
  const blueprintName = await screen.findByRole('textbox', {
    name: /blueprint name/i,
  });
  await userEvent.type(blueprintName, 'Red Velvet');
};

export const saveBlueprint = async () => {
  const saveButton = await screen.findByRole('button', {
    name: 'Save',
  });
  await userEvent.click(saveButton);
  const saveChangesButton = await screen.findByRole('menuitem', {
    name: 'Save changes',
  });
  await userEvent.click(saveChangesButton);
};
