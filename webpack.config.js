const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
/* To use as production code to minimize bundle.js file.
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
plugins: [new MiniCssExtractPlugin(), new UglifyJsPlugin()],
*/
module.exports = {
  mode: "development",
  entry: './index.ts',
  devtool: 'eval-cheap-module-source-map',
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      { test: /\.css$/, use: ["style-loader","css-loader"] },
      { test: /\.(png|svg|jpe?g|gif|woff2?|ttf|eot)$/, use: [ 'file-loader' ] },
      {
        test: /\.s[ac]ss$/i, use: ['style-loader','css-loader','sass-loader',
        ],
      }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    sourceMapFilename: "bundle.map",
    publicPath: '/bundles/',
    libraryTarget: 'var',
    library: 'globular_1_0_0'
  },
};