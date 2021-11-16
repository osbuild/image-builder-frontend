import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Router } from './Router';
import '@patternfly/patternfly/patternfly-addons.css';
import './App.scss';

import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';

import api from './api.js';
import PermissionDenied from './Components/LandingPage/PermissionDenied';

const App = (props) => {
    const [ permission, setPermission ] = useState(false);
    const history = useHistory();

    useEffect(() => {
        const registry = getRegistry();
        registry.register({ notifications: notificationsReducer });
        insights.chrome.init();
        insights.chrome.identifyApp('image-builder');

        api.getVersion().then(() => {
            setPermission(true);
        }).catch(() => {
            setPermission(false);
        });

        const unregister = insights.chrome.on('APP_NAVIGATION', (event) =>
            history.push(`/${event.navId}`)
        );
        return () => {
            unregister();
        };
    }, []);

    return (
        <React.Fragment>
            <NotificationsPortal />
            { permission ? <Router childProps={ props } /> : <PermissionDenied /> }
        </React.Fragment>
    );
};

export default App;
