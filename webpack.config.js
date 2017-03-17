const path = require('path'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
  entry: './client/pdk.js',

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'pdk-client-bundle.js'
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', options: { babelrc: false } }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'pdk.html',
      template: 'pdk.template.ejs',
      inlineSource: '.(js|css|html)$',
    }),
    new HtmlWebpackInlineSourcePlugin(),
  ]
};
