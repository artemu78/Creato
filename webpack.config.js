const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/renderer.js", // Update the entry point if necessary
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  target: "electron-renderer", // Add this line
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
  experiments: {
    outputModule: true,
  },
  output: {
    module: true,
    filename: "bundle.js",
    path: path.resolve(__dirname, "src"),
  },
  externals: {
    fs: "commonjs fs", // Add this line
    path: "commonjs path", // Add this line
    electron: "commonjs electron", // Add this line
  },
  plugins: [
    new NodePolyfillPlugin(), // Add this line
  ],
};
