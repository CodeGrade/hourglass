const { environment } = require('@rails/webpacker');
const typescript =  require('./loaders/typescript')

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
};

environment.config.set('resolve.alias', aliasConfig);

environment.loaders.prepend('typescript', typescript)
module.exports = environment;
