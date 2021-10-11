const { webpackConfig, merge } = require('@rails/webpacker')
const webpack = require('webpack')
const path = require('path')

const aliasConfig = {
  jquery: 'jquery/src/jquery',
  '@hourglass': path.resolve(__dirname, '..', '..', 'app/packs/components'),
  '@grading': path.resolve(__dirname, '..', '..', 'app/packs/components/workflows/grading'),
  '@student': path.resolve(__dirname, '..', '..', 'app/packs/components/workflows/student'),
  '@proctor': path.resolve(__dirname, '..', '..', 'app/packs/components/workflows/proctor'),
  '@professor': path.resolve(__dirname, '..', '..', 'app/packs/components/workflows/professor'),
};

module.exports = merge(webpackConfig, {
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery/src/jquery',
      jQuery: 'jquery/src/jquery',
      Popper: ['popper.js', 'default'],
    }),
  ],
  resolve: {
    alias: aliasConfig,
  },
  optimization: {
    usedExports: true,
    sideEffects: true,
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
        },
      },
    },
  },
});
