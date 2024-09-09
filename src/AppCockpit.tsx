import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-addons.css';

import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter, Route, Routes } from 'react-router-dom';

import { EmptyImagesTable } from './Components/ImagesTable/SharedEmptyState';
import BlueprintsEmpty from './Components/LandingPage/BlueprintEmpty';
import { store } from './store';

const Application = () => {
  const isCockpit = true;
  const Router = () => {
    return (
      <React.Fragment>
        <EmptyImagesTable />
        <HashRouter>
          <Routes>
            <Route
              path="*"
              element={
                <Suspense>
                  <BlueprintsEmpty />
                </Suspense>
              }
            />
            <Route path="*" element={'API will be ready soon'} />
          </Routes>
        </HashRouter>
      </React.Fragment>
    );
  };

  return isCockpit ? <Router /> : null;
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
