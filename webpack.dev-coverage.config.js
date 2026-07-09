const path = require('path');

const originalConfig = require(
  path.join(
    __dirname,
    'node_modules/@redhat-cloud-services/frontend-components-config/bin/dev-proxy.webpack.config.js',
  ),
);

if (process.env.COVERAGE === 'true') {
  // eslint-disable-next-line no-console
  console.log(
    '[45m[COVERAGE][0m Adding Istanbul instrumentation via dev-coverage config',
  );
  originalConfig.module = originalConfig.module || {};
  originalConfig.module.rules = originalConfig.module.rules || [];

  originalConfig.module.rules.push({
    test: /\.[jt]sx?$/,
    include: path.resolve(__dirname, 'src'),
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

module.exports = originalConfig;
