import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications';

import api from './api.js';
import PermissionDenied from './Components/LandingPage/PermissionDenied';

class App extends Component {
    constructor() {
        super();

        this.state = {
            permission: false,
        };
    }

    componentDidMount () {
        insights.chrome.init();
        insights.chrome.identifyApp('image-builder').catch(() => {
            /* We are not in the menu so this call is allowed to fail */
        });
        this.appNav = insights.chrome.on('APP_NAVIGATION', event => this.props.history.push(`/${event.navId}`));
        insights.chrome.auth.getUser().then(data => {
            this.setState({ identity: data.identity });
            api.getVersion().then(() => {
                this.setState({ permission: true });
            }).catch(() => {
                this.setState({ permission: false });
            });
        });
    }

    componentWillUnmount () {
        this.appNav();
    }

    render () {
        return (
            <React.Fragment>
                <NotificationsPortal />
                { this.state.permission ? <Routes childProps={ this.props } /> : <PermissionDenied /> }
            </React.Fragment>
        );
    }
}

App.propTypes = {
    history: PropTypes.object
};

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default withRouter (connect()(App));
