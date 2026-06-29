const path = require('path');

const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');
const webpack = require('webpack');

const srcDir = path.resolve(__dirname, 'src');

class IstanbulCoveragePlugin {
  apply(compiler) {
    if (process.env.COVERAGE !== 'true') {
      return;
    }

    compiler.options.module = compiler.options.module || {};
    compiler.options.module.rules = compiler.options.module.rules || [];
    const rules = compiler.options.module.rules;
    const alreadyAdded = rules.some((rule) =>
      rule && Array.isArray(rule.use)
        ? rule.use.some(
            (u) =>
              typeof u === 'object' &&
              typeof u.loader === 'string' &&
              u.loader.includes('istanbul'),
          )
        : typeof rule?.use === 'object' &&
          typeof rule.use?.loader === 'string' &&
          rule.use.loader.includes('istanbul'),
    );
    if (alreadyAdded) {
      return;
    }

    rules.push({
      test: /\.[jt]sx?$/,
      include: srcDir,
      exclude: /node_modules|\.test\.|\.spec\./,
      enforce: 'post',
      use: {
        loader: '@jsdevtools/coverage-istanbul-loader',
        options: {
          esModules: true,
          coverageGlobalScope: 'window',
          coverageGlobalScopeFunc: false,
        },
      },
    });
  }
}

const plugins = [new IstanbulCoveragePlugin()];

function add_define(key, value) {
  const definePluginIndex = plugins.findIndex(
    (plugin) => plugin instanceof webpack.DefinePlugin,
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
      }),
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
    }),
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
      '@': path.resolve(__dirname, 'src'),
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
      './ImageBuilderWidget': path.resolve(
        __dirname,
        './src/Components/Widgets/image-builder-widget.tsx',
      ),
    },
    shared: [{ 'react-router-dom': { singleton: true, version: '*' } }],
    exclude: ['react-router-dom'],
  },
  frontendCRDPath: path.resolve(__dirname, './deploy/frontend-clowder.yml'),
};
