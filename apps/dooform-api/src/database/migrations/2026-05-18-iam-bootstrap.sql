-- GCP-IAM-style multi-role bootstrap.
--
-- Idempotent: creates the `roles` and `role_assignments` tables, adds the
-- `role_id` column to `role_permissions`, seeds the three system roles,
-- backfills `role_id` from the legacy enum column, and creates one
-- role_assignments row per existing user matching their `users.role` value.
-- Safe to re-run.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -f apps/dooform-api/src/database/migrations/2026-05-18-iam-bootstrap.sql

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. roles table — system + custom IAM roles.
CREATE TABLE IF NOT EXISTS roles (
  id          uuid        PRIMARY KEY,
  code        varchar(64) NOT NULL,
  name        varchar(200) NOT NULL,
  description text,
  is_system   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW(),
  deleted_at  timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_code
  ON roles (code) WHERE deleted_at IS NULL;

-- 2. role_assignments — many-to-many users <-> roles with optional expiry/condition.
CREATE TABLE IF NOT EXISTS role_assignments (
  id                  uuid        PRIMARY KEY,
  user_id             uuid        NOT NULL,
  role_id             uuid        NOT NULL,
  granted_by_user_id  uuid,
  expires_at          timestamptz,
  condition           jsonb,
  created_at          timestamptz NOT NULL DEFAULT NOW(),
  updated_at          timestamptz NOT NULL DEFAULT NOW(),
  deleted_at          timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_role_assignments_user_role
  ON role_assignments (user_id, role_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_user
  ON role_assignments (user_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_role
  ON role_assignments (role_id);

-- 3. role_permissions.role_id — new FK column on the existing table.
ALTER TABLE role_permissions
  ADD COLUMN IF NOT EXISTS role_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS idx_role_permissions_role_id_key
  ON role_permissions (role_id, permission_key) WHERE role_id IS NOT NULL;

-- 4. Seed the three system roles with stable UUIDs so cross-environment
--    references match. ON CONFLICT keeps reruns clean.
INSERT INTO roles (id, code, name, description, is_system, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'USER',         'Member',       'Default member role. Read-only across the board plus their own documents.',         TRUE, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000011', 'ORG_ADMIN',    'Org Admin',    'Tenant administrator. Manages members, templates, and compliance within one org.', TRUE, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000012', 'GLOBAL_ADMIN', 'Global Admin', 'Platform administrator. Cross-tenant access to every feature.',                    TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name       = EXCLUDED.name,
  is_system  = TRUE,
  updated_at = NOW();

-- 5. Backfill role_permissions.role_id from the legacy enum.
UPDATE role_permissions rp
SET role_id = r.id
FROM roles r
WHERE rp.role_id IS NULL
  AND r.code = rp.role::text;

-- 6. Backfill role_assignments from users.role — one per user.
INSERT INTO role_assignments (id, user_id, role_id, granted_at, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  r.id,
  NOW(),
  NOW(),
  NOW()
FROM users u
JOIN roles r ON r.code = u.role::text
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 7. FK constraints (idempotent: drop first if exists).
ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS fk_role_permissions_role;
ALTER TABLE role_permissions
  ADD CONSTRAINT fk_role_permissions_role
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;

ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS fk_role_assignments_user;
ALTER TABLE role_assignments
  ADD CONSTRAINT fk_role_assignments_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS fk_role_assignments_role;
ALTER TABLE role_assignments
  ADD CONSTRAINT fk_role_assignments_role
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;

ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS fk_role_assignments_granted_by;
ALTER TABLE role_assignments
  ADD CONSTRAINT fk_role_assignments_granted_by
  FOREIGN KEY (granted_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

COMMIT;
