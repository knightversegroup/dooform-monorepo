-- Per-user permission overrides (ALLOW / DENY on top of role grants).
--
-- Idempotent: creates the `user_permissions` table if missing, adds FK
-- constraints, and creates the by-user lookup index. Safe to re-run.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -f apps/dooform-api/src/database/migrations/2026-05-18-user-permission-overrides.sql

BEGIN;

CREATE TABLE IF NOT EXISTS user_permissions (
  id                 uuid         PRIMARY KEY,
  user_id            uuid         NOT NULL,
  permission_key     varchar(100) NOT NULL,
  effect             varchar(10)  NOT NULL,
  granted_by_user_id uuid,
  created_at         timestamptz  NOT NULL DEFAULT NOW(),
  updated_at         timestamptz  NOT NULL DEFAULT NOW(),
  deleted_at         timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_permissions_user_key
  ON user_permissions (user_id, permission_key);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id
  ON user_permissions (user_id);

ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS fk_user_permissions_user;
ALTER TABLE user_permissions
  ADD CONSTRAINT fk_user_permissions_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS fk_user_permissions_granted_by;
ALTER TABLE user_permissions
  ADD CONSTRAINT fk_user_permissions_granted_by
  FOREIGN KEY (granted_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

COMMIT;
