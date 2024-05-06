import React, { useEffect } from 'react';

import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import '@patternfly/patternfly/patternfly-addons.css';

import { Router } from './Router';

const App = () => {
  const { hideGlobalFilter, updateDocumentTitle } = useChrome();

  useEffect(() => {
    updateDocumentTitle('Images');
    hideGlobalFilter(true);
  }, [hideGlobalFilter, updateDocumentTitle]);

  return (
    <React.Fragment>
      <NotificationsPortal />
      <Router />
    </React.Fragment>
  );
};

export default App;
