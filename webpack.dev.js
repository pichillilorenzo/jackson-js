const webpack = require('webpack');
const path = require('path');

const defaultConfig = {
  watch: true,
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: [/node_modules/, /tests/],
        use: [
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
  devtool: 'inline-source-map',
  mode: 'development',
  plugins: []
};

const testConfig = {
  watch: true,
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: [/node_modules/],
        include: [/src/, /tests/],
        use: [
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
  devtool: 'inline-source-map',
  mode: 'development',
  plugins: [],
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'test.node.js'
  },
};

const serverConfig = {
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.node.js',
    library: 'jackson-js',
    libraryTarget: 'umd'
  },
  ...defaultConfig
};

const clientConfig = {
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.js',
    library: 'jackson-js',
    libraryTarget: 'umd'
  },
  ...defaultConfig
};

module.exports = [ serverConfig, clientConfig ];
