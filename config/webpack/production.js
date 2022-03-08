process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const { merge } = require('@rails/webpacker');
const webpackConfig = require('./base')

module.exports = merge(
  {
    module: {
      rules: [
        {
          test: /graphiql|wdyr/,
          use: [{ loader: 'ignore-loader' }],
        },
      ],
    },
  },
  webpackConfig,
);

module.exports = webpackConfig
