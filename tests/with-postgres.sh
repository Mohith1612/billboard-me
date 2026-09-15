#!/usr/bin/env bash
set -euo pipefail

# Runs a command with TEST_DATABASE_URL pointing at a disposable PostgreSQL 16
# server, then removes it. This is how `pnpm test` supplies a database without
# anyone configuring one.
#
# The application's own variables are removed from the command's environment, so
# a test can never fall back to a developer's database. The container publishes
# on an ephemeral loopback port, so parallel runs and an already-running local
# PostgreSQL do not collide.
#
# Set TEST_DATABASE_URL yourself to reuse a cluster you already have. It must be
# one you can afford to have databases and roles created on and dropped from.

if [[ $# -eq 0 ]]; then
  echo "usage: tests/with-postgres.sh <command> [args...]" >&2
  exit 64
fi

run_command() {
  env -u DATABASE_URL -u DATABASE_MIGRATION_URL TEST_DATABASE_URL="$1" "${@:2}"
}

if [[ -n "${TEST_DATABASE_URL:-}" ]]; then
  echo "Using the TEST_DATABASE_URL already set in this shell."
  run_command "$TEST_DATABASE_URL" "$@"
  exit $?
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Required command not found: docker. Start a throwaway PostgreSQL yourself and export TEST_DATABASE_URL instead. See docs/development/testing.md." >&2
  exit 1
fi

container_name="billboard-test-postgres-$RANDOM-$$"
# Disposable by construction: this password only ever reaches a container that
# is removed when the command returns.
postgres_password="harness-test-only"

cleanup() {
  docker rm --force "$container_name" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run --detach --rm \
  --name "$container_name" \
  --env POSTGRES_PASSWORD="$postgres_password" \
  --publish 127.0.0.1::5432 \
  postgres:16-alpine >/dev/null

# Readiness is checked over TCP, not over the Unix socket: the image bootstraps
# the cluster with a temporary server that listens on the socket only, so a
# socket check reports "ready" during initialisation and again reports failure
# moments later when that server is shut down and restarted.
postgres_ready() {
  docker exec "$container_name" pg_isready --host 127.0.0.1 --username postgres >/dev/null 2>&1
}

for _ in {1..60}; do
  if postgres_ready; then
    break
  fi
  sleep 1
done
if ! postgres_ready; then
  echo "The disposable PostgreSQL container did not become ready." >&2
  docker logs "$container_name" >&2 || true
  exit 1
fi

postgres_port="$(docker port "$container_name" 5432/tcp | sed 's/.*://')"

status=0
run_command "postgresql://postgres:${postgres_password}@127.0.0.1:${postgres_port}/postgres" "$@" || status=$?
exit "$status"
