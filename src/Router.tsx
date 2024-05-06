import React, { lazy, Suspense } from 'react';

import { useFlag } from '@unleash/proxy-client-react';
import { Route, Routes } from 'react-router-dom';

import EdgeImageDetail from './Components/edge/ImageDetails';
import ShareImageModal from './Components/ShareImageModal/ShareImageModal';
import { manageEdgeImagesUrlName } from './Utilities/edge';
import { useExperimentalFlag } from './Utilities/useExperimentalFlag';

const LandingPage = lazy(() => import('./Components/LandingPage/LandingPage'));
const CreateImageWizard = lazy(
  () => import('./Components/CreateImageWizard/CreateImageWizard')
);
const ImportImageWizard = lazy(
  () => import('./Components/CreateImageWizardV2/ImportImageWizard')
);
const CreateImageWizardV2 = lazy(
  () => import('./Components/CreateImageWizardV2')
);

export const Router = () => {
  const edgeParityFlag = useFlag('edgeParity.image-list');
  const importExportFlag = useFlag('image-builder.import.enabled');
  const experimentalFlag = useExperimentalFlag();
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

      {importExportFlag && experimentalFlag && (
        <Route
          path="imagewizard/import"
          element={
            <Suspense>
              <ImportImageWizard />
            </Suspense>
          }
        />
      )}
      <Route
        path="imagewizard/:composeId?"
        element={
          <Suspense>
            {experimentalFlag ? <CreateImageWizardV2 /> : <CreateImageWizard />}
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
