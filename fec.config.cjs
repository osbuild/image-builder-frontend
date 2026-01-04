/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');
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

if (process.env.NODE_ENV) {
  add_define('process.env.NODE_ENV', process.env.NODE_ENV);
}

if (process.env.ENABLE_SENTRY) {
  plugins.push(
    sentryWebpackPlugin({
      ...(process.env.SENTRY_AUTH_TOKEN && {
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }),
      org: 'red-hat-it',
      project: 'image-builder-rhel',
      moduleMetadata: ({ release }) => ({
        dsn: 'https://f4b4288bbb7cf6c0b2ac1a2b90a076bf@o490301.ingest.us.sentry.io/4508297557901312',
        org: 'red-hat-it',
        project: 'image-builder-rhel',
        release,
      }),
    })
  );
}

module.exports = {
  sassPrefix: '.imageBuilder',
  debug: true,
  useFileHash: true,
  devtool: 'hidden-source-map',
  appUrl: '/insights/image-builder',
  useProxy: true,
  useAgent: true,
  bounceProd: false,
  proxyVerbose: true,
  resolve: {
    alias: {
      // we don't wan't these packages bundled with
      // the service frontend, so we can set the aliases
      // to false
      cockpit: false,
      'cockpit/fsinfo': false,
      'os-release': false,
    },
  },
  module: {
    rules: [
      {
        // running `make` on cockpit plugin creates './pkg'
        // directory, the generated files do not pass
        // `npm run build` outputing failures
        // this ensures the directory is exluded during build time
        exclude: ',/pkg',
      },
    ],
  },
  routes: {
    ...(process.env.CONFIG_PORT && {
      [`${process.env.BETA ? '/beta' : ''}/config`]: {
        host: `http://localhost:${process.env.CONFIG_PORT}`,
      },
    }),
    ...(process.env.LOCAL_IMAGE_BUILDER_API && {
      '/api/image-builder': {
        host: process.env.LOCAL_IMAGE_BUILDER_API,
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
  frontendCRDPath: path.resolve(__dirname, './deploy/frontend-clowder.yml')
};
