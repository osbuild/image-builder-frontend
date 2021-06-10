const { DefinePlugin } = require('webpack');
const { resolve } = require('path');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    debug: true,
    port: 8002,
    useFileHash: false,
    sassPrefix: '.image-builder, body',
    skipChrome2: true,
});

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

plugins.push(new DefinePlugin({
    COMMITHASH: JSON.stringify((new GitRevisionPlugin()).commithash()),
}));

module.exports = {
    ...webpackConfig,
    plugins
};
