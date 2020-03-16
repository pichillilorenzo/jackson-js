const webpack = require('webpack');
const path = require('path');

const babelOptions = {
  presets: ['@babel/typescript'],
  plugins: [
    ['@babel/plugin-transform-runtime'],
    ['@babel/plugin-syntax-bigint'],
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true
      }
    ],
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true
      }
    ]
  ]
};

const defaultConfig = {
  watch: true,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/(node_modules|bower_components)/, /tests/],
        use: [
          {
            loader: 'babel-loader',
            options: babelOptions
          },
          {
            loader: 'eslint-loader'
          }
        ]
      },
      {
        test: /\.ts(x?)$/,
        exclude: [/node_modules/, /tests/],
        use: [
          {
            loader: 'babel-loader',
            options: babelOptions
          },
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            }
          },
          {
            loader: 'eslint-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  mode: 'development',
  plugins: []
};

const serverConfig = {
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.node.js'
  },
  ...defaultConfig
};

const clientConfig = {
  target: 'web', // <=== can be omitted as default is 'web'
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.js'
  },
  ...defaultConfig
};

module.exports = [ serverConfig, clientConfig ];
