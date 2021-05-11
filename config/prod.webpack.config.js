const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    skipChrome2: false,
});

plugins.push(
    require('@redhat-cloud-services/frontend-components-config/federated-modules')({
        root: resolve(__dirname, '../'),
        moduleName: 'image_builder',
        exposes: {
            './RootApp': resolve(__dirname, '../src/AppEntry.js'),
        },
    })
);

module.exports = {
    ...webpackConfig,
    plugins
};
