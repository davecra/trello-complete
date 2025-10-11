/* eslint-disable no-undef */
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require("fs");
const packageJson = require('./package.json');
async function getHttpsOptions() {
  return { key: fs.readFileSync('./certs/server.key'), cert: fs.readFileSync('./certs/server.cert') };
}
/*"node server.js", */
module.exports = async (env, options) => {
  const isProduction = options.mode === 'production';
  const config = {
    devtool: isProduction ? false : 'source-map',
    mode: isProduction ? 'production' : "development",
    entry: {
      client: "./js/client.js",
      details: "./js/details.js",
    },
    output: {
      devtoolModuleFilenameTemplate: "webpack:///[resource-path]?[loaders]",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"],
    },
    optimization: {
      minimize: true,
      runtimeChunk: 'single',
      minimizer: [new TerserPlugin({
        extractComments: false,
      })],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "images/*",
            to: "images/[name][ext][query]",
          },
          {
            from: "public",
            to: "."
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "./views/index.html",
        chunks: ["client"],
      }),
      new HtmlWebpackPlugin({
        filename: "details.html",
        template: "./views/index.html",
        chunks: ["details"],
      }),
      new ReplaceInFileWebpackPlugin([{
        dir: "dist",
        files: ["version.html"],
        rules: [{
            search: "__VERSION__",
            replace: packageJson.version
        },{
            search: "__APPNAME__",
            replace: packageJson.appName
        }]
      }]),
    ],
    devServer: {
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      https: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
      port: process.env.npm_package_config_dev_server_port || 54104,
    },
  };

  return config;
};