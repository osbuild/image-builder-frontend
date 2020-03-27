import { Route, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import asyncComponent from './Utilities/asyncComponent';

const LandingPage = asyncComponent(() => import('./SmartComponents/LandingPage/LandingPage'));

const InsightsRoute = ({ component: Component, rootClass, ...rest }) => {
    const root = document.getElementById('root');
    root.removeAttribute('class');
    root.classList.add(`page__${rootClass}`, 'pf-c-page__main');
    root.setAttribute('role', 'main');
    return (<Route { ...rest } component={ Component } />);
};

InsightsRoute.propTypes = {
    component: PropTypes.func,
    rootClass: PropTypes.string
};

export const Routes = () => {
    return (
        <Switch>
            <InsightsRoute exact path='/landing' component={ LandingPage } rootClass='landingpage'/>
            <Redirect to='/landing'/>
        </Switch>
    );
};
