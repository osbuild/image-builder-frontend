/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require('path');

const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  sassPrefix: '.imageBuilder',
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')(
    {
      root: resolve(__dirname, '../'),
      exposes: {
        './RootApp': resolve(__dirname, '../src/AppEntry.tsx'),
      },
      shared: [{ 'react-router-dom': { singleton: true } }],
      exclude: ['react-router-dom'],
    }
  )
);

module.exports = {
  ...webpackConfig,
  plugins,
};
