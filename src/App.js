import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Router } from './Router';
import '@patternfly/patternfly/patternfly-addons.css';

import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';

const App = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    const registry = getRegistry();
    registry.register({ notifications: notificationsReducer });
    document.title = 'Image Builder | Red Hat Insights';
    insights.chrome.init();
    insights.chrome.identifyApp('image-builder');
    const unregister = insights.chrome.on('APP_NAVIGATION', (event) =>
      navigate(`/${event.navId}`)
    );
    return () => {
      unregister();
    };
  }, []);

  return (
    <React.Fragment>
      <NotificationsPortal />
      <Router childProps={props} />
    </React.Fragment>
  );
};

export default App;
