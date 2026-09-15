#!/usr/bin/env bash
set -euo pipefail

# Environment-contract checks for FOUNDATION-002.
#
# Everything runs against a disposable copy of the application that contains no
# `.env*` file, so the only configuration is what each case passes explicitly.
# The repository's own `.env.local` is never read.
#
# Covered:
#   1. a production build refuses a missing canonical origin
#   2. a production build refuses an invalid canonical origin
#   3. a build with no database configured still succeeds, and the origin it was
#      given is the one actually served in robots.txt and the sitemap
#   4. a missing DATABASE_URL fails at the database boundary, naming the variable
#   5. a malformed DATABASE_URL fails the same way

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# The fixture lives inside the repository, not in /tmp: Turbopack refuses a
# node_modules symlink that leaves the project root, so the copy instead
# resolves packages by walking up to the repository's own node_modules. Next.js
# reads `.env*` only from the project directory it is given, so the fixture sees
# no environment file of its own.
fixture_root="$repo_root/.tmp-env-check"
log_file="$(mktemp)"
response_file="$(mktemp)"
server_pid=""
site_origin="https://billboard.example"

cleanup() {
  stop_server
  rm -rf "$fixture_root"
  rm -f "$log_file" "$response_file"
}

# Servers are started with `setsid`, so signalling the negated PID takes down
# the whole session. `next dev` refuses to start while an earlier instance for
# the same directory is alive, and it leaves worker processes behind if only the
# parent is killed.
stop_server() {
  if [[ -n "$server_pid" ]]; then
    kill -TERM -- "-$server_pid" 2>/dev/null || kill -TERM "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
    for _ in {1..30}; do
      if ! kill -0 -- "-$server_pid" 2>/dev/null; then
        break
      fi
      sleep 1
    done
    server_pid=""
  fi
}
trap cleanup EXIT

for command_name in curl setsid; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command not found: $command_name" >&2
    exit 1
  fi
done

rm -rf "$fixture_root"
mkdir -p "$fixture_root"
cp -R "$repo_root/src" "$fixture_root/src"
cp "$repo_root/package.json" "$repo_root/tsconfig.json" "$repo_root/next.config.ts" \
  "$repo_root/postcss.config.mjs" "$repo_root/next-env.d.ts" "$fixture_root/"

# Leading NAME=VALUE arguments become the environment for this run; everything
# after them is passed to `next`. `env -u` guards against a developer shell that
# already exports any of these.
run_next() {
  local assignments=()
  while [[ "${1-}" == *=* ]]; do
    assignments+=("$1")
    shift
  done

  env -u DATABASE_URL -u DATABASE_MIGRATION_URL -u NEXT_PUBLIC_SITE_URL \
    ${assignments[@]+"${assignments[@]}"} "$repo_root/node_modules/.bin/next" "$@"
}

fail() {
  echo "$1" >&2
  cat "$log_file" >&2
  exit 1
}

expect_build_failure() {
  local description="$1" expected="$2"
  shift 2

  rm -rf "$fixture_root/.next"
  if run_next "$@" build "$fixture_root" >"$log_file" 2>&1; then
    fail "Expected the build to fail: ${description}"
  fi
  if ! grep -q "$expected" "$log_file"; then
    fail "Build failed without mentioning ${expected}: ${description}"
  fi
  echo "ok: ${description}"
}

# start_server <next-command> <port> [NAME=VALUE ...]
start_server() {
  local next_command="$1" port="$2"
  shift 2

  local assignments=()
  while [[ "${1-}" == *=* ]]; do
    assignments+=("$1")
    shift
  done

  : >"$log_file"
  setsid env -u DATABASE_URL -u DATABASE_MIGRATION_URL -u NEXT_PUBLIC_SITE_URL \
    ${assignments[@]+"${assignments[@]}"} "$repo_root/node_modules/.bin/next" \
    "$next_command" "$fixture_root" --hostname 127.0.0.1 --port "$port" \
    >"$log_file" 2>&1 &
  server_pid=$!

  for _ in {1..60}; do
    if curl --silent --fail "http://127.0.0.1:${port}/" >/dev/null 2>&1; then
      return 0
    fi
    if ! kill -0 "$server_pid" 2>/dev/null; then
      fail "Server exited before it accepted requests"
    fi
    sleep 1
  done
  fail "Server did not become ready"
}

post_waitlist() {
  local port="$1"
  curl --silent --output "$response_file" --write-out '%{http_code}' \
    --header 'content-type: application/json' \
    --data '{"kind":"seller","name":"Env check","email":"env-check@example.test"}' \
    "http://127.0.0.1:${port}/api/waitlist"
}

expect_database_boundary_failure() {
  local description="$1" expected="$2" database_url="${3-}"
  local port="$((41000 + RANDOM % 20000))"

  if [[ -n "$database_url" ]]; then
    start_server dev "$port" NEXT_PUBLIC_SITE_URL="$site_origin" DATABASE_URL="$database_url"
  else
    start_server dev "$port" NEXT_PUBLIC_SITE_URL="$site_origin"
  fi

  local status
  status="$(post_waitlist "$port")"
  if [[ "$status" != "500" ]]; then
    cat "$response_file" >&2
    fail "Expected HTTP 500 from the waitlist route, got ${status}: ${description}"
  fi
  if ! grep -q "$expected" "$log_file"; then
    fail "Server log did not report \"${expected}\": ${description}"
  fi
  stop_server
  echo "ok: ${description}"
}

# 1 and 2: the canonical origin is a build-time input, so the build is the only
# place a missing or malformed value can still be rejected.
expect_build_failure "production build rejects a missing canonical origin" "NEXT_PUBLIC_SITE_URL"
expect_build_failure "production build rejects an invalid canonical origin" "NEXT_PUBLIC_SITE_URL" \
  NEXT_PUBLIC_SITE_URL="billboard.example/landing"

# 3: static validation must not require a database.
rm -rf "$fixture_root/.next"
if ! run_next NEXT_PUBLIC_SITE_URL="$site_origin" build "$fixture_root" >"$log_file" 2>&1; then
  fail "Expected a build with no DATABASE_URL to succeed"
fi
echo "ok: production build succeeds with no DATABASE_URL configured"

start_port="$((41000 + RANDOM % 20000))"
start_server start "$start_port" NEXT_PUBLIC_SITE_URL="$site_origin"
served_robots="$(curl --silent --fail "http://127.0.0.1:${start_port}/robots.txt")"
served_sitemap="$(curl --silent --fail "http://127.0.0.1:${start_port}/sitemap.xml")"
stop_server

for served in "$served_robots" "$served_sitemap"; do
  if [[ "$served" != *"${site_origin}/"* ]]; then
    echo "Served metadata did not use the configured origin:" >&2
    echo "$served" >&2
    exit 1
  fi
  if [[ "$served" == *"localhost"* ]]; then
    echo "Served metadata fell back to localhost:" >&2
    echo "$served" >&2
    exit 1
  fi
done
echo "ok: robots.txt and sitemap.xml use the configured origin"

# 4 and 5: the database boundary reports its own variable rather than failing
# somewhere downstream with a connection error.
expect_database_boundary_failure "missing DATABASE_URL fails at the database boundary" \
  "DATABASE_URL is not set"
expect_database_boundary_failure "malformed DATABASE_URL fails at the database boundary" \
  "DATABASE_URL is not a valid URL" "not-a-postgres-url"

echo "environment checks passed"
