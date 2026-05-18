-- Per-user permission overrides.
-- TypeORM `synchronize` will have already created the `user_permissions` table on boot.
-- This migration adds the FKs that synchronize can't safely add over rows it can't validate.
--
-- Usage:
--   psql "$DATABASE_URL" -f apps/dooform-api/src/database/migrations/2026-05-18-user-permission-overrides.sql

BEGIN;

ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS fk_user_permissions_user;
ALTER TABLE user_permissions
  ADD CONSTRAINT fk_user_permissions_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS fk_user_permissions_granted_by;
ALTER TABLE user_permissions
  ADD CONSTRAINT fk_user_permissions_granted_by
  FOREIGN KEY (granted_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Helpful index for the by-user lookup pattern (the unique compound index covers
-- exact lookups; this single-column index speeds up "all overrides for user X"
-- which is the hot path for /admin/permissions/users/:userId).
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions (user_id);

COMMIT;
