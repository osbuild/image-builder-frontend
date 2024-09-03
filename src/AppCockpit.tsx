import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-addons.css';

import React, { Suspense } from 'react';

import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { EmptyImagesTable } from './Components/ImagesTable/SharedEmptyState';
import ShareImageModal from './Components/ShareImageModal/ShareImageModal';
import { store } from './store';
const Application = () => {
  return (
    <React.Fragment>
      <EmptyImagesTable />
      <NotificationsPortal />
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Suspense></Suspense>}>
            <Route path="share/:composeId" element={<ShareImageModal />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
};

const ImageBuilder = () => (
  <Provider store={store}>
    <Application />
  </Provider>
);

export default ImageBuilder;

const main = async () => {
  const root = document.getElementById('main');
  if (root) {
    const reactRoot = createRoot(root);
    reactRoot.render(<ImageBuilder />);
  }
};

main();
