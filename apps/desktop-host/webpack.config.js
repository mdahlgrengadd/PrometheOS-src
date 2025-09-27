const { ModuleFederationPlugin } = require('@module-federation/enhanced');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    port: 3011,
    host: 'localhost',
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
    publicPath: 'http://localhost:3011/',
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

      // Remotes - dynamically loaded applications
      remotes: {
        notepad: 'notepad@http://localhost:3001/remoteEntry.js',
        // calculator: 'calculator@http://localhost:3002/remoteEntry.js', // Disabled until implemented
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