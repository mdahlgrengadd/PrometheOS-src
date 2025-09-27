const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Configuration constants - modify these for different environments
const HOST_URL = process.env.HOST_URL || 'http://localhost:3011';
const NOTEPAD_REMOTE_URL = process.env.NOTEPAD_REMOTE_URL || 'http://localhost:3001';
const CALCULATOR_REMOTE_URL = process.env.CALCULATOR_REMOTE_URL || 'http://localhost:3002';
const SHARED_UI_KIT_URL = process.env.SHARED_UI_KIT_URL || 'http://localhost:3003';
const DEV_SERVER_PORT = process.env.DEV_SERVER_PORT || 3011;
const DEV_SERVER_HOST = process.env.DEV_SERVER_HOST || 'localhost';

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': './src',
      '@src': './src',
    },
  },
  devServer: {
    port: DEV_SERVER_PORT,
    host: DEV_SERVER_HOST,
    historyApiFallback: true,
    static: {
      directory: './public'
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  output: {
    publicPath: `${HOST_URL}/`,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        use: {
          loader: 'babel-loader'
        },
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
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'desktop_host',
      filename: 'remoteEntry.js',

      // Exports - what the host exposes to remotes
      exposes: {
        './ApiProvider': './src/api/ApiProvider.tsx',
        './HostApiBridge': './src/api/HostApiBridge.tsx',
      },

      // Remotes - dynamically loaded applications
      remotes: {
        notepad: `notepad@${NOTEPAD_REMOTE_URL}/remoteEntry.js`,
        // calculator: `calculator@${CALCULATOR_REMOTE_URL}/remoteEntry.js`, // Disabled until implemented
        // More remotes will be added dynamically via registry
      },

      // Shared libraries - singletons across all apps
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: '^18.3.1',
        },
        'react-dom': {
          singleton: true,
          eager: true,
          requiredVersion: '^18.3.1',
        },
        zustand: {
          singleton: true,
          eager: true,
          requiredVersion: '^5.0.3',
        },
        comlink: {
          singleton: true,
          eager: true,
          requiredVersion: '^4.4.2',
        },
        '@shared/ui-kit': {
          singleton: true,
          eager: true,
        },
        '@shared/api-client': {
          singleton: true,
          eager: true,
        },
        '@shared/themes': {
          singleton: true,
          eager: true,
        },
        '@shared/workers': {
          singleton: true,
          eager: true,
        },
      },
    }),

    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'PrometheOS - Module Federation Desktop',
    }),
  ],
};
