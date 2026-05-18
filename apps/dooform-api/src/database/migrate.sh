#!/usr/bin/env bash
#
# Applies every SQL file under ./migrations in alphabetical (date) order
# against $DATABASE_URL. Each file is run with ON_ERROR_STOP=1 so a failure
# aborts the run immediately and the script exits non-zero, which prevents
# downstream deploy steps from rolling out a container against a half-
# migrated database.
#
# Every migration file is idempotent (IF NOT EXISTS / ON CONFLICT) so this
# is safe to run on every deploy without tracking which files have already
# been applied.
#
# Usage:
#   DATABASE_URL=postgres://... ./apps/dooform-api/src/database/migrate.sh

set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found on PATH — install postgresql-client first" >&2
  exit 1
fi

# Resolve the migrations dir relative to this script so it works from any cwd.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "No migrations directory at $MIGRATIONS_DIR" >&2
  exit 1
fi

shopt -s nullglob
files=("$MIGRATIONS_DIR"/*.sql)
if (( ${#files[@]} == 0 )); then
  echo "No migration files found in $MIGRATIONS_DIR"
  exit 0
fi

# Lexicographic order matches the YYYY-MM-DD-* naming convention, so files
# run chronologically. Use LC_ALL=C to keep the sort deterministic across
# locales (GitHub Actions runners default to en_US.UTF-8).
sorted_files=()
while IFS= read -r line; do
  sorted_files+=("$line")
done < <(printf '%s\n' "${files[@]}" | LC_ALL=C sort)

echo "Found ${#sorted_files[@]} migration(s)."
for f in "${sorted_files[@]}"; do
  echo "→ Applying $(basename "$f")"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --quiet -f "$f"
done

echo "All migrations applied."
