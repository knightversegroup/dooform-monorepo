-- Loosens role_permissions.role to NULL-able so custom roles can be stored
-- as (role=NULL, role_id=<custom-role-uuid>) instead of forcing them to
-- borrow a system-role enum value as a placeholder.
--
-- The placeholder approach (`role=USER, role_id=<custom>`) caused custom-role
-- permissions to be wiped when an admin edited the USER baseline via
-- /settings/permissions, because setGrantsBulk does
--   DELETE FROM role_permissions WHERE role = 'USER'
-- which matched every row using USER as its placeholder.
--
-- Idempotent: re-running is safe.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -f apps/dooform-api/src/database/migrations/2026-05-19-role-permissions-role-nullable.sql

BEGIN;

ALTER TABLE role_permissions ALTER COLUMN role DROP NOT NULL;

COMMIT;
