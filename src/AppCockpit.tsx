import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-addons.css';

import React, { useEffect, useState } from 'react';

import 'cockpit-dark-theme';
import { Page, PageSection } from '@patternfly/react-core';
import { Spinner } from '@redhat-cloud-services/frontend-components';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import cockpit from 'cockpit';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import './AppCockpit.scss';
import { RequireAdmin } from './Components/Cockpit';
import { Router } from './Router';
import { onPremStore as store } from './store';
import { useIsCockpitAdmin } from './Utilities/useIsCockpitAdmin';

const Application = () => {
  const isAdmin = useIsCockpitAdmin();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (cockpit) {
      setReady(true);
    }
  }, [cockpit, ready, setReady]);

  if (!ready) {
    return <Spinner centered />;
  }

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
