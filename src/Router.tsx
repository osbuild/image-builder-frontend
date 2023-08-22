import React, { Suspense, lazy } from 'react';

import { Bullseye, Button, Spinner } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { useFlag } from '@unleash/proxy-client-react';
import { Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import EdgeImageDetail from './Components/edge/ImageDetails';
import ShareImageModal from './Components/ShareImageModal/ShareImageModal';
import { useGetComposesQuery } from './store/imageBuilderApi';
import { manageEdgeImagesUrlName } from './Utilities/edge';
import { resolveRelPath } from './Utilities/path';

const LandingPage = lazy(() => import('./Components/LandingPage/LandingPage'));
const CreateImageWizard = lazy(
  () => import('./Components/CreateImageWizard/CreateImageWizard')
);

/**
 * Help page for newcomers creating their first image if they've never did it.
 * The user gets the possibility to click on a `create image` button that will
 * open the wizard for them.
 *
 */
const AppZeroState = () => {
  const navigate = useNavigate();

  return (
    <AsyncComponent
      appName="dashboard"
      module="./AppZeroState"
      scope="dashboard"
      ErrorComponent={<ErrorState />}
      app="Images"
      appId="images_zero_state"
      customText="Create your image by using the Image Builder wizard."
      customButton={
        <>
          <Button
            className="pf-c-button pf-m-primary pf-u-p-md pf-u-font-size-md"
            data-testid="create-image-action"
            onClick={() => navigate(resolveRelPath('imagewizard'))}
          >
            Create image
          </Button>
        </>
      }
    />
  );
};

const ZERO_IMAGES = 0;

/**
 * Choses the proper entry point for the user (between the LandingPage and the
 * AppZeroState components) depending on the condition that makes that user a
 * newcomer or not.
 */
const AppEntryPoint = () => {
  const { data, isSuccess } = useGetComposesQuery({
    limit: 100,
  });
  // Get a spinner while the app is waiting for valid data to take a decision on
  // which component to render.
  if (!isSuccess) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }
  const composes = data.data;
  if (composes.length > ZERO_IMAGES) {
    return <LandingPage />;
  }
  return <AppZeroState />;
};

export const Router = () => {
  const edgeParityFlag = useFlag('edgeParity.image-list');
  return (
    <Routes>
      <Route
        path="*"
        element={
          <Suspense>
            <AppEntryPoint />
          </Suspense>
        }
      >
        <Route path="share/:composeId" element={<ShareImageModal />} />
      </Route>

      <Route
        path="imagewizard/:composeId?"
        element={
          <Suspense>
            <CreateImageWizard />
          </Suspense>
        }
      />

      {edgeParityFlag && (
        <Route
          path={`/${manageEdgeImagesUrlName}/:imageId`}
          element={<EdgeImageDetail />}
        >
          <Route path="*" element={<EdgeImageDetail />} />
          <Route
            path={`versions/:imageVersionId/*`}
            element={<EdgeImageDetail />}
          />
        </Route>
      )}
    </Routes>
  );
};
