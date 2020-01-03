const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PreloadWebpackPlugin = require("preload-webpack-plugin");
const CssUrlRelativePlugin = require("css-url-relative-plugin");
const processNunjucksPages = require("./processNjkHelper.js");

const IS_DEV = process.env.NODE_ENV === "dev";

const config = {
  mode: IS_DEV ? "development" : "production",
  devtool: IS_DEV ? "eval-source-map" : "source-map",
  entry: "./src/js/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].[hash].js"
    //publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.scss|.css$/,
        use: [
          IS_DEV ? "style-loader" : MiniCssExtractPlugin.loader,
          //{ loader: "css-loader", options: { importLoaders: 1 } },
          "css-loader",
          "postcss-loader",
          "sass-loader"
          /*{
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }*/
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/"
            }
          }
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "public/img"
            }
          },
          // WARNING: We used 'file-loader' instead of 'url-loader' because of an error when running build task.
          // TODO: Research/Fix why the 'url-loader' isn't working.
          /* {
            loader: "url-loader",
            options: {
              limit: 8000,
              name: "[path][name].[ext]?[hash]",
              fallback: "file-loader"
            }
          }, */
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              pngquant: {
                quality: "65-90",
                speed: 4
              },
              gifsicle: {
                interlaced: false
              },
              svgo: {
                plugins: [
                  { removeTitle: true },
                  { convertColors: { shorthex: false } },
                  { convertPathData: false }
                ]
              },
              webp: {
                quality: 75
              }
            }
          }
        ]
      },
      {
        test: /\.(nunjucks)$/i,
        use: [
          "html-loader",
          {
            loader: "nunjucks-webpack-loader",
            options: {
              alias: {
                demo: path.resolve(__dirname, "src/partials/demo"),
                blog: path.resolve(__dirname, "src/partials/blog"),
                blocks: path.resolve(__dirname, "src/partials/blocks"),
                components: path.resolve(__dirname, "src/partials/components"),

                layout: path.resolve(__dirname, "src/partials/layout"),
                heading: path.resolve(__dirname, "src/partials/heading"),
                sections: path.resolve(__dirname, "src/partials/sections")
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "windows.jQuery": "jquery"
    }),
    new CopyWebpackPlugin([
      {
        from: "./src/public",
        to: "public"
      }
    ]),
    new MiniCssExtractPlugin({
      filename: IS_DEV ? "css/[name].css" : "css/[name].[contenthash].css",
      chunkFilename: "css/[id].css"
    }),
    new webpack.HashedModuleIdsPlugin(),
    new PreloadWebpackPlugin({
      include: "initial"
    }),
    new CssUrlRelativePlugin()
  ].concat(processNunjucksPages({ IS_DEV })),
  devServer: {
    contentBase: path.join(__dirname, "src")
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: "initial",
          name: "vendor",
          priority: 10,
          enforce: true
        }
      }
    },
    minimizer: []
  }
};

if (!IS_DEV) {
  const TerserPlugin = require("terser-webpack-plugin");
  const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

  config.optimization.minimizer.push(
    new TerserPlugin(),
    new OptimizeCSSAssetsPlugin({})
  );
}

module.exports = config;
