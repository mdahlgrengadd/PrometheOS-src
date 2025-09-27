const { ModuleFederationPlugin } = require('@module-federation/enhanced');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  
  devServer: {
    port: 3003,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  output: {
    publicPath: 'http://localhost:3003/',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': require('path').resolve(__dirname, 'src'),
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
      },
    }),
    
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};