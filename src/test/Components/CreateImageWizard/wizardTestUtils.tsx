import React from 'react';

import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import ImageWizard from '../../../Components/CreateImageWizard';
import { RHEL_10 } from '../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../store/imageBuilderApi';
import { getLastBlueprintReq } from '../../mocks/cockpit/cockpitFile';
import { server } from '../../mocks/server';
import { renderCustomRoutesWithReduxRouter } from '../../testUtils';

type RequestTypes = 'GET' | 'PUT' | 'POST' | 'DELETE';

export function spyOnRequest(pathname: string, method: RequestTypes) {
  return new Promise((resolve) => {
    const listener = async ({ request: req }: { request: Request }) => {
      const url = new URL(req.url);
      if (url.pathname === pathname && req.method === method) {
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
    element: <ImageWizard />,
  },
  // cockpit routes
  {
    path: '/imageWizard/:composeId?',
    element: <ImageWizard />,
  },
  {
    path: '/',
    element: <div />,
  },
];

export const imageRequest: ImageRequest = {
  architecture: 'x86_64',
  image_type: 'guest-image',
  upload_request: {
    options: {},
    type: 'aws.s3',
  },
};

export const blueprintRequest: CreateBlueprintRequest = {
  name: 'Red Velvet',
  description: '',
  distribution: RHEL_10,
  image_requests: [imageRequest],
  customizations: {},
};

/**
 * @example
 * // returns 'imageWizard?release=rhel8&architecture=aarch64'
 * preparePathname({ release: 'rhel8', architecture: 'aarch64' });
 * @example
 * // returns '(/)imageWizard'
 * preparePathname({});
 */
function preparePathname(searchParams: { [key: string]: string } = {}): string {
  let pathName = process.env.IS_ON_PREMISE ? '/imageWizard' : 'imageWizard';
  const params = Object.entries(searchParams).map(
    ([param, value]) => `${param}=${value}`,
  );
  if (params.length > 0) {
    pathName += `?${params.join('&')}`;
  }
  return pathName;
}

export const renderCreateMode = async (searchParams = {}) => {
  const pathName = preparePathname(searchParams);
  await renderCustomRoutesWithReduxRouter(pathName, {}, routes);
};

export const renderEditMode = async (id: string) => {
  const pathName = process.env.IS_ON_PREMISE
    ? `/imagewizard/${id}`
    : `imagewizard/${id}`;
  await renderCustomRoutesWithReduxRouter(pathName, {}, routes);
};

export const openReleaseMenu = async () => {
  const user = userEvent.setup();
  const releaseMenu = screen.getByTestId('release_select');
  await waitFor(() => user.click(releaseMenu));
};

export const selectRhel9 = async () => {
  const user = userEvent.setup();
  await openReleaseMenu();
  const rhel9 = await screen.findByRole('option', {
    name: /red hat enterprise linux \(rhel\) 9 full support ends: may 2027 \| maintenance support ends: may 2032/i,
  });
  await waitFor(() => user.click(rhel9));
};

export const selectGuestImageTarget = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /Virtualization guest image/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
};

export const goToRegistrationStep = async () => {
  await selectGuestImageTarget();
  await clickNext();
};

export const clickRegisterLater = async () => {
  const user = userEvent.setup();
  await screen.findByRole('heading', {
    name: /Register systems using this image/,
  });
  const registerLaterRadio = await screen.findByRole('radio', {
    name: /register later/i,
  });
  await waitFor(() => user.click(registerLaterRadio));
};

export const clickRegisterSatellite = async () => {
  const user = userEvent.setup();
  await screen.findByRole('heading', {
    name: /Register systems using this image/,
  });
  const registerLaterRadio = await screen.findByRole('radio', {
    name: /register with satellite/i,
  });
  await waitFor(() => user.click(registerLaterRadio));
};

export const goToOscapStep = async () => {
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
};

export const selectCustomRepo = async () => {
  const user = userEvent.setup();
  await clickBack();
  const customRepoCheckbox = await screen.findByRole('checkbox', {
    name: /select row 0/i,
  });

  user.click(customRepoCheckbox);
  await clickNext();
};

export const enterBlueprintName = async (name: string = 'Red Velvet') => {
  const user = userEvent.setup({ delay: null });
  const blueprintName = await screen.findByRole('textbox', {
    name: /blueprint name/i,
  });

  await waitFor(() => user.clear(blueprintName));
  await waitFor(() => expect(blueprintName).toHaveValue(''));
  await waitFor(() => user.type(blueprintName, name));
};

export const openAndDismissSaveAndBuildModal = async () => {
  const user = userEvent.setup();
  const createBlueprintBtn = await screen.findByRole('button', {
    name: 'Create blueprint',
  });
  await waitFor(async () => user.click(createBlueprintBtn));
  const saveAndBuildModal = await screen.findByTestId(
    'close-button-saveandbuild-modal',
  );
  await waitFor(() => user.click(saveAndBuildModal));
};

export const interceptBlueprintRequest = async (requestPathname: string) => {
  const user = userEvent.setup();
  const receivedRequestPromise = spyOnRequest(requestPathname, 'POST');

  const saveButton = await screen.findByRole('button', {
    name: 'Create blueprint',
  });
  await waitFor(() => user.click(saveButton));

  if (process.env.IS_ON_PREMISE) {
    return JSON.parse(getLastBlueprintReq());
  }

  return await receivedRequestPromise;
};

export const interceptEditBlueprintRequest = async (
  requestPathname: string,
) => {
  const user = userEvent.setup();
  const receivedRequestPromise = spyOnRequest(requestPathname, 'PUT');

  const saveButton = await screen.findByRole('button', {
    name: 'Save changes to blueprint',
  });
  await waitFor(() => user.click(saveButton));

  if (process.env.IS_ON_PREMISE) {
    return JSON.parse(getLastBlueprintReq());
  }

  return await receivedRequestPromise;
};

export const clickBack = async () => {
  const user = userEvent.setup();
  const backBtn = await screen.findByRole('button', { name: /Back/ });
  await waitFor(() => user.click(backBtn));
};

export const clickNext = async () => {
  const user = userEvent.setup();
  const nextBtn = await screen.findByRole('button', { name: /Next/ });
  await waitFor(() => user.click(nextBtn));
};

export const clickCancel = async () => {
  const user = userEvent.setup();
  const cancelBtn = await screen.findByRole('button', { name: /Cancel/ });
  await waitFor(() => user.click(cancelBtn));
};

export const clickReviewAndFinish = async () => {
  const user = userEvent.setup();
  const reviewAndFinishBtn = await screen.findByRole('button', {
    name: /Review and finish/,
  });
  await waitFor(() => user.click(reviewAndFinishBtn));
};

export const getNextButton = async () => {
  const next = await screen.findByRole('button', { name: /Next/ });
  return next;
};

export const verifyCancelButton = async (router: RemixRouter | undefined) => {
  await clickCancel();
  if (router) {
    expect(router.state.location.pathname).toBe('/insights/image-builder');
  }
};
