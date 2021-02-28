#!/bin/sh

echo "user: $(whoami)"

export RAILS_ENV=production
export RAILS_SERVE_STATIC_FILES=true

source /opt/rh/rh-nodejs12/enable
source /opt/rh/rh-ruby27/enable
source /opt/rh/rh-postgresql96/enable

su -c "/opt/rh/rh-postgresql96/root/usr/libexec/postgresql-ctl start -D ${PGDATA} -s -w -t ${PGSTARTTIMEOUT} -N 20" - postgres &

sleep 10

CMD="./entrypoint-hg.sh $@"
su -m -c "$CMD" - hourglass
