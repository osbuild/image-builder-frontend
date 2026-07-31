import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-addons.css';

import React from 'react';

import 'cockpit-dark-theme';
import { Page, PageSection } from '@patternfly/react-core';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import './AppCockpit.scss';
import { RequireAdmin } from './Components/Cockpit';
import { Router } from './Router';
import { onPremStore as store } from './store';
import { useGetRegistryAuthStatusQuery } from './store/api/backend';
import { useIsCockpitAdmin } from './Utilities/useIsCockpitAdmin';

const Application = () => {
  const isAdmin = useIsCockpitAdmin();

  // Populate the registry auth cache early so the image source step
  // doesn't show a "checking" spinner when the user reaches it.
  useGetRegistryAuthStatusQuery();

  if (!isAdmin) {
    return <RequireAdmin />;
  }

  return (
    <React.Fragment>
      <NotificationsProvider>
        <HashRouter>
          <Router />
        </HashRouter>
      </NotificationsProvider>
    </React.Fragment>
  );
};
const ImageBuilder = () => (
  <Provider store={store}>
    <Page className='no-masthead-sidebar' isContentFilled>
      <PageSection>
        <Application />
      </PageSection>
    </Page>
  </Provider>
);

const main = async () => {
  const root = document.getElementById('main');
  if (root) {
    const reactRoot = createRoot(root);
    reactRoot.render(<ImageBuilder />);
  }
};

main();
