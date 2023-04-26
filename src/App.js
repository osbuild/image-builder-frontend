import React, { useEffect } from 'react';

import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { useStore } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '@patternfly/patternfly/patternfly-addons.css';

import { Router } from './Router';
import { resolveRelPath } from './Utilities/path';

const App = (props) => {
  const navigate = useNavigate();
  const store = useStore();

  const { hideGlobalFilter, on, updateDocumentTitle } = useChrome();

  useEffect(() => {
    updateDocumentTitle('Image Builder | Red Hat Insights');
    hideGlobalFilter();
    const unregister = on('APP_NAVIGATION', () => navigate(resolveRelPath('')));
    return () => {
      unregister();
    };
  }, []);

  return (
    <React.Fragment>
      <NotificationsPortal store={store} />
      <Router childProps={props} />
    </React.Fragment>
  );
};

export default App;
