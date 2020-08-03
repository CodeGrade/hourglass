process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const environment = require('./environment')

environment.loaders.prepend('ignore', {
  test: /graphiql|wdyr/,
  loader: 'ignore-loader',
});

module.exports = environment.toWebpackConfig()
