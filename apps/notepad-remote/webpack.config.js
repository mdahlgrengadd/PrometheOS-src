const { ModuleFederationPlugin } = require('@module-federation/enhanced');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

// Configuration constants - modify these for different environments
const NOTEPAD_REMOTE_URL = process.env.NOTEPAD_REMOTE_URL || 'http://localhost:3001';
const SHARED_UI_KIT_URL = process.env.SHARED_UI_KIT_URL || 'http://localhost:3003';
const DEV_SERVER_PORT = process.env.DEV_SERVER_PORT || 3001;

module.exports = {
  mode: 'development',
  entry: './src/index.ts',

  devServer: {
    port: DEV_SERVER_PORT,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },

  output: {
    publicPath: `${NOTEPAD_REMOTE_URL}/`,
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@shared/ui-kit$': path.resolve(__dirname, '../../packages/shared-ui-kit/src/index.ts'),
    },
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'notepad',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/bootstrap.tsx',
      },
      remotes: {
        shared_ui_kit: `shared_ui_kit@${SHARED_UI_KIT_URL}/remoteEntry.js`,
      },
      shared: {
        react: {
          singleton: true,
          strictVersion: false,
          requiredVersion: false,
          eager: true,
        },
        'react-dom': {
          singleton: true,
          strictVersion: false,
          requiredVersion: false,
          eager: true,
        },
        'react/jsx-runtime': {
          singleton: true,
          strictVersion: false,
          requiredVersion: false,
          eager: true,
        },
      },
    }),

    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],

  optimization: {
    splitChunks: false,
  },
};
