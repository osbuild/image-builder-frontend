import React, { lazy, Suspense } from 'react';

import { useFlag } from '@unleash/proxy-client-react';
import { Route, Routes } from 'react-router-dom';

import ShareImageModal from './Components/ShareImageModal/ShareImageModal';

const LandingPage = lazy(() => import('./Components/LandingPage/LandingPage'));
const CreateImageWizard = lazy(() =>
  import('./Components/CreateImageWizard/CreateImageWizard')
);
const CreateBlueprintWizard = lazy(() =>
  import('./Components/CreateImageWizard/CreateBlueprintWizard')
);
const CreateImageWizardV2 = lazy(() =>
  import('./Components/CreateImageWizardV2/CreateImageWizard')
);

export const Router = () => {
  const experimental =
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
            {experimental ? <CreateImageWizardV2 /> : <CreateImageWizard />}
          </Suspense>
        }
      />
      {experimental && (
        <Route
          path="blueprintwizard/:blueprintId?"
          element={
            <Suspense>
              <CreateBlueprintWizard />
            </Suspense>
          }
        />
      )}
    </Routes>
  );
};
