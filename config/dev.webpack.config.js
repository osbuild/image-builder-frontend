
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    debug: true,
    https: false,
    port: 8002,
});

module.exports = {
    ...webpackConfig,
    plugins
};
