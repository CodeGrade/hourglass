module.exports = {
  // ...
  // Configuration options accepted by the `relay-compiler` command-line tool and `babel-plugin-relay`.
  src: './app/javascript/components',
  schema: './app/javascript/relay/data/schema.json',
  exclude: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],
  extensions: ['ts', 'tsx'],
  language: 'typescript',
  customScalars: {
    ISO8601DateTime: 'string',
  },
};
