-- Auth bootstrap migration
-- Run AFTER the API has booted with the new schema (TypeORM synchronize will create new
-- tables and columns). This script handles data backfill + FK constraints that synchronize
-- can't safely add over existing rows.
--
-- Usage:
--   psql "$DATABASE_URL" -f apps/dooform-api/src/database/migrations/2026-05-04-auth-bootstrap.sql

BEGIN;

-- 1. gen_random_uuid() is built into Postgres 13+, so no pgcrypto extension
--    is required. (Azure Flexible Server allowlists extensions at the server
--    level and pgcrypto isn't allowed by default — depending on it would
--    block the deploy.)

-- 2. Create the legacy organization + user that owns historical (pre-auth) data.
INSERT INTO organizations (id, name, slug, owner_user_id, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Legacy',
  'legacy',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (
  id, email, display_name, avatar_url, password_hash, email_verified, role, user_tier,
  organization_id, google_id, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'legacy@dooform.local',
  'Legacy User',
  NULL,
  NULL,
  TRUE,
  'GLOBAL_ADMIN',
  'pro',
  '00000000-0000-0000-0000-000000000001',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Point the legacy org back at its owner.
UPDATE organizations
SET owner_user_id = '00000000-0000-0000-0000-000000000001'
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND owner_user_id IS NULL;

-- 3. Backfill documents.owner_user_id and documents.user_id.
-- Existing rows have non-uuid varchar values like 'dev-user'. Map them all to legacy user.
-- Add a temporary uuid column, populate, then swap.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='documents' AND column_name='owner_user_id' AND data_type='character varying'
  ) THEN
    -- Replace non-UUID owner ids with legacy user.
    UPDATE documents
    SET owner_user_id = '00000000-0000-0000-0000-000000000001'
    WHERE owner_user_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

    ALTER TABLE documents
      ALTER COLUMN owner_user_id TYPE uuid USING owner_user_id::uuid;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='documents' AND column_name='user_id' AND data_type='character varying'
  ) THEN
    UPDATE documents
    SET user_id = '00000000-0000-0000-0000-000000000001'
    WHERE user_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

    ALTER TABLE documents
      ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
  END IF;
END
$$;

-- 4. Backfill templates.owner_user_id (newly added; null for legacy rows).
UPDATE templates
SET owner_user_id = '00000000-0000-0000-0000-000000000001'
WHERE owner_user_id IS NULL;

-- 5. Add foreign keys (idempotent: drop first if exists).
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_organization;
ALTER TABLE users
  ADD CONSTRAINT fk_users_organization
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE organizations DROP CONSTRAINT IF EXISTS fk_organizations_owner;
ALTER TABLE organizations
  ADD CONSTRAINT fk_organizations_owner
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE documents DROP CONSTRAINT IF EXISTS fk_documents_owner;
ALTER TABLE documents
  ADD CONSTRAINT fk_documents_owner
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE templates DROP CONSTRAINT IF EXISTS fk_templates_owner;
ALTER TABLE templates
  ADD CONSTRAINT fk_templates_owner
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE refresh_tokens DROP CONSTRAINT IF EXISTS fk_refresh_tokens_user;
ALTER TABLE refresh_tokens
  ADD CONSTRAINT fk_refresh_tokens_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE password_reset_tokens DROP CONSTRAINT IF EXISTS fk_password_reset_tokens_user;
ALTER TABLE password_reset_tokens
  ADD CONSTRAINT fk_password_reset_tokens_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE invite_codes DROP CONSTRAINT IF EXISTS fk_invite_codes_organization;
ALTER TABLE invite_codes
  ADD CONSTRAINT fk_invite_codes_organization
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE invite_codes DROP CONSTRAINT IF EXISTS fk_invite_codes_creator;
ALTER TABLE invite_codes
  ADD CONSTRAINT fk_invite_codes_creator
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE;

COMMIT;
