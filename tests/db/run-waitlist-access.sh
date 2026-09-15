#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
container_name="billboard-waitlist-$RANDOM-$$"
postgres_password="foundation-test-only"
server_password="waitlist-server-test-only"
next_pid=""
next_log="$(mktemp)"
response_file="$(mktemp)"

cleanup() {
  if [[ -n "$next_pid" ]]; then
    # The server is started under `setsid`, so the negated PID signals the whole
    # session. Killing only the wrapper leaves `next dev` running, and a second
    # run of this script then fails with "Another next dev server is already
    # running" for this directory.
    kill -TERM -- "-$next_pid" 2>/dev/null || kill -TERM "$next_pid" 2>/dev/null || true
    wait "$next_pid" 2>/dev/null || true
    next_pid=""
  fi
  docker rm --force "$container_name" >/dev/null 2>&1 || true
  rm -f "$next_log" "$response_file"
}
trap cleanup EXIT

for command_name in docker psql curl pnpm setsid; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command not found: $command_name" >&2
    exit 1
  fi
done

docker run --detach --rm \
  --name "$container_name" \
  --env POSTGRES_PASSWORD="$postgres_password" \
  --publish 127.0.0.1::5432 \
  postgres:16-alpine >/dev/null

for _ in {1..60}; do
  if docker exec "$container_name" pg_isready --username postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker exec "$container_name" pg_isready --username postgres >/dev/null

postgres_port="$(docker port "$container_name" 5432/tcp | sed 's/.*://')"
admin_url="postgresql://postgres:${postgres_password}@127.0.0.1:${postgres_port}"

psql "$admin_url/postgres" --set ON_ERROR_STOP=1 <<SQL
create role anon nologin;
create role authenticated nologin;
create role waitlist_server login password '${server_password}' bypassrls;
create database foundation_fresh;
create database foundation_upgrade;
SQL

apply_server_grants() {
  local database_url="$1"
  psql "$database_url" --set ON_ERROR_STOP=1 <<'SQL'
grant usage on schema public to waitlist_server;
grant insert on table public.seller_waitlist, public.brand_waitlist to waitlist_server;
SQL
}

fresh_admin_url="$admin_url/foundation_fresh"
psql "$fresh_admin_url" --set ON_ERROR_STOP=1 --file "$repo_root/drizzle/0000_clammy_ma_gnuci.sql" >/dev/null
psql "$fresh_admin_url" --set ON_ERROR_STOP=1 --file "$repo_root/drizzle/0001_many_vector.sql" >/dev/null
apply_server_grants "$fresh_admin_url"
psql "$fresh_admin_url" --file "$repo_root/tests/db/waitlist-access.sql"

upgrade_admin_url="$admin_url/foundation_upgrade"
psql "$upgrade_admin_url" --set ON_ERROR_STOP=1 --file "$repo_root/drizzle/0000_clammy_ma_gnuci.sql" >/dev/null
psql "$upgrade_admin_url" --set ON_ERROR_STOP=1 <<'SQL'
insert into public.seller_waitlist (name, email)
values ('Before migration', 'before-migration@example.test');
SQL
psql "$upgrade_admin_url" --set ON_ERROR_STOP=1 --file "$repo_root/drizzle/0001_many_vector.sql" >/dev/null
apply_server_grants "$upgrade_admin_url"
psql "$upgrade_admin_url" --set ON_ERROR_STOP=1 --tuples-only --command \
  "select 1 from public.seller_waitlist where email = 'before-migration@example.test'" \
  | grep -q 1
psql "$upgrade_admin_url" --file "$repo_root/tests/db/waitlist-access.sql"

server_url="postgresql://waitlist_server:${server_password}@127.0.0.1:${postgres_port}/foundation_fresh"
next_port="$((41000 + RANDOM % 20000))"
setsid env --chdir="$repo_root" \
  DATABASE_URL="$server_url" NEXT_PUBLIC_SITE_URL="http://127.0.0.1:${next_port}" \
  "$repo_root/node_modules/.bin/next" dev --hostname 127.0.0.1 --port "$next_port" \
  >"$next_log" 2>&1 &
next_pid=$!

for _ in {1..60}; do
  if curl --silent --fail "http://127.0.0.1:${next_port}/" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$next_pid" 2>/dev/null; then
    cat "$next_log" >&2
    exit 1
  fi
  sleep 1
done
curl --silent --fail "http://127.0.0.1:${next_port}/" >/dev/null

seller_status="$(curl --silent --output "$response_file" --write-out '%{http_code}' \
  --header 'content-type: application/json' \
  --data '{"kind":"seller","name":"Route seller","email":"route-seller@example.test"}' \
  "http://127.0.0.1:${next_port}/api/waitlist")"
if [[ "$seller_status" != "201" ]]; then
  cat "$response_file" >&2
  cat "$next_log" >&2
  exit 1
fi

brand_status="$(curl --silent --output "$response_file" --write-out '%{http_code}' \
  --header 'content-type: application/json' \
  --data '{"kind":"brand","companyName":"Route brand","contactEmail":"route-brand@example.test"}' \
  "http://127.0.0.1:${next_port}/api/waitlist")"
if [[ "$brand_status" != "201" ]]; then
  cat "$response_file" >&2
  cat "$next_log" >&2
  exit 1
fi

psql "$fresh_admin_url" --set ON_ERROR_STOP=1 --tuples-only --command \
  "select count(*) from public.seller_waitlist where email = 'route-seller@example.test'" \
  | grep -Eq '^ *1 *$'
psql "$fresh_admin_url" --set ON_ERROR_STOP=1 --tuples-only --command \
  "select count(*) from public.brand_waitlist where contact_email = 'route-brand@example.test'" \
  | grep -Eq '^ *1 *$'

echo "fresh, upgrade, role-denial, and waitlist route checks passed"
