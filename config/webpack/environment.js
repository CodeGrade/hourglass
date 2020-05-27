const { environment } = require('@rails/webpacker');
const path = require('path')

const webpack = require('webpack');

const aliasConfig = {
  '@hourglass': path.resolve(__dirname, '..', '..', 'app/javascript'),
  '@student': path.resolve(__dirname, '..', '..', 'app/javascript/workflows/student'),
  '@proctor': path.resolve(__dirname, '..', '..', 'app/javascript/workflows/proctor'),
  '@professor': path.resolve(__dirname, '..', '..', 'app/javascript/workflows/professor'),
};

environment.config.set('resolve.alias', aliasConfig);
environment.config.set('optimization.usedExports', true);
environment.config.set('optimization.sideEffects', true);

environment.loaders.prepend('typescript', {
  test: /.(ts|tsx)$/,
  loader: 'babel-loader',
  exclude: [/node_modules/],
});

module.exports = environment;
