#!/usr/bin/env bash
set -euo pipefail

before_snapshot="$(mktemp)"
after_snapshot="$(mktemp)"
cleanup() {
  rm -f "$before_snapshot" "$after_snapshot"
}
trap cleanup EXIT

snapshot_assets() {
  local output_file="$1"

  python3 - "$output_file" <<'PY'
import hashlib
import os
import sys

output_path = sys.argv[1]
root = 'assets'
entries = []

if os.path.isdir(root):
    for current_root, dirnames, files in os.walk(root):
        dirnames.sort()
        for filename in sorted(files):
            path = os.path.join(current_root, filename)
            with open(path, 'rb') as handle:
                digest = hashlib.sha256(handle.read()).hexdigest()
            entries.append(f"{digest}  {path}")

with open(output_path, 'w', encoding='utf-8') as handle:
    handle.write('\n'.join(entries))
PY
}

snapshot_assets "$before_snapshot"
npm run build
snapshot_assets "$after_snapshot"

if ! diff -u "$before_snapshot" "$after_snapshot" >/dev/null; then
  echo "Generated assets are out of date. Run 'npm run build' and commit the resulting changes in assets/." >&2
  echo >&2
  git status --short -- assets >&2 || true
  echo >&2
  git --no-pager diff -- assets >&2 || true
  exit 1
fi
