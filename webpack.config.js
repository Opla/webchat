/* eslint-disable no-undef */
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const jsConfig = {
  entry: "./src/js/app.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "js/app.js",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "./src/images",
        to: path.resolve(__dirname, "./dist/images"),
        force: true,
      },
      {
        from: "./server",
        to: path.resolve(__dirname, "./dist"),
        force: true,
      },
      {
        from: "./favicon.ico",
        to: path.resolve(__dirname, "./dist"),
        force: true,
      },
    ]),
    new HtmlWebpackPlugin({
      filename: "template.php",
      path: path.resolve(__dirname, "./dist"),
      template: "./server/template.php",
    }),
  ],
};

const cssConfig = {
  entry: "./src/css/index.scss",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "css/index.css",
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader"],
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin({
      filename: "css/index.css",
    }),
  ],
};

module.exports = [jsConfig, cssConfig];
