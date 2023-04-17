import React, { lazy } from 'react';

import { Route, Routes } from 'react-router-dom';

import ShareImageModal from './Components/ShareImageModal/ShareImageModal';

const LandingPage = lazy(() => import('./Components/LandingPage/LandingPage'));
const CreateImageWizard = lazy(() =>
  import('./Components/CreateImageWizard/CreateImageWizard')
);

export const Router = () => {
  return (
    <Routes>
      <Route path="*" element={<LandingPage />}>
        <Route path="imagewizard/:composeId?" element={<CreateImageWizard />} />
        <Route path="share/:composeId" element={<ShareImageModal />} />
      </Route>
    </Routes>
  );
};
