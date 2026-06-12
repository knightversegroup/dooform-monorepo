-- Adds a user-template favorites (starred) table.
-- Each user can favorite any template they have access to.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -f apps/dooform-api/src/database/migrations/2026-06-11-template-favorites.sql

BEGIN;

CREATE TABLE IF NOT EXISTS template_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Each user can only favorite a template once
  CONSTRAINT uq_template_favorites_user_template UNIQUE (user_id, template_id)
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_template_favorites_user_id ON template_favorites(user_id);

-- Index for fast lookup by template
CREATE INDEX IF NOT EXISTS idx_template_favorites_template_id ON template_favorites(template_id);

COMMIT;
