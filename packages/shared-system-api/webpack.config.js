const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/index',
  target: 'web',

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@shared/api-client': path.resolve(__dirname, '../shared-api-client/src'),
    }
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ],
      }
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'shared_system_api',
      filename: 'remoteEntry.js',
      exposes: {
        './SystemApiProvider': './src/SystemApiProvider',
        './systemActions': './src/systemActions',
        './types': './src/types',
      },
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: '^18.3.1'
        },
        'react-dom': {
          singleton: true,
          eager: true,
          requiredVersion: '^18.3.1'
        },
        '@shared/api-client': {
          singleton: true,
          eager: true
        },
        '@shared/ui-kit': {
          singleton: true,
          eager: false
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],

  devServer: {
    port: 3004,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'auto',
  },
};