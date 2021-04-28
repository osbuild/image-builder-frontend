import { Route, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import asyncComponent from './Utilities/asyncComponent';

const LandingPage = asyncComponent(() => import('./Components/LandingPage/LandingPage'));
const CreateImageWizard = asyncComponent(() => import('./Components/CreateImageWizard/CreateImageWizard'));

const InsightsRoute = ({ component: Component, title, ...rest }) => {
    title ? document.title = title : null;
    return (<Route { ...rest } component={ Component } />);
};

InsightsRoute.propTypes = {
    component: PropTypes.func,
    title: PropTypes.string
};

export const Routes = () => {
    return (
        <Switch>
            <InsightsRoute exact path='/landing' component={ LandingPage } />
            <InsightsRoute exact path='/imagewizard' component={ CreateImageWizard } />
            <Redirect to='/landing' />
        </Switch>
    );
};
