const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    debug: true,
    port: 8002,
    useFileHash: false,
    skipChrome2: false,
});

console.log('CONFIG', config);

plugins.push(
    require('@redhat-cloud-services/frontend-components-config/federated-modules')({
        root: resolve(__dirname, '../'),
        useFileHash: false,
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
