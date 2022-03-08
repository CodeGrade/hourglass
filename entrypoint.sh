#!/usr/bin/env bash
set -euo pipefail

rm -f /hourglass/tmp/pids/server.pid

exec "$@"
