#!/bin/sh

cd app

if [ ! -f "README.md" ]; then
  echo "Did not detect repo. Make sure it is mounted at $(pwd)."
  exit 1
fi

echo Generating rails secret.
export SECRET_KEY_BASE=$(rails secret)

echo Updating graphql schema file.
RAILS_ENV=development rails graphql:update_schema

echo Updating persisted relay queries.
yarn run relay-persist

echo Compiling webpack assets.
rails assets:precompile

echo Setting up database.
rails db:setup

exec bundle exec "$@"
