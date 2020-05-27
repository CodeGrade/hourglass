const { environment } = require('@rails/webpacker');
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
  '@student': path.resolve(__dirname, '..', '..', 'app/javascript/workflows/student'),
  '@proctor': path.resolve(__dirname, '..', '..', 'app/javascript/workflows/proctor'),
  '@professor': path.resolve(__dirname, '..', '..', 'app/javascript/workflows/professor'),
};

environment.config.set('resolve.alias', aliasConfig);

environment.loaders.prepend('typescript', typescript)
module.exports = environment;
