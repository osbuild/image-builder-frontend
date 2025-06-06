import React, { lazy, Suspense } from 'react';

import { Route, Routes } from 'react-router-dom';

import ShareImageModal from './Components/ShareImageModal/ShareImageModal';
import { useFlagWithEphemDefault } from './Utilities/useGetEnvironment';

const LandingPage = lazy(() => import('./Components/LandingPage/LandingPage'));
const ImportImageWizard = lazy(
  () => import('./Components/CreateImageWizard/ImportImageWizard')
);
const CreateImageWizard = lazy(() => import('./Components/CreateImageWizard'));

export const Router = () => {
  const importExportFlag = useFlagWithEphemDefault(
    'image-builder.import.enabled'
  );
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

      {importExportFlag && (
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
            <CreateImageWizard />
          </Suspense>
        }
      />
    </Routes>
  );
};
