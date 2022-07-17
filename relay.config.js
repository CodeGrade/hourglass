module.exports = {
  // ...
  // Configuration options accepted by the `relay-compiler` command-line tool and `babel-plugin-relay`.
  src: './app/packs/components',
  schema: './app/packs/relay/data/schema.graphql',
  exclude: ['**/node_modules/**', '**/__generated__/**'],
  language: 'typescript',
  noFutureProofEnums: true,
  customScalars: {
    ISO8601DateTime: 'string',
  },
  persistConfig: {
    file: "./config/schemas/graphql-queries.json",
    algorithm: "MD5",
  },
};
