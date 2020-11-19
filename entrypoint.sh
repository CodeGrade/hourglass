#!/bin/sh

cd app

if [ ! -f "README.md" ]; then
  echo "Did not detect repo. Make sure it is mounted at $(pwd)."
  exit 1
fi

echo Generating rails secret.
export SECRET_KEY_BASE=$(rails secret)

echo Updating graphql schema file.
rails graphql:update_schema

echo Compiling webpack assets.
rails webpacker:compile

echo Compiling relay queries.
yarn run relay-persist

exec bundle exec "$@"
