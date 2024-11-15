/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");
const webpack = require('webpack');

const plugins = [];

function add_define(key, value) {
  const definePluginIndex = plugins.findIndex(
    (plugin) => plugin instanceof webpack.DefinePlugin
  );
  if (definePluginIndex !== -1) {
    const definePlugin = plugins[definePluginIndex];

    const newDefinePlugin = new webpack.DefinePlugin({
      ...definePlugin.definitions,
      [key]: JSON.stringify(value),
    });

    plugins[definePluginIndex] = newDefinePlugin;
  } else {
    plugins.push(
      new webpack.DefinePlugin({
        [key]: JSON.stringify(value),
      })
    );
  }
}

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
  We would like the client to be able to determine whether or not to start
  the service worker at run time based on the value of process.env.MSW. We can
  add that variable to process.env via the DefinesPlugin plugin, but
  DefinePlugin has already been added by config() to the default webpackConfig.

  Therefore, we find it in the `plugins` array based on its type, then update
  it to add our new process.env.MSW variable.
  */
  add_define('process.env.MSW', process.env.MSW);
}

if (process.env.NODE_ENV) {
  add_define('process.env.NODE_ENV', process.env.NODE_ENV);
}

if (process.env.SENTRY_AUTH_TOKEN) {
  plugins.push(
    sentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      urlPrefix: '~/apps/image-builder',
      _experiments: {
        moduleMetadata: ({ release }) => ({
          dsn: process.env.SENTRY_DSN,
          release,
        }),
      },
    })
  );
}

module.exports = {
  sassPrefix: '.imageBuilder',
  debug: true,
  useFileHash: false,
  /*
  mockServiceWorker.js will be served from /beta/apps/image-builder, which
  will become its default scope. Setting the Service-Worker-Allowed header to
  '/' allows the worker's scope to be expanded to the root route '/'.

  The default webpackConfig for stage does not contain any headers.

  Caution: The default webpackConfig for prod *does* contain headers, so this
  code will need to be modified if using MSW in prod-beta or prod-stable so that
  those headers are not overwritten.
  */
  devServer: process.env.MSW && {
    headers: { 'Service-Worker-Allowed': '/' },
  },
  devtool: 'hidden-source-map',
  appUrl: '/insights/image-builder',
  useProxy: true,
  useAgent: true,
  bounceProd: false,
  proxyVerbose: true,
  routes: {
    ...(process.env.CONFIG_PORT && {
      [`${process.env.BETA ? '/beta' : ''}/config`]: {
        host: `http://localhost:${process.env.CONFIG_PORT}`,
      },
    }),
    ...(process.env.LOCAL_API && {
      ...(process.env.LOCAL_API.split(',') || []).reduce((acc, curr) => {
        const [appName, appConfig] = (curr || '').split(':');
        const [appPort = 8003, protocol = 'http', host = 'localhost'] =
          appConfig.split('~');
        return {
          ...acc,
          [`/apps/${appName}`]: { host: `${protocol}://${host}:${appPort}` },
          [`/beta/apps/${appName}`]: {
            host: `${protocol}://${host}:${appPort}`,
          },
        };
      }, {}),
    }),
  },
  plugins: plugins,
  moduleFederation: {
    exposes: {
      './RootApp': path.resolve(__dirname, './src/AppEntry.tsx'),
    },
    shared: [{ 'react-router-dom': { singleton: true, version: '*' } }],
    exclude: ['react-router-dom'],
  },
};
