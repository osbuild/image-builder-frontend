const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack'); // Add this line
const [mode, devtool] =
  process.env.NODE_ENV === 'production'
    ? ['production', 'source-map']
    : ['development', 'inline-source-map'];

const output = {
  path: path.resolve('cockpit/public'),
  filename: 'main.js',
  sourceMapFilename: '[file].map',
};

const plugins = [
  new MiniCssExtractPlugin({
    ignoreOrder: true,
  }),
  new webpack.DefinePlugin({
    'process.env.IS_ON_PREMISE': JSON.stringify(true),
  }),
];

module.exports = {
  entry: './src/AppCockpit.tsx',
  output,
  mode,
  devtool,
  plugins,
  resolve: {
    modules: ['node_modules', 'pkg/lib'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      cockpit: path.resolve(__dirname, '../pkg/lib/cockpit'),
      fsinfo: path.resolve(__dirname, '../pkg/lib/cockpit/fsinfo'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: [path.resolve('src'), path.resolve(path.join('pkg', 'lib'))],
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
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
};
