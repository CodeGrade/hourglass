const { environment } = require('@rails/webpacker');
const path = require('path')

const webpack = require('webpack');

const aliasConfig = {
  '@hourglass': path.resolve(__dirname, '..', '..', 'app/javascript/components'),
  '@student': path.resolve(__dirname, '..', '..', 'app/javascript/components/workflows/student'),
  '@proctor': path.resolve(__dirname, '..', '..', 'app/javascript/components/workflows/proctor'),
  '@professor': path.resolve(__dirname, '..', '..', 'app/javascript/components/workflows/professor'),
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
