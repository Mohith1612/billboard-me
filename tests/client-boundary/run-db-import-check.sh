#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fixture_root="$(mktemp -d)"
build_log="$(mktemp)"

cleanup() {
  rm -rf "$fixture_root"
  rm -f "$build_log"
}
trap cleanup EXIT

mkdir -p "$fixture_root/app" "$fixture_root/lib/db"
ln -s "$repo_root/node_modules" "$fixture_root/node_modules"
cp "$repo_root/src/lib/db/index.ts" "$repo_root/src/lib/db/schema.ts" "$fixture_root/lib/db/"

cat >"$fixture_root/package.json" <<'JSON'
{"private":true,"dependencies":{"next":"16.3.5","react":"19.2.8","react-dom":"19.2.8"}}
JSON

cat >"$fixture_root/app/layout.tsx" <<'TSX'
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html><body>{children}</body></html>;
}
TSX

cat >"$fixture_root/app/page.tsx" <<'TSX'
"use client";

import { db } from "../lib/db";

export default function Page() {
  void db;
  return null;
}
TSX

if DATABASE_URL="postgresql://unused:unused@127.0.0.1:1/unused" \
  "$repo_root/node_modules/.bin/next" build --webpack "$fixture_root" >"$build_log" 2>&1; then
  echo "Expected a client import of the database module to fail" >&2
  cat "$build_log" >&2
  exit 1
fi

if ! grep -q 'server-only' "$build_log"; then
  echo "Build failed, but not because the database module is server-only" >&2
  cat "$build_log" >&2
  exit 1
fi

echo "database client-import check passed"
