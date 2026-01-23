import React, { useEffect } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
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
      <NotificationsProvider>
        <Router />
      </NotificationsProvider>
    </React.Fragment>
  );
};

export default App;
