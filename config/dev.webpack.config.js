const { resolve } = require('path');

const config = require('@redhat-cloud-services/frontend-components-config');

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
          // [`/insights/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
          // [`/beta/insights/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
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

module.exports = {
  ...webpackConfig,
  plugins,
};
