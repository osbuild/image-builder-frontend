import React, { lazy } from 'react';
import { Route, Routes, Redirect } from 'react-router-dom';

const LandingPage = lazy(() => import('./Components/LandingPage/LandingPage'));
const CreateImageWizard = lazy(() => import('./Components/CreateImageWizard/CreateImageWizard'));

export const Router = () => {
    return (
        <Routes>
            <Route exact path='/landing' component={ LandingPage } />
            <Route exact path='/imagewizard' component={ CreateImageWizard } />
            <Redirect to='/landing' />
        </Routes>
    );
};
