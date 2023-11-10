import React, { useEffect } from 'react';

import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { useStore } from 'react-redux';
import '@patternfly/patternfly/patternfly-addons.css';

import { Router } from './Router';

const App = (props) => {
  const store = useStore();
  const { hideGlobalFilter, updateDocumentTitle } = useChrome();

  useEffect(() => {
    updateDocumentTitle('Images | Red Hat Insights');
    hideGlobalFilter();
  }, [hideGlobalFilter, updateDocumentTitle]);

  return (
    <React.Fragment>
      <NotificationsPortal store={store} />
      <Router childProps={props} />
    </React.Fragment>
  );
};

export default App;
