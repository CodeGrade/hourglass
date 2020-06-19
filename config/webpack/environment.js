const { environment } = require('@rails/webpacker');
const path = require('path')

const webpack = require('webpack');

environment.plugins.prepend('Provide',
  new webpack.ProvidePlugin({
    $: 'jquery/src/jquery',
    jQuery: 'jquery/src/jquery',
    Popper: ['popper.js', 'default'],
  })
);

const aliasConfig = {
  'jquery': 'jquery/src/jquery',
  '@hourglass': path.resolve(__dirname, '..', '..', 'app/javascript/components'),
  '@student': path.resolve(__dirname, '..', '..', 'app/javascript/components/workflows/student'),
  '@proctor': path.resolve(__dirname, '..', '..', 'app/javascript/components/workflows/proctor'),
  '@professor': path.resolve(__dirname, '..', '..', 'app/javascript/components/workflows/professor'),
};

environment.config.set('resolve.alias', aliasConfig);
environment.config.set('optimization.usedExports', true);
environment.config.set('optimization.sideEffects', true);

environment.config.merge({
  optimization: {
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

environment.loaders.prepend('babel', {
  test: /.(ts|tsx)$/,
  loader: ['babel-loader'],
  exclude: [/node_modules/],
});

module.exports = environment;
