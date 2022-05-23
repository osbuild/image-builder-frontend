const { DefinePlugin } = require('webpack');
const { resolve } = require('path');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');
const config = require('@redhat-cloud-services/frontend-components-config');

const webpackProxy = {
  useProxy: true,
  proxyVerbose: true,
  env: `${process.env.STAGE ? 'stage' : 'prod'}-${
    process.env.BETA ? 'beta' : 'stable'
  }`,
  appUrl: process.env.BETA
    ? '/beta/insights/image-builder'
    : '/insights/image-builder',
};

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  modules: ['image_builder'],
  useFileHash: false,
  sassPrefix: '.imageBuilder, .image_builder',
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  ...(process.env.PROXY ? webpackProxy : {}),
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')(
    {
      root: resolve(__dirname, '../'),
      useFileHash: false,
      moduleName: 'image_builder',
      exposes: {
        './RootApp': resolve(__dirname, '../src/AppEntry.js'),
      },
    }
  )
);

plugins.push(
  new DefinePlugin({
    COMMITHASH: JSON.stringify(new GitRevisionPlugin().commithash()),
  })
);

module.exports = {
  ...webpackConfig,
  plugins,
};
