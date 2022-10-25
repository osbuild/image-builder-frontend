import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ShareImageModal from './Components/ShareImageModal/ShareImageModal';

import { resolveRelPath } from './Utilities/path';

const LandingPage = lazy(() => import('./Components/LandingPage/LandingPage'));
const CreateImageWizard = lazy(() =>
  import('./Components/CreateImageWizard/CreateImageWizard')
);

export const Router = () => {
  return (
    <Routes>
      <Route
        path={resolveRelPath('imagewizard/*')}
        element={<CreateImageWizard />}
      />
      <Route path={resolveRelPath('*')} element={<LandingPage />} />
      <Route path={resolveRelPath('share/*')} element={<ShareImageModal />} />
    </Routes>
  );
};
