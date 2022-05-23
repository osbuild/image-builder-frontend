import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import logger from 'redux-logger';

const ImageBuilder = () => (
  <Provider
    store={init(
      {},
      ...[process.env.NODE_ENV !== 'production' ? logger : undefined]
    ).getStore()}
  >
    <Router basename={getBaseName(window.location.pathname)}>
      <App />
    </Router>
  </Provider>
);

export default ImageBuilder;
