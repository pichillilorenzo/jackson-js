const webpack = require('webpack');
const path = require('path');

const defaultConfig = {
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: [/node_modules/, /tests/],
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.prod.json'),
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
  mode: 'production',
  plugins: []
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
