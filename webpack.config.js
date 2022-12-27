const path = require("path");

module.exports = {
  entry: "./src/client/js/app.js",
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "dist/js"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
    ],
  },
};
