const { resolve } = require('path');

const config = require('@redhat-cloud-services/frontend-components-config');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');
const { DefinePlugin } = require('webpack');
const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  sassPrefix: '.imageBuilder',
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')(
    {
      root: resolve(__dirname, '../'),
      exposes: {
        './RootApp': resolve(__dirname, '../src/AppEntry.js'),
      },
      shared: [{ 'react-router-dom': { singleton: true } }],
      exclude: ['react-router-dom'],
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
