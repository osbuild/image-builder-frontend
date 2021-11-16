import React, { lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

const LandingPage = lazy(() => import('./Components/LandingPage/LandingPage'));
const CreateImageWizard = lazy(() => import('./Components/CreateImageWizard/CreateImageWizard'));

export const Router = () => {
    return (
        <Routes>
            <Route path='/landing/*' element={ <LandingPage /> } />
            <Route path='/imagewizard/*' element={ <CreateImageWizard /> } />
            <Route path='/' element={ <Navigate replace to='/landing' /> } />
        </Routes>
    );
};
