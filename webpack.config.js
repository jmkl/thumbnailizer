const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const sveltePreprocess = require("svelte-preprocess");
const tailwindcss = require("tailwindcss");
const TerserPlugin = require("terser-webpack-plugin");
const autoprefixer = require("autoprefixer");
const { preprocess } = require('svelte/compiler');
module.exports = {
  entry: './src/index.js',
  optimization:{
    minimize:true,
    minimizer:[new TerserPlugin()]
  },
  resolve: {
    alias: {
      svelte: path.resolve('node_modules', 'svelte/src/runtime'),
    },
    conditionNames: ['require', 'node', 'svelte'],
    extensions: ['.mjs', '.js', '.svelte'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
  },

  externals: {
    uxp: 'commonjs2 uxp',
    photoshop: 'commonjs2 photoshop',
    os: 'commonjs2 os',
    fs: 'commonjs2 fs',
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            emitCss: true,
            preprocess: sveltePreprocess({ postcss: { plugins: [tailwindcss, autoprefixer], }, }),
          }
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        // Prevents errors from Svelte on Webpack 5+
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: ['plugin'],
    }),
  ],
};