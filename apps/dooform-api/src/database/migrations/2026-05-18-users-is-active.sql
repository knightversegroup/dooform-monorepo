-- Adds the soft-disable flag used by the platform users admin page to
-- deactivate accounts without dropping the row (audit trail and document
-- ownership stay intact).
--
-- Idempotent: ADD COLUMN IF NOT EXISTS + DEFAULT applies to existing rows
-- so every legacy user starts active.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -f apps/dooform-api/src/database/migrations/2026-05-18-users-is-active.sql

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

COMMIT;
