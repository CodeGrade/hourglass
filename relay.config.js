module.exports = {
  // ...
  // Configuration options accepted by the `relay-compiler` command-line tool and `babel-plugin-relay`.
  src: './app/packs/components',
  schema: './app/packs/relay/data/schema.json',
  exclude: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],
  extensions: ['ts', 'tsx'],
  language: 'typescript',
  noFutureProofEnums: true,
  customScalars: {
    ISO8601DateTime: 'string',
  },
};
