const { environment } = require('@rails/webpacker');
const erb = require('./loaders/erb')
const typescript =  require('./loaders/typescript')
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
  '@hourglass': path.resolve(__dirname, '..', '..', 'app/javascript'),
};

environment.config.set('resolve.alias', aliasConfig);

environment.loaders.prepend('typescript', typescript)
environment.loaders.prepend('erb', erb)
module.exports = environment;
