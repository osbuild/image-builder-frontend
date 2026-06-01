import React, { lazy, Suspense } from 'react';

import { Route, Routes } from 'react-router-dom';

const LandingPage = lazy(() => import('./Components/LandingPage/LandingPage'));

export const Router = () => {
  return (
    <Routes>
      <Route
        path='*'
        element={
          <Suspense>
            <LandingPage />
          </Suspense>
        }
      />
      <Route
        path='imagewizard/:composeId?'
        element={
          <Suspense>
            <LandingPage />
          </Suspense>
        }
      />
    </Routes>
  );
};
