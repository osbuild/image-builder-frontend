import React from 'react';

import { Provider } from 'react-redux';

import App from './App';
import { store } from './store';

const ImageBuilder = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default ImageBuilder;
