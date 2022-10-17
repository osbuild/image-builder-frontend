import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import { getBaseName } from './Utilities/path';
import App from './App';
import { store } from './store';

const ImageBuilder = () => (
  <Provider store={store}>
    <Router basename={getBaseName(window.location.pathname)}>
      <App />
    </Router>
  </Provider>
);

export default ImageBuilder;
