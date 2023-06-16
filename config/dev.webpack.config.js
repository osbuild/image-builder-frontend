const { resolve } = require('path');

const config = require('@redhat-cloud-services/frontend-components-config');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const webpackProxy = {
  useProxy: true,
  proxyVerbose: true,
  env: `${process.env.STAGE ? 'stage' : 'prod'}-${
    process.env.BETA ? 'beta' : 'stable'
  }`,
  appUrl: [
    '/insights/image-builder',
    '/beta/insights/image-builder',
    '/preview/insights/image-builder',
  ],
  routes: {
    ...(process.env.CONFIG_PORT && {
      [`${process.env.BETA ? '/beta' : ''}/config`]: {
        host: `http://localhost:${process.env.CONFIG_PORT}`,
      },
    }),
    ...(process.env.LOCAL_API && {
      ...(process.env.LOCAL_API.split(',') || []).reduce((acc, curr) => {
        const [appName, appConfig] = (curr || '').split(':');
        const [appPort = 8003, protocol = 'http'] = appConfig.split('~');
        return {
          ...acc,
          [`/apps/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
          [`/beta/apps/${appName}`]: {
            host: `${protocol}://localhost:${appPort}`,
          },
        };
      }, {}),
    }),
  },
};

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  useFileHash: false,
  sassPrefix: '.imageBuilder',
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
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

if (process.env.MSW) {
  // Copy mockServiceWorker.js to ./dist/ so it is served with the bundle
  plugins.push(
    new CopyPlugin({
      patterns: [
        { from: 'src/mockServiceWorker.js', to: 'mockServiceWorker.js' },
      ],
    })
  );

  /*
  mockServiceWorker.js will be served from /beta/apps/image-builder, which
  will become its default scope. Setting the Service-Worker-Allowed header to
  '/' allows the worker's scope to be expanded to the root route '/'.

  The default webpackConfig for stage does not contain any headers. 

  Caution: The default webpackConfig for prod *does* contain headers, so this
  code will need to be modified if using MSW in prod-beta or prod-stable so that
  those headers are not overwritten.
  */
  webpackConfig.devServer.headers = { 'Service-Worker-Allowed': '/' };

  /*
  We would like the client to be able to determine whether or not to start
  the service worker at run time based on the value of process.env.MSW. We can
  add that variable to process.env via the DefinesPlugin plugin, but
  DefinePlugin has already been added by config() to the default webpackConfig.

  Therefore, we find it in the `plugins` array based on its type, then update
  it to add our new process.env.MSW variable.
  */
  const definePluginIndex = plugins.findIndex(
    (plugin) => plugin instanceof webpack.DefinePlugin
  );
  const definePlugin = plugins[definePluginIndex];

  const newDefinePlugin = new webpack.DefinePlugin({
    ...definePlugin.definitions,
    'process.env.MSW': true,
  });

  plugins[definePluginIndex] = newDefinePlugin;
}

module.exports = {
  ...webpackConfig,
  plugins,
};
