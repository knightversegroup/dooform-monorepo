-- GCP-IAM-style multi-role bootstrap.
-- Run AFTER the API boots with the new schema — TypeORM `synchronize` creates
-- the `roles` and `role_assignments` tables plus the `role_id` column on
-- `role_permissions`. This script seeds the system roles, backfills role
-- assignments from each user's legacy `users.role` value, fills in
-- `role_permissions.role_id`, and adds the FKs that synchronize can't safely
-- add over existing rows.
--
-- Idempotent: rerunning is a no-op aside from a quick scan.
--
-- Usage:
--   psql "$DATABASE_URL" -f apps/dooform-api/src/database/migrations/2026-05-18-iam-bootstrap.sql

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Seed the three system roles. UUIDs are stable across environments so the
--    role_id can be referenced from code if needed.
INSERT INTO roles (id, code, name, description, is_system, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'USER',         'Member',       'Default member role. Read-only across the board plus their own documents.',         TRUE, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000011', 'ORG_ADMIN',    'Org Admin',    'Tenant administrator. Manages members, templates, and compliance within one org.', TRUE, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000012', 'GLOBAL_ADMIN', 'Global Admin', 'Platform administrator. Cross-tenant access to every feature.',                    TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  is_system   = TRUE,
  updated_at  = NOW();

-- 2. Backfill role_permissions.role_id from the legacy enum column.
UPDATE role_permissions rp
SET role_id = r.id
FROM roles r
WHERE rp.role_id IS NULL
  AND r.code = rp.role::text;

-- 3. Backfill role_assignments from users.role. One assignment per user matching
--    their existing role. Re-runs are harmless because of the unique index on
--    (user_id, role_id).
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

-- 4. FK constraints (idempotent: drop first if they exist).
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
