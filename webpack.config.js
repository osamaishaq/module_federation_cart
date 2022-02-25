const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

const deps = require("./package.json").dependencies;
module.exports = (_, argv) => ({
  output: {
    publicPath:
      argv.mode === "development"
        ? "http://localhost:3002/"
        : "https://module-federation-cart.vercel.app/",
  },

  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  devServer: {
    port: 3002,
    historyApiFallback: true,
  },

  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "cart",
      filename: "remoteEntry.js",
      remotes: {
        home:
          argv.mode === "development"
            ? "home@http://localhost:3000/remoteEntry.js"
            : "home@https://module-federation-home.vercel.app/remoteEntry.js",
        pdp:
          argv.mode === "development"
            ? "pdp@http://localhost:3001/remoteEntry.js"
            : "https://module-federation-pdp.vercel.app/remoteEntry.js",
        cart:
          argv.mode === "development"
            ? "cart@http://localhost:3002/remoteEntry.js"
            : "cart@https://module-federation-cart.vercel.app/remoteEntry.js",
      },
      exposes: {
        "./cart": "./src/cart.js",
        "./Login": "./src/Login.jsx",
        "./MiniCart": "./src/MiniCart.jsx",
        "./CartContent": "./src/CartContent.jsx",
      },
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: deps["react-dom"],
        },
      },
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
    }),
  ],
});
