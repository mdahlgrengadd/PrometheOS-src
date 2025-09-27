const { ModuleFederationPlugin } = require('@module-federation/enhanced');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Configuration constants - modify these for different environments
const SHARED_UI_KIT_URL = process.env.SHARED_UI_KIT_URL || 'http://localhost:3003';
const DEV_SERVER_PORT = process.env.DEV_SERVER_PORT || 3003;

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  
  devServer: {
    port: DEV_SERVER_PORT,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  output: {
    publicPath: `${SHARED_UI_KIT_URL}/`,
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': require('path').resolve(__dirname, 'src'),
      // Keep local alias only for build-time resolution; Module Federation will still share
      '@shared/api-client': require('path').resolve(__dirname, '../shared-api-client/src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              jsx: 'react-jsx',
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shared_ui_kit',
      filename: 'remoteEntry.js',
      exposes: {
        './ui-kit': './src/index.ts',
      },
      shared: {
        react: {
          singleton: true,
          eager: true,
          strictVersion: false,
          requiredVersion: false,
        },
        'react-dom': {
          singleton: true,
          eager: true,
          strictVersion: false,
          requiredVersion: false,
        },
        'react/jsx-runtime': {
          singleton: true,
          eager: true,
          strictVersion: false,
          requiredVersion: false,
        },
        '@shared/api-client': {
          singleton: true,
          eager: true,
          strictVersion: false,
          requiredVersion: false,
        },
      },
    }),
    
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
