import React, { useEffect } from 'react';

import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import '@patternfly/patternfly/patternfly-addons.css';

import { Router } from './Router';

const App = () => {
  const { hideGlobalFilter, updateDocumentTitle } = useChrome();

  useEffect(() => {
    updateDocumentTitle('Images');
    hideGlobalFilter(true);
  }, [hideGlobalFilter, updateDocumentTitle]);

  // Necessary for in-page wizard overflow to behave properly
  // The .chr-render class is defined in Insights Chrome:
  // https://github.com/RedHatInsights/insights-chrome/blob/fe573705020ff64003ac9e6101aa978b471fe6f2/src/sass/chrome.scss#L82
  useEffect(() => {
    const chrRenderDiv = document.querySelector('.chr-render');
    if (chrRenderDiv) {
      (chrRenderDiv as HTMLElement).style.overflow = 'auto';
    }
  }, []);

  return (
    <React.Fragment>
      <NotificationsProvider>
        <Router />
      </NotificationsProvider>
    </React.Fragment>
  );
};

export default App;
