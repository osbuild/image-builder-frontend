import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-addons.css';

import React from 'react';

import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import { NotReady } from './Components/Cockpit/NotReady';
import { Router } from './Router';
import { onPremStore as store } from './store';
import { useGetComposerSocketStatus } from './Utilities/useComposerStatus';

const Application = () => {
  const { enabled, started } = useGetComposerSocketStatus();

  if (!started || !enabled) {
    return <NotReady enabled={enabled} />;
  }

  return (
    <React.Fragment>
      <NotificationsPortal />
      <HashRouter>
        <Router />
      </HashRouter>
    </React.Fragment>
  );
};
const ImageBuilder = () => (
  <Provider store={store}>
    <Application />
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
