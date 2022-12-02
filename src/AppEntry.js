import React from 'react';

import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import { store } from './store';
import { getBaseName } from './Utilities/path';

const ImageBuilder = () => (
  <Provider store={store}>
    <Router basename={getBaseName(window.location.pathname)}>
      <App />
    </Router>
  </Provider>
);

export default ImageBuilder;
