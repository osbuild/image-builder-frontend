import React from 'react';

import { Provider } from 'react-redux';

import App from './App';
import { PlatformProvider } from './context/platform';
import { hostedPlatform } from './context/platform/hosted';
import { serviceStore as store } from './store';

const ImageBuilder = () => (
  <Provider store={store}>
    <PlatformProvider value={hostedPlatform}>
      <App />
    </PlatformProvider>
  </Provider>
);

export default ImageBuilder;
