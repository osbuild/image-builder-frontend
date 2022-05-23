import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const LandingPage = lazy(() => import('./Components/LandingPage/LandingPage'));
const CreateImageWizard = lazy(() =>
  import('./Components/CreateImageWizard/CreateImageWizard')
);

export const Router = () => {
  return (
    <Routes>
      <Route path="/imagewizard/*" element={<CreateImageWizard />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};
