#!/usr/bin/env bash
set -euo pipefail

# Proves that the modules holding server credentials cannot be bundled into a
# Client Component. Each one is imported from a "use client" page in a
# disposable fixture app; Next.js must reject the build because of the
# `server-only` marker.

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fixture_root="$(mktemp -d)"
build_log="$(mktemp)"

cleanup() {
  rm -rf "$fixture_root"
  rm -f "$build_log"
}
trap cleanup EXIT

mkdir -p "$fixture_root/app" "$fixture_root/lib/db" "$fixture_root/lib/env"
ln -s "$repo_root/node_modules" "$fixture_root/node_modules"
cp "$repo_root/src/lib/db/index.ts" "$repo_root/src/lib/db/schema.ts" "$fixture_root/lib/db/"
cp "$repo_root"/src/lib/env/*.ts "$fixture_root/lib/env/"

cat >"$fixture_root/package.json" <<'JSON'
{"private":true,"dependencies":{"next":"16.3.5","react":"19.2.8","react-dom":"19.2.8"}}
JSON

cat >"$fixture_root/app/layout.tsx" <<'TSX'
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html><body>{children}</body></html>;
}
TSX

assert_client_import_rejected() {
  local module_path="$1"

  cat >"$fixture_root/app/page.tsx" <<TSX
"use client";

import * as serverModule from "../${module_path}";

export default function Page() {
  void serverModule;
  return null;
}
TSX

  rm -rf "$fixture_root/.next"

  if DATABASE_URL="postgresql://unused:unused@127.0.0.1:1/unused" \
    "$repo_root/node_modules/.bin/next" build --webpack "$fixture_root" >"$build_log" 2>&1; then
    echo "Expected a client import of ${module_path} to fail" >&2
    cat "$build_log" >&2
    exit 1
  fi

  if ! grep -q 'server-only' "$build_log"; then
    echo "Build of ${module_path} failed, but not because the module is server-only" >&2
    cat "$build_log" >&2
    exit 1
  fi
}

assert_client_import_rejected "lib/db"
assert_client_import_rejected "lib/env/server"

echo "server-only client-import checks passed (lib/db, lib/env/server)"
