process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const webpackConfig = require('./base')

webpackConfig.loaders.prepend('ignore', {
  test: /graphiql|wdyr/,
  loader: 'ignore-loader',
});

module.exports = webpackConfig
