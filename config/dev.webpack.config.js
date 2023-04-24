const { resolve } = require('path');

const config = require('@redhat-cloud-services/frontend-components-config');

const webpackProxy = {
  useProxy: true,
  proxyVerbose: true,
  env: `${process.env.STAGE ? 'stage' : 'prod'}-${
    process.env.PREVIEW ? 'preview' : 'stable'
  }`,
  appUrl: process.env.PREVIEW
    ? '/preview/insights/image-builder'
    : '/insights/image-builder',
};

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  useFileHash: false,
  sassPrefix: '.imageBuilder',
  deployment: process.env.PREVIEW ? 'preview/apps' : 'apps',
  ...(process.env.PROXY ? webpackProxy : {}),
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
