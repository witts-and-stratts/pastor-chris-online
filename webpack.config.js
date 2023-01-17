export const config = {
  mode: "production",
  entry: {
    app: "/src/ts/app.ts",
  },
  devtool: "inline-source-map",
  watch: true,
  output: {
    path: "/dist/assets/js",
    filename: "[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: [/node_modules/, /backend/],
      use: {
        // loader: "babel-loader",
        loader: "ts-loader",
      },
    }, ],
  },
};