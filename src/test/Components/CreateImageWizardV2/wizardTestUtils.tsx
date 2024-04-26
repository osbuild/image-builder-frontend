import React from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MockedRequest } from 'msw';

import CreateImageWizard from '../../../Components/CreateImageWizardV2/CreateImageWizard';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../store/imageBuilderApi';
import { server } from '../../mocks/server';
import { clickNext, renderCustomRoutesWithReduxRouter } from '../../testUtils';

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

export const imageRequest: ImageRequest = {
  architecture: 'x86_64',
  image_type: 'image-installer',
  upload_request: {
    options: {},
    type: 'aws.s3',
  },
};

export const blueprintRequest: CreateBlueprintRequest = {
  name: 'Red Velvet',
  description: '',
  distribution: 'rhel-93',
  image_requests: [imageRequest],
  customizations: {},
};

/**
 * @example
 * // returns 'imageWizard?release=rhel8&architecture=aarch64'
 * preparePathname({ release: 'rhel8', architecture: 'aarch64' });
 * @example
 * // returns 'imageWizard'
 * preparePathname({});
 */
function preparePathname(searchParams: { [key: string]: string } = {}): string {
  let pathName = 'imageWizard';
  const params = Object.entries(searchParams).map(
    ([param, value]) => `${param}=${value}`
  );
  if (params.length > 0) {
    pathName += `?${params.join('&')}`;
  }
  return pathName;
}

export const render = async (searchParams = {}) => {
  const pathName = preparePathname(searchParams);
  await renderCustomRoutesWithReduxRouter(pathName, {}, routes);
};

export const goToRegistrationStep = async () => {
  const bareMetalCheckBox = await screen.findByRole('checkbox', {
    name: /bare metal installer checkbox/i,
  });
  await userEvent.click(bareMetalCheckBox);
  await clickNext();
};

export const clickRegisterLater = async () => {
  const radioButton = await screen.findByRole('radio', {
    name: 'Register later',
  });
  await userEvent.click(radioButton);
};

export const enterBlueprintName = async (name: string = 'Red Velvet') => {
  const blueprintName = await screen.findByRole('textbox', {
    name: /blueprint name/i,
  });
  await userEvent.type(blueprintName, name);
};

export const interceptBlueprintRequest = async (requestPathname: string) => {
  const receivedRequestPromise = spyOnRequest(requestPathname);

  const saveButton = await screen.findByRole('button', {
    name: 'Create blueprint',
  });
  await userEvent.click(saveButton);

  return await receivedRequestPromise;
};
