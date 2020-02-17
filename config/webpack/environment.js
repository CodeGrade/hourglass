const { environment } = require('@rails/webpacker');

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
  'jquery-ui': 'jquery-ui-dist/jquery-ui.js',
};

environment.config.set('resolve.alias', aliasConfig);

module.exports = environment;
