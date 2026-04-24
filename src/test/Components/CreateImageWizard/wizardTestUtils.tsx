import React from 'react';

import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CreateBlueprintRequest, ImageRequest } from '@/store/api/backend';

import CreateImageWizard3 from '../../../Components/CreateImageWizard3/CreateImageWizard3';
import { RHEL_10 } from '../../../constants';
import { getLastBlueprintReq } from '../../mocks/cockpit/cockpitFile';
import { server } from '../../mocks/server';
import { renderCustomRoutesWithReduxRouter } from '../../renderUtils';

type RequestTypes = 'GET' | 'PUT' | 'POST' | 'DELETE';

export function spyOnRequest(pathname: string, method: RequestTypes) {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = async (event: any) => {
      const req = event.request;
      const url = new URL(req.url);
      if (url.pathname === pathname && req.method === method) {
        const requestData = await req.clone().json();
        resolve(requestData);
        // Cleanup listener after successful intercept
        server.events.removeListener('*', listener);
      }
    };

    server.events.on('*', listener);
  });
}

const routes = [
  {
    path: 'insights/image-builder/*',
    element: <CreateImageWizard3 />,
  },
  // cockpit routes
  {
    path: '/',
    element: <CreateImageWizard3 />,
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
  customizations: {
    locale: {
      languages: ['C.UTF-8'],
    },
    timezone: {
      timezone: 'Etc/UTC',
    },
  },
};

/**
 * @example
 * // returns '?release=rhel8&architecture=aarch64'
 * preparePathname({ release: 'rhel8', architecture: 'aarch64' });
 * @example
 * // returns ''
 * preparePathname({});
 */
function preparePathname(searchParams: { [key: string]: string } = {}): string {
  let pathName = process.env.IS_ON_PREMISE ? '/' : '';
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
  const preloadedState = {
    wizardModal: {
      isModalOpen: true,
      mode: 'create' as const,
    },
  };

  await waitFor(
    async () =>
      await renderCustomRoutesWithReduxRouter(pathName, preloadedState, routes),
  );
};

export const renderEditMode = async (id: string) => {
  const pathName = process.env.IS_ON_PREMISE ? '/' : '';
  const preloadedState = {
    wizardModal: {
      isModalOpen: true,
      mode: 'edit' as const,
    },
    blueprints: {
      selectedBlueprintId: id,
    },
  };

  await waitFor(
    async () =>
      await renderCustomRoutesWithReduxRouter(pathName, preloadedState, routes),
  );
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

export const getTenantGuidInput = async () => {
  const tenantGuidInput = await screen.findByRole('textbox', {
    name: /azure tenant guid/i,
  });
  return tenantGuidInput;
};

export const enterTenantGuid = async () => {
  const user = userEvent.setup();
  await waitFor(
    async () => {
      const tenantGuid = await getTenantGuidInput();
      await user.type(tenantGuid, 'b8f86d22-4371-46ce-95e7-65c415f3b1e2');
    },
    { timeout: 5000 },
  );
};

export const getSubscriptionIdInput = async () => {
  const subscriptionIdInput = await screen.findByRole('textbox', {
    name: /subscription id/i,
  });
  return subscriptionIdInput;
};

export const enterSubscriptionId = async () => {
  const user = userEvent.setup();
  await waitFor(
    async () => {
      const subscriptionId = await getSubscriptionIdInput();
      await user.type(subscriptionId, '60631143-a7dc-4d15-988b-ba83f3c99711');
    },
    { timeout: 5000 },
  );
};

export const getResourceGroupTextInput = async () => {
  const resourceGroupInput = await screen.findByRole('textbox', {
    name: /resource group/i,
  });
  return resourceGroupInput;
};

export const enterResourceGroup = async () => {
  const user = userEvent.setup();
  await waitFor(
    async () => {
      const resourceGroup = await getResourceGroupTextInput();
      await user.type(resourceGroup, 'testResourceGroup');
    },
    { timeout: 5000 },
  );
};

export const goToRegistrationStep = async () => {
  await selectGuestImageTarget();
  await clickNext();
};

export const clickRegisterLater = async () => {
  const user = userEvent.setup();
  await screen.findByRole('heading', {
    name: /Register/,
  });
  const registerLaterRadio = await screen.findByRole('radio', {
    name: /register later/i,
  });
  await waitFor(() => user.click(registerLaterRadio));
};

export const clickRegisterSatellite = async () => {
  const user = userEvent.setup();
  await screen.findByRole('heading', {
    name: /Register/,
  });
  const registerLaterRadio = await screen.findByRole('radio', {
    name: /Register for a Satellite or Capsule server/i,
  });
  await waitFor(() => user.click(registerLaterRadio));
};

export const goToOscapStep = async () => {
  await clickRegisterLater();
};

export const selectCustomRepo = async () => {
  const user = userEvent.setup();

  const searchInput = await screen.findByRole('textbox', {
    name: /filter repositories/i,
  });
  await waitFor(() => user.click(searchInput));
  await waitFor(() => user.type(searchInput, 'repo'));

  const firstResult = await screen.findByRole('option', { name: /repo/i });
  await waitFor(() => user.click(firstResult));
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
  const saveAndBuildModal = screen.queryByTestId(
    'close-button-saveandbuild-modal',
  );
  if (saveAndBuildModal) {
    await waitFor(() => user.click(saveAndBuildModal));
  }
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

export const clickReviewImage = async () => {
  const user = userEvent.setup();
  const reviewImageBtn = await screen.findByRole('button', {
    name: /Review image/,
  });
  await waitFor(() => user.click(reviewImageBtn));
};

export const getNextButton = async () => {
  const next = await screen.findByRole('button', { name: /Next/ });
  return next;
};

export const goToReview = async (maxSteps: number = 25) => {
  for (let stepIndex = 0; stepIndex < maxSteps; stepIndex++) {
    const isOnReview = !!screen.queryByRole('heading', {
      name: /Review image configuration/,
    });
    if (isOnReview) {
      return;
    }

    await clickNext();
  }

  throw new Error(
    'goToReview exceeded maxSteps without reaching the Review step',
  );
};

export const goToStep = async (
  targetHeading: string | RegExp,
  maxSteps: number = 25,
) => {
  for (let stepIndex = 0; stepIndex < maxSteps; stepIndex++) {
    const isOnTarget = !!screen.queryByRole('heading', { name: targetHeading });
    if (isOnTarget) {
      return;
    }

    await clickNext();
  }

  throw new Error(
    'goToStep exceeded maxSteps without reaching the target step',
  );
};

export const verifyCancelButton = async (router: RemixRouter | undefined) => {
  await clickCancel();
  if (router) {
    expect(router.state.location.pathname).toBe('/insights/image-builder');
  }
};
