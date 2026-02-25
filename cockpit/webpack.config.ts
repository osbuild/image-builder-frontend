const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV === 'production';
const [mode, devtool] = isProduction
  ? ['production', 'source-map']
  : ['development', 'inline-source-map'];

const output = {
  path: path.resolve('cockpit/public'),
  filename: 'main.[contenthash].js',
  sourceMapFilename: '[file].map',
};

const plugins = [
  new MiniCssExtractPlugin({
    filename: 'main.[contenthash].css',
    ignoreOrder: true,
  }),
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, 'index.template.html'),
    filename: 'index.html',
    inject: true,
    scriptLoading: 'defer',
    templateParameters: {
      livereload: !isProduction,
    },
  }),
  new webpack.DefinePlugin({
    'process.env.IS_ON_PREMISE': JSON.stringify(true),
  }),
];

if (!isProduction) {
  plugins.push(
    new LiveReloadPlugin({
      appendScriptTag: false,
      port: 35729,
      delay: 2000,
      protocol: 'http',
    }),
  );
  plugins.push({
    apply: (compiler: any) => {
      compiler.hooks.done.tap('BuildCompletePlugin', (stats: any) => {
        if (stats.hasErrors()) return;
        const msg =
          compiler.watchMode ?
            '\x1b[32m✓ Build complete. Changes will auto-reload in the browser.\x1b[0m' :
            '\x1b[32m✓ Build complete. Open http://localhost:9091 when Cockpit has started.\x1b[0m';
        console.log('\n' + msg + '\n');
      });
    },
  });
}

module.exports = {
  entry: './src/AppCockpit.tsx',
  output,
  mode,
  devtool,
  plugins,
  stats: { colors: true },
  infrastructureLogging: { colors: true },
  devServer: {
    historyApiFallback: true, // Ensures all routes are served with `index.html`
  },
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
    },
    modules: [
      'node_modules',
      // this tells webpack to check `node_modules`
      // and `pkg/lib` for modules. This allows us
      // to import `cockpit` and `cockpit/fsinfo`
      path.resolve(__dirname, '../pkg/lib'),
    ],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: [
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, '../pkg/lib'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
        resolve: { fullySpecified: false },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { url: false },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,

          {
            loader: 'css-loader',
            options: { url: false },
          },
          'sass-loader',
        ],
      },
    ],
  },
};
