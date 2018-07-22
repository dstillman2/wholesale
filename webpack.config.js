const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

let plugins = [];

let filename = 'bundle.js';

const pluginsProd = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }),

  new UglifyJsPlugin(),
];

const pluginsDev = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('development'),
    },
  }),
];

if (process.env.NODE_ENV === 'production') {
  plugins = plugins.concat(pluginsProd);
  filename = 'bundle.min.js';
} else {
  plugins = plugins.concat(pluginsDev);
}

module.exports = {
  entry: {
    wholesale: path.join(__dirname, 'src', 'app.client_portal', 'index.jsx'),
    embed: path.join(__dirname, 'src', 'embed.ecommerce', 'index.jsx'),
    ecommerce: path.join(__dirname, 'src', 'server.ecommerce', 'js', 'index.js'),
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: `[name]/static/js/[name].${filename}`,
  },

  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'flow'],
        },
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  plugins,
};
