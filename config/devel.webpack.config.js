const { resolve } = require('path');

const config = require('@redhat-cloud-services/frontend-components-config');

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  useFileHash: false,
  sassPrefix: '.imageBuilder',
  deployment: 'beta/apps',
  appUrl: '/preview/insights/image-builder',
  env: 'stage-beta',
  useProxy: true,
  useAgent: true,
  bounceProd: false,
  proxyVerbose: true,
  routes: {
    '/api/image-builder/v1': { host: 'http://localhost:8086' },
  },
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')(
    {
      root: resolve(__dirname, '../'),
      useFileHash: false,
      exposes: {
        './RootApp': resolve(__dirname, '../src/AppEntry.js'),
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
