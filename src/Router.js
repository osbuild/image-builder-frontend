import React, { lazy, Suspense } from 'react';

import { useFlag } from '@unleash/proxy-client-react';
import { Route, Routes } from 'react-router-dom';

import EdgeImageDetail from './Components/edge/ImageDetails';
import ShareImageModal from './Components/ShareImageModal/ShareImageModal';
import { manageEdgeImagesUrlName } from './Utilities/edge';

const LandingPage = lazy(() => import('./Components/LandingPage/LandingPage'));
const CreateImageWizard = lazy(() =>
  import('./Components/CreateImageWizard/CreateImageWizard')
);
const CreateImageWizardV2 = lazy(() =>
  import('./Components/CreateImageWizardV2')
);

export const Router = () => {
  const edgeParityFlag = useFlag('edgeParity.image-list');

  const experimentalWizard =
    useFlag('image-builder.new-wizard.enabled') ||
    process.env.EXPERIMENTAL === true;
  return (
    <Routes>
      <Route
        path="*"
        element={
          <Suspense>
            <LandingPage />
          </Suspense>
        }
      >
        <Route path="share/:composeId" element={<ShareImageModal />} />
      </Route>

      <Route
        path="imagewizard/:composeId?"
        element={
          <Suspense>
            {experimentalWizard ? (
              <CreateImageWizardV2 />
            ) : (
              <CreateImageWizard />
            )}
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
