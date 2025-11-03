/* eslint-disable no-undef */
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const packageJson = require('./package.json');

const outputDir = path.resolve(__dirname, "dist");
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true }); // deep clean
}

async function getHttpsOptions() {
  return { 
    key: fs.readFileSync('./certs/server.key'), 
    cert: fs.readFileSync('./certs/server.cert'),
    ca: fs.readFileSync("./certs/ca.crt"),
  };
}

// Plugin to create stable stub JS outside version folder
class StableEntryPlugin {
  apply(compiler) {
    compiler.hooks.done.tap("StableEntryPlugin", (stats) => {
      const json = stats.toJson({ all: false, assets: true, chunks: true, entrypoints: true });

      const entrypoints = json.entrypoints || {};
      Object.keys(entrypoints).forEach((chunkName) => {
        const assets = entrypoints[chunkName].assets || [];
        const jsFile = assets.find(f => {
          const fileName = typeof f === 'string' ? f : f.name || f.path;
          return fileName && fileName.endsWith(".js");
        });
        if (!jsFile) return;

        const jsFilePath = typeof jsFile === 'string' ? jsFile : jsFile.name || jsFile.path;
        const buildRoot = path.resolve(compiler.options.output.path, ".."); // points to dist/build
        const stablePath = path.join(buildRoot, `${chunkName}.js`); // => dist/details.js
        const content = /*html*/`
          (() => {
            const script = document.createElement("script");
            script.src = './v${packageJson.version}/${jsFilePath}';
            document.head.appendChild(script);
          })();
        `;
        fs.writeFileSync(stablePath, content);
        console.log(`✅ Created stable ${chunkName}.js -> v${packageJson.version}/${jsFilePath}`);
      });
    });
  }
}

// Plugin to add cache-busting GUID inside JS and HTML files
class CacheBustPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("CacheBustPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "CacheBustPlugin",
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          const guid = crypto.randomUUID();

          for (const filename of Object.keys(assets)) {
            const originalSource = assets[filename].source().toString();

            if (filename.endsWith(".js")) {
              const updatedSource = `/* CacheBust GUID: ${guid} */\n${originalSource}`;
              compilation.updateAsset(
                filename,
                new compiler.webpack.sources.RawSource(updatedSource)
              );
            } else if (filename.endsWith(".html")) {
              const updatedSource = originalSource.replace(
                "</head>",
                `<meta name="cache-bust-guid" content="${guid}">\n</head>`
              );
              compilation.updateAsset(
                filename,
                new compiler.webpack.sources.RawSource(updatedSource)
              );
            }
          }
        }
      );
    });
  }
}

module.exports = async (env, options) => {
  const isProduction = options.mode === 'production';
  return {
    devtool: isProduction ? false : 'source-map',
    mode: isProduction ? 'production' : "development",
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({
        extractComments: false,
      })],
    },
    entry: {
      client: "./js/client.js",
      details: "./js/details.js",
    },
    output: {
      path: isProduction
        ? path.resolve(__dirname, "dist", "build", `v${packageJson.version}`)
        : path.resolve(__dirname, "dist"),
      filename: isProduction ? "[name].[contenthash].js" : "[name].js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"],
    },
    module: { 
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],      
    },
    plugins: [
      isProduction && new CleanWebpackPlugin(),

      new CopyWebpackPlugin({
        patterns: [
          {
            from: "images/*",
            to: isProduction ? "../images/[name][ext][query]" : "images/[name][ext][query]",
          },
        ],
      }),

      // Version info page
      new HtmlWebpackPlugin({
        filename: isProduction ? "../version.html" : "version.html",
        template: "./public/version.html",
        inject: false,
        templateParameters: {
          VERSION: packageJson.version,
          APPNAME: packageJson.appName,
        },
      }),

      new HtmlWebpackPlugin({
        filename: isProduction ? "../index.html" : "index.html",
        template: "./views/index.html",
        chunks: [],
        inject: false,
        templateParameters: {
          BUST: Date.now(), // 👈 adds a cache-busting timestamp
        },
      }),
      new HtmlWebpackPlugin({
        filename: isProduction ? "../details.html" : "details.html",
        template: "./views/details.html",
        chunks: [],
        inject: false,
        templateParameters: {
          BUST: Date.now(), // 👈 adds a cache-busting timestamp
        },
      }),

      isProduction && new CacheBustPlugin(),
      isProduction && new StableEntryPlugin(),
    ],
    devServer: {
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      server:
        env.WEBPACK_BUILD || options.https !== undefined
          ? {
            type: options.https ? "https" : "http",
          }
          : {
            type: "https",
            options: await getHttpsOptions(),
          },
      port: process.env.npm_package_config_dev_server_port || 54104,
    },
  };
};