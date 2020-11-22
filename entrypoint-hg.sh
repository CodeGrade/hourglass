#!/bin/sh

echo "user: $(whoami)"

export RAILS_ENV=production
export RAILS_SERVE_STATIC_FILES=true

source /opt/rh/rh-nodejs12/enable
source /opt/rh/rh-ruby27/enable
source /opt/rh/rh-postgresql96/enable

echo Generating rails secret.
export SECRET_KEY_BASE=$(rails secret)

echo Setting up database.
rails db:setup

exec bundle exec "$@"
