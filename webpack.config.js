const webpack = require('webpack');
const path = require('path');

module.exports = {
  watch: true,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              [
                "@babel/plugin-proposal-decorators",
                {
                  "legacy": true
                }
              ],
              [
                "@babel/plugin-proposal-class-properties",
                {
                  "loose": true
                }
              ],
              [
                "@babel/proposal-object-rest-spread"
              ]
            ]
          }
        }
      }
    ]
  },
  mode: 'development',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
  },
};